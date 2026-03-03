import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  jsonb,
  index,
} from "drizzle-orm/pg-core"

/**
 * customers
 *
 * Customer profiles are linked 1:1 to Supabase auth.users via userId.
 * The profile is created automatically via a Postgres trigger when a
 * new user signs up (including anonymous users via signInAnonymously()).
 *
 * Anonymous users have isAnonymous = true. When they upgrade to a full
 * account, Supabase updates auth.users and you should update isAnonymous
 * here. Their cart is preserved because it references customer_id.
 *
 * Trigger to auto-create a profile on signup (add to your migrations):
 *
 *   create or replace function public.handle_new_user()
 *   returns trigger language plpgsql security definer set search_path = ''
 *   as $$
 *   begin
 *     insert into public.customers (user_id, email, is_anonymous)
 *     values (
 *       new.id,
 *       new.email,
 *       coalesce((new.raw_app_meta_data->>'provider') = 'anonymous', false)
 *     );
 *     return new;
 *   end;
 *   $$;
 *
 *   create trigger on_auth_user_created
 *     after insert on auth.users
 *     for each row execute procedure public.handle_new_user();
 */
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** References auth.users(id) — set null if the auth user is deleted */
    userId: uuid("user_id").unique(),

    email: varchar("email", { length: 255 }),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    phone: varchar("phone", { length: 30 }),
    avatarUrl: text("avatar_url"),

    isAnonymous: boolean("is_anonymous").notNull().default(false),

    /** Optional: group membership for B2B / loyalty tiers */
    groupId: uuid("group_id"),

    /** Arbitrary metadata — store provider-specific IDs (Stripe customer ID, etc.) */
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("customers_user_id_idx").on(t.userId), index("customers_email_idx").on(t.email)]
)

/**
 * customer_groups
 *
 * Groups for segmentation — B2B pricing tiers, loyalty programs, VIP access.
 * Assign a customer to a group via customers.group_id.
 */
export const customerGroups = pgTable("customer_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * customer_addresses
 *
 * Saved addresses on a customer's account. These are the canonical
 * address records. When used in an order or cart, the address is
 * snapshotted as JSONB — so historical records remain accurate even
 * if the customer later edits or deletes the address.
 */
export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),

    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    company: varchar("company", { length: 150 }),
    address1: varchar("address_1", { length: 255 }).notNull(),
    address2: varchar("address_2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    province: varchar("province", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    isDefault: boolean("is_default").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("customer_addresses_customer_id_idx").on(t.customerId)]
)

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type CustomerGroup = typeof customerGroups.$inferSelect
export type CustomerAddress = typeof customerAddresses.$inferSelect
export type NewCustomerAddress = typeof customerAddresses.$inferInsert
