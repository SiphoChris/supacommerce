import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * Supabase client initialised with the SERVICE ROLE key.
 *
 * ⚠️  This client bypasses Row Level Security entirely.
 *    Only use it in edge functions — never expose the service role key
 *    to the browser or mobile client.
 *
 * Usage:
 *   import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"
 *
 *   const { data, error } = await supabaseAdmin
 *     .from("orders")
 *     .select("*")
 */
export const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
