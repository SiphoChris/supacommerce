import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center flex-1 px-6">

      {/* Hero */}
      <section className="flex flex-col items-center text-center pt-24 pb-20 max-w-3xl w-full">
        <div className="inline-flex items-center gap-2 border border-fd-border rounded-full px-4 py-1.5 text-xs font-medium text-fd-muted-foreground mb-8 tracking-wide uppercase">
          Ecommerce for Supabase
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-fd-foreground mb-6 leading-[1.05]">
          Your backend.<br />Not ours.
        </h1>

        <p className="text-xl text-fd-muted-foreground max-w-2xl mb-10 leading-relaxed">
          One command drops a complete ecommerce backend into your Supabase project.
          Schemas, edge functions, RLS policies, Postgres RPCs, and a typed query client.
          Every file lands in your repo and becomes yours.
        </p>

        <div className="flex items-center gap-3 bg-fd-card border border-fd-border rounded-xl px-6 py-4 font-mono text-sm text-fd-foreground mb-10 w-full max-w-md justify-center">
          <span className="text-fd-muted-foreground select-none">$</span>
          <span className="select-all">npx @supacommerce/cli init</span>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center gap-2 bg-fd-primary text-fd-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Get started →
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 border border-fd-border text-fd-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-fd-accent transition-colors"
          >
            Read the docs
          </Link>
          <a
            href="https://github.com/SiphoChris/supacommerce"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-fd-border text-fd-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-fd-accent transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </section>

      {/* Shadcn callout */}
      <section className="w-full max-w-3xl mb-20">
        <div className="border border-fd-border rounded-xl p-8 bg-fd-card">
          <p className="text-fd-foreground text-lg leading-relaxed">
            The same idea as{' '}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              shadcn/ui
            </a>
            {' '}— but for your backend instead of your UI.
            No black box. No vendor lock-in. No abstraction sitting between you and your database.
            Delete{' '}
            <code className="text-sm bg-fd-muted px-1.5 py-0.5 rounded font-mono">@supacommerce/client</code>
            {' '}and nothing breaks except your convenience wrappers.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="w-full max-w-3xl mb-20">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-fd-muted-foreground mb-6">
          What you get
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {whatYouGet.map((item) => (
            <div key={item.title} className="border border-fd-border rounded-xl p-6 bg-fd-card">
              <p className="font-semibold text-fd-foreground mb-2">{item.title}</p>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-3xl mb-20">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-fd-muted-foreground mb-6">
          How it works
        </h2>
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 items-start border border-fd-border rounded-xl p-6 bg-fd-card">
              <span className="text-xs font-bold text-fd-muted-foreground border border-fd-border rounded-md w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-fd-foreground mb-1">{step.title}</p>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">{step.description}</p>
                {step.code && (
                  <code className="mt-2 block text-xs font-mono bg-fd-muted px-3 py-2 rounded-lg text-fd-foreground">
                    {step.code}
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="w-full max-w-3xl mb-24">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-fd-muted-foreground mb-6">
          Packages
        </h2>
        <div className="flex flex-col gap-3">
          {packages.map((pkg) => (
            <div key={pkg.name} className="flex items-start gap-4 border border-fd-border rounded-xl p-6 bg-fd-card">
              <code className="text-sm font-mono text-fd-foreground bg-fd-muted px-2 py-1 rounded shrink-0">
                {pkg.name}
              </code>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">{pkg.description}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

const whatYouGet = [
  {
    title: '14 Drizzle schemas',
    description:
      'Products, variants, cart, orders, inventory, pricing, promotions, tax, fulfillment, payments, sales channels, and admin. Fully typed.',
  },
  {
    title: '7 edge functions',
    description:
      'Checkout, order confirmation, payment webhooks, admin invitations, and storage. Clear TODO markers where your payment provider goes.',
  },
  {
    title: 'RLS policies',
    description:
      'Products are publicly readable. Carts and orders are own-data-only. Admin tables are role-gated. Fully idempotent.',
  },
  {
    title: 'Postgres RPCs',
    description:
      'Checkout, order confirmation, and inventory reservation run as atomic Postgres transactions. Partial failures are impossible.',
  },
  {
    title: 'Typed query client',
    description:
      'commerce.cart.addItem(), commerce.catalog.listProducts(). Ecommerce methods that speak your domain instead of raw SQL.',
  },
  {
    title: 'You own everything',
    description:
      'Every file lands in your repo. Read it. Modify it. Delete what you don\'t need. No abstraction to fight.',
  },
];

const steps = [
  {
    title: 'Run the CLI',
    description: 'Copies all schemas, edge functions, SQL files, and config into your project.',
    code: 'npx @supacommerce/cli init',
  },
  {
    title: 'Generate and apply migrations',
    description: 'The schemas are plain Drizzle ORM TypeScript files. Generate SQL and push to your Supabase project.',
    code: 'pnpm drizzle:generate && supabase db push',
  },
  {
    title: 'Apply RLS and Postgres functions',
    description: 'Paste rls.sql and functions.sql into the Supabase SQL Editor. These are not applied by db push.',
  },
  {
    title: 'Use the query client',
    description: 'Install @supacommerce/client and start building your storefront.',
    code: 'pnpm add @supacommerce/client',
  },
];

const packages = [
  {
    name: '@supacommerce/cli',
    description:
      'The init command. Copies schemas, edge functions, SQL files, and config into your project. Detects your package manager automatically.',
  },
  {
    name: '@supacommerce/client',
    description:
      'Typed ecommerce query client. commerce.cart.addItem(), commerce.catalog.listProducts(), commerce.orders.list() — and more.',
  },
  {
    name: '@supacommerce/utils',
    description:
      'Shared utilities. Currency helpers, typed error classes, Result<T>, pagination, ID generation, and date helpers.',
  },
];