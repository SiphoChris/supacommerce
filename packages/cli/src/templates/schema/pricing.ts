import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  text,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { productVariants } from "./catalog.ts";
import { currencies } from "./currencies.ts";
import { regions } from "./regions.ts";
import { customerGroups } from "./customers.ts";

export const priceListTypeEnum = pgEnum("price_list_type", [
  "sale",
  "override",
]);
export const priceListStatusEnum = pgEnum("price_list_status", [
  "active",
  "draft",
]);

/**
 * price_sets
 *
 * A price set is a collection of prices for a single variant across
 * multiple currencies and regions. One variant = one price set.
 *
 * This separation allows a future where pricing logic lives independently
 * of the catalog (e.g. dynamic pricing, A/B testing).
 */
export const priceSets = pgTable("price_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id")
    .notNull()
    .unique()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * prices
 *
 * A concrete price within a price set. Amounts are stored as integers
 * in the smallest currency unit (cents for USD, etc.).
 *
 * region_id and currency_code can both be set for maximum flexibility:
 *   - currency_code only → applies across all regions using that currency
 *   - region_id only → applies to that region regardless of currency
 *   - both → most specific, applies to that region+currency combination
 *
 * min_quantity / max_quantity enable tiered/volume pricing.
 */
export const prices = pgTable(
  "prices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    priceSetId: uuid("price_set_id")
      .notNull()
      .references(() => priceSets.id, { onDelete: "cascade" }),

    currencyCode: varchar("currency_code", { length: 3 })
      .notNull()
      .references(() => currencies.code),

    regionId: uuid("region_id").references(() => regions.id, {
      onDelete: "cascade",
    }),

    /** Integer in smallest currency unit */
    amount: integer("amount").notNull(),

    /** For volume/tiered pricing. null = no minimum */
    minQuantity: integer("min_quantity"),

    /** For volume/tiered pricing. null = no maximum */
    maxQuantity: integer("max_quantity"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("prices_price_set_id_idx").on(t.priceSetId),
    index("prices_currency_code_idx").on(t.currencyCode),
    index("prices_region_id_idx").on(t.regionId),
  ],
);

/**
 * price_lists
 *
 * A price list is a set of overriding prices for a specific context —
 * a sale event, a VIP customer group, a B2B contract, etc.
 *
 * type "sale"     → prices are applied on top of regular prices
 * type "override" → prices completely replace regular prices
 */
export const priceLists = pgTable("price_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: priceListTypeEnum("type").notNull().default("sale"),
  status: priceListStatusEnum("status").notNull().default("draft"),

  /** When the price list becomes active */
  startsAt: timestamp("starts_at", { withTimezone: true }),

  /** When the price list expires */
  endsAt: timestamp("ends_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/**
 * price_list_customer_groups
 *
 * Restricts a price list to specific customer groups.
 * If no groups are linked, the price list applies to all customers.
 */
export const priceListCustomerGroups = pgTable("price_list_customer_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  priceListId: uuid("price_list_id")
    .notNull()
    .references(() => priceLists.id, { onDelete: "cascade" }),
  groupId: uuid("group_id")
    .notNull()
    .references(() => customerGroups.id, { onDelete: "cascade" }),
});

/**
 * price_list_prices
 *
 * The actual prices within a price list. Same structure as prices
 * but scoped to a price_list rather than a price_set.
 */
export const priceListPrices = pgTable(
  "price_list_prices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    priceListId: uuid("price_list_id")
      .notNull()
      .references(() => priceLists.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    currencyCode: varchar("currency_code", { length: 3 })
      .notNull()
      .references(() => currencies.code),
    regionId: uuid("region_id").references(() => regions.id, {
      onDelete: "cascade",
    }),
    amount: integer("amount").notNull(),
    minQuantity: integer("min_quantity"),
    maxQuantity: integer("max_quantity"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("price_list_prices_price_list_id_idx").on(t.priceListId)],
);

export type PriceSet = typeof priceSets.$inferSelect;
export type Price = typeof prices.$inferSelect;
export type NewPrice = typeof prices.$inferInsert;
export type PriceList = typeof priceLists.$inferSelect;
export type NewPriceList = typeof priceLists.$inferInsert;
