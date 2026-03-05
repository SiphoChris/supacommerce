import { useRecordContext } from "react-admin";
import { Chip } from "@mui/material";

// ─── Enum choices ─────────────────────────────────────────────────────────────

export const ORDER_STATUS = [
  { id: "pending", name: "Pending" },
  { id: "processing", name: "Processing" },
  { id: "completed", name: "Completed" },
  { id: "cancelled", name: "Cancelled" },
  { id: "requires_action", name: "Requires Action" },
];

export const ORDER_PAYMENT_STATUS = [
  { id: "pending", name: "Pending" },
  { id: "awaiting", name: "Awaiting" },
  { id: "captured", name: "Captured" },
  { id: "partially_refunded", name: "Partially Refunded" },
  { id: "refunded", name: "Refunded" },
  { id: "cancelled", name: "Cancelled" },
  { id: "requires_action", name: "Requires Action" },
];

export const ORDER_FULFILLMENT_STATUS = [
  { id: "not_fulfilled", name: "Not Fulfilled" },
  { id: "partially_fulfilled", name: "Partially Fulfilled" },
  { id: "fulfilled", name: "Fulfilled" },
  { id: "partially_shipped", name: "Partially Shipped" },
  { id: "shipped", name: "Shipped" },
  { id: "partially_returned", name: "Partially Returned" },
  { id: "returned", name: "Returned" },
  { id: "cancelled", name: "Cancelled" },
  { id: "requires_action", name: "Requires Action" },
];

export const PRODUCT_STATUS = [
  { id: "draft", name: "Draft" },
  { id: "published", name: "Published" },
  { id: "archived", name: "Archived" },
];

export const CART_STATUS = [
  { id: "active", name: "Active" },
  { id: "completed", name: "Completed" },
  { id: "abandoned", name: "Abandoned" },
];

export const PAYMENT_COLLECTION_STATUS = [
  { id: "not_paid", name: "Not Paid" },
  { id: "awaiting", name: "Awaiting" },
  { id: "authorized", name: "Authorized" },
  { id: "partially_authorized", name: "Partially Authorized" },
  { id: "captured", name: "Captured" },
  { id: "partially_captured", name: "Partially Captured" },
  { id: "partially_refunded", name: "Partially Refunded" },
  { id: "refunded", name: "Refunded" },
  { id: "cancelled", name: "Cancelled" },
  { id: "requires_action", name: "Requires Action" },
];

export const PAYMENT_SESSION_STATUS = [
  { id: "pending", name: "Pending" },
  { id: "authorized", name: "Authorized" },
  { id: "captured", name: "Captured" },
  { id: "requires_more", name: "Requires More" },
  { id: "error", name: "Error" },
  { id: "cancelled", name: "Cancelled" },
];

export const PRICE_LIST_STATUS = [
  { id: "active", name: "Active" },
  { id: "draft", name: "Draft" },
];

export const PRICE_LIST_TYPE = [
  { id: "sale", name: "Sale" },
  { id: "override", name: "Override" },
];

export const PROMOTION_STATUS = [
  { id: "draft", name: "Draft" },
  { id: "active", name: "Active" },
  { id: "expired", name: "Expired" },
  { id: "archived", name: "Archived" },
];

export const PROMOTION_TYPE = [
  { id: "percentage", name: "Percentage" },
  { id: "fixed_amount", name: "Fixed Amount" },
  { id: "free_shipping", name: "Free Shipping" },
  { id: "buy_x_get_y", name: "Buy X Get Y" },
];

export const RETURN_STATUS = [
  { id: "requested", name: "Requested" },
  { id: "received", name: "Received" },
  { id: "requires_action", name: "Requires Action" },
  { id: "cancelled", name: "Cancelled" },
];

export const REFUND_REASON = [
  { id: "discount", name: "Discount" },
  { id: "return", name: "Return" },
  { id: "swap", name: "Swap" },
  { id: "claim", name: "Claim" },
  { id: "other", name: "Other" },
];

export const RESERVATION_STATUS = [
  { id: "pending", name: "Pending" },
  { id: "confirmed", name: "Confirmed" },
  { id: "released", name: "Released" },
];

export const SHIPPING_OPTION_TYPE = [
  { id: "flat_rate", name: "Flat Rate" },
  { id: "calculated", name: "Calculated" },
  { id: "free", name: "Free" },
];

export const SHIPPING_PROFILE_TYPE = [
  { id: "default", name: "Default" },
  { id: "gift_card", name: "Gift Card" },
  { id: "custom", name: "Custom" },
];

export const ADMIN_ROLE = [
  { id: "super_admin", name: "Super Admin" },
  { id: "admin", name: "Admin" },
  { id: "developer", name: "Developer" },
  { id: "manager", name: "Manager" },
  { id: "viewer", name: "Viewer" },
];

// ─── Reusable field components ────────────────────────────────────────────────

type ChipColor =
  | "default"
  | "warning"
  | "success"
  | "error"
  | "info"
  | "primary"
  | "secondary";

const STATUS_COLORS: Record<string, ChipColor> = {
  // generic
  active: "success",
  draft: "default",
  archived: "default",
  cancelled: "error",
  requires_action: "error",
  // orders
  pending: "warning",
  processing: "info",
  completed: "success",
  // fulfillment
  fulfilled: "success",
  shipped: "success",
  returned: "default",
  not_fulfilled: "warning",
  // payment
  captured: "success",
  refunded: "default",
  awaiting: "warning",
  authorized: "info",
  // promotions
  expired: "error",
  // returns
  requested: "warning",
  received: "info",
  // reservations
  confirmed: "success",
  released: "default",
  // price list
  sale: "info",
  override: "secondary",
};

export function StatusChipField({
  source,
  label,
}: {
  source: string;
  label?: string;
}) {
  const record = useRecordContext();
  if (!record) return null;
  const value = record[source];
  if (!value) return <>—</>;
  return (
    <Chip
      label={value}
      size="small"
      color={STATUS_COLORS[value] ?? "default"}
    />
  );
}

/** Render cents as formatted currency, e.g. 1099 → $10.99 */
export function CentsField({
  source,
  currency = "USD",
}: {
  source: string;
  currency?: string;
}) {
  const record = useRecordContext();
  if (!record) return null;
  const val = record[source];
  if (val == null) return <>—</>;
  return (
    <>
      {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
        val / 100,
      )}
    </>
  );
}
