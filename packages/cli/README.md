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
├── drizzle.config.example.ts         ← rename to drizzle.config.ts
├── supabase/
│   ├── rls.sql                       ← Row Level Security policies
│   ├── functions.sql                 ← Postgres RPC functions
│   └── functions/
│       ├── _shared/
│       │   ├── cors.ts               ← CORS helpers
│       │   └── supabaseAdmin.ts      ← Service role client
│       ├── cart-checkout/index.ts
│       ├── order-confirmed/index.ts
│       ├── payment-webhook/index.ts
│       └── inventory-reserve/index.ts
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

- **Existing `src/` directory** — schemas are placed inside the existing directory at `src/ecommerce/schema/` without disturbing your existing code
- **Files that already exist** — shown as `overwrite` in the preview table with a warning before any files are written
- **Non-existent target directory** — prompts to create it
- **Missing template files** — fails fast with a clear error before writing anything
- **Failed writes** — reports which files failed; any successfully written files remain

## After running init

1. **Install dependencies**

   ```bash
   pnpm add drizzle-orm @supabase/supabase-js @supacommerce/core
   pnpm add -D drizzle-kit
   ```

2. **Configure Drizzle**

   ```bash
   mv drizzle.config.example.ts drizzle.config.ts
   # Add DATABASE_URL to your .env
   ```

3. **Start Supabase**
   ```bash
   supabase start
   ```

## We recommend putting these scripts in your `package.json`:

```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "preview": "...",

    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",

    "supabase:login": "supabase login",
    "supabase:link": "supabase link",
    "supabase:start": "supabase start",
    "db:push:remote": "supabase db push",
    "db:pull:remote": "supabase db pull",
    "db:reset": "supabase db reset",
    "db:new": "supabase migration new",

    "db:sync": "pnpm db:generate && pnpm db:push:remote"
  }
}
```

4. **Generate and apply migrations**

   ```bash
   pnpm db:generate
   pnpm db:migrate OR pnpm db:push:remote
   ```

5. **Apply RLS and Postgres functions**
   - Open the Supabase SQL Editor
   - Apply RLS policies (rls.sql)
   - Run `supabase/functions.sql`

6. **Create first admin user**
   SUPABASE_URL=https://xxx.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your-key \
   ADMIN_EMAIL=you@example.com \
   ADMIN_PASSWORD=yourpassword \
   ADMIN_FIRST_NAME=Your \
   ADMIN_LAST_NAME=Name \
   pnpm seed:admin

## License

MIT
