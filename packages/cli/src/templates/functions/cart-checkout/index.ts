import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

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
 *   4. Calculate totals:
 *      a. Shipping — from cart_shipping_methods
 *      b. Tax     — from tax_regions / tax_rates, matched by shipping address country/province
 *      c. Discount — from promotion_codes on cart (first valid code wins)
 *                    automatic promotions apply if no manual code matched
 *   5. Create order via checkout_cart RPC (atomic transaction)
 *      → if this fails, release all reservations and abort
 *   6. Create payment session with provider (TODO: wire in Stripe/etc.)
 *   7. Return orderId + paymentSession to client
 *
 * After this function returns, the client completes payment using the
 * provider's own client-side SDK (Stripe Elements, PayPal SDK, etc.)
 * using the paymentSession.data returned here.
 *
 * Called by: commerce.cart.checkout(cartId, options)
 *
 * Request body:
 *   { cartId, paymentProvider, billingAddress? }
 *
 * Response:
 *   { orderId, paymentSession: { id, provider, data } }
 */

interface CheckoutBody {
  cartId: string;
  paymentProvider: string;
  billingAddress?: Record<string, unknown>;
}

interface LineItem {
  id: string;
  variant_id: string | null;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  title: string;
  thumbnail: string | null;
}

interface ReservationRecord {
  reservationId: string;
}

