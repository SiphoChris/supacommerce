import {
  corsHeaders,
  handleCors,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.js";
import { supabaseAdmin } from "../_shared/supabaseAdmin.js";

interface AcceptInvitePayload {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const { token, firstName, lastName, password } =
      (await req.json()) as AcceptInvitePayload;

    // ── 1. Validate inputs ─────────────────────────────────────────────────
    if (!token?.trim()) return errorResponse("Token is required", 400);
    if (!firstName?.trim()) return errorResponse("First name is required", 400);
    if (!lastName?.trim()) return errorResponse("Last name is required", 400);
    if (!password || password.length < 8)
      return errorResponse("Password must be at least 8 characters", 400);

    // ── 2. Look up the invitation ──────────────────────────────────────────
    const { data: invitation, error: invError } = await supabaseAdmin
      .from("admin_invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (invError || !invitation) {
      return errorResponse("Invalid invitation token", 404);
    }

    if (invitation.accepted_at) {
      return errorResponse("This invitation has already been accepted", 409);
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return errorResponse("This invitation has expired", 410);
    }

    // ── 3. Create the auth user (email pre-confirmed, no confirmation email)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: invitation.email,
        password,
        email_confirm: true, // skip confirmation email entirely
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

    if (authError || !authData.user) {
      // Handle case where auth user already exists (e.g. retry after partial failure)
      if (authError?.message?.includes("already been registered")) {
        return errorResponse(
          "An account with this email already exists. Contact an admin.",
          409,
        );
      }
      return errorResponse(
        `Failed to create auth account: ${authError?.message ?? "unknown"}`,
        500,
      );
    }

    const authUserId = authData.user.id;

    // ── 4. Insert admin_users row ──────────────────────────────────────────
    const { error: insertError } = await supabaseAdmin
      .from("admin_users")
      .insert({
        user_id: authUserId,
        email: invitation.email,
        first_name: firstName,
        last_name: lastName,
        role: invitation.role,
        is_active: true,
      });

    if (insertError) {
      // Rollback: delete the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return errorResponse(
        `Failed to create admin record: ${insertError.message}`,
        500,
      );
    }

    // ── 5. Stamp accepted_at on the invitation ─────────────────────────────
    const { error: updateError } = await supabaseAdmin
      .from("admin_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (updateError) {
      // Non-fatal — the admin user was created successfully.
      // Log it but don't roll back. The invite can be manually marked accepted.
      console.error(
        "Failed to stamp accepted_at on invitation:",
        updateError.message,
      );
    }

    // ── 6. Return success ──────────────────────────────────────────────────
    return jsonResponse({
      success: true,
      email: invitation.email,
      role: invitation.role,
    });
  } catch (err) {
    console.error("admin-accept-invite error:", err);
    return errorResponse("Internal server error", 500);
  }
});
