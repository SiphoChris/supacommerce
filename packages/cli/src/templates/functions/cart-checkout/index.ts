import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"

/**
 * cart-checkout
 *
 * The checkout entry point. Atomically reserves inventory before creating
 * the order — preventing overselling under concurrent checkout load.
 *
 * Flow:
 *   1. Load and validate cart
 *   2. Resolve inventory items for each line item
 *   3. Reserve inventory via reserve_inventory RPC (atomic, row-locked)
 *      → if any reservation fails, release all previous reservations and abort
 *   4. Calculate tax, promotions, shipping
 *   5. Create order via checkout_cart RPC (atomic transaction)
 *      → if this fails, release all reservations and abort
 *   6. Create payment session with provider
 *   7. Return orderId + paymentSession to client
 *
 * After this function returns, the client completes payment using the
 * provider's own client-side SDK (Stripe Elements, PayPal SDK, etc.)
 * using the paymentSession.data returned here.
 *
 * Called by: commerce.cart.checkout(cartId, options)
 *
 * Request body:
 *   {
 *     cartId: string
 *     paymentProvider: string          // e.g. "stripe", "paypal", "manual"
 *     billingAddress?: object          // optional override
 *   }
 *
 * Response:
 *   {
 *     orderId: string
 *     paymentSession: {
 *       id: string
 *       provider: string
 *       data: object                   // provider-specific — pass to client SDK
 *     }
 *   }
 */

interface CheckoutBody {
  cartId: string
  paymentProvider: string
  billingAddress?: Record<string, unknown>
}

interface LineItem {
  id: string
  variant_id: string | null
  product_id: string | null
  quantity: number
  unit_price: number
  subtotal: number
  title: string
  thumbnail: string | null
}

