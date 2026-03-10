import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../lib/cart"
import { formatCurrency } from "@supacommerce/utils"

export default function CartDrawer() {
  const { cart, open, closeCart, updateItem, removeItem, loading } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Trap focus / close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart() }
    document.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [open, closeCart])

  const currency = cart?.currencyCode ?? "USD"
  const fmt = (n: number) => formatCurrency(n, currency)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: "rgba(26,24,20,0.35)", backdropFilter: "blur(2px)" }}
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          background: "var(--color-surface)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0, 0.67, 0)",
          boxShadow: open ? "-8px 0 40px rgba(0,0,0,0.12)" : "none",
        }}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
            Your Bag
          </span>
          <button
            onClick={closeCart}
            style={{ color: "var(--color-ink-muted)" }}
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!cart || cart.lineItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "var(--color-ink-faint)" }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p style={{ color: "var(--color-ink-muted)", fontSize: "0.9rem" }}>
                Your bag is empty
              </p>
              <button
                onClick={closeCart}
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  fontWeight: 500,
                }}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {cart.lineItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4"
                  style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1.25rem" }}
                >
                  {/* Thumbnail */}
                  <div
                    className="flex-shrink-0 rounded overflow-hidden"
                    style={{
                      width: 72,
                      height: 88,
                      background: "var(--color-accent-light)",
                    }}
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{item.title}</span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.85rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt(item.subtotal)}
                      </span>
                    </div>

                    {item.subtitle && (
                      <span style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>
                        {item.subtitle}
                      </span>
                    )}

                    {/* Qty controls */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div
                        className="flex items-center"
                        style={{ border: "1px solid var(--color-border)", borderRadius: 4 }}
                      >
                        <button
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={loading}
                          className="w-7 h-7 flex items-center justify-center"
                          style={{ color: "var(--color-ink-muted)", fontSize: "1rem" }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8rem",
                            minWidth: 20,
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={loading}
                          className="w-7 h-7 flex items-center justify-center"
                          style={{ color: "var(--color-ink-muted)", fontSize: "1rem" }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={loading}
                        style={{ fontSize: "0.75rem", color: "var(--color-ink-faint)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer totals + CTA */}
        {cart && cart.lineItems.length > 0 && (
          <div
            className="px-6 py-5 flex flex-col gap-3"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--color-ink-muted)" }}>Subtotal</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{fmt(cart.subtotal)}</span>
            </div>
            {cart.shippingTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--color-ink-muted)" }}>Shipping</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{fmt(cart.shippingTotal)}</span>
              </div>
            )}
            {cart.discountTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--color-accent)" }}>Discount</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
                  −{fmt(cart.discountTotal)}
                </span>
              </div>
            )}
            <div
              className="flex justify-between pt-3"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <span style={{ fontWeight: 500 }}>Total</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                {fmt(cart.total)}
              </span>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="mt-2 w-full flex items-center justify-center py-3.5 text-white text-sm tracking-widest uppercase font-medium"
              style={{ background: "var(--color-ink)", letterSpacing: "0.1em" }}
            >
              Proceed to checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
