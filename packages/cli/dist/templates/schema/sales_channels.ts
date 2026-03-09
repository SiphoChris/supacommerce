import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { products } from "./catalog.ts"

/**
 * sales_channels
 *
 * A sales channel scopes which products are available in a given
 * storefront context. Use this for multi-storefront setups, or to
 * separate a B2B portal from a B2C storefront.
 *
 * e.g. "Web Store", "Mobile App", "Wholesale Portal", "POS"
 *
 * If you only have one storefront, create a single default channel
 * and assign all products to it.
 */
export const salesChannels = pgTable("sales_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  isDisabled: boolean("is_disabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})

/**
 * sales_channel_products
 *
 * Many-to-many join — which products are available in which channels.
 */
export const salesChannelProducts = pgTable(
  "sales_channel_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    salesChannelId: uuid("sales_channel_id")
      .notNull()
      .references(() => salesChannels.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("sales_channel_products_channel_id_idx").on(t.salesChannelId),
    index("sales_channel_products_product_id_idx").on(t.productId),
  ]
)

export type SalesChannel = typeof salesChannels.$inferSelect
export type NewSalesChannel = typeof salesChannels.$inferInsert