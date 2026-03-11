# @supacommerce/cli

The `init` command for supacommerce. Copies schemas, edge functions, and SQL files into your Supabase project.

## Usage

```bash
npx @supacommerce/cli init
```

Or with options:

```bash
# Target a specific directory
npx @supacommerce/cli init --dir ./my-project

# Skip the confirmation prompt
npx @supacommerce/cli init --skip-confirmation
```

## What it copies

```
your-project/
├── drizzle.config.example.ts
├── supabase/
│   ├── rls.sql
│   ├── functions.sql
│   └── functions/
│       ├── _shared/
│       │   ├── cors.ts
│       │   └── supabaseAdmin.ts
│       ├── cart-checkout/index.ts
│       ├── order-confirmed/index.ts
│       ├── payment-webhook/index.ts
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

## Edge case handling

- **Existing `src/` directory** — schemas are placed at `src/ecommerce/schema/` without touching your existing code
- **Files that already exist** — shown as `overwrite` in the preview table with a warning before writing
- **Non-existent target directory** — prompts to create it
- **Missing template files** — fails fast with a clear error before writing anything
- **Failed writes** — reports which files failed; successfully written files remain

## After running init

### 1. Install dependencies

```bash
pnpm add drizzle-orm @supabase/supabase-js @supacommerce/client
pnpm add -D drizzle-kit
```

### 2. Configure Drizzle

```bash
mv drizzle.config.example.ts drizzle.config.ts
# Add DATABASE_URL to your .env
```

### 3. Generate and apply migrations

```bash
pnpm db:generate
supabase db push
```

### 4. Apply RLS policies and Postgres functions

Open the Supabase SQL Editor and run `rls.sql`, then `functions.sql`. These are not applied by `supabase db push` — they must be pasted in manually each time you reset or re-provision.

### 5. Create your first admin user

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-key \
ADMIN_EMAIL=you@example.com \
ADMIN_PASSWORD=yourpassword \
ADMIN_FIRST_NAME=Your \
ADMIN_LAST_NAME=Name \
pnpm seed:admin
```

### 6. Configure store fundamentals

Before creating products or pricing, set these up in the dashboard in order — each one depends on the previous:

1. **Currencies** (e.g. USD, ZAR) — these are the foundation; everything else references them
2. **Regions** — each region requires a currency
3. **Countries** — each country belongs to a region
4. **Tax regions & rates** — optional, reference regions

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

## License

MIT