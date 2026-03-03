# supacommerce

Ecommerce building blocks for Supabase. Not a platform. Not a hosted service. A set of production-grade files that get dropped into your project and become yours.

The closest analogy is [shadcn/ui](https://ui.shadcn.com) — but for your backend instead of your UI.

---

## What it is

A pnpm monorepo containing three packages:

| Package | Description |
|---|---|
| `@supacommerce/cli` | The `init` command — copies schemas, edge functions, and SQL files into your project |
| `@supacommerce/core` | Typed ecommerce query client — `commerce.cart.addItem()`, `commerce.catalog.listProducts()`, etc. |
| `@supacommerce/utils` | Shared utilities — currency helpers, error types, `Result<T>`, pagination |

---

## Quickstart

```bash
npx @supacommerce/cli init
```

That's it. The CLI copies the following into your project:

- **14 Drizzle schema files** → `src/ecommerce/schema/`
- **4 Supabase edge functions** → `supabase/functions/`
- **RLS policies** → `supabase/rls.sql`
- **Postgres RPC functions** → `supabase/functions.sql`
- **Drizzle config example** → `drizzle.config.example.ts`

From that point on, all files are yours. Read them. Modify them. Delete what you don't need.

---

## How it works

### 1. The CLI copies files into your project

```bash
npx @supacommerce/cli init
```

The CLI detects whether you already have a `src/` directory and places files appropriately. It warns you before overwriting anything.

### 2. You generate and apply migrations

The schemas are plain Drizzle ORM TypeScript files. You control the migration process:

```bash
mv drizzle.config.example.ts drizzle.config.ts
# add DATABASE_URL to .env

pnpm db:generate        # generates SQL from your schemas
supabase db push        # applies to your Supabase project
```

### 3. You apply RLS policies and Postgres functions

```sql
-- Paste supabase/rls.sql into your Supabase SQL Editor
-- Paste supabase/functions.sql into your Supabase SQL Editor
```

The RLS policies are sensible defaults — public read on products, own-data-only on carts and orders. Read and adjust them for your use case.

### 4. You use the query client

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@supacommerce/core"

const supabase = createSupabaseClient(url, anonKey)
const commerce = createClient(supabase)

// Storefront
const products = await commerce.catalog.listProducts()
const cart = await commerce.cart.getOrCreate()
await commerce.cart.addItem(cart.id, { variantId, quantity: 1 })
const orders = await commerce.orders.list()

// Admin (pass service role client)
const supabaseAdmin = createSupabaseClient(url, serviceRoleKey)
const adminCommerce = createClient(supabaseAdmin)
const admins = await adminCommerce.admin.list()
```

---

## Guest / anonymous carts

Carts are tied to a Supabase auth user. For unauthenticated customers, use Supabase anonymous auth:

```typescript
// Creates a real auth user with no email — cart persists across sessions
const { data } = await supabase.auth.signInAnonymously()

// When the user signs up for a full account later, Supabase upgrades
// the anonymous user and the cart is preserved.
```

RLS works identically for anonymous and authenticated users — no special handling needed.

---

## Schema coverage

| Domain | Tables |
|---|---|
| Currencies | `currencies` |
| Regions | `regions`, `countries` |
| Customers | `customers`, `customer_groups`, `customer_addresses` |
| Catalog | `products`, `product_variants`, `product_options`, `product_option_values`, `product_variant_option_values`, `product_categories`, `product_collections`, `product_tags`, `product_images` |
| Inventory | `stock_locations`, `inventory_items`, `inventory_levels`, `inventory_reservations` |
| Pricing | `price_sets`, `prices`, `price_lists`, `price_list_prices`, `price_list_customer_groups` |
| Promotions | `promotions`, `promotion_rules`, `promotion_usages` |
| Tax | `tax_regions`, `tax_rates`, `tax_rate_product_categories` |
| Fulfillment | `shipping_profiles`, `fulfillment_providers`, `shipping_options`, `shipping_option_requirements` |
| Cart | `carts`, `cart_line_items`, `cart_shipping_methods` |
| Orders | `orders`, `order_line_items`, `order_fulfillments`, `order_fulfillment_items`, `order_returns`, `order_return_items`, `order_refunds` |
| Payments | `payment_collections`, `payment_sessions` |
| Sales Channels | `sales_channels`, `sales_channel_products` |
| Admin | `admin_users`, `admin_invitations` |

---

## Edge functions

Four Supabase edge functions are included as building blocks with clear TODO markers:

| Function | What it does |
|---|---|
| `cart-checkout` | Validates inventory, creates order atomically via RPC, returns payment session data |
| `order-confirmed` | Marks order as processing, reserves inventory — called by `payment-webhook` |
| `payment-webhook` | Receives provider webhook events, verifies signature, calls `order-confirmed` |
| `inventory-reserve` | Creates soft inventory holds before payment capture |

Transactional operations (`checkout_cart`, `confirm_order`, `reserve_inventory`) are handled by Postgres functions, not sequential queries — so partial failures are impossible.

---

## Philosophy

**You own everything.** supacommerce makes no attempt to abstract Drizzle, abstract Supabase, or hide the database from you. The schemas are Drizzle schemas. The migrations are SQL. The edge functions are TypeScript.

This means:
- You can read every line of code running in your system
- You can modify anything without fighting an abstraction layer
- You are not locked in — delete `@supacommerce/core` and nothing breaks except your convenience wrappers

The tradeoff: when supacommerce releases schema improvements, they don't automatically apply to your project. You read the changelog and apply relevant changes manually, the same as any schema change in your own codebase.

---

## Packages in this repo

- [`packages/cli`](./packages/cli) — `@supacommerce/cli`
- [`packages/core`](./packages/core) — `@supacommerce/core`
- [`packages/utils`](./packages/utils) — `@supacommerce/utils`

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build a specific package
pnpm build:cli
pnpm build:core
pnpm build:utils

# Type-check all packages
pnpm typecheck

# Publish all packages to npm
pnpm publish:all
```

---

## License

MIT
