import { createClient } from "@supacommerce/client";
import { supabase } from "./supabase";

export const commerce = createClient(supabase);
