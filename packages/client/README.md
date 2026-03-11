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

The client respects your Supabase auth session and RLS policies automatically. Customers can only see their own carts and orders. Products are publicly readable.

For admin operations that bypass RLS:

```typescript
const supabaseAdmin = createSupabaseClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const adminCommerce = createClient(supabaseAdmin);
```

---

## API Reference

### `commerce.cart`

Carts require a Supabase auth user. For guest customers, use `supabase.auth.signInAnonymously()` — the cart is preserved when the user upgrades to a full account.

```typescript
// Get or create the current customer's active cart
const cart = await commerce.cart.getOrCreate(regionId?, currencyCode?)

// Get a cart by ID
const cart = await commerce.cart.get(cartId)

// Add an item (increments quantity if variant already in cart)
// unitPrice is optional — resolved from the variant's price set if omitted
const cart = await commerce.cart.addItem(cartId, {
  variantId: "...",
  quantity: 1,
  unitPrice: 2999,
})

// Update a line item quantity
const cart = await commerce.cart.updateItem(cartId, lineItemId, { quantity: 2 })

// Remove a line item
const cart = await commerce.cart.removeItem(cartId, lineItemId)

// Set addresses
const cart = await commerce.cart.setShippingAddress(cartId, address)
const cart = await commerce.cart.setBillingAddress(cartId, address)

// Set email (required before checkout)
const cart = await commerce.cart.setEmail(cartId, "user@example.com")

// Select a shipping method
const cart = await commerce.cart.setShippingMethod(cartId, shippingOptionId)

// Apply / remove a promotion code
const cart = await commerce.cart.applyPromotion(cartId, "SAVE10")
const cart = await commerce.cart.removePromotion(cartId, "SAVE10")

// Initiate checkout — calls the cart-checkout edge function
const result = await commerce.cart.checkout(cartId, {
  paymentProvider: "manual",  // wire in your provider in supabase/functions/cart-checkout/index.ts
  billingAddress: address,
})
// result.orderId
// result.paymentSession.data
```

### `commerce.catalog`

```typescript
const { data, count, hasMore } = await commerce.catalog.listProducts({
  limit: 20,
  offset: 0,
  categoryId: "...",
  collectionId: "...",
  salesChannelId: "...",
  search: "shirt",
})

const product = await commerce.catalog.getProduct(productId)
const product = await commerce.catalog.getProductByHandle("blue-t-shirt")
const variant = await commerce.catalog.getVariant(variantId)

const categories = await commerce.catalog.listCategories(parentId?)
const { data } = await commerce.catalog.listCollections({ limit: 10 })
```

### `commerce.orders`

```typescript
const { data, count } = await commerce.orders.list({ limit: 10, status: "completed" })
const order = await commerce.orders.get(orderId)
const order = await commerce.orders.getByDisplayId(1042)
```

### `commerce.customers`

```typescript
const customer = await commerce.customers.me()
const customer = await commerce.customers.updateProfile({ firstName: "Jane", lastName: "Doe", phone: "+1234567890" })

const addresses = await commerce.customers.listAddresses()
const address = await commerce.customers.addAddress({ address1: "...", city: "...", countryCode: "US" })
const address = await commerce.customers.updateAddress(addressId, { isDefault: true })
await commerce.customers.deleteAddress(addressId)
```

### `commerce.inventory`

```typescript
const available = await commerce.inventory.getTotalAvailable(variantId)

const availability = await commerce.inventory.getAvailability(variantId)
// availability.totalAvailable
// availability.isAvailable
// availability.levels[].locationName, .quantityAvailable

const map = await commerce.inventory.getBulkAvailability([variantId1, variantId2])
const qty = map.get(variantId1) // number
```

### `commerce.pricing`

```typescript
const price = await commerce.pricing.getVariantPrice({
  variantId: "...",
  regionId: "...",
  currencyCode: "USD",
  quantity: 2,
})
// price.amount        — integer, smallest currency unit
// price.currencyCode
// price.priceListId   — non-null if a sale price applied

const priceMap = await commerce.pricing.getBulkVariantPrices(
  [variantId1, variantId2],
  { regionId, currencyCode: "USD" },
)
```

### `commerce.promotions`

```typescript
const result = await commerce.promotions.validate({
  code: "SAVE10",
  cartSubtotal: 5000,
  customerId: "...",
})
// result.valid
// result.discountAmount
// result.reason

const promos = await commerce.promotions.listAutomatic()
```

### `commerce.regions`

```typescript
const regions = await commerce.regions.list()
const region = await commerce.regions.get(regionId)
const region = await commerce.regions.getByCountry("US")
```

### `commerce.fulfillment`

```typescript
const options = await commerce.fulfillment.listShippingOptions({
  regionId: "...",
  cartSubtotal: 5000,
})
const option = await commerce.fulfillment.getShippingOption(optionId)
```

### `commerce.tax`

```typescript
const tax = await commerce.tax.calculate({
  subtotal: 5000,
  countryCode: "US",
  provinceCode: "CA",
})
// tax.taxTotal
// tax.rate

const taxRegions = await commerce.tax.listTaxRegions("US")
```

### `commerce.salesChannels`

```typescript
const channels = await commerce.salesChannels.list()
const defaultChannel = await commerce.salesChannels.getDefault()
const channel = await commerce.salesChannels.get(channelId)
```

### `commerce.admin`

```typescript
const me = await adminCommerce.admin.me()
const { data } = await adminCommerce.admin.list()
const admin = await adminCommerce.admin.create({ userId, email, role: "manager" })
const admin = await adminCommerce.admin.update(adminId, { role: "admin" })
await adminCommerce.admin.deactivate(adminId)
```

---

## Error handling

All methods throw typed errors from `@supacommerce/utils`:

```typescript
import { NotFoundError, ValidationError, ForbiddenError } from "@supacommerce/utils";

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
formatCurrency(300, "JPY");  // "¥300"
```

---

## License

MIT