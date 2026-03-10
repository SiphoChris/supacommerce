import { SupabaseClient } from '@supabase/supabase-js';
import { PaginationParams, PaginatedResult } from '@supacommerce/utils';

type AnySupabaseClient = SupabaseClient<any, any, any>;
interface Address {
    firstName?: string;
    lastName?: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    postalCode?: string;
    countryCode: string;
    phone?: string;
}
interface Money {
    amount: number;
    currencyCode: string;
}
type ProductStatus = "draft" | "published" | "archived";
type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "requires_action";
type OrderPaymentStatus = "pending" | "awaiting" | "captured" | "partially_refunded" | "refunded" | "cancelled" | "requires_action";
type OrderFulfillmentStatus = "not_fulfilled" | "partially_fulfilled" | "fulfilled" | "partially_shipped" | "shipped" | "partially_returned" | "returned" | "cancelled" | "requires_action";
type CartStatus = "active" | "completed" | "abandoned";
type PaymentSessionStatus = "pending" | "authorized" | "captured" | "requires_more" | "error" | "cancelled";
type ReturnStatus = "requested" | "received" | "requires_action" | "cancelled";
type AdminRole = "super_admin" | "admin" | "developer" | "manager" | "viewer";
type PromotionType = "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";

interface CartLineItem {
    id: string;
    cartId: string;
    variantId: string | null;
    productId: string | null;
    title: string;
    subtitle: string | null;
    thumbnail: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}
interface CartShippingMethod {
    id: string;
    cartId: string;
    shippingOptionId: string | null;
    name: string;
    price: number;
    data: Record<string, unknown> | null;
}
interface Cart {
    id: string;
    customerId: string;
    regionId: string | null;
    currencyCode: string | null;
    email: string | null;
    status: string;
    shippingAddress: Address | null;
    billingAddress: Address | null;
    promotionCodes: string[];
    /**
     * Computed live from line items by the SDK mapper.
     * Always accurate — does not read the stale DB column.
     */
    subtotal: number;
    /**
     * Written by the checkout edge function at completion.
     * Zero before checkout — apply promotions to get this value.
     */
    discountTotal: number;
    /**
     * Computed live from shipping methods by the SDK mapper.
     * Always accurate — does not read the stale DB column.
     */
    shippingTotal: number;
    /**
     * Written by the checkout edge function at completion.
     * Zero before checkout — use TaxClient.calculate() for pre-checkout display.
     */
    taxTotal: number;
    /**
     * Computed live: subtotal + shippingTotal + taxTotal - discountTotal.
     * Always accurate — does not read the stale DB column.
     */
    total: number;
    completedAt: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    lineItems: CartLineItem[];
    shippingMethods: CartShippingMethod[];
}
interface AddItemInput {
    variantId: string;
    quantity: number;
    title?: string;
    subtitle?: string;
    thumbnail?: string;
    productId?: string;
    unitPrice?: number;
    metadata?: Record<string, unknown>;
}
interface UpdateItemInput {
    quantity: number;
}
interface CheckoutOptions {
    paymentProvider: string;
    billingAddress?: Address;
}
interface CheckoutResult {
    orderId: string;
    paymentSession: {
        id: string;
        provider: string;
        data: Record<string, unknown>;
    };
}
declare class CartClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * Get the current customer's active cart, or create one if none exists.
     * The customer must be authenticated (including anonymous auth).
     */
    getOrCreate(regionId?: string, currencyCode?: string): Promise<Cart>;
    /**
     * Get a cart by ID.
     */
    get(cartId: string): Promise<Cart>;
    /**
     * Add an item to the cart.
     * If the variant is already in the cart, increments the quantity.
     */
    addItem(cartId: string, input: AddItemInput): Promise<Cart>;
    /**
     * Update a line item's quantity. Set to 0 to remove the item.
     */
    updateItem(cartId: string, lineItemId: string, input: UpdateItemInput): Promise<Cart>;
    /**
     * Remove a line item from the cart.
     */
    removeItem(cartId: string, lineItemId: string): Promise<Cart>;
    /**
     * Set the shipping address on the cart.
     */
    setShippingAddress(cartId: string, address: Address): Promise<Cart>;
    /**
     * Set the billing address on the cart.
     */
    setBillingAddress(cartId: string, address: Address): Promise<Cart>;
    /**
     * Set the customer's email on the cart (required for checkout).
     */
    setEmail(cartId: string, email: string): Promise<Cart>;
    /**
     * Set or replace the shipping method on the cart.
     */
    setShippingMethod(cartId: string, shippingOptionId: string): Promise<Cart>;
    /**
     * Apply a promotion code to the cart.
     */
    applyPromotion(cartId: string, code: string): Promise<Cart>;
    /**
     * Remove a promotion code from the cart.
     */
    removePromotion(cartId: string, code: string): Promise<Cart>;
    /**
     * Initiate checkout. Calls the cart-checkout edge function.
     */
    checkout(cartId: string, options: CheckoutOptions): Promise<CheckoutResult>;
    private mapCart;
    private mapLineItem;
    private mapShippingMethod;
}

