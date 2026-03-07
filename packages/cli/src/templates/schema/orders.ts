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
} from "drizzle-orm/pg-core";
import { customers } from "./customers.ts";
import { regions } from "./regions.ts";
import { currencies } from "./currencies.ts";
import { productVariants, products } from "./catalog.ts";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "requires_action",
]);

export const orderPaymentStatusEnum = pgEnum("order_payment_status", [
  "pending",
  "awaiting",
  "captured",
  "partially_refunded",
  "refunded",
  "cancelled",
  "requires_action",
]);

export const orderFulfillmentStatusEnum = pgEnum("order_fulfillment_status", [
  "not_fulfilled",
  "partially_fulfilled",
  "fulfilled",
  "partially_shipped",
  "shipped",
  "partially_returned",
  "returned",
  "cancelled",
  "requires_action",
]);

export const returnStatusEnum = pgEnum("return_status", [
  "requested",
  "received",
  "requires_action",
  "cancelled",
]);

export const refundReasonEnum = pgEnum("refund_reason", [
  "discount",
  "return",
  "swap",
  "claim",
  "other",
]);

/**
 * orders
 *
 * An order is created from a cart during checkout (cart-checkout edge fn).
 * Once created, it is immutable from the customer's perspective.
 * All addresses are JSONB snapshots at time of checkout.
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    displayId: integer("display_id").generatedAlwaysAsIdentity(),

    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    cartId: uuid("cart_id"),
    regionId: uuid("region_id").references(() => regions.id, {
      onDelete: "set null",
    }),
    currencyCode: varchar("currency_code", { length: 3 }).references(
      () => currencies.code,
    ),

    email: varchar("email", { length: 255 }).notNull(),

    status: orderStatusEnum("status").notNull().default("pending"),
    paymentStatus: orderPaymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),
    fulfillmentStatus: orderFulfillmentStatusEnum("fulfillment_status")
      .notNull()
      .default("not_fulfilled"),

    /** JSONB address snapshots */
    shippingAddress: jsonb("shipping_address"),
    billingAddress: jsonb("billing_address"),

    /** All amounts are integers in smallest currency unit */
    subtotal: integer("subtotal").notNull().default(0),
    discountTotal: integer("discount_total").notNull().default(0),
    shippingTotal: integer("shipping_total").notNull().default(0),
    taxTotal: integer("tax_total").notNull().default(0),
    refundedTotal: integer("refunded_total").notNull().default(0),
    total: integer("total").notNull().default(0),

    metadata: jsonb("metadata"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("orders_customer_id_idx").on(t.customerId),
    index("orders_status_idx").on(t.status),
    index("orders_display_id_idx").on(t.displayId),
  ],
);

/**
 * order_line_items
 *
 * Copied from cart_line_items at checkout. Immutable after creation.
 *
 * variantId and productId use onDelete: "set null" — the historical
 * record must survive even if the product is later deleted from the catalog.
 */
export const orderLineItems = pgTable(
  "order_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    /** Set null if variant is deleted — title/price snapshot preserves the record */
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),

    /** Set null if product is deleted — title snapshot preserves the record */
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    thumbnail: text("thumbnail"),

    quantity: integer("quantity").notNull(),
    fulfilledQuantity: integer("fulfilled_quantity").notNull().default(0),
    returnedQuantity: integer("returned_quantity").notNull().default(0),

    unitPrice: integer("unit_price").notNull(),
    subtotal: integer("subtotal").notNull(),
    taxTotal: integer("tax_total").notNull().default(0),
    discountTotal: integer("discount_total").notNull().default(0),
    total: integer("total").notNull(),

    isReturn: boolean("is_return").notNull().default(false),
    isGiftcard: boolean("is_giftcard").notNull().default(false),

    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("order_line_items_order_id_idx").on(t.orderId)],
);

/**
 * order_fulfillments
 *
 * A fulfillment records the physical dispatch of items.
 * One order can have multiple fulfillments (partial fulfilment).
 */
export const orderFulfillments = pgTable(
  "order_fulfillments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    providerId: varchar("provider_id", { length: 100 }),
    trackingNumber: varchar("tracking_number", { length: 255 }),
    trackingUrl: text("tracking_url"),

    /** Snapshotted shipping address at time of fulfillment */
    shippingAddress: jsonb("shipping_address"),

    /** Provider-specific data (label URL, carrier metadata, etc.) */
    data: jsonb("data"),
    metadata: jsonb("metadata"),

    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("order_fulfillments_order_id_idx").on(t.orderId)],
);

/**
 * order_fulfillment_items
 *
 * Which line items (and quantities) are included in each fulfillment.
 */
export const orderFulfillmentItems = pgTable("order_fulfillment_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  fulfillmentId: uuid("fulfillment_id")
    .notNull()
    .references(() => orderFulfillments.id, { onDelete: "cascade" }),
  lineItemId: uuid("line_item_id")
    .notNull()
    .references(() => orderLineItems.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
});

/**
 * order_returns
 *
 * A return request from a customer.
 */
export const orderReturns = pgTable(
  "order_returns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: returnStatusEnum("status").notNull().default("requested"),
    shippingOptionId: uuid("shipping_option_id"),

    /** Refund amount for the return shipping */
    shippingTotal: integer("shipping_total").notNull().default(0),
    refundAmount: integer("refund_amount").notNull().default(0),

    metadata: jsonb("metadata"),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("order_returns_order_id_idx").on(t.orderId)],
);

/**
 * order_return_items
 */
export const orderReturnItems = pgTable("order_return_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  returnId: uuid("return_id")
    .notNull()
    .references(() => orderReturns.id, { onDelete: "cascade" }),
  lineItemId: uuid("line_item_id")
    .notNull()
    .references(() => orderLineItems.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  note: text("note"),
  isRequested: boolean("is_requested").notNull().default(true),
});

/**
 * order_refunds
 */
export const orderRefunds = pgTable(
  "order_refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    reason: refundReasonEnum("reason"),
    note: text("note"),
    paymentId: uuid("payment_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("order_refunds_order_id_idx").on(t.orderId)],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderLineItem = typeof orderLineItems.$inferSelect;
export type OrderFulfillment = typeof orderFulfillments.$inferSelect;
export type OrderReturn = typeof orderReturns.$inferSelect;
export type OrderRefund = typeof orderRefunds.$inferSelect;