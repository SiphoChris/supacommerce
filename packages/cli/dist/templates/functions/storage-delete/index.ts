import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

/**
 * storage-delete
 *
 * Deletes one or more files from Supabase Storage using the service role key.
 * This bypasses RLS so the caller only needs to be a valid admin user —
 * object ownership is not required.
 *
 * Request: POST application/json
 *   { "bucket": "products", "paths": ["thumbnails/123_file.jpg"] }
 *
 * Response:
 *   { "deleted": ["thumbnails/123_file.jpg"] }
 *
 * Auth:
 *   Requires a valid Supabase JWT in the Authorization header.
 *   Only admin users (present in admin_users table) may delete.
 */

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  const origin = req.headers.get("Origin") ?? "*";

  try {
    // ── Auth — verify caller is an active admin user ───────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");

    if (!jwt) return errorResponse("Unauthorized", 401, origin);

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(jwt);
    if (authError || !user) return errorResponse("Unauthorized", 401, origin);

    const { count } = await supabaseAdmin
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (!count || count === 0) return errorResponse("Forbidden", 403, origin);

    // ── Parse request body ────────────────────────────────────────────────────
    const body = await req.json();
    const bucket = body?.bucket as string | undefined;
    const paths = body?.paths as string[] | undefined;

    if (!bucket) return errorResponse("No bucket specified", 400, origin);
    if (!paths || paths.length === 0)
      return errorResponse("No paths specified", 400, origin);

    // ── Delete using service role — bypasses RLS ──────────────────────────────
    const { error: deleteError } = await supabaseAdmin.storage
      .from(bucket)
      .remove(paths);

    if (deleteError) {
      console.error("Storage delete error:", deleteError);
      return errorResponse(
        `Delete failed: ${deleteError.message}`,
        500,
        origin,
      );
    }

    return jsonResponse({ deleted: paths }, origin);
  } catch (err) {
    console.error("storage-delete error:", err);
    return errorResponse("Internal server error", 500, origin);
  }
});