interface ProductOptionValue {
    id: string;
    optionId: string;
    value: string;
    rank: number;
}
interface ProductOption {
    id: string;
    productId: string;
    title: string;
    rank: number;
    values: ProductOptionValue[];
}
interface ProductVariant {
    id: string;
    productId: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    weight: number | null;
    allowBackorder: boolean;
    manageInventory: boolean;
    rank: number;
    metadata: Record<string, unknown> | null;
    optionValues: ProductOptionValue[];
}
interface ProductImage {
    id: string;
    productId: string;
    url: string;
    alt: string | null;
    rank: number;
}
interface Product {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    handle: string;
    status: ProductStatus;
    thumbnail: string | null;
    isGiftcard: boolean;
    discountable: boolean;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    variants: ProductVariant[];
    options: ProductOption[];
    images: ProductImage[];
}
interface ProductCategory {
    id: string;
    name: string;
    handle: string;
    description: string | null;
    parentId: string | null;
    rank: number;
    isActive: boolean;
}
interface ProductCollection {
    id: string;
    title: string;
    handle: string;
    metadata: Record<string, unknown> | null;
}
interface ListProductsParams extends PaginationParams {
    status?: ProductStatus;
    categoryId?: string;
    collectionId?: string;
    tagIds?: string[];
    salesChannelId?: string;
    search?: string;
}
declare class CatalogClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * List products. Defaults to published only (respects RLS).
     */
    listProducts(params?: ListProductsParams): Promise<PaginatedResult<Product>>;
    /**
     * Get a single product by ID.
     */
    getProduct(productId: string): Promise<Product>;
    /**
     * Get a single product by handle (URL slug).
     */
    getProductByHandle(handle: string): Promise<Product>;
    /**
     * Get a single variant by ID.
     */
    getVariant(variantId: string): Promise<ProductVariant>;
    /**
     * List categories.
     * Pass parentId = null to get top-level categories only.
     * Pass parentId = "<uuid>" to get children of that category.
     * Omit parentId to get all active categories.
     */
    listCategories(parentId?: string | null): Promise<ProductCategory[]>;
    /**
     * List collections.
     */
    listCollections(params?: PaginationParams): Promise<PaginatedResult<ProductCollection>>;
    private mapProduct;
    private mapVariant;
    private mapCategory;
    private mapCollection;
}

interface OrderLineItem {
    id: string;
    orderId: string;
    variantId: string | null;
    title: string;
    subtitle: string | null;
    thumbnail: string | null;
    quantity: number;
    fulfilledQuantity: number;
    returnedQuantity: number;
    unitPrice: number;
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    total: number;
}
interface OrderFulfillment {
    id: string;
    orderId: string;
    providerId: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
    cancelledAt: string | null;
    createdAt: string;
}
interface Order {
    id: string;
    displayId: number;
    customerId: string | null;
    cartId: string | null;
    regionId: string | null;
    currencyCode: string | null;
    email: string;
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
    fulfillmentStatus: OrderFulfillmentStatus;
    shippingAddress: Address | null;
    billingAddress: Address | null;
    subtotal: number;
    discountTotal: number;
    shippingTotal: number;
    taxTotal: number;
    refundedTotal: number;
    total: number;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
    lineItems: OrderLineItem[];
    fulfillments: OrderFulfillment[];
}
interface ListOrdersParams extends PaginationParams {
    status?: OrderStatus;
}
declare class OrdersClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * List the current customer's orders.
     */
    list(params?: ListOrdersParams): Promise<PaginatedResult<Order>>;
    /**
     * Get a single order by ID.
     */
    get(orderId: string): Promise<Order>;
    /**
     * Get a single order by display ID (the human-readable order number).
     */
    getByDisplayId(displayId: number): Promise<Order>;
    private mapOrder;
}

interface CustomerAddress {
    id: string;
    customerId: string;
    firstName: string | null;
    lastName: string | null;
    company: string | null;
    address1: string;
    address2: string | null;
    city: string;
    province: string | null;
    postalCode: string | null;
    countryCode: string;
    phone: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}
interface Customer {
    id: string;
    userId: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    isAnonymous: boolean;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}
