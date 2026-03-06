import { useState, useCallback } from "react";
import {
  useRecordContext,
  useInput,
  DateTimeInput as RaDateTimeInput,
} from "react-admin";
import {
  Chip,
  Box,
  Button,
  CircularProgress,
  Typography,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// ─── Re-export DateTimeInput for convenience ──────────────────────────────────
export { RaDateTimeInput as DateTimeInput };

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

export const PROMOTION_RULE_TYPE = [
  { id: "cart_total", name: "Cart Total Minimum" },
  { id: "product", name: "Product" },
  { id: "product_category", name: "Product Category" },
  { id: "customer_group", name: "Customer Group" },
  { id: "usage_limit", name: "Usage Limit" },
];

// ─── StatusChipField ──────────────────────────────────────────────────────────

type ChipColor =
  | "default"
  | "warning"
  | "success"
  | "error"
  | "info"
  | "primary"
  | "secondary";

const STATUS_COLORS: Record<string, ChipColor> = {
  active: "success",
  draft: "default",
  archived: "default",
  cancelled: "error",
  requires_action: "error",
  pending: "warning",
  processing: "info",
  completed: "success",
  fulfilled: "success",
  shipped: "success",
  returned: "default",
  not_fulfilled: "warning",
  captured: "success",
  refunded: "default",
  awaiting: "warning",
  authorized: "info",
  expired: "error",
  requested: "warning",
  received: "info",
  confirmed: "success",
  released: "default",
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

// ─── CentsField ───────────────────────────────────────────────────────────────

/** Renders an integer cents value as formatted currency, e.g. 1099 → R 10.99 */
export function CentsField({
  source,
  currencySource,
  currency = "ZAR",
}: {
  source: string;
  currencySource?: string;
  currency?: string;
}) {
  const record = useRecordContext();
  if (!record) return null;
  const val = record[source];
  if (val == null) return <>—</>;
  const cur =
    currencySource && record[currencySource]
      ? record[currencySource]
      : currency;
  return (
    <>
      {new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: cur.toUpperCase(),
      }).format(val / 100)}
    </>
  );
}

// ─── ImageUploadInput ─────────────────────────────────────────────────────────

/**
 * A file upload input that uploads to Supabase Storage via the storage-upload
 * edge function and stores the resulting public URL in the form field.
 *
 * Usage:
 *   <ImageUploadInput source="thumbnail" bucket="products" path="thumbnails" />
 *   <ImageUploadInput source="avatar_url" bucket="avatars" />
 */
export function ImageUploadInput({
  source,
  bucket,
  path,
  label,
}: {
  source: string;
  bucket: string;
  path?: string;
  label?: string;
}) {
  const { field } = useInput({ source });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setError(null);
      setUploaded(false);

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);
        if (path) formData.append("path", path);

        const res = await fetch(`${supabaseUrl}/functions/v1/storage-upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: formData,
        });

        const json = await res.json();

        if (!res.ok || !json.url) {
          throw new Error(json.error ?? "Upload failed");
        }

        field.onChange(json.url);
        setUploaded(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [bucket, path, field],
  );

  const currentUrl = field.value as string | undefined;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 0.5, display: "block" }}
      >
        {label ?? source.replace(/_/g, " ")}
      </Typography>

      {/* Preview current image if URL exists */}
      {currentUrl && (
        <Box sx={{ mb: 1 }}>
          <img
            src={currentUrl}
            alt="preview"
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 6,
              display: "block",
            }}
          />
        </Box>
      )}

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={
            uploading ? <CircularProgress size={14} /> : <CloudUploadIcon />
          }
          disabled={uploading}
        >
          {uploading ? "Uploading…" : currentUrl ? "Replace" : "Upload image"}
          <input type="file" accept="image/*" hidden onChange={handleFile} />
        </Button>

        {uploaded && !uploading && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
            <Typography variant="caption" color="success.main">
              Uploaded
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* URL text field — allows manual paste too */}
      <input
        type="text"
        placeholder="or paste a URL"
        value={currentUrl ?? ""}
        onChange={(e) => field.onChange(e.target.value)}
        style={{
          marginTop: 6,
          width: "100%",
          maxWidth: 400,
          padding: "6px 10px",
          fontSize: 13,
          border: "1px solid #ccc",
          borderRadius: 4,
          boxSizing: "border-box",
        }}
      />

      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, display: "block" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
