import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

// React Email renders to HTML string — we inline it here since Deno edge
// functions don't support JSX imports without a build step. The template
// is minimal and hand-written as an HTML string for simplicity.

interface SendInvitePayload {
  invitationId: string;
}

function renderInviteEmail(params: {
  email: string;
  role: string;
  acceptUrl: string;
  expiresAt: string;
}): string {
  const { email, role, acceptUrl, expiresAt } = params;
  const roleDisplay = role.replace(/_/g, " ");
  const expiryDisplay = new Date(expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to Supacommerce</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f0f0f;padding:32px 40px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                Supacommerce
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f0f0f;letter-spacing:-0.5px;">
                You've been invited
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                You've been invited to join the Supacommerce admin dashboard as
                <strong style="color:#0f0f0f;">${roleDisplay}</strong>.
              </p>

              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">
                Invited email
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#0f0f0f;font-weight:500;">
                ${email}
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#0f0f0f;border-radius:6px;">
                    <a href="${acceptUrl}"
                       style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">
                      Accept invitation →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">
                Or copy this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#6b7280;word-break:break-all;">
                ${acceptUrl}
              </p>

              <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 0 24px;" />

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                This invitation expires on <strong style="color:#6b7280;">${expiryDisplay}</strong>.
                If you weren't expecting this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Sent by Supacommerce · noreply@supacommerce.dev
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const { invitationId } = (await req.json()) as SendInvitePayload;

    if (!invitationId?.trim()) {
      return errorResponse("invitationId is required", 400);
    }

    // ── 1. Load the invitation ─────────────────────────────────────────────
    const { data: invitation, error: invError } = await supabaseAdmin
      .from("admin_invitations")
      .select("*")
      .eq("id", invitationId)
      .single();

    if (invError || !invitation) {
      return errorResponse("Invitation not found", 404);
    }

    if (invitation.accepted_at) {
      return errorResponse("Invitation already accepted", 409);
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return errorResponse("Invitation has expired", 410);
    }

    // ── 2. Build the accept URL ────────────────────────────────────────────
    const dashboardUrl =
      Deno.env.get("DASHBOARD_URL") ?? "http://localhost:5173";
    const acceptUrl = `${dashboardUrl}/accept-invite?token=${invitation.token}`;

    // ── 3. Render email HTML ───────────────────────────────────────────────
    const html = renderInviteEmail({
      email: invitation.email,
      role: invitation.role,
      acceptUrl,
      expiresAt: invitation.expires_at,
    });

    // ── 4. Send via Resend ─────────────────────────────────────────────────
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return errorResponse("RESEND_API_KEY is not configured", 500);
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          Deno.env.get("RESEND_FROM") ?? "Supacommerce <onboarding@resend.dev>",
        to: [invitation.email],
        subject: "You've been invited to Supacommerce",
        html,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.text();
      console.error("Resend error:", resendError);
      return errorResponse(`Failed to send email: ${resendError}`, 500);
    }

    return jsonResponse({ success: true, email: invitation.email });
  } catch (err) {
    console.error("admin-send-invite error:", err);
    return errorResponse("Internal server error", 500);
  }
});
