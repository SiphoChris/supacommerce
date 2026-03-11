# supacommerce

Ecommerce building blocks for Supabase. Not a platform. Not a hosted service. A set of production-grade files that get dropped into your project and become yours.

The closest analogy is [shadcn/ui](https://ui.shadcn.com) — but for your backend instead of your UI.

---

## What it is

A pnpm monorepo containing three packages:

| Package | Description |
| --- | --- |
| `@supacommerce/cli` | The `init` command — copies schemas, edge functions, and SQL files into your project |
| `@supacommerce/client` | Typed ecommerce query client — `commerce.cart.addItem()`, `commerce.catalog.listProducts()`, etc. |
| `@supacommerce/utils` | Shared utilities — currency helpers, error types, `Result<T>`, pagination |

---

## Quickstart

```bash
npx @supacommerce/cli init
```

The CLI copies the following into your project:

- **14 Drizzle schema files** → `src/ecommerce/schema/`
- **7 Supabase edge functions** → `supabase/functions/`
- **RLS policies** → `supabase/rls.sql`
- **Postgres RPC functions** → `supabase/functions.sql`
- **Utility SQL scripts** → `supabase/nuke-dbs.sql`, `supabase/drop-dbs.sql`
- **Supabase config** → `supabase/config.toml`
- **Drizzle config example** → `drizzle.config.example.ts`

From that point on, all files are yours. Read them. Modify them. Delete what you don't need.

---

## How it works

### 1. Run the CLI

```bash
npx supacommerce init
```

Options:

```bash
npx supacommerce init --dir ./my-project     # target a specific directory
npx supacommerce init --skip-confirmation    # skip the confirmation prompt
```

The CLI detects your package manager (pnpm, yarn, bun, npm) automatically and prints the correct install commands for your setup.

### 2. Install dependencies

```bash
pnpm add drizzle-orm @supabase/supabase-js @supacommerce/client
pnpm add -D drizzle-kit
```

### 3. Configure Drizzle

```bash
mv drizzle.config.example.ts drizzle.config.ts
# Add to .env:
# DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### 4. Generate and apply migrations

#### We recommend putting these scripts in your package.json

```json
"scripts": {
    "dev": "...",
    "build": "...",
    "preview": "...",
    "drizzle:generate": "drizzle-kit generate",
    "drizzle:migrate": "drizzle-kit migrate",
    "drizzle:push": "drizzle-kit push"
  }
```

```bash
pnpm db:generate
supabase db push
```

### 5. Apply RLS policies and Postgres functions

Open the Supabase SQL Editor and run `supabase/rls.sql`, then `supabase/functions.sql`. These are not applied by `supabase db push` — they must be run manually.

### 6. Use the query client

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supacommerce/client";

const supabase = createSupabaseClient(url, anonKey);
const commerce = createClient(supabase);

const products = await commerce.catalog.listProducts();
const cart = await commerce.cart.getOrCreate();
await commerce.cart.addItem(cart.id, { variantId, quantity: 1 });
```

---

## Guest / anonymous carts

Carts require a Supabase auth user. For unauthenticated customers, use anonymous auth:

```typescript
const { data } = await supabase.auth.signInAnonymously();
// Cart is preserved when the user later creates a full account
```

RLS works identically for anonymous and authenticated users.

---

## Schema coverage

| Domain | Tables |
| --- | --- |
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

| Function | What it does |
| --- | --- |
| `cart-checkout` | Validates inventory, applies tax + promotions, creates order atomically via RPC |
| `order-confirmed` | Marks order as processing, confirms inventory reservation |
| `payment-webhook` | Receives provider webhook events, calls `order-confirmed` |
| `admin-send-invite` | Sends admin invitation email via Resend |
| `admin-accept-invite` | Handles invitation redemption, creates admin user |
| `storage-upload` | Handles product image uploads to Supabase Storage |
| `storage-delete` | Handles product image deletion from Supabase Storage |

Shared utilities in `_shared/`: `cors.ts`, `supabaseAdmin.ts`.

Transactional operations are handled by Postgres RPC functions, not sequential queries — partial failures are impossible.

---

## Philosophy

**You own everything.** supacommerce makes no attempt to abstract Drizzle, Supabase, or the database from you. The schemas are Drizzle schemas. The migrations are SQL. The edge functions are TypeScript.

- You can read every line of code running in your system
- You can modify anything without fighting an abstraction layer
- You are not locked in — delete `@supacommerce/client` and nothing breaks except your convenience wrappers

The tradeoff: when supacommerce releases schema improvements, they don't automatically apply to your project. You read the changelog and apply relevant changes manually, the same as any schema change in your own codebase.

---

## Packages in this repo

- [`packages/cli`](./packages/cli) — `@supacommerce/cli`
- [`packages/client`](./packages/client) — `@supacommerce/client`
- [`packages/utils`](./packages/utils) — `@supacommerce/utils`

---

## Development

```bash
pnpm install

pnpm build          # build all packages
pnpm build:cli
pnpm build:client
pnpm build:utils

pnpm typecheck
pnpm publish:all
```

Dashboard:

```bash
pnpm dev:dashboard
pnpm build:dashboard
```

---

## Requirements

- Node.js >= 18.0.0
- pnpm >= 9.0.0

---

## License

MIT