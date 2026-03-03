import { pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core"

/**
 * currencies
 *
 * ISO 4217 currency definitions. Seed this table with the currencies
 * your store supports. The currency_code is the canonical key used
 * across all monetary tables.
 *
 * All monetary values throughout supacommerce are stored as integers
 * in the smallest currency unit (cents for USD, pence for GBP, etc.)
 * to avoid floating-point precision issues entirely.
 */
export const currencies = pgTable("currencies", {
  /** ISO 4217 code — e.g. "USD", "EUR", "GBP" */
  code: varchar("code", { length: 3 }).primaryKey(),

  /** Human-readable name — e.g. "US Dollar" */
  name: varchar("name", { length: 100 }).notNull(),

  /** Symbol for display — e.g. "$", "€", "£" */
  symbol: varchar("symbol", { length: 10 }).notNull(),

  /**
   * Zero-decimal currencies (JPY, KRW, etc.) store amounts without
   * multiplying by 100. This flag tells formatCurrency() how to render.
   */
  includesDecimal: boolean("includes_decimal").notNull().default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Currency = typeof currencies.$inferSelect
export type NewCurrency = typeof currencies.$inferInsert
