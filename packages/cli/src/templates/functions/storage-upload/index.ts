import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");

    if (!jwt) return errorResponse("Unauthorized", 401);

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (authError || !user) return errorResponse("Unauthorized", 401);

    const { count, error: countError } = await supabaseAdmin
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true);

    console.log("admin_users count:", count);
    console.log("countError:", countError?.message);

    if (!count || count === 0) return errorResponse("Forbidden", 403);

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return errorResponse("Expected multipart/form-data", 400);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string | null)?.trim();
    const pathPrefix = (formData.get("path") as string | null)?.trim() ?? "";

    if (!file) return errorResponse("No file provided", 400);
    if (!bucket) return errorResponse("No bucket specified", 400);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse(`File type not allowed: ${file.type}`, 400);
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
    const storagePath = pathPrefix
      ? `${pathPrefix}/${timestamp}_${safeName}`
      : `${timestamp}_${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return errorResponse(`Upload failed: ${uploadError.message}`, 500);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return jsonResponse({ url: urlData.publicUrl });
  } catch (err) {
    console.error("storage-upload error:", err);
    return errorResponse("Internal server error", 500);
  }
});
