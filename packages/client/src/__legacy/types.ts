import type { SupabaseClient } from "@supabase/supabase-js"

// ─── Supabase Client ──────────────────────────────────────────────────────────

/**
 * Accept any Supabase client — untyped or fully typed with generated types.
 * TypeScript inference handles the rest once the developer runs
 * `supabase gen types typescript`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySupabaseClient = SupabaseClient<any, any, any>

// ─── Address ──────────────────────────────────────────────────────────────────

/**
 * Address snapshot. Used on carts, orders, and fulfillments.
 * Stored as JSONB so historical records remain accurate if the customer
 * later edits or deletes the address on their account.
 */
export interface Address {
  firstName?: string
  lastName?: string
  company?: string
  address1: string
  address2?: string
  city: string
  province?: string
  postalCode?: string
  countryCode: string
  phone?: string
}

// ─── Money ────────────────────────────────────────────────────────────────────

/**
 * Monetary amount with currency. The amount is always an integer in the
 * smallest currency unit (cents for USD, pence for GBP, etc.).
 */
export interface Money {
  amount: number
  currencyCode: string
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProductStatus = "draft" | "published" | "archived"

export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "requires_action"

export type OrderPaymentStatus =
  | "pending"
  | "awaiting"
  | "captured"
  | "partially_refunded"
  | "refunded"
  | "cancelled"
  | "requires_action"

export type OrderFulfillmentStatus =
  | "not_fulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "partially_shipped"
  | "shipped"
  | "partially_returned"
  | "returned"
  | "cancelled"
  | "requires_action"

export type CartStatus = "active" | "completed" | "abandoned"

export type PaymentSessionStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "requires_more"
  | "error"
  | "cancelled"

export type ReturnStatus = "requested" | "received" | "requires_action" | "cancelled"

export type AdminRole = "super_admin" | "admin" | "developer" | "manager" | "viewer"

export type PromotionType = "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y"
