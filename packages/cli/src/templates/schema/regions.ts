import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core"
import { currencies } from "./currencies.ts"

/**
 * regions
 *
 * A region groups countries together under a common currency, tax
 * configuration, and set of payment/fulfilment providers. This is the
 * primary way to support multi-currency and multi-locale storefronts.
 *
 * Example regions: "North America" (USD), "Europe" (EUR), "UK" (GBP)
 */
export const regions = pgTable("regions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  currencyCode: varchar("currency_code", { length: 3 })
    .notNull()
    .references(() => currencies.code),

  /**
   * Legacy display-only tax rate for the region — stored as a string,
   * e.g. "0.20" or "20". This is NOT used for tax calculations.
   *
   * For actual tax calculation use TaxClient.calculate() which reads
   * from the tax_regions / tax_rates tables and returns a numeric rate.
   */
  taxRate: varchar("tax_rate", { length: 10 }).notNull().default("0"),

  /** Whether prices in this region are tax-inclusive (e.g. VAT-inclusive in EU) */
  taxIncluded: boolean("tax_included").notNull().default(false),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})

/**
 * countries
 *
 * ISO 3166-1 alpha-2 country codes assigned to regions.
 * A country belongs to exactly one region.
 */
export const countries = pgTable("countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  regionId: uuid("region_id")
    .notNull()
    .references(() => regions.id, { onDelete: "cascade" }),

  /** ISO 3166-1 alpha-2 — e.g. "US", "GB", "DE" */
  iso2: varchar("iso2", { length: 2 }).notNull().unique(),

  /** ISO 3166-1 alpha-3 — e.g. "USA", "GBR", "DEU" */
  iso3: varchar("iso3", { length: 3 }),

  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Region = typeof regions.$inferSelect
export type NewRegion = typeof regions.$inferInsert
export type Country = typeof countries.$inferSelect
export type NewCountry = typeof countries.$inferInsert