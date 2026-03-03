import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core"
import { regions } from "./regions.ts"

export const shippingOptionTypeEnum = pgEnum("shipping_option_type", [
  "flat_rate",
  "calculated",
  "free",
])

export const shippingProfileTypeEnum = pgEnum("shipping_profile_type", [
  "default",
  "gift_card",
  "custom",
])

/**
 * shipping_profiles
 *
 * A profile groups products that share the same shipping behaviour.
 * e.g. "Default", "Large/Freight", "Digital" (no shipping required)
 *
 * Products are assigned to a profile. The profile determines which
 * shipping options are available at checkout.
 */
export const shippingProfiles = pgTable("shipping_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  type: shippingProfileTypeEnum("type").notNull().default("default"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})

/**
 * fulfillment_providers
 *
 * A registered shipping carrier or fulfilment service.
 * e.g. "manual", "shippo", "shipbob", "easypost"
 *
 * The id is a string slug so your edge functions can switch on it:
 *   if (provider.id === "shippo") { ... }
 */
export const fulfillmentProviders = pgTable("fulfillment_providers", {
  id: varchar("id", { length: 100 }).primaryKey(),
  isInstalled: boolean("is_installed").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * shipping_options
 *
 * A purchasable shipping method within a region.
 * e.g. "Standard Shipping $5", "Express $15", "Free Shipping"
 *
 * amount is an integer in the smallest currency unit.
 * For calculated shipping, amount is 0 and price is determined at checkout.
 */
export const shippingOptions = pgTable(
  "shipping_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    regionId: uuid("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id").references(() => shippingProfiles.id, {
      onDelete: "set null",
    }),
    providerId: varchar("provider_id", { length: 100 }).references(
      () => fulfillmentProviders.id
    ),
    type: shippingOptionTypeEnum("type").notNull().default("flat_rate"),

    /** Integer in smallest currency unit. 0 for calculated or free options. */
    amount: integer("amount").notNull().default(0),

    isActive: boolean("is_active").notNull().default(true),

    /** Whether this option is only available for returns */
    isReturn: boolean("is_return").notNull().default(false),

    /** Arbitrary data passed to the provider (e.g. carrier service code) */
    data: jsonb("data"),

    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("shipping_options_region_id_idx").on(t.regionId)]
)

/**
 * shipping_option_requirements
 *
 * Conditions that must be met for a shipping option to be available.
 * e.g. min_subtotal: 5000 → only available if cart subtotal >= $50
 */
export const shippingOptionRequirements = pgTable("shipping_option_requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  shippingOptionId: uuid("shipping_option_id")
    .notNull()
    .references(() => shippingOptions.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // "min_subtotal" | "max_subtotal"
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type ShippingProfile = typeof shippingProfiles.$inferSelect
export type FulfillmentProvider = typeof fulfillmentProviders.$inferSelect
export type ShippingOption = typeof shippingOptions.$inferSelect
export type NewShippingOption = typeof shippingOptions.$inferInsert
