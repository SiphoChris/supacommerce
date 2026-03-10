import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ShippingOption, Region } from "@supacommerce/client";
import type { Address } from "@supacommerce/client";
import { commerce } from "../lib/commerce";
import { useCart } from "../lib/cart";
import { useAuth } from "../lib/auth";
import { formatCurrency } from "@supacommerce/utils";

const EMPTY_ADDRESS: Address = {
  firstName: "",
  lastName: "",
  address1: "",
  city: "",
  countryCode: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, applyPromotion, removePromotion, refresh } = useCart();
  const { user } = useAuth();

  const [regions, setRegions] = useState<Region[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!cart) return;
    commerce.regions.list().then(setRegions);
  }, [cart]);

  // Load shipping options when country changes
  useEffect(() => {
    if (!address.countryCode) return;
    const region = regions.find((r) =>
      r.countries.some((c) => c.iso2 === address.countryCode),
    );
    if (!region) {
      setShippingOptions([]);
      return;
    }

    commerce.fulfillment
      .listShippingOptions({
        regionId: region.id,
        cartSubtotal: cart?.subtotal ?? 0,
      })
      .then((opts) => {
        setShippingOptions(opts);
        if (opts[0]) setSelectedShipping(opts[0].id);
      });
  }, [address.countryCode, regions, cart?.subtotal]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const result = await commerce.promotions.validate({
        code: promoCode,
        cartSubtotal: cart?.subtotal ?? 0,
      });
      if (!result.valid) {
        setPromoError(result.reason ?? "Invalid code");
        return;
      }
      await applyPromotion(promoCode);
      setPromoCode("");
    } catch (e: unknown) {
      setPromoError(e instanceof Error ? e.message : "Failed to apply");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!cart || !selectedShipping) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Set shipping method
      await commerce.cart.setShippingMethod(cart.id, selectedShipping);
      await commerce.cart.setShippingAddress(cart.id, address);

      // Checkout
      const result = await commerce.cart.checkout(cart.id, {
        paymentProvider: "manual",
        billingAddress: address,
      });
      await refresh();
      navigate(`/orders/${result.orderId}/confirmation`);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  const currency = cart?.currencyCode ?? "USD";
  const fmt = (n: number) => formatCurrency(n, currency);

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <p style={{ color: "var(--color-ink-muted)" }}>Your cart is empty.</p>
      </div>
    );
  }

  // Unique countries across all regions
  const countries = regions
    .flatMap((r) => r.countries)
    .sort((a, b) => a.name.localeCompare(b.name));


  return (
    <div className="max-w-5xl mx-auto px-6 py-14 fade-in">
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          marginBottom: "2.5rem",
          fontStyle: "italic",
        }}
      >
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        {/* Left — forms */}
        <div className="flex flex-col gap-10">
          {/* Shipping address */}
          <section>
            <SectionHeading>Shipping address</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="First name"
                value={address.firstName ?? ""}
                onChange={(v) => setAddress((a) => ({ ...a, firstName: v }))}
              />
              <Field
                label="Last name"
                value={address.lastName ?? ""}
                onChange={(v) => setAddress((a) => ({ ...a, lastName: v }))}
              />
              <div className="col-span-2">
                <Field
                  label="Address"
                  value={address.address1}
                  onChange={(v) => setAddress((a) => ({ ...a, address1: v }))}
                />
              </div>
              <div className="col-span-2">
                <Field
                  label="Apartment, suite, etc. (optional)"
                  value={address.address2 ?? ""}
                  onChange={(v) => setAddress((a) => ({ ...a, address2: v }))}
                />
              </div>
              <Field
                label="City"
                value={address.city}
                onChange={(v) => setAddress((a) => ({ ...a, city: v }))}
              />
              <Field
                label="Postal code"
                value={address.postalCode ?? ""}
                onChange={(v) => setAddress((a) => ({ ...a, postalCode: v }))}
              />
              <div className="col-span-2">
                <label style={labelStyle}>Country</label>
                <select
                  value={address.countryCode}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, countryCode: e.target.value }))
                  }
                  style={inputStyle}
                  className="w-full"
                >
                  <option value="">Select country…</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.iso2}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Shipping method */}
          {shippingOptions.length > 0 && (
            <section>
              <SectionHeading>Shipping method</SectionHeading>
              <div className="flex flex-col gap-2">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    style={{
                      border:
                        selectedShipping === opt.id
                          ? "1.5px solid var(--color-ink)"
                          : "1.5px solid var(--color-border)",
                      borderRadius: 4,
                    }}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={selectedShipping === opt.id}
                      onChange={() => setSelectedShipping(opt.id)}
                      style={{ accentColor: "var(--color-ink)" }}
                    />
                    <span style={{ flex: 1, fontSize: "0.9rem" }}>
                      {opt.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {fmt(opt.amount)}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Promo code */}
          <section>
            <SectionHeading>Promo code</SectionHeading>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCode}
                style={{
                  padding: "0 1.25rem",
                  background: "var(--color-ink)",
                  color: "white",
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: promoLoading || !promoCode ? 0.5 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {promoLoading ? "…" : "Apply"}
              </button>
            </div>
            {promoError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-accent)",
                  marginTop: 6,
                }}
              >
                {promoError}
              </p>
            )}
            {cart.promotionCodes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {cart.promotionCodes.map((code) => (
                  <span
                    key={code}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
                    style={{
                      background: "var(--color-accent-light)",
                      color: "var(--color-accent)",
                      borderRadius: 3,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {code}
                    <button
                      onClick={() => removePromotion(code)}
                      style={{ lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {submitError && (
            <p style={{ color: "var(--color-accent)", fontSize: "0.85rem" }}>
              {submitError}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !address.countryCode ||
              !address.address1 ||
              !selectedShipping
            }
            className="w-full py-4 text-white text-sm font-medium tracking-widest uppercase"
            style={{
              background: "var(--color-ink)",
              letterSpacing: "0.12em",
              opacity:
                submitting ||
                !address.countryCode ||
                !address.address1 ||
                !selectedShipping
                  ? 0.5
                  : 1,
              cursor: submitting ? "wait" : "pointer",
              transition: "opacity 0.2s",
            }}
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </div>

        {/* Right — order summary */}
        <aside className="flex flex-col gap-4">
          <div
            className="p-6 flex flex-col gap-5"
            style={{ border: "1px solid var(--color-border)", borderRadius: 4 }}
          >
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              Order summary
            </h3>

            <ul className="flex flex-col gap-3">
              {cart.lineItems.map((item) => (
                <li key={item.id} className="flex gap-3">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-12 h-14 object-cover rounded"
                      style={{ background: "var(--color-accent-light)" }}
                    />
                  )}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        {item.subtitle}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      Qty {item.quantity}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmt(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ height: 1, background: "var(--color-border)" }} />

            <div className="flex flex-col gap-2 text-sm">
              <Row label="Subtotal" value={fmt(cart.subtotal)} />
              {cart.shippingTotal > 0 && (
                <Row label="Shipping" value={fmt(cart.shippingTotal)} />
              )}
              {cart.discountTotal > 0 && (
                <Row
                  label="Discount"
                  value={`−${fmt(cart.discountTotal)}`}
                  accent
                />
              )}
            </div>

            <div
              className="flex justify-between pt-3"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <span style={{ fontWeight: 500 }}>Total</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                {fmt(cart.total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return (
    <h3
      style={{
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--color-ink-muted)",
        fontWeight: 500,
        marginBottom: "1rem",
        fontFamily: "var(--font-body)",
      }}
    >
      {children}
    </h3>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-ink-muted)",
  marginBottom: 6,
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.6rem 0.75rem",
  border: "1.5px solid var(--color-border)",
  background: "var(--color-surface)",
  fontSize: "0.88rem",
  outline: "none",
  transition: "border-color 0.15s",
};

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span
        style={{
          color: accent ? "var(--color-accent)" : "var(--color-ink-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          color: accent ? "var(--color-accent)" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}
