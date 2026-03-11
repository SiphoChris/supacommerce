# supacommerce

Ecommerce building blocks for Supabase. Not a platform. Not a hosted service. A set of production-grade files that get dropped into your project and become yours.

The closest analogy is [shadcn/ui](https://ui.shadcn.com) — but for your backend instead of your UI.

---

## What it is

A pnpm monorepo containing three packages:

| Package                | Description                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| `@supacommerce/cli`    | The `init` command — copies schemas, edge functions, and SQL files into your project              |
| `@supacommerce/client` | Typed ecommerce query client — `commerce.cart.addItem()`, `commerce.catalog.listProducts()`, etc. |
| `@supacommerce/utils`  | Shared utilities — currency helpers, error types, `Result<T>`, pagination                         |

---

## Quickstart

```bash
npx @supacommerce/cli init
```

The CLI copies the following into your project:

- **14 Drizzle schema files** → `src/ecommerce/schema/`
- **4 Supabase edge functions** → `supabase/functions/`
- **RLS policies** → `supabase/rls.sql`
- **Postgres RPC functions** → `supabase/functions.sql`
- **Drizzle config example** → `drizzle.config.example.ts`

From that point on, all files are yours. Read them. Modify them. Delete what you don't need.

---

## How it works

### 1. Run the CLI

```bash
npx @supacommerce/cli init
```

### 2. Install dependencies

```bash
pnpm add drizzle-orm @supabase/supabase-js @supacommerce/client
pnpm add -D drizzle-kit
```

### 3. Configure Drizzle

```bash
mv drizzle.config.example.ts drizzle.config.ts
# Add DATABASE_URL to your .env
```

### 4. Generate and apply migrations

```bash
pnpm db:generate
supabase db push
```

### 5. Apply RLS policies and Postgres functions

Open the Supabase SQL Editor and run `rls.sql`, then `functions.sql`. Migrations don't apply these — they must be pasted in manually.

### 6. Set up your first admin

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-key \
ADMIN_EMAIL=you@example.com \
ADMIN_PASSWORD=yourpassword \
ADMIN_FIRST_NAME=Your \
ADMIN_LAST_NAME=Name \
pnpm seed:admin
```

### 7. Configure store fundamentals (in order)

The dashboard enforces this dependency chain — set these up before creating products or pricing:

1. **Currencies** — e.g. USD, ZAR
2. **Regions** — each region references a currency
3. **Countries** — each country belongs to a region
4. **Tax regions & rates** — optional, reference regions

### 8. Use the query client

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supacommerce/client";

const supabase = createSupabaseClient(url, anonKey);
const commerce = createClient(supabase);

const products = await commerce.catalog.listProducts();
const cart = await commerce.cart.getOrCreate();
await commerce.cart.addItem(cart.id, { variantId, quantity: 1 });
const orders = await commerce.orders.list();
```

---

## Guest / anonymous carts

Carts require a Supabase auth user. For unauthenticated customers, use anonymous auth:

```typescript
// Creates a real auth user with no email — cart persists across sessions
const { data } = await supabase.auth.signInAnonymously();

// When the user creates a full account later, Supabase upgrades the
// anonymous user and the cart is preserved automatically.
```

RLS works identically for anonymous and authenticated users — no special handling needed.

---

## Schema coverage

| Domain         | Tables                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Currencies     | `currencies`                                                                                                                                                                               |
| Regions        | `regions`, `countries`                                                                                                                                                                     |
| Customers      | `customers`, `customer_groups`, `customer_addresses`                                                                                                                                       |
| Catalog        | `products`, `product_variants`, `product_options`, `product_option_values`, `product_variant_option_values`, `product_categories`, `product_collections`, `product_tags`, `product_images` |
| Inventory      | `stock_locations`, `inventory_items`, `inventory_levels`, `inventory_reservations`                                                                                                         |
| Pricing        | `price_sets`, `prices`, `price_lists`, `price_list_prices`, `price_list_customer_groups`                                                                                                   |
| Promotions     | `promotions`, `promotion_rules`, `promotion_usages`                                                                                                                                        |
| Tax            | `tax_regions`, `tax_rates`, `tax_rate_product_categories`                                                                                                                                  |
| Fulfillment    | `shipping_profiles`, `fulfillment_providers`, `shipping_options`, `shipping_option_requirements`                                                                                           |
| Cart           | `carts`, `cart_line_items`, `cart_shipping_methods`                                                                                                                                        |
| Orders         | `orders`, `order_line_items`, `order_fulfillments`, `order_fulfillment_items`, `order_returns`, `order_return_items`, `order_refunds`                                                      |
| Payments       | `payment_collections`, `payment_sessions`                                                                                                                                                  |
| Sales Channels | `sales_channels`, `sales_channel_products`                                                                                                                                                 |
| Admin          | `admin_users`, `admin_invitations`                                                                                                                                                         |

---

## Edge functions

Four Supabase edge functions are included as building blocks. Each has clear `TODO` markers where you wire in your payment provider or fulfillment logic:

| Function          | What it does                                                                        |
| ----------------- | ----------------------------------------------------------------------------------- |
| `cart-checkout`   | Validates inventory, creates order atomically via RPC, returns payment session data |
| `order-confirmed` | Marks order as processing, reserves inventory — called by `payment-webhook`         |
| `payment-webhook` | Receives provider webhook events, verifies signature, calls `order-confirmed`       |
| `storage-upload`  | Handles product image uploads to Supabase Storage                                   |
| `storage-delete`  | Handles product image deletion from Supabase Storage                                |

Transactional operations (`checkout_cart`, `confirm_order`, `reserve_inventory`) are handled by Postgres RPC functions — not sequential queries — so partial failures are impossible.

---

## Key design decisions

**`product_variants` has no `thumbnail` column.** Thumbnails live on `products` only. The cart client resolves the thumbnail from the parent product automatically.

**`currencies` uses `code` as its primary key** (e.g. `"usd"`, `"zar"`), not a UUID. If you're using the react-admin dashboard, configure the dataProvider accordingly:

```typescript
const dataProvider = supabaseDataProvider({
  instanceUrl,
  apiKey,
  supabaseClient,
  primaryKeys: new Map([["currencies", ["code"]]]),
});
```

**All monetary values are integers** in the smallest currency unit. Use `@supacommerce/utils` to convert and format them.

---

## Philosophy

**You own everything.** supacommerce makes no attempt to abstract Drizzle, Supabase, or the database from you. The schemas are Drizzle schemas. The migrations are SQL. The edge functions are TypeScript.

This means:

- You can read every line of code running in your system
- You can modify anything without fighting an abstraction layer
- You are not locked in — delete `@supacommerce/client` and nothing breaks except your convenience wrappers

The tradeoff: when supacommerce releases schema improvements, they don't automatically apply to your project. You read the changelog and apply relevant changes manually, the same as any schema change in your own codebase.

---

## Recommended `package.json` scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:push:remote": "supabase db push",
    "db:pull:remote": "supabase db pull",
    "db:reset": "supabase db reset",
    "db:new": "supabase migration new",
    "db:sync": "pnpm db:generate && pnpm db:push:remote",
    "supabase:login": "supabase login",
    "supabase:link": "supabase link",
    "supabase:start": "supabase start"
  }
}
```

---

## Packages in this repo

- [`packages/cli`](./packages/cli) — `@supacommerce/cli`
- [`packages/client`](./packages/client) — `@supacommerce/client`
- [`packages/utils`](./packages/utils) — `@supacommerce/utils`

---

## Development

```bash
pnpm install
pnpm build        # build all packages
pnpm build:cli
pnpm build:client
pnpm build:utils
pnpm typecheck
pnpm publish:all
```

---

## License

MIT