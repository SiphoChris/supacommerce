import { useEffect, useState } from "react";
import type { Product } from "@supacommerce/client";
import { commerce } from "../lib/commerce";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    commerce.catalog
      .listProducts({ status: "published", limit: 48 })
      .then((res) => setProducts(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero text */}
      <div className="mb-14 max-w-xl">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--color-ink)",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
          }}
        >
          The Collection
        </h1>
        <p
          style={{
            color: "var(--color-ink-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          Thoughtfully made, carefully considered.
        </p>
      </div>

      {/* Thin rule */}
      <div
        style={{
          height: 1,
          background: "var(--color-border)",
          marginBottom: "3rem",
        }}
      />

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="aspect-[3/4] animate-pulse rounded"
                style={{ background: "var(--color-border)" }}
              />
              <div
                className="h-3 w-2/3 rounded animate-pulse"
                style={{ background: "var(--color-border)" }}
              />
              <div
                className="h-3 w-1/3 rounded animate-pulse"
                style={{ background: "var(--color-border)" }}
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="py-20 text-center">
          <p style={{ color: "var(--color-accent)", fontSize: "0.9rem" }}>
            {error}
          </p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="py-20 text-center">
          <p style={{ color: "var(--color-ink-muted)", fontSize: "0.9rem" }}>
            No products yet. Add some from the dashboard.
          </p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
