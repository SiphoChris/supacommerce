import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  text,
  pgEnum,
  index,
} from "drizzle-orm/pg-core"
import { customers } from "./customers.ts"
import { regions } from "./regions.ts"
import { currencies } from "./currencies.ts"
import { productVariants } from "./catalog.ts"
import { shippingOptions } from "./fulfillment.ts"

export const cartStatusEnum = pgEnum("cart_status", [
  "active",
  "completed",
  "abandoned",
])

/**
 * carts
 *
 * A cart belongs to a customer (authenticated or anonymous via Supabase
 * anonymous auth). There are no guest carts without any auth identity.
 *
 * Anonymous users are created via supabase.auth.signInAnonymously().
 * Their cart persists across sessions and can be merged when they
 * sign up for a full account.
 *
 * Addresses on carts are stored as JSONB snapshots. This means:
 *   1. The checkout edge function captures the address at time of order
 *   2. Historical orders remain accurate if the customer updates addresses
 *   3. No FK constraints needed — simpler schema
 *
 * All monetary amounts are integers in the smallest currency unit.
 */
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    regionId: uuid("region_id").references(() => regions.id, { onDelete: "set null" }),
    currencyCode: varchar("currency_code", { length: 3 }).references(() => currencies.code),
    email: varchar("email", { length: 255 }),
    status: cartStatusEnum("status").notNull().default("active"),

    /** JSONB address snapshot */
    shippingAddress: jsonb("shipping_address"),
    billingAddress: jsonb("billing_address"),

    /** Applied promotion codes (array of code strings) */
    promotionCodes: jsonb("promotion_codes").$type<string[]>().default([]),

    /** Totals — computed by the checkout edge function */
    subtotal: integer("subtotal").notNull().default(0),
    discountTotal: integer("discount_total").notNull().default(0),
    shippingTotal: integer("shipping_total").notNull().default(0),
    taxTotal: integer("tax_total").notNull().default(0),
    total: integer("total").notNull().default(0),

    completedAt: timestamp("completed_at", { withTimezone: true }),

    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("carts_customer_id_idx").on(t.customerId),
    index("carts_status_idx").on(t.status),
  ]
)

/**
 * cart_line_items
 *
 * Each line item represents a variant + quantity in the cart.
 * unit_price is snapshotted at the time the item is added so that
 * price changes don't silently affect an open cart.
 */
export const cartLineItems = pgTable(
  "cart_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),

    /** Denormalised from variant/product at time of add — survives product deletion */
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    thumbnail: text("thumbnail"),
    productId: uuid("product_id"),

    quantity: integer("quantity").notNull().default(1),

    /** Price per unit at time of add. Integer, smallest currency unit. */
    unitPrice: integer("unit_price").notNull(),

    /** unit_price * quantity */
    subtotal: integer("subtotal").notNull(),

    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("cart_line_items_cart_id_idx").on(t.cartId),
    index("cart_line_items_variant_id_idx").on(t.variantId),
  ]
)

/**
 * cart_shipping_methods
 *
 * The shipping method selected by the customer during checkout.
 * Stores a snapshot of the price at time of selection.
 */
export const cartShippingMethods = pgTable("cart_shipping_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  shippingOptionId: uuid("shipping_option_id").references(() => shippingOptions.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),

  /** Snapshotted price at time of selection */
  price: integer("price").notNull(),

  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Cart = typeof carts.$inferSelect
export type NewCart = typeof carts.$inferInsert
export type CartLineItem = typeof cartLineItems.$inferSelect
export type NewCartLineItem = typeof cartLineItems.$inferInsert
export type CartShippingMethod = typeof cartShippingMethods.$inferSelect
