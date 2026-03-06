import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  real,
  index,
} from "drizzle-orm/pg-core"
import { regions } from "./regions.ts"

/**
 * tax_regions
 *
 * A tax region maps to a geographic jurisdiction — typically a country
 * or a country + province/state combination.
 *
 * tax_regions are more granular than commerce regions. A single commerce
 * region (e.g. "North America") may contain many tax regions
 * (e.g. "US/CA", "US/NY", "Canada").
 */
export const taxRegions = pgTable(
  "tax_regions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    regionId: uuid("region_id").references(() => regions.id, { onDelete: "cascade" }),

    countryCode: varchar("country_code", { length: 2 }).notNull(),

    /** null = applies to entire country */
    provinceCode: varchar("province_code", { length: 10 }),

    name: varchar("name", { length: 255 }).notNull(),

    /** Reference ID in your external tax provider (TaxJar, Avalara, etc.) */
    providerId: varchar("provider_id", { length: 255 }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tax_regions_country_code_idx").on(t.countryCode),
    index("tax_regions_region_id_idx").on(t.regionId),
  ]
)

/**
 * tax_rates
 *
 * One or more rates within a tax region. You can have multiple rates
 * to represent different tax categories (standard, reduced, zero).
 *
 * rate is a decimal percentage — e.g. 0.20 = 20% VAT, 0.0875 = 8.75% sales tax
 */
export const taxRates = pgTable(
  "tax_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taxRegionId: uuid("tax_region_id")
      .notNull()
      .references(() => taxRegions.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 100 }),

    /** Decimal rate — 0.20 = 20%. Stored as real for flexibility. */
    rate: real("rate").notNull(),

    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tax_rates_tax_region_id_idx").on(t.taxRegionId)]
)

/**
 * tax_rate_product_categories
 *
 * Override the default tax rate for specific product categories.
 * e.g. Children's clothing at 0% in the UK while standard rate is 20%.
 */
export const taxRateProductCategories = pgTable("tax_rate_product_categories", {
  taxRateId: uuid("tax_rate_id")
    .notNull()
    .references(() => taxRates.id, { onDelete: "cascade" }),
  productCategoryId: uuid("product_category_id").notNull(),
})

export type TaxRegion = typeof taxRegions.$inferSelect
export type NewTaxRegion = typeof taxRegions.$inferInsert
export type TaxRate = typeof taxRates.$inferSelect
export type NewTaxRate = typeof taxRates.$inferInsert
