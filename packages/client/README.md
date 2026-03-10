# @supacommerce/client

The typed ecommerce query client for supacommerce. A thin, complete wrapper around your Supabase client that gives you an ecommerce-oriented API.

## Installation

```bash
pnpm add @supacommerce/client @supabase/supabase-js
```

## Usage

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supacommerce/client";

const supabase = createSupabaseClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export const commerce = createClient(supabase);
```

The client respects your Supabase auth session and RLS policies automatically. Customers can only see their own carts and orders. Products are publicly readable. No configuration required.

For admin operations that need to bypass RLS:

```typescript
const supabaseAdmin = createSupabaseClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const adminCommerce = createClient(supabaseAdmin);
```

---

## API Reference

### `commerce.cart`

```typescript
// Get or create the current customer's active cart
const cart = await commerce.cart.getOrCreate(regionId?, currencyCode?)

// Get a cart by ID
const cart = await commerce.cart.get(cartId)

// Add an item (increments quantity if variant already in cart)
const cart = await commerce.cart.addItem(cartId, {
  variantId: "...",
  quantity: 1,
  unitPrice: 2999,  // optional — fetched from variant if omitted
})

// Update a line item quantity (set to 0 to remove)
const cart = await commerce.cart.updateItem(cartId, lineItemId, { quantity: 2 })

// Remove a line item
const cart = await commerce.cart.removeItem(cartId, lineItemId)

// Set shipping / billing address
const cart = await commerce.cart.setShippingAddress(cartId, address)
const cart = await commerce.cart.setBillingAddress(cartId, address)

// Set email (required for checkout)
const cart = await commerce.cart.setEmail(cartId, "user@example.com")

// Select a shipping method
const cart = await commerce.cart.setShippingMethod(cartId, shippingOptionId)

// Apply / remove a promotion code
const cart = await commerce.cart.applyPromotion(cartId, "SAVE10")
const cart = await commerce.cart.removePromotion(cartId, "SAVE10")

// Initiate checkout — calls the cart-checkout edge function
const result = await commerce.cart.checkout(cartId, {
  paymentProvider: "stripe",
  billingAddress: address,  // optional
})
// result.orderId — use to poll order status
// result.paymentSession.data — pass to your provider's client SDK
```

### `commerce.catalog`

```typescript
// List published products (paginated)
const { data, count, hasMore } = await commerce.catalog.listProducts({
  limit: 20,
  offset: 0,
  categoryId: "...",      // filter by category
  collectionId: "...",    // filter by collection
  salesChannelId: "...",  // filter by sales channel
  search: "shirt",        // title search
})

// Get a product by ID
const product = await commerce.catalog.getProduct(productId)

// Get a product by URL handle
const product = await commerce.catalog.getProductByHandle("blue-t-shirt")

// Get a variant by ID
const variant = await commerce.catalog.getVariant(variantId)

// List categories (pass parentId to get children; null for root)
const categories = await commerce.catalog.listCategories(parentId?)

// List collections
const { data } = await commerce.catalog.listCollections({ limit: 10 })
```

### `commerce.orders`

```typescript
// List the current customer's orders
const { data, count } = await commerce.orders.list({
  limit: 10,
  status: "completed",
});

// Get a single order
const order = await commerce.orders.get(orderId);

// Get by human-readable display ID (order number)
const order = await commerce.orders.getByDisplayId(1042);
```

### `commerce.customers`

```typescript
// Get the current customer's profile
const customer = await commerce.customers.me();

// Update profile
const customer = await commerce.customers.updateProfile({
  firstName: "Jane",
  lastName: "Doe",
  phone: "+1234567890",
});

// Address management
const addresses = await commerce.customers.listAddresses();
const address = await commerce.customers.addAddress({
  address1: "...",
  city: "...",
  countryCode: "US",
});
const address = await commerce.customers.updateAddress(addressId, {
  isDefault: true,
});
await commerce.customers.deleteAddress(addressId);
```

### `commerce.inventory`

```typescript
// Get total available stock across all locations
const available = await commerce.inventory.getTotalAvailable(variantId);

