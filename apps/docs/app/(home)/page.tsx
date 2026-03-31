import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">

      {/* Eyebrow */}
      <p className="text-sm font-semibold tracking-widest uppercase text-fd-muted-foreground mb-6">
        Ecommerce for Supabase
      </p>

      {/* Headline */}
      <h1 className="text-5xl font-bold tracking-tight text-fd-foreground mb-6 max-w-2xl">
        Your backend.<br />Not ours.
      </h1>

      {/* Sub */}
      <p className="text-lg text-fd-muted-foreground max-w-xl mb-10 leading-relaxed">
        supacommerce drops a complete ecommerce backend into your Supabase project —
        schemas, edge functions, RLS policies, and a typed query client.
        Every file becomes yours the moment it lands.
      </p>

      {/* Install */}
      <div className="bg-fd-card border border-fd-border rounded-lg px-6 py-4 font-mono text-sm text-fd-foreground mb-10 select-all">
        npx supacommerce init
      </div>

      {/* CTAs */}
      <div className="flex gap-4 flex-wrap justify-center mb-20">
        <Link
          href="/docs/getting-started"
          className="inline-flex items-center gap-2 bg-fd-primary text-fd-primary-foreground px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Get started →
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 border border-fd-border text-fd-foreground px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-fd-accent transition-colors"
        >
          Read the docs
        </Link>
        <a
          href="https://github.com/SiphoChris/supacommerce"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-fd-border text-fd-foreground px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-fd-accent transition-colors"
        >
          GitHub
        </a>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full text-left">
        {features.map((f) => (
          <div
            key={f.title}
            className="border border-fd-border rounded-lg p-6 bg-fd-card"
          >
            <p className="text-base font-semibold text-fd-foreground mb-2">{f.title}</p>
            <p className="text-sm text-fd-muted-foreground leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Shadcn reference */}
      <p className="mt-20 text-sm text-fd-muted-foreground max-w-lg leading-relaxed">
        The same idea as{' '}
        <a
          href="https://ui.shadcn.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-fd-foreground transition-colors"
        >
          shadcn/ui
        </a>
        {' '}— but for your backend. No black box. No vendor lock-in.
        Delete{' '}
        <code className="text-xs bg-fd-muted px-1.5 py-0.5 rounded">@supacommerce/client</code>
        {' '}and nothing breaks except your convenience wrappers.
      </p>

    </main>
  );
}

const features = [
  {
    title: '14 Drizzle schemas',
    description:
      'Products, variants, cart, orders, inventory, pricing, promotions, tax, fulfillment, payments, and more. Fully typed, fully yours.',
  },
  {
    title: '7 edge functions',
    description:
      'Atomic checkout, payment webhooks, order confirmation, admin invitations, and storage — all with clear TODO markers where your provider goes.',
  },
  {
    title: 'RLS out of the box',
    description:
      'Products are publicly readable. Carts and orders are own-data-only. Admin tables are gated by role. All idempotent and safe to re-run.',
  },
  {
    title: 'Typed query client',
    description:
      'commerce.cart.addItem(), commerce.catalog.listProducts(). Ecommerce-oriented methods that speak your domain instead of raw SQL.',
  },
  {
    title: 'Postgres RPCs',
    description:
      'Checkout, order confirmation, and inventory reservation are atomic Postgres transactions. Partial failures are impossible.',
  },
  {
    title: 'You own everything',
    description:
      'Every file lands in your repo and becomes yours. Read it. Modify it. Delete what you don\'t need. No abstraction to fight.',
  },
];