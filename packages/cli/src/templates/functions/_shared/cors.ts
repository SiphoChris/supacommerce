// /**
//  * CORS headers for Supabase Edge Functions.
//  *
//  * Adjust the allowed origin in production — wildcard is fine for
//  * development but should be restricted to your domain(s) in prod.
//  *
//  * Usage:
//  *   import { corsHeaders, handleCors } from "../_shared/cors.ts"
//  *
//  *   Deno.serve(async (req) => {
//  *     const preflight = handleCors(req)
//  *     if (preflight) return preflight
//  *     // ... your handler
//  *   })
//  */

// export const corsHeaders = {
//   "Access-Control-Allow-Origin": Deno.env.get("DASHBOARD_URL") ?? "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
// };

// /**
//  * Handle CORS preflight OPTIONS request.
//  * Returns a Response if this is a preflight, otherwise null.
//  */
// export function handleCors(req: Request): Response | null {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }
//   return null;
// }

// /**
//  * Create a JSON response with CORS headers.
//  */
// export function jsonResponse(body: unknown, status = 200): Response {
//   return new Response(JSON.stringify(body), {
//     status,
//     headers: { ...corsHeaders, "Content-Type": "application/json" },
//   });
// }

// /**
//  * Create an error response with CORS headers.
//  */
// export function errorResponse(message: string, status = 500): Response {
//   return jsonResponse({ error: message }, status);
// }

/**
 * CORS headers for Supabase Edge Functions.
 *
 * Echoes the request Origin back in the response so any localhost port works
 * in development, and your deployed domain works in production without needing
 * to update a hardcoded DASHBOARD_URL env var.
 *
 * Usage:
 *   import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"
 *
 *   Deno.serve(async (req) => {
 *     const preflight = handleCors(req)
 *     if (preflight) return preflight
 *     const origin = req.headers.get("Origin") ?? ""
 *     // ...
 *     return jsonResponse({ result }, origin)
 *   })
 */

function getCorsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
}

/**
 * Handle CORS preflight OPTIONS request.
 * Returns a Response if this is a preflight, otherwise null.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("Origin") ?? "*";
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }
  return null;
}

/**
 * Create a JSON response with CORS headers.
 */
export function jsonResponse(
  body: unknown,
  origin = "*",
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create an error response with CORS headers.
 */
export function errorResponse(
  message: string,
  status = 500,
  origin = "*",
): Response {
  return jsonResponse({ error: message }, origin, status);
}
