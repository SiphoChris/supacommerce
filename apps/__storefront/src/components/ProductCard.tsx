import { Link } from "react-router-dom";
import type { Product } from "@supacommerce/client";
import { formatCurrency } from "@supacommerce/utils";

interface Props {
  product: Product;
  price?: number;
  currencyCode?: string;
}

export default function ProductCard({
  product,
  price,
  currencyCode = "USD",
}: Props) {
  return (
    <Link
      to={`/products/${product.handle}`}
      className="group flex flex-col gap-3"
      style={{ color: "inherit" }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden aspect-[3/4]"
        style={{ background: "var(--color-accent-light)" }}
      >
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            style={{ transition: "transform 0.5s ease" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              style={{ color: "var(--color-ink-faint)" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
          style={{
            background:
              "linear-gradient(to top, rgba(26,24,20,0.35) 0%, transparent 60%)",
          }}
        >
          <span
            className="text-white text-xs tracking-widest uppercase"
            style={{ fontWeight: 500, letterSpacing: "0.12em" }}
          >
            View product
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5">
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: 400,
            color: "var(--color-ink)",
            lineHeight: 1.3,
          }}
        >
          {product.title}
        </span>
        {product.subtitle && (
          <span
            style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}
          >
            {product.subtitle}
          </span>
        )}
        {price !== undefined && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--color-ink)",
              marginTop: 4,
            }}
          >
            {formatCurrency(price, currencyCode)}
          </span>
        )}
      </div>
    </Link>
  );
}
