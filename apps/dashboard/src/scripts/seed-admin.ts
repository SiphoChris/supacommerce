/**
 * seed-admin.ts
 *
 * Bootstraps the first super_admin for a fresh supacommerce installation.
 * Run this once after your first `supabase db push`.
 *
 * Usage:
 *   pnpm seed:admin
 *
 * Reads from .env in the project root. Make sure these are set:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_SERVICE_ROLE_KEY
 *   VITE_ADMIN_EMAIL
 *   VITE_ADMIN_PASSWORD
 *   VITE_ADMIN_FIRST_NAME
 *   VITE_ADMIN_LAST_NAME
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env" });

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.VITE_ADMIN_EMAIL;
const password = process.env.VITE_ADMIN_PASSWORD;
const firstName = process.env.VITE_ADMIN_FIRST_NAME ?? "Admin";
const lastName = process.env.VITE_ADMIN_LAST_NAME ?? "User";

if (!url || !serviceRoleKey || !email || !password) {
  console.error(
    "\n❌ Missing required env vars in .env:\n" +
      "   VITE_SUPABASE_URL\n" +
      "   VITE_SUPABASE_SERVICE_ROLE_KEY\n" +
      "   VITE_ADMIN_EMAIL\n" +
      "   VITE_ADMIN_PASSWORD\n",
  );
  process.exit(1);
}

// Service role client — bypasses RLS
const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log(`\n🌱 Seeding first admin: ${email}\n`);

  // 1. Check if an admin already exists
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    console.log("✋ An admin already exists. Skipping seed.");
    console.log(
      "   Use the invite flow in the dashboard to add more admins.\n",
    );
    process.exit(0);
  }

  // 2. Create the auth user
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("⚠️  Auth user already exists, looking up by email...");
      const { data: users } = await supabase.auth.admin.listUsers();
      const found = users?.users.find((u) => u.email === email);
      if (!found) {
        console.error("❌ Could not find existing auth user.\n");
        process.exit(1);
      }
      await insertAdminUser(found.id);
    } else {
      console.error("❌ Failed to create auth user:", authError.message, "\n");
      process.exit(1);
    }
    return;
  }

  await insertAdminUser(authData.user.id);
}

async function insertAdminUser(userId: string) {
  // Delete any stray customer row created by the trigger
  await supabase.from("customers").delete().eq("user_id", userId);

  const { error } = await supabase.from("admin_users").insert({
    user_id: userId,
    email,
    first_name: firstName,
    last_name: lastName,
    role: "super_admin",
    is_active: true,
  });

  if (error) {
    console.error("❌ Failed to insert admin_users row:", error.message, "\n");
    process.exit(1);
  }

  console.log("✅ First admin created successfully!");
  console.log(`   Email:    ${email}`);
  console.log(`   Name:     ${firstName} ${lastName}`);
  console.log(`   Role:     super_admin`);
  console.log(`\n   Log in and use the invite flow to add more admins.\n`);
}

seed();
