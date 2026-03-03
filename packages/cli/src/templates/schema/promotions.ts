import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core"

export const promotionTypeEnum = pgEnum("promotion_type", [
  "percentage",
  "fixed_amount",
  "free_shipping",
  "buy_x_get_y",
])

export const promotionStatusEnum = pgEnum("promotion_status", [
  "draft",
  "active",
  "expired",
  "archived",
])

export const promotionRuleTypeEnum = pgEnum("promotion_rule_type", [
  "cart_total",
  "product",
  "product_category",
  "customer_group",
  "usage_limit",
])

/**
 * promotions
 *
 * A promotion is a discount that can be applied to a cart.
 * Promotions can be code-based (customer enters a code) or automatic
 * (applied when cart conditions are met).
 */
export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 100 }).unique(),
    type: promotionTypeEnum("type").notNull(),
    status: promotionStatusEnum("status").notNull().default("draft"),
    description: text("description"),

    /** Percentage value (0–100) or fixed integer amount in smallest currency unit */
    value: integer("value").notNull(),

    /** Whether the code is case-insensitive */
    isCaseInsensitive: boolean("is_case_insensitive").notNull().default(true),

    /** null = unlimited usage */
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").notNull().default(0),

    /** Per-customer usage limit */
    usageLimitPerCustomer: integer("usage_limit_per_customer"),

    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),

    /** Whether this promotion is automatically applied (no code needed) */
    isAutomatic: boolean("is_automatic").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("promotions_code_idx").on(t.code),
    index("promotions_status_idx").on(t.status),
  ]
)

/**
 * promotion_rules
 *
 * Conditions that must be met for a promotion to be applied.
 * Multiple rules on a promotion are AND'd together.
 *
 * Examples:
 *   type: "cart_total", value: "5000"  → cart must be >= $50.00
 *   type: "product", value: "<product_id>"  → cart must contain product
 *   type: "customer_group", value: "<group_id>"  → customer must be in group
 */
export const promotionRules = pgTable("promotion_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  promotionId: uuid("promotion_id")
    .notNull()
    .references(() => promotions.id, { onDelete: "cascade" }),
  type: promotionRuleTypeEnum("type").notNull(),

  /** Serialized rule value — interpretation depends on type */
  value: text("value").notNull(),

  description: text("description"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * promotion_usages
 *
 * Records each time a promotion is used against an order.
 * Used to enforce usage_limit and usage_limit_per_customer.
 */
export const promotionUsages = pgTable(
  "promotion_usages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promotionId: uuid("promotion_id")
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").notNull(),
    customerId: uuid("customer_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("promotion_usages_promotion_id_idx").on(t.promotionId),
    index("promotion_usages_customer_id_idx").on(t.customerId),
  ]
)

export type Promotion = typeof promotions.$inferSelect
export type NewPromotion = typeof promotions.$inferInsert
export type PromotionRule = typeof promotionRules.$inferSelect
export type PromotionUsage = typeof promotionUsages.$inferSelect
