type ErrorCode = "NOT_FOUND" | "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT" | "INTERNAL_ERROR" | "PAYMENT_ERROR" | "INVENTORY_ERROR" | "CART_ERROR" | "ORDER_ERROR";
declare class SupacommerceError extends Error {
    readonly statusCode: number;
    readonly code: ErrorCode;
    constructor(message: string, statusCode: number, code: ErrorCode);
}
declare class NotFoundError extends SupacommerceError {
    constructor(resource: string, id?: string);
}
declare class ValidationError extends SupacommerceError {
    readonly fields?: Record<string, string>;
    constructor(message: string, fields?: Record<string, string>);
}
declare class UnauthorizedError extends SupacommerceError {
    constructor(message?: string);
}
declare class ForbiddenError extends SupacommerceError {
    constructor(message?: string);
}
declare class ConflictError extends SupacommerceError {
    constructor(message: string);
}
declare class InventoryError extends SupacommerceError {
    constructor(message: string);
}
declare class PaymentError extends SupacommerceError {
    constructor(message: string);
}
type Result<T, E extends Error = SupacommerceError> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
declare function ok<T>(value: T): Result<T, never>;
declare function err<E extends Error>(error: E): Result<never, E>;
declare function isOk<T, E extends Error>(result: Result<T, E>): result is {
    ok: true;
    value: T;
};
declare function isErr<T, E extends Error>(result: Result<T, E>): result is {
    ok: false;
    error: E;
};
/**
 * Unwraps a Result, throwing the error if it is not ok.
 */
declare function unwrap<T>(result: Result<T>): T;
/**
 * Convert a decimal amount to the minor unit (integer) for storage.
 * e.g. toMinorUnit(9.99, "USD") → 999
 * e.g. toMinorUnit(100, "JPY") → 100
 */
declare function toMinorUnit(amount: number, currencyCode: string): number;
/**
 * Convert a minor unit integer to a decimal amount for display.
 * e.g. fromMinorUnit(999, "USD") → 9.99
 * e.g. fromMinorUnit(100, "JPY") → 100
 */
declare function fromMinorUnit(amount: number, currencyCode: string): number;
/**
 * Format a minor-unit integer as a localised currency string.
 * e.g. formatCurrency(999, "USD") → "$9.99"
 * e.g. formatCurrency(999, "USD", "de-DE") → "9,99 $"
 */
declare function formatCurrency(amount: number, currencyCode: string, locale?: string): string;
/**
 * Add two minor-unit amounts safely (integer addition, no floats).
 */
declare function addMoney(a: number, b: number): number;
/**
 * Subtract two minor-unit amounts safely.
 */
declare function subtractMoney(a: number, b: number): number;
interface PaginationParams {
    limit?: number;
    offset?: number;
}
interface PaginatedResult<T> {
    data: T[];
    count: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
declare function buildPaginatedResult<T>(data: T[], count: number, params: PaginationParams): PaginatedResult<T>;
/**
 * Generate a Stripe/Medusa-style prefixed ID.
 * e.g. generateId("cart") → "cart_a1b2c3d4e5f6g7h8"
 */
declare function generateId(prefix: string): string;
/** Returns the current timestamp as an ISO 8601 string. */
declare function nowISO(): string;
/** Returns true if a date string represents a past date. */
declare function isPast(dateString: string): boolean;
/** Returns true if a date string represents a future date. */
declare function isFuture(dateString: string): boolean;
/** Make specific keys of T required. */
type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
/** Make all keys of T optional except the specified ones. */
type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;
/** Deep partial — all nested objects also become partial. */
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export { ConflictError, type DeepPartial, type ErrorCode, ForbiddenError, InventoryError, NotFoundError, type PaginatedResult, type PaginationParams, type PartialExcept, PaymentError, type RequireKeys, type Result, SupacommerceError, UnauthorizedError, ValidationError, addMoney, buildPaginatedResult, err, formatCurrency, fromMinorUnit, generateId, isErr, isFuture, isOk, isPast, nowISO, ok, subtractMoney, toMinorUnit, unwrap };