// Get full availability breakdown by location
const availability = await commerce.inventory.getAvailability(variantId);
// availability.totalAvailable
// availability.isAvailable
// availability.levels[].locationName, .quantityAvailable

// Check multiple variants efficiently
const map = await commerce.inventory.getBulkAvailability([
  variantId1,
  variantId2,
]);
const qty = map.get(variantId1); // number
```

### `commerce.pricing`

```typescript
// Get the best price for a variant (respects price lists, regions, volume)
const price = await commerce.pricing.getVariantPrice({
  variantId: "...",
  regionId: "...",
  currencyCode: "USD",
  quantity: 2, // for tiered pricing
});
// price.amount (integer, smallest currency unit)
// price.currencyCode
// price.priceListId (non-null if a sale price was applied)

// Get prices for multiple variants at once
const priceMap = await commerce.pricing.getBulkVariantPrices(
  [variantId1, variantId2],
  { regionId, currencyCode: "USD" },
);
```

### `commerce.promotions`

```typescript
// Validate a code and calculate the discount
const result = await commerce.promotions.validate({
  code: "SAVE10",
  cartSubtotal: 5000, // integer, smallest currency unit
  customerId: "...", // optional — checks per-customer usage limit
});
// result.valid — boolean
// result.discountAmount — integer
// result.reason — string explaining why invalid (if !valid)

// List automatic promotions (applied without a code)
const promos = await commerce.promotions.listAutomatic();
```

### `commerce.regions`

```typescript
// List all active regions
const regions = await commerce.regions.list();

// Get a region by ID
const region = await commerce.regions.get(regionId);

// Find the region for a country code
const region = await commerce.regions.getByCountry("US");
```

### `commerce.fulfillment`

```typescript
// List shipping options for a region
const options = await commerce.fulfillment.listShippingOptions({
  regionId: "...",
  cartSubtotal: 5000, // filters out options with unmet min_subtotal requirements
});

// Get a single shipping option
const option = await commerce.fulfillment.getShippingOption(optionId);
```

### `commerce.tax`

```typescript
// Calculate tax for a subtotal and location
const tax = await commerce.tax.calculate({
  subtotal: 5000,
  countryCode: "US",
  provinceCode: "CA", // optional — matches province-specific rates
});
// tax.taxTotal — integer
// tax.rate — decimal (0.0875 = 8.75%)

// List all tax regions
const taxRegions = await commerce.tax.listTaxRegions("US");
```

### `commerce.salesChannels`

```typescript
const channels = await commerce.salesChannels.list();
const defaultChannel = await commerce.salesChannels.getDefault();
const channel = await commerce.salesChannels.get(channelId);
```

### `commerce.admin`

```typescript
// Get current admin's record (throws ForbiddenError if not admin)
const me = await adminCommerce.admin.me();

// List all admins
const { data } = await adminCommerce.admin.list();

// Create, update, deactivate
const admin = await adminCommerce.admin.create({
  userId,
  email,
  role: "manager",
});
const admin = await adminCommerce.admin.update(adminId, { role: "admin" });
await adminCommerce.admin.deactivate(adminId);
```

---

## Error handling

All methods throw typed errors from `@supacommerce/utils`:

```typescript
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@supacommerce/utils";

try {
  const product = await commerce.catalog.getProduct(id);
} catch (err) {
  if (err instanceof NotFoundError) {
    // 404 — product doesn't exist or isn't published
  }
}
```

---

## Currency

All monetary amounts are integers in the smallest currency unit (cents for USD, pence for GBP). Use `@supacommerce/utils` to format them:

```typescript
import { formatCurrency } from "@supacommerce/utils";

formatCurrency(2999, "USD"); // "$29.99"
formatCurrency(2999, "GBP"); // "£29.99"
formatCurrency(300, "JPY"); // "¥300"
```

---

## License

MIT
