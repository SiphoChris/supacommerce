/**
 * CORS headers for Supabase Edge Functions.
 *
 * Adjust the allowed origin in production — wildcard is fine for
 * development but should be restricted to your domain(s) in prod.
 *
 * Usage:
 *   import { corsHeaders, handleCors } from "../_shared/cors.ts"
 *
 *   Deno.serve(async (req) => {
 *     const preflight = handleCors(req)
 *     if (preflight) return preflight
 *     // ... your handler
 *   })
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
}

/**
 * Handle CORS preflight OPTIONS request.
 * Returns a Response if this is a preflight, otherwise null.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  return null
}

/**
 * Create a JSON response with CORS headers.
 */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

/**
 * Create an error response with CORS headers.
 */
export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status)
}
