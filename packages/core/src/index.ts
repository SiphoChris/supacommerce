import { CartClient } from "./cart/index.js"
import { CatalogClient } from "./catalog/index.js"
import { OrdersClient } from "./orders/index.js"
import { CustomersClient } from "./customers/index.js"
import { InventoryClient } from "./inventory/index.js"
import { PricingClient } from "./pricing/index.js"
import { PromotionsClient } from "./promotions/index.js"
import { RegionsClient } from "./regions/index.js"
import { FulfillmentClient } from "./fulfillment/index.js"
import { TaxClient } from "./tax/index.js"
import { SalesChannelsClient } from "./sales-channels/index.js"
import { AdminClient } from "./admin/index.js"
import type { AnySupabaseClient } from "./types.js"

export type {
  AnySupabaseClient,
  Address,
  Money,
  ProductStatus,
  OrderStatus,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
  CartStatus,
  PaymentSessionStatus,
  ReturnStatus,
  AdminRole,
  PromotionType,
} from "./types.js"

export type {
  Cart,
  CartLineItem,
  CartShippingMethod,
  AddItemInput,
  UpdateItemInput,
  CheckoutOptions,
  CheckoutResult,
} from "./cart/index.js"

export type {
  Product,
  ProductVariant,
  ProductOption,
  ProductOptionValue,
  ProductImage,
  ProductCategory,
  ProductCollection,
  ListProductsParams,
} from "./catalog/index.js"

export type {
  Order,
  OrderLineItem,
  OrderFulfillment,
  ListOrdersParams,
} from "./orders/index.js"

export type {
  Customer,
  CustomerAddress,
  UpdateProfileInput,
  AddAddressInput,
} from "./customers/index.js"

export type { InventoryLevel, InventoryAvailability } from "./inventory/index.js"
export type { VariantPrice, GetVariantPriceParams } from "./pricing/index.js"
export type {
  Promotion,
  PromotionRule,
  ValidatePromotionParams,
  ValidationResult,
} from "./promotions/index.js"
export type { Region, Country } from "./regions/index.js"
export type { ShippingOption, ListShippingOptionsParams } from "./fulfillment/index.js"
export type { TaxRate, TaxRegion, CalculateTaxParams, TaxCalculation } from "./tax/index.js"
export type { SalesChannel } from "./sales-channels/index.js"
export type { AdminUser, CreateAdminInput, UpdateAdminInput } from "./admin/index.js"

export interface CommerceClient {
  cart: CartClient
  catalog: CatalogClient
  orders: OrdersClient
  customers: CustomersClient
  inventory: InventoryClient
  pricing: PricingClient
  promotions: PromotionsClient
  regions: RegionsClient
  fulfillment: FulfillmentClient
  tax: TaxClient
  salesChannels: SalesChannelsClient
  admin: AdminClient
}

/**
 * Create a supacommerce client from your Supabase client.
 *
 * @example
 * import { createClient as createSupabaseClient } from "@supabase/supabase-js"
 * import { createClient } from "@supacommerce/core"
 *
 * const supabase = createSupabaseClient(url, anonKey)
 * const commerce = createClient(supabase)
 *
 * const products = await commerce.catalog.listProducts()
 * const cart = await commerce.cart.getOrCreate()
 *
 * // Admin operations — pass service role client
 * const supabaseAdmin = createSupabaseClient(url, serviceRoleKey)
 * const adminCommerce = createClient(supabaseAdmin)
 */
export function createClient(supabase: AnySupabaseClient): CommerceClient {
  return {
    cart: new CartClient(supabase),
    catalog: new CatalogClient(supabase),
    orders: new OrdersClient(supabase),
    customers: new CustomersClient(supabase),
    inventory: new InventoryClient(supabase),
    pricing: new PricingClient(supabase),
    promotions: new PromotionsClient(supabase),
    regions: new RegionsClient(supabase),
    fulfillment: new FulfillmentClient(supabase),
    tax: new TaxClient(supabase),
    salesChannels: new SalesChannelsClient(supabase),
    admin: new AdminClient(supabase),
  }
}
