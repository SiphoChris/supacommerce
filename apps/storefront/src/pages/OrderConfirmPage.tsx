import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Order } from "@supacommerce/client";
import { commerce } from "../lib/commerce";
import { formatCurrency } from "@supacommerce/utils";

export default function OrderConfirmPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    commerce.orders
      .get(orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <div
          className="h-4 w-48 mx-auto rounded animate-pulse"
          style={{ background: "var(--color-border)" }}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <p style={{ color: "var(--color-ink-muted)" }}>Order not found.</p>
      </div>
    );
  }

  const currency = order.currencyCode ?? "USD";
  const fmt = (n: number) => formatCurrency(n, currency);

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 fade-in">
      {/* Success mark */}
      <div className="flex flex-col items-center text-center mb-12">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ background: "var(--color-accent-light)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--color-accent)" }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontStyle: "italic",
            marginBottom: "0.5rem",
          }}
        >
          Thank you for your order
        </h1>
        <p style={{ color: "var(--color-ink-muted)", fontSize: "0.9rem" }}>
          Order #{order.displayId} — confirmation sent to{" "}
          <span style={{ color: "var(--color-ink)" }}>{order.email}</span>
        </p>
      </div>

      {/* Order summary card */}
      <div
        className="p-6 flex flex-col gap-5"
        style={{ border: "1px solid var(--color-border)", borderRadius: 4 }}
      >
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          Order summary
        </h3>

        <ul className="flex flex-col gap-3">
          {order.lineItems.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-12 h-14 object-cover rounded"
                  style={{ background: "var(--color-accent-light)" }}
                />
              )}
              <div className="flex-1">
                <p style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                  {item.title}
                </p>
                {item.subtitle && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {item.subtitle}
                  </p>
                )}
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  Qty {item.quantity}
                </p>
              </div>
              <span
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
              >
                {fmt(item.total)}
              </span>
            </li>
          ))}
        </ul>

        <div style={{ height: 1, background: "var(--color-border)" }} />

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--color-ink-muted)" }}>Subtotal</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {fmt(order.subtotal)}
            </span>
          </div>
          {order.shippingTotal > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "var(--color-ink-muted)" }}>Shipping</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {fmt(order.shippingTotal)}
              </span>
            </div>
          )}
          {order.discountTotal > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "var(--color-accent)" }}>Discount</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-accent)",
                }}
              >
                −{fmt(order.discountTotal)}
              </span>
            </div>
          )}
        </div>

        <div
          className="flex justify-between pt-3 font-medium"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span>Total</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>
            {fmt(order.total)}
          </span>
        </div>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div
          className="mt-4 p-5"
          style={{ border: "1px solid var(--color-border)", borderRadius: 4 }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-muted)",
              marginBottom: "0.6rem",
              fontWeight: 500,
            }}
          >
            Ships to
          </p>
          <address
            style={{
              fontStyle: "normal",
              fontSize: "0.88rem",
              lineHeight: 1.7,
            }}
          >
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            <br />
            {order.shippingAddress.address1}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.countryCode}
          </address>
        </div>
      )}

      <div className="flex gap-4 mt-10">
        <Link
          to="/account"
          className="flex-1 py-3 text-center text-sm tracking-widest uppercase"
          style={{
            border: "1.5px solid var(--color-ink)",
            color: "var(--color-ink)",
            letterSpacing: "0.1em",
          }}
        >
          View orders
        </Link>
        <Link
          to="/"
          className="flex-1 py-3 text-center text-sm tracking-widest uppercase text-white"
          style={{ background: "var(--color-ink)", letterSpacing: "0.1em" }}
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
