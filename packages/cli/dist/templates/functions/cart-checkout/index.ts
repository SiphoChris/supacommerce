import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"

/**
 * cart-checkout
 *
 * The checkout entry point. Validates inventory, then delegates order
 * creation to the checkout_cart Postgres function (atomic transaction).
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
          id, variant_id, quantity, unit_price, subtotal, title, thumbnail
        )
      `)
      .eq("id", cartId)
      .eq("status", "active")
      .is("completed_at", null)
      .single()

    if (cartError || !cart) {
      return errorResponse("Cart not found or already completed", 404)
    }

    const lineItems = cart.cart_line_items as Array<{
      id: string
      variant_id: string
      quantity: number
      unit_price: number
      subtotal: number
      title: string
      thumbnail: string | null
    }>

    if (lineItems.length === 0) {
      return errorResponse("Cart is empty", 422)
    }

    // ── 2. Validate inventory ────────────────────────────────────────────────
    for (const item of lineItems) {
      const { data: invItem } = await supabaseAdmin
        .from("inventory_items")
        .select("id, inventory_levels(quantity_available)")
        .eq("variant_id", item.variant_id)
        .single()

      if (invItem) {
        const levels = (
          invItem as unknown as { inventory_levels: Array<{ quantity_available: number }> }
        ).inventory_levels ?? []

        const totalAvailable = levels.reduce(
          (sum, l) => sum + l.quantity_available,
          0
        )

        if (totalAvailable < item.quantity) {
          return errorResponse(
            `Insufficient inventory for: ${item.title}`,
            422
          )
        }
      }
    }

    // ── 3. Calculate tax ─────────────────────────────────────────────────────
    // TODO: implement your tax logic here.
    // Options:
    //   a) Use the tax_regions / tax_rates tables (already in your schema)
    //   b) Call an external provider (TaxJar, Avalara, Stripe Tax)
    //   c) Use a fixed rate per region: region.tax_rate
    //
    // Example using your tax_rates table:
    //   const { data: taxRate } = await supabaseAdmin
    //     .from("tax_rates")
    //     .select("rate")
    //     .eq("tax_region_id", ...)
    //     .eq("is_default", true)
    //     .single()
    //   const taxTotal = Math.round(subtotal * (taxRate?.rate ?? 0))
    //
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0)
    const taxTotal = 0 // replace with real calculation

    // ── 4. Apply promotions ──────────────────────────────────────────────────
    // TODO: implement your discount calculation here.
    // Promotion codes are in cart.promotion_codes (array of strings).
    // Use the promotions / promotion_rules tables to validate and calculate.
    //
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
    //
    const discountTotal = 0 // replace with real calculation

    // ── 5. Get shipping total ────────────────────────────────────────────────
    // TODO: get the selected shipping method price.
    // The customer selects a shipping option before checkout. Retrieve it:
    //
    //   const { data: shippingMethod } = await supabaseAdmin
    //     .from("cart_shipping_methods")
    //     .select("price")
    //     .eq("cart_id", cartId)
    //     .single()
    //   const shippingTotal = shippingMethod?.price ?? 0
    //
    const shippingTotal = 0 // replace with real calculation

    // ── 6. Create payment session with your provider ─────────────────────────
    // TODO: integrate your payment provider here.
    //
    // Stripe example:
    //   import Stripe from "https://esm.sh/stripe@14?target=deno"
    //   const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!)
    //   const total = subtotal + taxTotal + shippingTotal - discountTotal
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount: total,
    //     currency: cart.currency_code.toLowerCase(),
    //     metadata: { cartId, orderId: "pending" },
    //   })
    //   const providerSessionId = paymentIntent.id
    //   const paymentSessionData = { clientSecret: paymentIntent.client_secret }
    //
    const providerSessionId: string | null = null
    const paymentSessionData: Record<string, unknown> = {}

    // ── 7. Atomically create order via Postgres function ─────────────────────
    // checkout_cart handles: order creation, line item copying, payment
    // collection, and cart completion — all in one transaction.
    const { data: orderId, error: checkoutError } = await supabaseAdmin
      .rpc("checkout_cart", {
        p_cart_id: cartId,
        p_discount_total: discountTotal,
        p_tax_total: taxTotal,
        p_shipping_total: shippingTotal,
        p_billing_address: billingAddress ?? null,
      })

    if (checkoutError || !orderId) {
      console.error("checkout_cart RPC error:", checkoutError)
      return errorResponse("Failed to create order", 500)
    }

    // ── 8. Create payment session record ─────────────────────────────────────
    // Get the payment collection that was created by checkout_cart
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
          payment_collection_id: collection.id,
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
