import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

/**
 * payment-webhook
 *
 * Receives webhook events from your payment provider and calls
 * order-confirmed when payment is successfully captured.
 *
 * Register this function's URL with your payment provider:
 *   https://<project-ref>.supabase.co/functions/v1/payment-webhook
 *
 * This stub shows Stripe as an example. Adapt it for your provider
 * by replacing the signature verification and event parsing sections.
 *
 * ⚠️  Always verify the webhook signature. Without it, anyone can
 *    send fake payment events to your endpoint and confirm orders
 *    without actually paying.
 *
 * Stripe setup:
 *   1. Go to Stripe Dashboard → Webhooks → Add endpoint
 *   2. Set endpoint URL to this function's URL
 *   3. Listen for: payment_intent.succeeded, payment_intent.payment_failed
 *   4. Copy the signing secret to your Supabase project secrets:
 *      supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
 */

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

    // ── 1. Verify webhook signature ──────────────────────────────────────────
    // TODO: uncomment and implement signature verification for your provider.
    //
    // Stripe example:
    //   import Stripe from "https://esm.sh/stripe@14?target=deno"
    //   const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!)
    //   let event: Stripe.Event
    //   try {
    //     event = await stripe.webhooks.constructEventAsync(
    //       body,
    //       signature,
    //       Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    //     )
    //   } catch (err) {
    //     console.error("Webhook signature verification failed:", err)
    //     return errorResponse("Invalid signature", 400)
    //   }
    //

    // For development only — parse body without verification.
    // REMOVE THIS in production and use the verified event above.
    if (Deno.env.get("ENVIRONMENT") !== "development") {
      return errorResponse(
        "Webhook signature verification not implemented",
        500,
      );
    }
    const event = JSON.parse(body);

    // ── 2. Handle event types ────────────────────────────────────────────────
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const providerSessionId = paymentIntent["id"] as string;

        // Find the payment session by provider session ID
        const { data: session, error: sessionError } = await supabaseAdmin
          .from("payment_sessions")
          .select("id, payment_collection_id, payment_collections(order_id)")
          .eq("provider_session_id", providerSessionId)
          .single();

        if (sessionError || !session) {
          console.error("Payment session not found for:", providerSessionId);
          // Return 200 so the provider doesn't retry indefinitely
          return jsonResponse({ received: true });
        }

        const orderId = (
          session as unknown as {
            payment_collections: { order_id: string };
          }
        ).payment_collections.order_id;

        // Call order-confirmed to atomically mark the order as processing
        // and upgrade pending inventory reservations to confirmed.
        const confirmUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/order-confirmed`;
        const confirmResponse = await fetch(confirmUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            orderId,
            paymentSessionId: session.id,
          }),
        });

        if (!confirmResponse.ok) {
          const errorText = await confirmResponse.text();
          console.error("order-confirmed failed:", errorText);
          return errorResponse("Failed to confirm order", 500);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const providerSessionId = paymentIntent["id"] as string;

        // ── Find the payment session ────────────────────────────────────────
        const { data: session } = await supabaseAdmin
          .from("payment_sessions")
          .select("id, payment_collection_id, payment_collections(order_id)")
          .eq("provider_session_id", providerSessionId)
          .single();

        if (!session) {
          console.error(
            "Payment session not found for failed payment:",
            providerSessionId,
          );
          return jsonResponse({ received: true });
        }

        const orderId = (
          session as unknown as {
            payment_collections: { order_id: string };
          }
        ).payment_collections.order_id;

        // ── Mark payment session as failed ──────────────────────────────────
        await supabaseAdmin
          .from("payment_sessions")
          .update({ status: "error", updated_at: new Date().toISOString() })
          .eq("provider_session_id", providerSessionId);

        // ── Release all pending inventory reservations for this order ────────
        // cart-checkout created pending reservations — without releasing them
        // quantity_available stays decremented forever even though no order
        // was confirmed.
        const { data: orderItems } = await supabaseAdmin
          .from("order_line_items")
          .select("id")
          .eq("order_id", orderId);

        if (orderItems && orderItems.length > 0) {
          const lineItemIds = (orderItems as Array<{ id: string }>).map(
            (i) => i.id,
          );

          const { data: reservations } = await supabaseAdmin
            .from("inventory_reservations")
            .select("id")
            .in("line_item_id", lineItemIds)
            .eq("status", "pending");

          if (reservations && reservations.length > 0) {
            await Promise.allSettled(
              (reservations as Array<{ id: string }>).map(({ id }) =>
                supabaseAdmin.rpc("release_inventory_reservation", {
                  p_reservation_id: id,
                }),
              ),
            );
          }
        }

        // ── Cancel the order ─────────────────────────────────────────────────
        // Mark the order as cancelled so it doesn't sit as pending forever.
        await supabaseAdmin
          .from("orders")
          .update({
            status: "cancelled",
            payment_status: "cancelled",
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        break;
      }

      default:
        console.log("Unhandled webhook event type:", event.type);
    }

    // Always return 200 to acknowledge receipt
    return jsonResponse({ received: true });
  } catch (err) {
    console.error("payment-webhook error:", err);
    // Return 200 for unexpected errors to prevent infinite retries.
    // Log and investigate separately.
    return jsonResponse({
      received: true,
      error: "Internal error — check logs",
    });
  }
});
