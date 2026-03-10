import { Link, useLocation } from "react-router-dom"
import { useCart } from "../lib/cart"
import { useAuth } from "../lib/auth"
import CartDrawer from "./CartDrawer"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  const { cart, openCart } = useCart()
  const { user, signOut } = useAuth()
  const location = useLocation()

  const itemCount = cart?.lineItems.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-ground)" }}>
      {/* Nav */}
      <header
        style={{ borderBottom: "1px solid var(--color-border)" }}
        className="sticky top-0 z-40"
        css-background="var(--color-ground)"
      >
        <nav
          className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
          style={{ background: "var(--color-ground)" }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
              }}
            >
              supacommerce
            </span>
          </Link>

          {/* Centre nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Shop", to: "/" },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                style={{
                  fontSize: "0.8rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  color: isActive(to) ? "var(--color-accent)" : "var(--color-ink-muted)",
                  transition: "color 0.2s",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            {user ? (
              <>
                <Link
                  to="/account"
                  style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  Account
                </Link>
                <button
                  onClick={() => signOut()}
                  style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                }}
              >
                Sign in
              </Link>
            )}

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2"
              style={{ color: "var(--color-ink)" }}
              aria-label="Open cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: "var(--color-accent)",
                    fontSize: "0.6rem",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-ink-muted)" }}
        className="mt-auto"
      >
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
            supacommerce
          </span>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            © {new Date().getFullYear()} — All rights reserved
          </span>
        </div>
      </footer>

      {/* Cart drawer — always rendered, opens/closes via context */}
      <CartDrawer />
    </div>
  )
}
