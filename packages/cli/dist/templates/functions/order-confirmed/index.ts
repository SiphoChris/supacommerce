import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

/**
 * order-confirmed
 *
 * Runs after payment is successfully captured. Two responsibilities:
 *   1. Atomically confirm the order via confirm_order RPC
 *      (order status → processing, inventory reservations → confirmed)
 *   2. Send an order confirmation email to the customer via Resend
 *
 * Called automatically by payment-webhook on payment_intent.succeeded.
 * Can also be invoked directly for testing.
 *
 * Request body:
 *   { orderId: string, paymentSessionId: string }
 *
 * Response:
 *   { success: true }
 */

interface OrderConfirmedBody {
  orderId: string;
  paymentSessionId: string;
}

type OrderRow = {
  id: string;
  display_id: number;
  email: string;
  currency_code: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  shipping_address: Record<string, unknown> | null;
  order_line_items: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    thumbnail: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    total: number;
  }>;
};

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const body: OrderConfirmedBody = await req.json();
    const { orderId, paymentSessionId } = body;

    if (!orderId) return errorResponse("orderId is required", 400);
    if (!paymentSessionId)
      return errorResponse("paymentSessionId is required", 400);

    // ── 1. Confirm order atomically ───────────────────────────────────────────
    // confirm_order handles in one transaction:
    //   - order status        → processing
    //   - payment session     → captured
    //   - payment collection  → captured
    //   - inventory reservations → pending → confirmed (or creates confirmed if missing)
    const { error: confirmError } = await supabaseAdmin.rpc("confirm_order", {
      p_order_id: orderId,
      p_payment_session_id: paymentSessionId,
    });

    if (confirmError) {
      console.error("confirm_order RPC error:", confirmError);
      return errorResponse(
        `Failed to confirm order: ${confirmError.message}`,
        500,
      );
    }

    // ── 2. Send confirmation email ────────────────────────────────────────────
    // Fetch the order with line items for the email body.
    // Non-fatal — order is confirmed regardless of email success.
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id, display_id, email, currency_code,
        subtotal, discount_total, shipping_total, tax_total, total,
        shipping_address,
        order_line_items (
          id, title, subtitle, thumbnail,
          quantity, unit_price, subtotal, total
        )
      `,
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Failed to load order for email:", orderError);
      return jsonResponse({ success: true, emailSent: false });
    }

    const o = order as unknown as OrderRow;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromAddress = Deno.env.get("EMAIL_FROM") ?? "orders@yourdomain.com";

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — skipping confirmation email");
      return jsonResponse({ success: true, emailSent: false });
    }

    const emailHtml = renderConfirmationEmail(o);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: o.email,
        subject: `Order #${o.display_id} confirmed — thank you!`,
        html: emailHtml,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend email failed:", errText);
      return jsonResponse({ success: true, emailSent: false });
    }

    // ── 3. Fulfillment ────────────────────────────────────────────────────────
    // Manual fulfillment — no external trigger needed.
    // Admin processes shipments via the dashboard.
    // When PAXI integration is ready, call their API here.

    return jsonResponse({ success: true, emailSent: true });
  } catch (err) {
    console.error("order-confirmed error:", err);
    return errorResponse("Internal server error", 500);
  }
});

// ── Email renderer ────────────────────────────────────────────────────────────

/**
 * Renders a plain but readable HTML order confirmation email.
 * Swap this out for a proper template engine (MJML, React Email, etc.)
 * when you're ready to brand it.
 */
function renderConfirmationEmail(order: OrderRow): string {
  const fmt = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  const currency = order.currency_code ?? "ZAR";

  const itemRows = order.order_line_items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
          <strong>${item.title}</strong>${item.subtitle ? `<br><span style="color:#666;font-size:13px;">${item.subtitle}</span>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;">
          ${fmt(item.total, currency)}
        </td>
      </tr>`,
    )
    .join("");

  const addr = order.shipping_address;
  const addressLines = addr
    ? [
        [addr.firstName, addr.lastName].filter(Boolean).join(" "),
        addr.address1,
        addr.address2,
        [addr.city, addr.province, addr.postalCode].filter(Boolean).join(", "),
        addr.countryCode,
      ]
        .filter(Boolean)
        .map((l) => `<div>${l}</div>`)
        .join("")
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#c8ff00;padding:32px 40px;">
              <h1 style="margin:0;font-size:24px;color:#1a1a1a;">Order Confirmed</h1>
              <p style="margin:8px 0 0;font-size:15px;color:#1a1a1a;">
                Order <strong>#${order.display_id}</strong>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;">
                Thank you for your order. We'll let you know when it's on its way.
              </p>

              <!-- Line items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;">
                <thead>
                  <tr>
                    <th style="padding:8px 0;text-align:left;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;">Item</th>
                    <th style="padding:8px 0;text-align:center;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;">Qty</th>
                    <th style="padding:8px 0;text-align:right;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                ${
                  order.discount_total > 0
                    ? `
                <tr>
                  <td style="padding:4px 0;color:#666;">Subtotal</td>
                  <td style="padding:4px 0;text-align:right;">${fmt(order.subtotal, currency)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#16a34a;">Discount</td>
                  <td style="padding:4px 0;text-align:right;color:#16a34a;">−${fmt(order.discount_total, currency)}</td>
                </tr>`
                    : ""
                }
                ${
                  order.shipping_total > 0
                    ? `
                <tr>
                  <td style="padding:4px 0;color:#666;">Shipping</td>
                  <td style="padding:4px 0;text-align:right;">${fmt(order.shipping_total, currency)}</td>
                </tr>`
                    : ""
                }
                ${
                  order.tax_total > 0
                    ? `
                <tr>
                  <td style="padding:4px 0;color:#666;">Tax</td>
                  <td style="padding:4px 0;text-align:right;">${fmt(order.tax_total, currency)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:12px 0 4px;font-weight:700;font-size:16px;border-top:2px solid #1a1a1a;">Total</td>
                  <td style="padding:12px 0 4px;text-align:right;font-weight:700;font-size:16px;border-top:2px solid #1a1a1a;">${fmt(order.total, currency)}</td>
                </tr>
              </table>

              <!-- Shipping address -->
              ${
                addressLines
                  ? `
              <div style="margin-top:32px;">
                <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;color:#999;font-weight:600;">Shipping to</h3>
                <div style="font-size:14px;line-height:1.6;">${addressLines}</div>
              </div>`
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f9f9f9;font-size:12px;color:#999;text-align:center;">
              If you have any questions, reply to this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
