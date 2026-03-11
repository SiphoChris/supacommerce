# @supacommerce/cli

The `init` command for supacommerce. Copies schemas, edge functions, and SQL files into your project.

## Usage

```bash
npx @supacommerce/cli init
```

Options:

```bash
npx @supacommerce/cli init --dir ./my-project     # target a specific directory
npx @supacommerce/cli init --skip-confirmation    # skip the confirmation prompt
```

## What it copies

```
your-project/
├── drizzle.config.example.ts
├── supabase/
│   ├── config.toml
│   ├── rls.sql
│   ├── functions.sql
│   ├── nuke-dbs.sql
│   ├── drop-dbs.sql
│   └── functions/
│       ├── deno.json
│       ├── _shared/
│       │   ├── cors.ts
│       │   └── supabaseAdmin.ts
│       ├── cart-checkout/index.ts
│       ├── order-confirmed/index.ts
│       ├── payment-webhook/index.ts
│       ├── admin-send-invite/index.ts
│       ├── admin-accept-invite/index.ts
│       ├── storage-upload/index.ts
│       └── storage-delete/index.ts
└── src/
    └── ecommerce/
        └── schema/
            ├── currencies.ts
            ├── regions.ts
            ├── customers.ts
            ├── catalog.ts
            ├── inventory.ts
            ├── pricing.ts
            ├── promotions.ts
            ├── tax.ts
            ├── fulfillment.ts
            ├── cart.ts
            ├── orders.ts
            ├── payments.ts
            ├── sales_channels.ts
            └── admin_users.ts
```

## How it handles your project

- **Existing `src/` directory** — schemas are placed at `src/ecommerce/schema/` without touching your existing code
- **Files that already exist** — shown as `overwrite` in the preview table with a warning before writing
- **Non-existent target directory** — prompts to create it
- **Missing template files** — fails fast with a clear error before writing anything
- **Failed writes** — reports which files failed; successfully written files remain
- **Package manager detection** — automatically detects pnpm, yarn, bun, or npm and prints the correct install commands

## After running init

### 1. Install dependencies

```bash
pnpm add drizzle-orm @supabase/supabase-js @supacommerce/client
pnpm add -D drizzle-kit
```

### 2. Configure Drizzle

```bash
mv drizzle.config.example.ts drizzle.config.ts
```

Add your database URL to `.env`:

```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### 3. Start Supabase locally

```bash
supabase start
```

### 4. Generate and apply migrations

```bash
pnpm db:generate
supabase db push
```

### 5. Apply RLS policies and Postgres functions

Open the Supabase SQL Editor and run:
1. `supabase/rls.sql` — Row Level Security policies
2. `supabase/functions.sql` — Postgres RPC functions

These are not applied by `supabase db push` — they must be run manually each time you reset or re-provision.

### 6. Use the query client

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supacommerce/client";

const supabase = createSupabaseClient(url, anonKey);
const commerce = createClient(supabase);

const products = await commerce.catalog.listProducts();
const cart = await commerce.cart.getOrCreate();
```

## License

MIT