type PromotionRow = {
  id: string;
  code: string | null;
  type: string;
  value: number;
  is_automatic: boolean;
  is_case_insensitive: boolean;
  usage_limit: number | null;
  usage_count: number;
  usage_limit_per_customer: number | null;
  starts_at: string | null;
  ends_at: string | null;
  promotion_rules: Array<{ type: string; value: string }>;
};

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const body: CheckoutBody = await req.json();
    const { cartId, paymentProvider, billingAddress } = body;

    if (!cartId) return errorResponse("cartId is required", 400);
    if (!paymentProvider)
      return errorResponse("paymentProvider is required", 400);

    // ── 1. Load cart with line items ─────────────────────────────────────────
    const { data: cart, error: cartError } = await supabaseAdmin
      .from("carts")
      .select(
        `
        *,
        cart_line_items (
          id, variant_id, product_id, quantity, unit_price, subtotal,
          title, thumbnail
        ),
        cart_shipping_methods (
          price
        )
      `,
      )
      .eq("id", cartId)
      .eq("status", "active")
      .is("completed_at", null)
      .single();

    if (cartError || !cart) {
      return errorResponse("Cart not found or already completed", 404);
    }

    const lineItems = (cart.cart_line_items ?? []) as LineItem[];

    if (lineItems.length === 0) {
      return errorResponse("Cart is empty", 422);
    }

    if (!cart.email) {
      return errorResponse("Cart is missing an email address", 422);
    }

    if (!cart.shipping_address) {
      return errorResponse("Cart is missing a shipping address", 422);
    }

    // ── 2. Resolve default stock location ────────────────────────────────────
    const { data: location } = await supabaseAdmin
      .from("stock_locations")
      .select("id")
      .eq("is_active", true)
      .order("created_at")
      .limit(1)
      .single();

    const locationId: string | null =
      (location as { id: string } | null)?.id ?? null;

    // ── 3. Reserve inventory atomically ──────────────────────────────────────
    const reservations: ReservationRecord[] = [];

    if (locationId) {
      for (const item of lineItems) {
        if (!item.variant_id) continue;

        const { data: invItem } = await supabaseAdmin
          .from("inventory_items")
          .select("id")
          .eq("variant_id", item.variant_id)
          .is("deleted_at", null)
          .single();

        if (!invItem) continue;

        const inventoryItemId = (invItem as { id: string }).id;

        const { data: reserved, error: reserveError } = await supabaseAdmin.rpc(
          "reserve_inventory",
          {
            p_inventory_item_id: inventoryItemId,
            p_location_id: locationId,
            p_line_item_id: item.id,
            p_quantity: item.quantity,
          },
        );

        if (reserveError) {
          await releaseAll(reservations);
          console.error("reserve_inventory error:", reserveError);
          return errorResponse("Failed to reserve inventory", 500);
        }

        if (!reserved) {
          await releaseAll(reservations);
          return errorResponse(
            `"${item.title}" is out of stock or has insufficient quantity`,
            422,
          );
        }

        const { data: newReservation } = await supabaseAdmin
          .from("inventory_reservations")
          .select("id")
          .eq("inventory_item_id", inventoryItemId)
          .eq("location_id", locationId)
          .eq("line_item_id", item.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (newReservation) {
          reservations.push({
            reservationId: (newReservation as { id: string }).id,
          });
        }
      }
    }

    // ── 4a. Shipping ─────────────────────────────────────────────────────────
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingMethods = (cart.cart_shipping_methods ?? []) as Array<{
      price: number;
    }>;
    let shippingTotal = shippingMethods.reduce((sum, m) => sum + m.price, 0);

    // ── 4b. Tax ──────────────────────────────────────────────────────────────
    // Resolve from tax_regions / tax_rates by shipping address country/province.
    // Province-specific match preferred; falls back to country-level; then 0.
    let taxTotal = 0;

    const shippingAddress = cart.shipping_address as Record<
      string,
      unknown
    > | null;
    const countryCode = (shippingAddress?.countryCode ??
      shippingAddress?.country_code) as string | null;

    if (countryCode) {
      const provinceCode = (shippingAddress?.province ??
        shippingAddress?.provinceCode) as string | null;

      const { data: taxRegions } = await supabaseAdmin
        .from("tax_regions")
        .select("id, province_code, tax_rates(rate, is_default)")
        .eq("country_code", countryCode.toUpperCase())
        .is("deleted_at", null);

      if (taxRegions && taxRegions.length > 0) {
        type TaxRegionRow = {
          id: string;
          province_code: string | null;
          tax_rates: Array<{ rate: number; is_default: boolean }>;
        };

        const regions = taxRegions as unknown as TaxRegionRow[];

        let matched = provinceCode
          ? (regions.find(
              (r) => r.province_code === provinceCode.toUpperCase(),
            ) ?? null)
          : null;

        if (!matched) {
          matched = regions.find((r) => r.province_code === null) ?? null;
        }

        if (matched) {
          const rates = matched.tax_rates ?? [];
          const defaultRate =
            rates.find((r) => r.is_default) ?? rates[0] ?? null;
          if (defaultRate) {
            taxTotal = Math.round(subtotal * defaultRate.rate);
          }
        }
      }
    }

    // ── 4c. Promotions ───────────────────────────────────────────────────────
    // First valid manual code wins. If none applies, first valid automatic wins.
    // free_shipping type zeroes shippingTotal instead of reducing subtotal.
    // buy_x_get_y is not yet implemented.
    let discountTotal = 0;
    let appliedPromotionId: string | null = null;

    const promotionCodes = (cart.promotion_codes ?? []) as string[];
    const customerId = cart.customer_id as string | null;
    const now = new Date().toISOString();

    // Fetch customer's group once — needed for customer_group rule checks
    let customerGroupId: string | null = null;
    if (customerId) {
      const { data: customer } = await supabaseAdmin
        .from("customers")
        .select("group_id")
        .eq("id", customerId)
        .single();
      customerGroupId =
        (customer as { group_id: string | null } | null)?.group_id ?? null;
    }

    // Try manual codes
    for (const rawCode of promotionCodes) {
      if (appliedPromotionId) break;

      const { data: promos } = await supabaseAdmin
        .from("promotions")
        .select("*, promotion_rules(*)")
        .eq("status", "active")
        .eq("is_automatic", false)
        .is("deleted_at", null);

      if (!promos) continue;

      // Match by code respecting is_case_insensitive flag
      const promo = (promos as unknown as PromotionRow[]).find((p) => {
        if (!p.code) return false;
        return p.is_case_insensitive
          ? p.code.toUpperCase() === rawCode.toUpperCase()
          : p.code === rawCode;
      });

      if (!promo) continue;

      const result = await applyPromotion(
        promo,
        subtotal,
        shippingTotal,
        customerId,
        customerGroupId,
        now,
      );
      if (result === null) continue;

      if (promo.type === "free_shipping") {
        shippingTotal = 0;
      } else {
        discountTotal = result;
      }
      appliedPromotionId = promo.id;
    }

    // Try automatic promotions if no manual code applied
    if (!appliedPromotionId) {
      const { data: autoPromos } = await supabaseAdmin
        .from("promotions")
        .select("*, promotion_rules(*)")
        .eq("status", "active")
        .eq("is_automatic", true)
        .is("deleted_at", null)
        .order("created_at");

      for (const promo of (autoPromos as unknown as PromotionRow[]) ?? []) {
        if (appliedPromotionId) break;

        const result = await applyPromotion(
          promo,
          subtotal,
          shippingTotal,
          customerId,
          customerGroupId,
          now,
        );
        if (result === null) continue;

        if (promo.type === "free_shipping") {
          shippingTotal = 0;
        } else {
          discountTotal = result;
        }
        appliedPromotionId = promo.id;
      }
    }

    // Cap discount at subtotal — total can never go negative
    discountTotal = Math.min(discountTotal, subtotal);

    // ── 5. Create order via checkout_cart RPC ─────────────────────────────────
    const { data: orderId, error: checkoutError } = await supabaseAdmin.rpc(
      "checkout_cart",
      {
        p_cart_id: cartId,
        p_discount_total: discountTotal,
        p_tax_total: taxTotal,
        p_shipping_total: shippingTotal,
        p_billing_address: billingAddress ?? null,
      },
    );

    if (checkoutError || !orderId) {
      await releaseAll(reservations);
      console.error("checkout_cart RPC error:", checkoutError);
      return errorResponse("Failed to create order", 500);
    }

    // Record promotion usage — non-fatal, order already created
    if (appliedPromotionId && customerId) {
      await supabaseAdmin.from("promotion_usages").insert({
        promotion_id: appliedPromotionId,
        order_id: orderId as string,
        customer_id: customerId,
      });

      // Increment global usage_count atomically
      await supabaseAdmin.rpc("increment_promotion_usage", {
        p_promotion_id: appliedPromotionId,
      });
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
    const providerSessionId: string | null = null;
    const paymentSessionData: Record<string, unknown> = {};

    // ── 7. Record payment session ────────────────────────────────────────────
    const { data: collection } = await supabaseAdmin
      .from("payment_collections")
      .select("id")
      .eq("order_id", orderId)
      .single();

    let paymentSessionId = "";

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
        .single();

      paymentSessionId = (session as { id: string } | null)?.id ?? "";
    }

    return jsonResponse({
      orderId,
      paymentSession: {
        id: paymentSessionId,
        provider: paymentProvider,
        data: paymentSessionData,
      },
    });
  } catch (err) {
    console.error("cart-checkout error:", err);
    return errorResponse("Internal server error", 500);
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function releaseAll(reservations: ReservationRecord[]): Promise<void> {
  await Promise.allSettled(
    reservations.map(({ reservationId }) =>
      supabaseAdmin.rpc("release_inventory_reservation", {
        p_reservation_id: reservationId,
      }),
    ),
  );
}

/**
 * Validate a promotion and return the discount amount in cents.
 * Returns null if the promotion does not apply.
 * Returns 0 for free_shipping (caller zeroes shippingTotal).
 *
 * Checks in order:
 *   1. Validity window
 *   2. Global usage limit
 *   3. Per-customer usage limit
 *   4. Promotion rules (cart_total minimum, customer_group membership)
 *   5. Compute discount by type
 */
async function applyPromotion(
  promo: PromotionRow,
  subtotal: number,
  shippingTotal: number,
  customerId: string | null,
  customerGroupId: string | null,
  now: string,
): Promise<number | null> {
  // 1. Validity window
  if (promo.starts_at && now < promo.starts_at) return null;
  if (promo.ends_at && now > promo.ends_at) return null;

  // 2. Global usage limit
  if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit)
    return null;

  // 3. Per-customer usage limit
  if (promo.usage_limit_per_customer !== null && customerId) {
    const { count } = await supabaseAdmin
      .from("promotion_usages")
      .select("id", { count: "exact", head: true })
      .eq("promotion_id", promo.id)
      .eq("customer_id", customerId);

    if ((count ?? 0) >= promo.usage_limit_per_customer) return null;
  }

  // 4. Promotion rules
  for (const rule of promo.promotion_rules ?? []) {
    switch (rule.type) {
      case "cart_total": {
        // value = minimum subtotal in cents
        const minimum = parseInt(rule.value, 10);
        if (isNaN(minimum) || subtotal < minimum) return null;
        break;
      }
      case "customer_group": {
        // value = customer_group id
        if (!customerGroupId || customerGroupId !== rule.value) return null;
        break;
      }
      // product / product_category rules would require line-item inspection —
      // not yet implemented, treated as always passing for now.
      default:
        break;
    }
  }

  // 5. Compute discount
  switch (promo.type) {
    case "percentage":
      // value = whole percent, e.g. 15 → 15%
      return Math.round(subtotal * (promo.value / 100));

    case "fixed_amount":
      // value = cents
      return promo.value;

    case "free_shipping":
      // Caller handles zeroing shippingTotal
      return 0;

    case "buy_x_get_y":
      // Not yet implemented
      return null;

    default:
      return null;
  }
}