interface UpdateProfileInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    metadata?: Record<string, unknown>;
}
interface AddAddressInput {
    firstName?: string;
    lastName?: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    postalCode?: string;
    countryCode: string;
    phone?: string;
    isDefault?: boolean;
}
declare class CustomersClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * Get the current authenticated customer's profile.
     */
    me(): Promise<Customer>;
    /**
     * Update the current customer's profile.
     */
    updateProfile(input: UpdateProfileInput): Promise<Customer>;
    /**
     * List the current customer's saved addresses.
     */
    listAddresses(): Promise<CustomerAddress[]>;
    /**
     * Add a new address to the customer's account.
     */
    addAddress(input: AddAddressInput): Promise<CustomerAddress>;
    /**
     * Update a saved address.
     */
    updateAddress(addressId: string, input: Partial<AddAddressInput>): Promise<CustomerAddress>;
    /**
     * Delete a saved address.
     */
    deleteAddress(addressId: string): Promise<void>;
    private mapCustomer;
    private mapAddress;
}

interface InventoryLevel {
    locationId: string;
    locationName: string;
    stockedQuantity: number;
    reservedQuantity: number;
    quantityAvailable: number;
}
interface InventoryAvailability {
    variantId: string;
    inventoryItemId: string | null;
    totalAvailable: number;
    isAvailable: boolean;
    levels: InventoryLevel[];
}
declare class InventoryClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * Get total available stock for a variant across all locations.
     */
    getTotalAvailable(variantId: string): Promise<number>;
    /**
     * Get full availability details for a variant, including per-location breakdown.
     */
    getAvailability(variantId: string): Promise<InventoryAvailability>;
    /**
     * Check availability for multiple variants at once.
     */
    getBulkAvailability(variantIds: string[]): Promise<Map<string, number>>;
}

interface VariantPrice {
    variantId: string;
    amount: number;
    currencyCode: string;
    regionId: string | null;
    priceListId: string | null;
    minQuantity: number | null;
    maxQuantity: number | null;
}
interface GetVariantPriceParams {
    variantId: string;
    regionId?: string;
    currencyCode?: string;
    quantity?: number;
    customerId?: string;
}
declare class PricingClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * Get the best price for a variant given a region, currency, and quantity.
     *
     * Resolution order:
     *   1. Active price list prices (sale / override) for the customer's group
     *   2. Region-specific price
     *   3. Currency-specific price
     *   4. null if no price found
     *
     * All prices are integers in the smallest currency unit.
     */
    getVariantPrice(params: GetVariantPriceParams): Promise<VariantPrice | null>;
    /**
     * Get prices for multiple variants at once.
     * Returns a map of variantId → VariantPrice | null.
     */
    getBulkVariantPrices(variantIds: string[], params: Omit<GetVariantPriceParams, "variantId">): Promise<Map<string, VariantPrice | null>>;
}

interface PromotionRule {
    id: string;
    type: string;
    value: string;
    description: string | null;
}
interface Promotion {
    id: string;
    code: string | null;
    type: PromotionType;
    status: string;
    value: number;
    usageLimit: number | null;
    usageCount: number;
    usageLimitPerCustomer: number | null;
    startsAt: string | null;
    endsAt: string | null;
    isAutomatic: boolean;
    rules: PromotionRule[];
}
interface ValidatePromotionParams {
    code: string;
    cartSubtotal: number;
    customerId?: string;
    productIds?: string[];
    categoryIds?: string[];
}
interface ValidationResult {
    valid: boolean;
    promotion: Promotion | null;
    /** Calculated discount amount in smallest currency unit */
    discountAmount: number;
    reason?: string;
}
declare class PromotionsClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * Validate a promotion code and calculate the discount amount.
     * Does not apply the promotion — call commerce.cart.applyPromotion() for that.
     */
    validate(params: ValidatePromotionParams): Promise<ValidationResult>;
    /**
     * List all currently active automatic promotions.
     */
    listAutomatic(): Promise<Promotion[]>;
    private mapPromotion;
}

interface Country {
    id: string;
    iso2: string;
    iso3: string | null;
    name: string;
    displayName: string | null;
}
interface Region {
    id: string;
    name: string;
    currencyCode: string;
    /**
     * Legacy display-only string — e.g. "0.20" or "20".
     * NOT used for tax calculation. Use TaxClient.calculate() instead,
     * which reads from tax_regions / tax_rates and returns a numeric rate.
     */
    taxRate: string;
    taxIncluded: boolean;
    isActive: boolean;
    countries: Country[];
}
declare class RegionsClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    list(): Promise<Region[]>;
    get(regionId: string): Promise<Region>;
    /** Find the region that includes a given ISO 2 country code. */
    getByCountry(countryCode: string): Promise<Region | null>;
    private mapRegion;
}

