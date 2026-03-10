import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "archived",
]);

/**
 * products
 *
 * The top-level product record. A product has one or more variants.
 * If a product has no options (e.g. a simple book), it has a single
 * default variant.
 */
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    description: text("description"),
    handle: varchar("handle", { length: 255 }).notNull().unique(),
    status: productStatusEnum("status").notNull().default("draft"),
    thumbnail: text("thumbnail"),

    /** Whether this product requires shipping */
    isGiftcard: boolean("is_giftcard").notNull().default(false),
    discountable: boolean("discountable").notNull().default(true),

    /** External ID for syncing with 3rd-party systems */
    externalId: varchar("external_id", { length: 255 }),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("products_handle_idx").on(t.handle),
    index("products_status_idx").on(t.status),
  ],
);

/**
 * product_categories
 *
 * Hierarchical categories via self-referencing parent_id.
 * e.g. Clothing > Mens > Jackets
 */
export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  handle: varchar("handle", { length: 255 }).notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id"),
  rank: integer("rank").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * product_category_products
 *
 * Many-to-many join between products and categories.
 */
export const productCategoryProducts = pgTable("product_category_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => productCategories.id, { onDelete: "cascade" }),
});

/**
 * product_collections
 *
 * Curated groupings — "Summer Drop", "Best Sellers", etc.
 * Unlike categories, collections are flat (no hierarchy).
 */
export const productCollections = pgTable("product_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  handle: varchar("handle", { length: 255 }).notNull().unique(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/**
 * product_collection_products
 */
export const productCollectionProducts = pgTable(
  "product_collection_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => productCollections.id, { onDelete: "cascade" }),
  },
);

/**
 * product_tags
 */
export const productTags = pgTable("product_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  value: varchar("value", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const productTagProducts = pgTable("product_tag_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => productTags.id, { onDelete: "cascade" }),
});

/**
 * product_options
 *
 * The option types on a product — e.g. "Size", "Color".
 */
export const productOptions = pgTable("product_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(),
  rank: integer("rank").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * product_option_values
 *
 * The concrete values for each option — e.g. "Small", "Medium", "Large".
 */
export const productOptionValues = pgTable("product_option_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  optionId: uuid("option_id")
    .notNull()
    .references(() => productOptions.id, { onDelete: "cascade" }),
  value: varchar("value", { length: 100 }).notNull(),
  rank: integer("rank").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * product_variants
 *
 * A specific purchasable combination of option values.
 * e.g. "Blue / Large" is a variant of "T-Shirt".
 *
 * Prices are NOT stored here — they live in the pricing schema
 * and are resolved per-region. This keeps pricing flexible.
 */
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }).unique(),
    barcode: varchar("barcode", { length: 100 }),
    ean: varchar("ean", { length: 13 }),
    upc: varchar("upc", { length: 12 }),
    thumbnail: text("thumbnail"),

    /** Grams */
    weight: integer("weight"),
    /** Centimetres */
    length: integer("length"),
    height: integer("height"),
    width: integer("width"),

    allowBackorder: boolean("allow_backorder").notNull().default(false),
    manageInventory: boolean("manage_inventory").notNull().default(true),

    /** Display order within the product */
    rank: integer("rank").notNull().default(0),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("product_variants_product_id_idx").on(t.productId),
    index("product_variants_sku_idx").on(t.sku),
  ],
);

/**
 * product_variant_option_values
 *
 * Which option values a variant has.
 * e.g. variant "Blue/Large" → [option_value: "Blue", option_value: "Large"]
 */
export const productVariantOptionValues = pgTable(
  "product_variant_option_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    optionValueId: uuid("option_value_id")
      .notNull()
      .references(() => productOptionValues.id, { onDelete: "cascade" }),
  },
);

/**
 * product_images
 */
export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }),
  rank: integer("rank").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type ProductOption = typeof productOptions.$inferSelect;
export type ProductOptionValue = typeof productOptionValues.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type ProductCollection = typeof productCollections.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductTag = typeof productTags.$inferSelect;
