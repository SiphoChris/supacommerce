import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core"

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "admin",
  "developer",
  "manager",
  "viewer",
])

/**
 * admin_users
 *
 * Admin accounts are linked to Supabase auth.users via user_id,
 * exactly like customer accounts — but with a role for authorization.
 *
 * RLS policies use the is_admin() helper function (defined in rls.sql)
 * to gate access to admin-only operations.
 *
 * To create the first super_admin:
 *   1. Create a user via Supabase Auth (dashboard or API)
 *   2. INSERT into admin_users with their auth user_id
 *
 * ⚠️  Never expose admin operations through the anon key client.
 *    Admin routes must use the service role key OR validate the
 *    admin_users table in an edge function before proceeding.
 */
export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** References auth.users(id) */
    userId: uuid("user_id").notNull().unique(),

    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    avatarUrl: text("avatar_url"),

    role: adminRoleEnum("role").notNull().default("viewer"),
    isActive: boolean("is_active").notNull().default(true),

    metadata: jsonb("metadata"),

    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("admin_users_user_id_idx").on(t.userId),
    index("admin_users_email_idx").on(t.email),
  ]
)

/**
 * admin_invitations
 *
 * Invite flow for new admin users. Generate a token, email it to the
 * invitee, and create the admin_users record when they accept.
 */
export const adminInvitations = pgTable("admin_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  role: adminRoleEnum("role").notNull().default("viewer"),
  token: text("token").notNull().unique(),
  invitedById: uuid("invited_by_id").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type AdminUser = typeof adminUsers.$inferSelect
export type NewAdminUser = typeof adminUsers.$inferInsert
export type AdminInvitation = typeof adminInvitations.$inferSelect
