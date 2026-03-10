import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  Product,
  ProductVariant,
  ProductOptionValue,
} from "@supacommerce/client";
import { commerce } from "../lib/commerce";
import { useCart } from "../lib/cart";
import { useAuth } from "../lib/auth";
import { formatCurrency } from "@supacommerce/utils";

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [price, setPrice] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Load product
  useEffect(() => {
    if (!handle) return;
    commerce.catalog
      .getProductByHandle(handle)
      .then((p) => {
        setProduct(p);
        // Pre-select first value for each option
        const defaults: Record<string, string> = {};
        p.options.forEach((opt) => {
          if (opt.values[0]) defaults[opt.id] = opt.values[0].id;
        });
        setSelectedOptions(defaults);
      })
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [handle]);

  // Resolve variant from selected options
  useEffect(() => {
    if (!product) return;
    const variant =
      product.variants.find((v) => {
        return v.optionValues.every(
          (ov) => selectedOptions[ov.optionId] === ov.id,
        );
      }) ?? null;
    setSelectedVariant(variant);
    setAdded(false);
  }, [selectedOptions, product]);

  // Fetch price for selected variant
  useEffect(() => {
    if (!selectedVariant) {
      setPrice(null);
      return;
    }
    commerce.pricing
      .getVariantPrice({ variantId: selectedVariant.id })
      .then((p) => setPrice(p?.amount ?? null))
      .catch(() => setPrice(null));
  }, [selectedVariant]);

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: valueId }));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !user) {
      if (!user) navigate("/login");
      return;
    }
    setAdding(true);
    try {
      await addItem(selectedVariant.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  };

  const currency = "USD";

  if (loading) return <ProductSkeleton />;
  if (error || !product)
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <p style={{ color: "var(--color-ink-muted)" }}>
          {error ?? "Product not found"}
        </p>
      </div>
    );

  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            id: "placeholder",
            url: "",
            alt: null,
            rank: 0,
            productId: product.id,
          },
        ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className="w-14 h-16 overflow-hidden rounded"
                  style={{
                    border:
                      activeImage === i
                        ? "2px solid var(--color-ink)"
                        : "2px solid var(--color-border)",
                    background: "var(--color-accent-light)",
                  }}
                >
                  {img.url && (
                    <img
                      src={img.url}
                      alt={img.alt ?? ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div
            className="flex-1 aspect-[3/4] overflow-hidden rounded relative"
            style={{ background: "var(--color-accent-light)" }}
          >
            {images[activeImage]?.url ? (
              <img
                src={images[activeImage].url}
                alt={images[activeImage].alt ?? product.title}
                className="w-full h-full object-cover"
                key={images[activeImage].id}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  style={{ color: "var(--color-ink-faint)" }}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-6 pt-2">
          {/* Title + price */}
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                lineHeight: 1.15,
                marginBottom: "0.5rem",
              }}
            >
              {product.title}
            </h1>
            {product.subtitle && (
              <p
                style={{ color: "var(--color-ink-muted)", fontSize: "0.9rem" }}
              >
                {product.subtitle}
              </p>
            )}
            {price !== null && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.25rem",
                  marginTop: "0.75rem",
                  color: "var(--color-ink)",
                }}
              >
                {formatCurrency(price, currency)}
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--color-border)" }} />

          {/* Option selectors */}
          {product.options.map((option) => (
            <div key={option.id} className="flex flex-col gap-2.5">
              <label
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  fontWeight: 500,
                }}
              >
                {option.title}
              </label>
              <div className="flex flex-wrap gap-2">
                {option.values.map((val: ProductOptionValue) => {
                  const isSelected = selectedOptions[option.id] === val.id;
                  return (
                    <button
                      key={val.id}
                      onClick={() => handleOptionSelect(option.id, val.id)}
                      style={{
                        padding: "0.4rem 1rem",
                        fontSize: "0.82rem",
                        border: isSelected
                          ? "1.5px solid var(--color-ink)"
                          : "1.5px solid var(--color-border)",
                        background: isSelected
                          ? "var(--color-ink)"
                          : "transparent",
                        color: isSelected ? "white" : "var(--color-ink)",
                        borderRadius: 3,
                        transition: "all 0.15s",
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {val.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex flex-col gap-2.5">
            <label
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-ink-muted)",
                fontWeight: 500,
              }}
            >
              Quantity
            </label>
            <div
              className="flex items-center self-start"
              style={{
                border: "1.5px solid var(--color-border)",
                borderRadius: 3,
              }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center"
                style={{ color: "var(--color-ink-muted)", fontSize: "1.1rem" }}
              >
                −
              </button>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  minWidth: 32,
                  textAlign: "center",
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center"
                style={{ color: "var(--color-ink-muted)", fontSize: "1.1rem" }}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding || !selectedVariant}
            className="w-full py-4 text-white text-sm font-medium tracking-widest uppercase transition-all duration-200"
            style={{
              background: added
                ? "#4a7c59"
                : !selectedVariant
                  ? "var(--color-ink-faint)"
                  : "var(--color-ink)",
              letterSpacing: "0.12em",
              cursor: !selectedVariant ? "not-allowed" : "pointer",
            }}
          >
            {adding
              ? "Adding…"
              : added
                ? "Added to bag ✓"
                : !selectedVariant
                  ? "Select options"
                  : "Add to bag"}
          </button>

          {!user && (
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--color-ink-muted)",
                textAlign: "center",
              }}
            >
              <a href="/login" style={{ color: "var(--color-accent)" }}>
                Sign in
              </a>{" "}
              to add items to your bag
            </p>
          )}

          {/* Description */}
          {product.description && (
            <>
              <div style={{ height: 1, background: "var(--color-border)" }} />
              <div>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--color-ink-muted)",
                    lineHeight: 1.8,
                  }}
                >
                  {product.description}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div
          className="aspect-[3/4] rounded animate-pulse"
          style={{ background: "var(--color-border)" }}
        />
        <div className="flex flex-col gap-4 pt-2">
          <div
            className="h-10 w-3/4 rounded animate-pulse"
            style={{ background: "var(--color-border)" }}
          />
          <div
            className="h-5 w-1/3 rounded animate-pulse"
            style={{ background: "var(--color-border)" }}
          />
          <div className="h-px" style={{ background: "var(--color-border)" }} />
          <div
            className="h-4 w-1/4 rounded animate-pulse"
            style={{ background: "var(--color-border)" }}
          />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-16 rounded animate-pulse"
                style={{ background: "var(--color-border)" }}
              />
            ))}
          </div>
          <div
            className="h-12 rounded animate-pulse mt-4"
            style={{ background: "var(--color-border)" }}
          />
        </div>
      </div>
    </div>
  );
}
