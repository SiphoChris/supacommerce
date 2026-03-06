import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core"
import { orders } from "./orders.ts"
import { currencies } from "./currencies.ts"

export const paymentCollectionStatusEnum = pgEnum("payment_collection_status", [
  "not_paid",
  "awaiting",
  "authorized",
  "partially_authorized",
  "captured",
  "partially_captured",
  "partially_refunded",
  "refunded",
  "cancelled",
  "requires_action",
])

export const paymentSessionStatusEnum = pgEnum("payment_session_status", [
  "pending",
  "authorized",
  "captured",
  "requires_more",
  "error",
  "cancelled",
])

/**
 * payment_collections
 *
 * A payment collection groups all payment sessions for an order.
 * An order typically has one collection, but multiple sessions are
 * possible (e.g. split payment, retry after failure).
 */
export const paymentCollections = pgTable(
  "payment_collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    currencyCode: varchar("currency_code", { length: 3 }).references(() => currencies.code),

    /** Total amount to collect. Integer, smallest currency unit. */
    amount: integer("amount").notNull(),
    authorizedAmount: integer("authorized_amount").notNull().default(0),
    capturedAmount: integer("captured_amount").notNull().default(0),
    refundedAmount: integer("refunded_amount").notNull().default(0),

    status: paymentCollectionStatusEnum("status").notNull().default("not_paid"),

    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("payment_collections_order_id_idx").on(t.orderId)]
)

/**
 * payment_sessions
 *
 * A payment session represents a single attempt to pay via a provider.
 * The `data` field stores provider-specific state — e.g. the Stripe
 * PaymentIntent client_secret needed to complete payment on the frontend.
 *
 * Flow:
 *   1. checkout edge fn creates session with status "pending"
 *   2. client completes payment using provider's SDK (Stripe Elements, etc.)
 *   3. provider calls your payment-webhook edge fn on success
 *   4. webhook updates session to "captured" and calls order-confirmed
 */
export const paymentSessions = pgTable(
  "payment_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentCollectionId: uuid("payment_collection_id")
      .notNull()
      .references(() => paymentCollections.id, { onDelete: "cascade" }),

    /** Provider slug — e.g. "stripe", "paypal", "manual" */
    providerId: varchar("provider_id", { length: 100 }).notNull(),

    status: paymentSessionStatusEnum("status").notNull().default("pending"),

    /** Integer in smallest currency unit */
    amount: integer("amount").notNull(),
    currencyCode: varchar("currency_code", { length: 3 }).references(() => currencies.code),

    /**
     * Provider-specific session data.
     * For Stripe: { clientSecret: "pi_xxx_secret_xxx", paymentIntentId: "pi_xxx" }
     * For PayPal: { orderId: "EC-xxx" }
     */
    data: jsonb("data"),

    /** Provider's own session/intent ID for reconciliation */
    providerSessionId: varchar("provider_session_id", { length: 255 }),

    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    capturedAt: timestamp("captured_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("payment_sessions_collection_id_idx").on(t.paymentCollectionId),
    index("payment_sessions_provider_session_id_idx").on(t.providerSessionId),
  ]
)

export type PaymentCollection = typeof paymentCollections.$inferSelect
export type NewPaymentCollection = typeof paymentCollections.$inferInsert
export type PaymentSession = typeof paymentSessions.$inferSelect
export type NewPaymentSession = typeof paymentSessions.$inferInsert
