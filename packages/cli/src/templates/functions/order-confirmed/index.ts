import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"

/**
 * order-confirmed
 *
 * Runs after payment is successfully captured. Atomically marks the
 * order as processing and reserves inventory via the confirm_order
 * Postgres function.
 *
 * This is called automatically by payment-webhook on successful payment.
 * You can also invoke it directly during development/testing.
 *
 * Request body:
 *   {
 *     orderId: string
 *     paymentSessionId: string
 *   }
 *
 * Response:
 *   { success: true }
 */

interface OrderConfirmedBody {
  orderId: string
  paymentSessionId: string
}

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req)
  if (preflight) return preflight

  try {
    const body: OrderConfirmedBody = await req.json()
    const { orderId, paymentSessionId } = body

    if (!orderId) return errorResponse("orderId is required", 400)
    if (!paymentSessionId) return errorResponse("paymentSessionId is required", 400)

    // ── 1. Confirm order atomically ─────────────────────────────────────────
    // confirm_order handles: order status update, payment session update,
    // payment collection update, and inventory reservation — in one transaction.
    const { error: confirmError } = await supabaseAdmin.rpc("confirm_order", {
      p_order_id: orderId,
      p_payment_session_id: paymentSessionId,
    })

    if (confirmError) {
      console.error("confirm_order RPC error:", confirmError)
      return errorResponse(`Failed to confirm order: ${confirmError.message}`, 500)
    }

    // ── 2. Send confirmation email ───────────────────────────────────────────
    // TODO: send order confirmation email to the customer.
    //
    // Options:
    //   - Resend: https://resend.com/docs/send-email
    //   - Postmark, SendGrid, or any SMTP provider
    //
    // Example with Resend:
    //   const resend = new Resend(Deno.env.get("RESEND_API_KEY")!)
    //   const { data: order } = await supabaseAdmin
    //     .from("orders")
    //     .select("*, order_line_items(*)")
    //     .eq("id", orderId)
    //     .single()
    //
    //   await resend.emails.send({
    //     from: "orders@yourdomain.com",
    //     to: order.email,
    //     subject: `Order #${order.display_id} confirmed`,
    //     html: renderOrderConfirmationEmail(order),
    //   })

    // ── 3. Trigger fulfillment ───────────────────────────────────────────────
    // TODO: notify your fulfilment provider that an order is ready.
    //
    // Manual fulfilment: no action needed here — handle in your admin UI.
    // 3PL integration: call your provider's API to create a shipment.
    //
    // Example:
    //   if (Deno.env.get("SHIPBOB_API_KEY")) {
    //     await createShipBobOrder(order)
    //   }

    return jsonResponse({ success: true })
  } catch (err) {
    console.error("order-confirmed error:", err)
    return errorResponse("Internal server error", 500)
  }
})
