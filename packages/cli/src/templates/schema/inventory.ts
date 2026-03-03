import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
  pgEnum,
} from "drizzle-orm/pg-core"
import { productVariants } from "./catalog.ts"

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "released",
])

/**
 * stock_locations
 *
 * Physical or virtual locations that hold inventory.
 * e.g. "Warehouse A", "Store NYC", "Dropship Supplier"
 */
export const stockLocations = pgTable("stock_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  address1: varchar("address_1", { length: 255 }),
  address2: varchar("address_2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  countryCode: varchar("country_code", { length: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})

/**
 * inventory_items
 *
 * One inventory_item per product_variant. Separating inventory from the
 * variant means you can track stock without coupling it to the catalog schema,
 * and it allows future support for bundled products (one item → many variants).
 */
export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .unique()
      .references(() => productVariants.id, { onDelete: "set null" }),

    sku: varchar("sku", { length: 100 }),
    description: text("description"),

    /** Require customers to confirm backorder */
    requiresShipping: boolean("requires_shipping").notNull().default(true),

    /** Weight in grams — overrides variant weight if set */
    weight: integer("weight"),
    length: integer("length"),
    height: integer("height"),
    width: integer("width"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("inventory_items_variant_id_idx").on(t.variantId)]
)

/**
 * inventory_levels
 *
 * The stock count for a given inventory_item at a given stock_location.
 * quantity_available = stocked_quantity - reserved_quantity
 */
export const inventoryLevels = pgTable(
  "inventory_levels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => stockLocations.id, { onDelete: "cascade" }),

    stockedQuantity: integer("stocked_quantity").notNull().default(0),
    reservedQuantity: integer("reserved_quantity").notNull().default(0),
    incomingQuantity: integer("incoming_quantity").notNull().default(0),

    /** Computed: stocked_quantity - reserved_quantity. Kept in sync by triggers. */
    quantityAvailable: integer("quantity_available").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("inventory_levels_item_location_idx").on(t.inventoryItemId, t.locationId),
  ]
)

/**
 * inventory_reservations
 *
 * Soft-holds placed on inventory when a customer initiates checkout.
 * Released if the order is cancelled or payment fails. Confirmed
 * when payment succeeds (via the order-confirmed edge function).
 *
 * ⚠️ Creating a reservation and decrementing quantity_available should
 * ideally happen in a single Postgres function to avoid race conditions
 * when two customers try to buy the last item simultaneously.
 */
export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => stockLocations.id, { onDelete: "cascade" }),
    lineItemId: uuid("line_item_id"),
    quantity: integer("quantity").notNull(),
    status: reservationStatusEnum("status").notNull().default("pending"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("inventory_reservations_item_id_idx").on(t.inventoryItemId),
    index("inventory_reservations_line_item_id_idx").on(t.lineItemId),
  ]
)

export type StockLocation = typeof stockLocations.$inferSelect
export type InventoryItem = typeof inventoryItems.$inferSelect
export type NewInventoryItem = typeof inventoryItems.$inferInsert
export type InventoryLevel = typeof inventoryLevels.$inferSelect
export type InventoryReservation = typeof inventoryReservations.$inferSelect
