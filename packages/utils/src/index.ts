// ─── Error Types ──────────────────────────────────────────────────────────────

export type ErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "PAYMENT_ERROR"
  | "INVENTORY_ERROR"
  | "CART_ERROR"
  | "ORDER_ERROR"

export class SupacommerceError extends Error {
  readonly statusCode: number
  readonly code: ErrorCode

  constructor(message: string, statusCode: number, code: ErrorCode) {
    super(message)
    this.name = "SupacommerceError"
    this.statusCode = statusCode
    this.code = code
  }
}

export class NotFoundError extends SupacommerceError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      "NOT_FOUND"
    )
    this.name = "NotFoundError"
  }
}

export class ValidationError extends SupacommerceError {
  readonly fields?: Record<string, string>

  constructor(message: string, fields?: Record<string, string>) {
    super(message, 400, "VALIDATION_ERROR")
    this.name = "ValidationError"
    this.fields = fields
  }
}

export class UnauthorizedError extends SupacommerceError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends SupacommerceError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}

export class ConflictError extends SupacommerceError {
  constructor(message: string) {
    super(message, 409, "CONFLICT")
    this.name = "ConflictError"
  }
}

export class InventoryError extends SupacommerceError {
  constructor(message: string) {
    super(message, 422, "INVENTORY_ERROR")
    this.name = "InventoryError"
  }
}

export class PaymentError extends SupacommerceError {
  constructor(message: string) {
    super(message, 402, "PAYMENT_ERROR")
    this.name = "PaymentError"
  }
}

// ─── Result Type ──────────────────────────────────────────────────────────────

export type Result<T, E extends Error = SupacommerceError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error }
}

export function isOk<T, E extends Error>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok
}

export function isErr<T, E extends Error>(
  result: Result<T, E>
): result is { ok: false; error: E } {
  return !result.ok
}

/**
 * Unwraps a Result, throwing the error if it is not ok.
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value
  throw result.error
}

// ─── Currency Helpers ─────────────────────────────────────────────────────────

/**
 * Currencies that have no minor unit (zero-decimal currencies).
 * Source: Stripe zero-decimal currency list / ISO 4217
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
])

/**
 * Convert a decimal amount to the minor unit (integer) for storage.
 * e.g. toMinorUnit(9.99, "USD") → 999
 * e.g. toMinorUnit(100, "JPY") → 100
 */
export function toMinorUnit(amount: number, currencyCode: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase())) {
    return Math.round(amount)
  }
  return Math.round(amount * 100)
}

/**
 * Convert a minor unit integer to a decimal amount for display.
 * e.g. fromMinorUnit(999, "USD") → 9.99
 * e.g. fromMinorUnit(100, "JPY") → 100
 */
export function fromMinorUnit(amount: number, currencyCode: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase())) {
    return amount
  }
  return amount / 100
}

/**
 * Format a minor-unit integer as a localised currency string.
 * e.g. formatCurrency(999, "USD") → "$9.99"
 * e.g. formatCurrency(999, "USD", "de-DE") → "9,99 $"
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale = "en-US"
): string {
  const decimal = fromMinorUnit(amount, currencyCode)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(decimal)
}

/**
 * Add two minor-unit amounts safely (integer addition, no floats).
 */
export function addMoney(a: number, b: number): number {
  return a + b
}

/**
 * Subtract two minor-unit amounts safely.
 */
export function subtractMoney(a: number, b: number): number {
  return a - b
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  limit: number
  offset: number
  hasMore: boolean
}

export function buildPaginatedResult<T>(
  data: T[],
  count: number,
  params: PaginationParams
): PaginatedResult<T> {
  const limit = params.limit ?? 20
  const offset = params.offset ?? 0
  return {
    data,
    count,
    limit,
    offset,
    hasMore: offset + data.length < count,
  }
}

// ─── ID Generation ────────────────────────────────────────────────────────────

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"

/**
 * Generate a Stripe/Medusa-style prefixed ID.
 * e.g. generateId("cart") → "cart_a1b2c3d4e5f6g7h8"
 */
export function generateId(prefix: string): string {
  let id = ""
  for (let i = 0; i < 16; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return `${prefix}_${id}`
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

/** Returns the current timestamp as an ISO 8601 string. */
export function nowISO(): string {
  return new Date().toISOString()
}

/** Returns true if a date string represents a past date. */
export function isPast(dateString: string): boolean {
  return new Date(dateString) < new Date()
}

/** Returns true if a date string represents a future date. */
export function isFuture(dateString: string): boolean {
  return new Date(dateString) > new Date()
}

// ─── Type Helpers ─────────────────────────────────────────────────────────────

/** Make specific keys of T required. */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/** Make all keys of T optional except the specified ones. */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

/** Deep partial — all nested objects also become partial. */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
