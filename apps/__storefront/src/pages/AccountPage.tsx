import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Customer, CustomerAddress, Order } from "@supacommerce/client";
import { commerce } from "../lib/commerce";
import { useAuth } from "../lib/auth";
import { formatCurrency } from "@supacommerce/utils";

type Tab = "orders" | "profile" | "addresses";

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    Promise.all([
      commerce.customers.me(),
      commerce.orders.list({ limit: 20 }),
      commerce.customers.listAddresses(),
    ])
      .then(([cust, ordersRes, addrs]) => {
        setCustomer(cust);
        setOrders(ordersRes.data);
        setAddresses(addrs);
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div
          className="h-8 w-48 rounded animate-pulse mb-8"
          style={{ background: "var(--color-border)" }}
        />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-14 fade-in">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            {customer?.firstName
              ? `Hello, ${customer.firstName}`
              : "My Account"}
          </h1>
          <p
            style={{
              color: "var(--color-ink-muted)",
              fontSize: "0.85rem",
              marginTop: 4,
            }}
          >
            {user?.email}
          </p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-ink-muted)",
            border: "1px solid var(--color-border)",
            padding: "0.4rem 1rem",
          }}
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0"
        style={{
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "2.5rem",
        }}
      >
        {(["orders", "profile", "addresses"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.6rem 1.25rem",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 500,
              color: tab === t ? "var(--color-ink)" : "var(--color-ink-muted)",
              borderBottom:
                tab === t
                  ? "2px solid var(--color-ink)"
                  : "2px solid transparent",
              marginBottom: -1,
              transition: "all 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrdersTab orders={orders} />}
      {tab === "profile" && customer && (
        <ProfileTab customer={customer} onSave={setCustomer} />
      )}
      {tab === "addresses" && (
        <AddressesTab addresses={addresses} onUpdate={setAddresses} />
      )}
    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────
function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <p style={{ color: "var(--color-ink-muted)", fontSize: "0.9rem" }}>
        You haven't placed any orders yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => {
        const currency = order.currencyCode ?? "USD";
        return (
          <div
            key={order.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ border: "1px solid var(--color-border)", borderRadius: 4 }}
          >
            <div className="flex flex-col gap-1">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.82rem",
                  color: "var(--color-ink-muted)",
                }}
              >
                #{order.displayId}
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span
                style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)" }}
              >
                {order.lineItems.length} item
                {order.lineItems.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-1">
                <span
                  className="px-2 py-0.5 text-xs uppercase tracking-wider"
                  style={{
                    background: statusColor(order.status).bg,
                    color: statusColor(order.status).text,
                    borderRadius: 2,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {order.status}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  {formatCurrency(order.total, currency)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "completed":
      return { bg: "#e8f5e9", text: "#2e7d32" };
    case "cancelled":
      return { bg: "#fce4ec", text: "#b71c1c" };
    case "processing":
      return { bg: "#fff8e1", text: "#f57f17" };
    default:
      return { bg: "var(--color-accent-light)", text: "var(--color-accent)" };
  }
}

// ─── Profile tab ──────────────────────────────────────────────────────────────
function ProfileTab({
  customer,
  onSave,
}: {
  customer: Customer;
  onSave: (c: Customer) => void;
}) {
  const [firstName, setFirstName] = useState(customer.firstName ?? "");
  const [lastName, setLastName] = useState(customer.lastName ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await commerce.customers.updateProfile({
        firstName,
        lastName,
        phone,
      });
      onSave(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" value={firstName} onChange={setFirstName} />
        <Field label="Last name" value={lastName} onChange={setLastName} />
      </div>
      <Field label="Phone" value={phone} onChange={setPhone} />

      <button
        type="submit"
        disabled={saving}
        className="self-start px-6 py-2.5 text-white text-xs uppercase tracking-widest"
        style={{ background: "var(--color-ink)", opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}

// ─── Addresses tab ────────────────────────────────────────────────────────────
function AddressesTab({
  addresses,
  onUpdate,
}: {
  addresses: CustomerAddress[];
  onUpdate: (a: CustomerAddress[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    address1: "",
    city: "",
    countryCode: "",
    postalCode: "",
    firstName: "",
    lastName: "",
  });
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newAddr = await commerce.customers.addAddress(form);
      onUpdate([...addresses, newAddr]);
      setShowForm(false);
      setForm({
        address1: "",
        city: "",
        countryCode: "",
        postalCode: "",
        firstName: "",
        lastName: "",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await commerce.customers.deleteAddress(id);
    onUpdate(addresses.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-4 flex flex-col gap-2"
            style={{ border: "1px solid var(--color-border)", borderRadius: 4 }}
          >
            {addr.isDefault && (
              <span
                className="self-start text-xs px-2 py-0.5 uppercase tracking-wider"
                style={{
                  background: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                  borderRadius: 2,
                }}
              >
                Default
              </span>
            )}
            <address
              style={{
                fontStyle: "normal",
                fontSize: "0.88rem",
                lineHeight: 1.7,
              }}
            >
              {addr.firstName} {addr.lastName}
              <br />
              {addr.address1}
              <br />
              {addr.city}
              {addr.postalCode ? `, ${addr.postalCode}` : ""}
              <br />
              {addr.countryCode}
            </address>
            <button
              onClick={() => handleDelete(addr.id)}
              style={{
                alignSelf: "flex-start",
                fontSize: "0.75rem",
                color: "var(--color-ink-faint)",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="max-w-md flex flex-col gap-4 pt-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="First name"
              value={form.firstName}
              onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
            />
            <Field
              label="Last name"
              value={form.lastName}
              onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
            />
          </div>
          <Field
            label="Address"
            value={form.address1}
            onChange={(v) => setForm((f) => ({ ...f, address1: v }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="City"
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            />
            <Field
              label="Postal code"
              value={form.postalCode}
              onChange={(v) => setForm((f) => ({ ...f, postalCode: v }))}
            />
          </div>
          <Field
            label="Country code (ISO2)"
            value={form.countryCode}
            onChange={(v) =>
              setForm((f) => ({ ...f, countryCode: v.toUpperCase() }))
            }
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-white text-xs uppercase tracking-widest"
              style={{
                background: "var(--color-ink)",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="self-start flex items-center gap-2 py-2.5 px-5 text-xs uppercase tracking-widest"
          style={{
            border: "1.5px solid var(--color-border)",
            color: "var(--color-ink)",
          }}
        >
          + Add address
        </button>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
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
