# @supacommerce/utils

Shared utilities for supacommerce. Intentionally public — use these in your own application code.

## Installation

```bash
pnpm add @supacommerce/utils
```

---

## Currency

All monetary values in supacommerce are stored as integers in the smallest currency unit. These helpers handle conversion and formatting.

```typescript
import {
  toMinorUnit,
  fromMinorUnit,
  formatCurrency,
  addMoney,
  subtractMoney,
} from "@supacommerce/utils";

toMinorUnit(29.99, "USD");  // 2999
toMinorUnit(100, "JPY");    // 100  (JPY is zero-decimal)

fromMinorUnit(2999, "USD"); // 29.99
fromMinorUnit(100, "JPY");  // 100

formatCurrency(2999, "USD");          // "$29.99"
formatCurrency(2999, "USD", "de-DE"); // "29,99 $"
formatCurrency(2999, "GBP");          // "£29.99"
formatCurrency(300, "JPY");           // "¥300"

addMoney(1999, 500);      // 2499
subtractMoney(1999, 500); // 1499
```

---

## Result type

A typed alternative to `try/catch` for operations that can fail predictably.

```typescript
import { ok, err, isOk, unwrap, type Result } from "@supacommerce/utils";

function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) return err(new Error("Division by zero"));
  return ok(a / b);
}

const result = divide(10, 2);

if (isOk(result)) {
  console.log(result.value); // 5
} else {
  console.error(result.error.message);
}

const value = unwrap(divide(10, 2)); // 5 — throws on error
```

---

## Error types

```typescript
import {
  SupacommerceError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InventoryError,
  PaymentError,
} from "@supacommerce/utils";

const e = new NotFoundError("Product", "abc-123");
e.statusCode; // 404
e.code;       // "NOT_FOUND"
e.message;    // "Product with id 'abc-123' not found"

const ve = new ValidationError("Invalid email", {
  email: "Must be a valid email",
});
ve.fields; // { email: "Must be a valid email" }
```

---

## Pagination

```typescript
import {
  buildPaginatedResult,
  type PaginationParams,
  type PaginatedResult,
} from "@supacommerce/utils";

const result = buildPaginatedResult(data, totalCount, { limit: 20, offset: 0 });
// result.data     — the items
// result.count    — total count
// result.limit
// result.offset
// result.hasMore  — boolean
```

---

## ID generation

```typescript
import { generateId } from "@supacommerce/utils";

generateId("cart");  // "cart_a1b2c3d4e5f6g7h8"
generateId("order"); // "order_x9y8z7w6v5u4t3s2"
```

---

## Date helpers

```typescript
import { nowISO, isPast, isFuture } from "@supacommerce/utils";

nowISO();                           // "2024-06-15T12:34:56.789Z"
isPast("2020-01-01T00:00:00Z");    // true
isFuture("2099-01-01T00:00:00Z"); // true
```

---

## Type utilities

```typescript
import type { RequireKeys, PartialExcept, DeepPartial } from "@supacommerce/utils";

// Make specific keys required
type T = RequireKeys<{ a?: string; b?: string }, "a">;
// { a: string; b?: string }

// Make all keys optional except specified ones
type T = PartialExcept<{ a: string; b: string; c: string }, "a">;
// { a: string; b?: string; c?: string }
```

---

## License

MIT