interface ShippingOptionRequirement {
    id: string;
    type: string;
    amount: number;
}
interface ShippingOption {
    id: string;
    name: string;
    regionId: string;
    providerId: string | null;
    type: string;
    amount: number;
    isActive: boolean;
    data: Record<string, unknown> | null;
    /** Requirements for this option to be available at checkout. */
    requirements: ShippingOptionRequirement[];
}
interface ListShippingOptionsParams {
    regionId?: string;
    cartSubtotal?: number;
}
declare class FulfillmentClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * List available shipping options for a region.
     * Optionally filters by cart subtotal to exclude options with unmet requirements.
     * Requirements are always included in the returned objects.
     */
    listShippingOptions(params?: ListShippingOptionsParams): Promise<ShippingOption[]>;
    /**
     * Get a single shipping option by ID including its requirements.
     */
    getShippingOption(optionId: string): Promise<ShippingOption>;
    private mapOption;
}

interface TaxRate {
    id: string;
    name: string;
    code: string | null;
    rate: number;
    isDefault: boolean;
}
interface TaxRegion {
    id: string;
    countryCode: string;
    provinceCode: string | null;
    name: string;
    rates: TaxRate[];
}
interface CalculateTaxParams {
    subtotal: number;
    countryCode: string;
    provinceCode?: string;
    regionId?: string;
}
interface TaxCalculation {
    taxable: number;
    rate: number;
    taxTotal: number;
    taxRegion: TaxRegion | null;
}
declare class TaxClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * Calculate tax for a given subtotal and location.
     * Uses the tax_regions / tax_rates tables.
     *
     * For production, consider using a dedicated tax provider
     * (TaxJar, Avalara, Stripe Tax) via the cart-checkout edge function.
     */
    calculate(params: CalculateTaxParams): Promise<TaxCalculation>;
    /** Get all tax regions with their rates. */
    listTaxRegions(countryCode?: string): Promise<TaxRegion[]>;
}

interface SalesChannel {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean;
    isDisabled: boolean;
    createdAt: string;
    updatedAt: string;
}
declare class SalesChannelsClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /** List all active sales channels. */
    list(): Promise<SalesChannel[]>;
    /** Get the default sales channel. */
    getDefault(): Promise<SalesChannel | null>;
    get(channelId: string): Promise<SalesChannel>;
    private mapChannel;
}

interface AdminUser {
    id: string;
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    role: AdminRole;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
}
interface CreateAdminInput {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: AdminRole;
}
interface UpdateAdminInput {
    firstName?: string;
    lastName?: string;
    role?: AdminRole;
    isActive?: boolean;
}
declare class AdminClient {
    private readonly supabase;
    constructor(supabase: AnySupabaseClient);
    /**
     * Get the current admin user's record.
     * Throws ForbiddenError if the authenticated user is not an admin.
     */
    me(): Promise<AdminUser>;
    /** List all admin users. Requires admin access (enforced by RLS). */
    list(params?: PaginationParams): Promise<PaginatedResult<AdminUser>>;
    /** Get a single admin user by ID. */
    get(adminId: string): Promise<AdminUser>;
    /** Create a new admin user. Requires super_admin or admin role. */
    create(input: CreateAdminInput): Promise<AdminUser>;
    /** Update an admin user's role or status. */
    update(adminId: string, input: UpdateAdminInput): Promise<AdminUser>;
    /** Soft-delete an admin user. */
    deactivate(adminId: string): Promise<void>;
    /** Record last login timestamp for the current admin. */
    recordLogin(): Promise<void>;
    private mapAdmin;
}

interface CommerceClient {
    cart: CartClient;
    catalog: CatalogClient;
    orders: OrdersClient;
    customers: CustomersClient;
    inventory: InventoryClient;
    pricing: PricingClient;
    promotions: PromotionsClient;
    regions: RegionsClient;
    fulfillment: FulfillmentClient;
    tax: TaxClient;
    salesChannels: SalesChannelsClient;
    admin: AdminClient;
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
declare function createClient(supabase: AnySupabaseClient): CommerceClient;

export { type AddAddressInput, type AddItemInput, type Address, type AdminRole, type AdminUser, type AnySupabaseClient, type CalculateTaxParams, type Cart, type CartLineItem, type CartShippingMethod, type CartStatus, type CheckoutOptions, type CheckoutResult, type CommerceClient, type Country, type CreateAdminInput, type Customer, type CustomerAddress, type GetVariantPriceParams, type InventoryAvailability, type InventoryLevel, type ListOrdersParams, type ListProductsParams, type ListShippingOptionsParams, type Money, type Order, type OrderFulfillment, type OrderFulfillmentStatus, type OrderLineItem, type OrderPaymentStatus, type OrderStatus, type PaymentSessionStatus, type Product, type ProductCategory, type ProductCollection, type ProductImage, type ProductOption, type ProductOptionValue, type ProductStatus, type ProductVariant, type Promotion, type PromotionRule, type PromotionType, type Region, type ReturnStatus, type SalesChannel, type ShippingOption, type TaxCalculation, type TaxRate, type TaxRegion, type UpdateAdminInput, type UpdateItemInput, type UpdateProfileInput, type ValidatePromotionParams, type ValidationResult, type VariantPrice, createClient };