interface ReservationRecord {
  reservationId: string
}

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req)
  if (preflight) return preflight

  try {
    const body: CheckoutBody = await req.json()
    const { cartId, paymentProvider, billingAddress } = body

    if (!cartId) return errorResponse("cartId is required", 400)
    if (!paymentProvider) return errorResponse("paymentProvider is required", 400)

    // ── 1. Load cart with line items ─────────────────────────────────────────
    const { data: cart, error: cartError } = await supabaseAdmin
      .from("carts")
      .select(`
        *,
        cart_line_items (
          id, variant_id, product_id, quantity, unit_price, subtotal,
          title, thumbnail
        ),
        cart_shipping_methods (
          price
        )
      `)
      .eq("id", cartId)
      .eq("status", "active")
      .is("completed_at", null)
      .single()

    if (cartError || !cart) {
      return errorResponse("Cart not found or already completed", 404)
    }

    const lineItems = (cart.cart_line_items ?? []) as LineItem[]

    if (lineItems.length === 0) {
      return errorResponse("Cart is empty", 422)
    }

    if (!cart.email) {
      return errorResponse("Cart is missing an email address", 422)
    }

    if (!cart.shipping_address) {
      return errorResponse("Cart is missing a shipping address", 422)
    }

    // ── 2. Resolve default stock location ────────────────────────────────────
    const { data: location } = await supabaseAdmin
      .from("stock_locations")
      .select("id")
      .eq("is_active", true)
      .order("created_at")
      .limit(1)
      .single()

    const locationId: string | null = (location as { id: string } | null)?.id ?? null

    // ── 3. Reserve inventory atomically ──────────────────────────────────────
    // Track successful reservations so we can roll them back on any failure.
    const reservations: ReservationRecord[] = []

    if (locationId) {
      for (const item of lineItems) {
        if (!item.variant_id) continue

        // Get inventory item for this variant
        const { data: invItem } = await supabaseAdmin
          .from("inventory_items")
          .select("id")
          .eq("variant_id", item.variant_id)
          .is("deleted_at", null)
          .single()

        if (!invItem) continue // variant has no inventory tracking — skip

        const inventoryItemId = (invItem as { id: string }).id

        // reserve_inventory is row-locked — concurrent requests will queue
        // behind each other rather than both reading the same quantity.
        const { data: reserved, error: reserveError } = await supabaseAdmin
          .rpc("reserve_inventory", {
            p_inventory_item_id: inventoryItemId,
            p_location_id: locationId,
            p_line_item_id: item.id,
            p_quantity: item.quantity,
          })

        if (reserveError) {
          // Unexpected DB error — release everything and abort
          await releaseAll(reservations)
          console.error("reserve_inventory error:", reserveError)
          return errorResponse("Failed to reserve inventory", 500)
        }

        if (!reserved) {
          // Insufficient stock — release everything and abort
          await releaseAll(reservations)
          return errorResponse(
            `"${item.title}" is out of stock or has insufficient quantity`,
            422
          )
        }

        // Track the reservation ID for potential rollback.
        // reserve_inventory returns a boolean — fetch the reservation we just created.
        const { data: newReservation } = await supabaseAdmin
          .from("inventory_reservations")
          .select("id")
          .eq("inventory_item_id", inventoryItemId)
          .eq("location_id", locationId)
          .eq("line_item_id", item.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (newReservation) {
          reservations.push({ reservationId: (newReservation as { id: string }).id })
        }
      }
    }

    // ── 4. Calculate totals ──────────────────────────────────────────────────
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0)

    // Shipping — read from cart_shipping_methods
    const shippingMethods = (cart.cart_shipping_methods ?? []) as Array<{ price: number }>
    const shippingTotal = shippingMethods.reduce((sum, m) => sum + m.price, 0)

    // Tax
    // TODO: implement real tax logic using tax_regions / tax_rates tables.
    // Example:
    //   const { data: taxRate } = await supabaseAdmin
    //     .from("tax_rates")
    //     .select("rate")
    //     .eq("tax_region_id", <resolved_tax_region_id>)
    //     .eq("is_default", true)
    //     .single()
    //   const taxTotal = Math.round(subtotal * (taxRate?.rate ?? 0))
    const taxTotal = 0

    // Promotions
    // TODO: validate promotion_codes from cart and calculate discounts.
    // Example:
    //   for (const code of cart.promotion_codes ?? []) {
    //     const { data: promo } = await supabaseAdmin
    //       .from("promotions")
    //       .select("*, promotion_rules(*)")
    //       .eq("code", code.toUpperCase())
    //       .eq("status", "active")
    //       .single()
    //     if (promo) discountTotal += calculateDiscount(promo, subtotal)
    //   }
    const discountTotal = 0

    // ── 5. Create order via checkout_cart RPC ─────────────────────────────────
    // If this fails, release all inventory reservations we made above.
    const { data: orderId, error: checkoutError } = await supabaseAdmin
      .rpc("checkout_cart", {
        p_cart_id: cartId,
        p_discount_total: discountTotal,
        p_tax_total: taxTotal,
        p_shipping_total: shippingTotal,
        p_billing_address: billingAddress ?? null,
      })

    if (checkoutError || !orderId) {
      await releaseAll(reservations)
      console.error("checkout_cart RPC error:", checkoutError)
      return errorResponse("Failed to create order", 500)
    }

    // ── 6. Create payment session with provider ──────────────────────────────
    // TODO: integrate your payment provider here.
    //
    // Stripe example:
    //   import Stripe from "https://esm.sh/stripe@14?target=deno"
    //   const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!)
    //   const total = subtotal + taxTotal + shippingTotal - discountTotal
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount: total,
    //     currency: cart.currency_code.toLowerCase(),
    //     metadata: { cartId, orderId },
    //   })
    //   providerSessionId = paymentIntent.id
    //   paymentSessionData = { clientSecret: paymentIntent.client_secret }
    //
    const providerSessionId: string | null = null
    const paymentSessionData: Record<string, unknown> = {}

    // ── 7. Record payment session ────────────────────────────────────────────
    const { data: collection } = await supabaseAdmin
      .from("payment_collections")
      .select("id")
      .eq("order_id", orderId)
      .single()

    let paymentSessionId = ""

    if (collection) {
      const { data: session } = await supabaseAdmin
        .from("payment_sessions")
        .insert({
          payment_collection_id: (collection as { id: string }).id,
          provider_id: paymentProvider,
          amount: subtotal + taxTotal + shippingTotal - discountTotal,
          currency_code: cart.currency_code,
          data: paymentSessionData,
          provider_session_id: providerSessionId,
          status: "pending",
        })
        .select("id")
        .single()

      paymentSessionId = (session as { id: string } | null)?.id ?? ""
    }

    return jsonResponse({
      orderId,
      paymentSession: {
        id: paymentSessionId,
        provider: paymentProvider,
        data: paymentSessionData,
      },
    })
  } catch (err) {
    console.error("cart-checkout error:", err)
    return errorResponse("Internal server error", 500)
  }
})

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Release all pending inventory reservations.
 * Called on any failure after reservations have been created.
 * Errors here are logged but not thrown — the original error takes precedence.
 */
async function releaseAll(reservations: ReservationRecord[]): Promise<void> {
  await Promise.allSettled(
    reservations.map(({ reservationId }) =>
      supabaseAdmin.rpc("release_inventory_reservation", {
        p_reservation_id: reservationId,
      })
    )
  )
}