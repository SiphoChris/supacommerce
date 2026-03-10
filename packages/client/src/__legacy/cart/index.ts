import type { AnySupabaseClient, Address } from "../types.js";
import { NotFoundError, ValidationError } from "@supacommerce/utils";

export interface CartLineItem {
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

export interface CartShippingMethod {
  id: string;
  cartId: string;
  shippingOptionId: string | null;
  name: string;
  price: number;
  data: Record<string, unknown> | null;
}

export interface Cart {
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

export interface AddItemInput {
  variantId: string;
  quantity: number;
  title?: string;
  subtitle?: string;
  thumbnail?: string;
  productId?: string;
  unitPrice?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateItemInput {
  quantity: number;
}

export interface CheckoutOptions {
  paymentProvider: string;
  billingAddress?: Address;
}

export interface CheckoutResult {
  orderId: string;
  paymentSession: {
    id: string;
    provider: string;
    data: Record<string, unknown>;
  };
}

export class CartClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Get the current customer's active cart, or create one if none exists.
   * The customer must be authenticated (including anonymous auth).
   */
  async getOrCreate(regionId?: string, currencyCode?: string): Promise<Cart> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user)
      throw new ValidationError("User must be authenticated to access a cart");

    const { data: customer } = await this.supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!customer) throw new NotFoundError("Customer profile");

    const customerId = (customer as { id: string }).id;

    const { data: existing } = await this.supabase
      .from("carts")
      .select(`*, cart_line_items(*), cart_shipping_methods(*)`)
      .eq("customer_id", customerId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existing) return this.mapCart(existing);

    const { data: created, error } = await this.supabase
      .from("carts")
      .insert({
        customer_id: customerId,
        region_id: regionId ?? null,
        currency_code: currencyCode ?? null,
        status: "active",
      })
      .select(`*, cart_line_items(*), cart_shipping_methods(*)`)
      .single();

    if (error || !created)
      throw new Error(`Failed to create cart: ${error?.message ?? "unknown"}`);

    return this.mapCart(created);
  }

  /**
   * Get a cart by ID.
   */
  async get(cartId: string): Promise<Cart> {
    const { data, error } = await this.supabase
      .from("carts")
      .select(`*, cart_line_items(*), cart_shipping_methods(*)`)
      .eq("id", cartId)
      .single();

    if (error || !data) throw new NotFoundError("Cart", cartId);

    return this.mapCart(data);
  }

  /**
   * Add an item to the cart.
   * If the variant is already in the cart, increments the quantity.
   */
  async addItem(cartId: string, input: AddItemInput): Promise<Cart> {
    if (input.quantity < 1)
      throw new ValidationError("Quantity must be at least 1");

    const { data: existing } = await this.supabase
      .from("cart_line_items")
      .select("id, quantity, unit_price")
      .eq("cart_id", cartId)
      .eq("variant_id", input.variantId)
      .single();

    if (existing) {
      const e = existing as {
        id: string;
        quantity: number;
        unit_price: number;
      };
      const newQty = e.quantity + input.quantity;
      await this.supabase
        .from("cart_line_items")
        .update({
          quantity: newQty,
          subtotal: newQty * e.unit_price,
          updated_at: new Date().toISOString(),
        })
        .eq("id", e.id);
      return this.get(cartId);
    }

    // Resolve product info if not provided
    let title = input.title;
    let thumbnail: string | null = input.thumbnail ?? null;
    let productId = input.productId;
    let unitPrice = input.unitPrice;

    if (!title || unitPrice === undefined) {
      const { data: variant } = await this.supabase
        .from("product_variants")
        .select("title, thumbnail, product_id, products(title, thumbnail)")
        .eq("id", input.variantId)
        .single();

      if (variant) {
        const v = variant as {
          title: string;
          thumbnail: string | null;
          product_id: string;
          // Supabase may return a joined row as array or object depending on
          // client version — normalise with Array.isArray below.
          products:
            | Array<{ title: string; thumbnail: string | null }>
            | { title: string; thumbnail: string | null }
            | null;
        };
        const product = Array.isArray(v.products)
          ? (v.products[0] ?? null)
          : v.products;
        title = title ?? `${product?.title ?? ""} — ${v.title}`.trim();
        thumbnail = thumbnail ?? product?.thumbnail ?? null;
        productId = productId ?? v.product_id;
      }
    }

    const resolvedUnitPrice = unitPrice ?? 0;

    const { error } = await this.supabase.from("cart_line_items").insert({
      cart_id: cartId,
      variant_id: input.variantId,
      product_id: productId ?? null,
      title: title ?? "Product",
      subtitle: input.subtitle ?? null,
      thumbnail,
      quantity: input.quantity,
      unit_price: resolvedUnitPrice,
      subtotal: resolvedUnitPrice * input.quantity,
      metadata: input.metadata ?? null,
    });

    if (error) throw new Error(`Failed to add item: ${error.message}`);

    return this.get(cartId);
  }

  /**
   * Update a line item's quantity. Set to 0 to remove the item.
   */
  async updateItem(
    cartId: string,
    lineItemId: string,
    input: UpdateItemInput,
  ): Promise<Cart> {
    if (input.quantity < 0)
      throw new ValidationError("Quantity cannot be negative");
    if (input.quantity === 0) return this.removeItem(cartId, lineItemId);

    const { data: item } = await this.supabase
      .from("cart_line_items")
      .select("unit_price")
      .eq("id", lineItemId)
      .eq("cart_id", cartId)
      .single();

    if (!item) throw new NotFoundError("Cart line item", lineItemId);

    const unitPrice = (item as { unit_price: number }).unit_price;

    const { error } = await this.supabase
      .from("cart_line_items")
      .update({
        quantity: input.quantity,
        subtotal: unitPrice * input.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lineItemId)
      .eq("cart_id", cartId);

    if (error) throw new Error(`Failed to update item: ${error.message}`);

    return this.get(cartId);
  }

  /**
   * Remove a line item from the cart.
   */
  async removeItem(cartId: string, lineItemId: string): Promise<Cart> {
    const { error } = await this.supabase
      .from("cart_line_items")
      .delete()
      .eq("id", lineItemId)
      .eq("cart_id", cartId);

    if (error) throw new Error(`Failed to remove item: ${error.message}`);

    return this.get(cartId);
  }

  /**
   * Set the shipping address on the cart.
   */
  async setShippingAddress(cartId: string, address: Address): Promise<Cart> {
    const { error } = await this.supabase
      .from("carts")
      .update({
        shipping_address: address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartId);

    if (error)
      throw new Error(`Failed to set shipping address: ${error.message}`);
    return this.get(cartId);
  }

  /**
   * Set the billing address on the cart.
   */
  async setBillingAddress(cartId: string, address: Address): Promise<Cart> {
    const { error } = await this.supabase
      .from("carts")
      .update({
        billing_address: address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartId);

    if (error)
      throw new Error(`Failed to set billing address: ${error.message}`);
    return this.get(cartId);
  }

  /**
   * Set the customer's email on the cart (required for checkout).
   */
  async setEmail(cartId: string, email: string): Promise<Cart> {
    const { error } = await this.supabase
      .from("carts")
      .update({ email, updated_at: new Date().toISOString() })
      .eq("id", cartId);

    if (error) throw new Error(`Failed to set email: ${error.message}`);
    return this.get(cartId);
  }

  /**
   * Set or replace the shipping method on the cart.
   */
  async setShippingMethod(
    cartId: string,
    shippingOptionId: string,
  ): Promise<Cart> {
    const { data: option } = await this.supabase
      .from("shipping_options")
      .select("id, name, amount")
      .eq("id", shippingOptionId)
      .single();

    if (!option) throw new NotFoundError("Shipping option", shippingOptionId);

    const opt = option as { id: string; name: string; amount: number };

    await this.supabase
      .from("cart_shipping_methods")
      .delete()
      .eq("cart_id", cartId);

    const { error } = await this.supabase.from("cart_shipping_methods").insert({
      cart_id: cartId,
      shipping_option_id: opt.id,
      name: opt.name,
      price: opt.amount,
    });

    if (error)
      throw new Error(`Failed to set shipping method: ${error.message}`);
    return this.get(cartId);
  }

  /**
   * Apply a promotion code to the cart.
   */
  async applyPromotion(cartId: string, code: string): Promise<Cart> {
    const { data: cart } = await this.supabase
      .from("carts")
      .select("promotion_codes")
      .eq("id", cartId)
      .single();

    if (!cart) throw new NotFoundError("Cart", cartId);

    const existing =
      (cart as { promotion_codes: string[] | null }).promotion_codes ?? [];
    const normalised = code.toUpperCase();

    if (existing.includes(normalised)) return this.get(cartId);

    const { error } = await this.supabase
      .from("carts")
      .update({
        promotion_codes: [...existing, normalised],
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartId);

    if (error) throw new Error(`Failed to apply promotion: ${error.message}`);
    return this.get(cartId);
  }

  /**
   * Remove a promotion code from the cart.
   */
  async removePromotion(cartId: string, code: string): Promise<Cart> {
    const { data: cart } = await this.supabase
      .from("carts")
      .select("promotion_codes")
      .eq("id", cartId)
      .single();

    if (!cart) throw new NotFoundError("Cart", cartId);

    const existing =
      (cart as { promotion_codes: string[] | null }).promotion_codes ?? [];
    const normalised = code.toUpperCase();

    const { error } = await this.supabase
      .from("carts")
      .update({
        promotion_codes: existing.filter((c) => c !== normalised),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartId);

    if (error) throw new Error(`Failed to remove promotion: ${error.message}`);
    return this.get(cartId);
  }

  /**
   * Initiate checkout. Calls the cart-checkout edge function.
   */
  async checkout(
    cartId: string,
    options: CheckoutOptions,
  ): Promise<CheckoutResult> {
    const { data, error } = await this.supabase.functions.invoke(
      "cart-checkout",
      {
        body: {
          cartId,
          paymentProvider: options.paymentProvider,
          billingAddress: options.billingAddress,
        },
      },
    );

    if (error) throw new Error(`Checkout failed: ${error.message}`);

    return data as CheckoutResult;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private mapCart(raw: Record<string, unknown>): Cart {
    const lineItems = ((raw["cart_line_items"] as unknown[]) ?? []).map(
      this.mapLineItem,
    );
    const shippingMethods = (
      (raw["cart_shipping_methods"] as unknown[]) ?? []
    ).map(this.mapShippingMethod);

    // Compute totals live from line items and shipping methods.
    // The DB columns are only written at checkout time — reading them
    // pre-checkout would return stale zeros.
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingTotal = shippingMethods.reduce((sum, m) => sum + m.price, 0);

    // discountTotal and taxTotal are only known after the checkout edge
    // function runs — read from DB so they're accurate post-checkout.
    const discountTotal = (raw["discount_total"] as number) ?? 0;
    const taxTotal = (raw["tax_total"] as number) ?? 0;

    const total = subtotal + shippingTotal + taxTotal - discountTotal;

    return {
      id: raw["id"] as string,
      customerId: raw["customer_id"] as string,
      regionId: raw["region_id"] as string | null,
      currencyCode: raw["currency_code"] as string | null,
      email: raw["email"] as string | null,
      status: raw["status"] as string,
      shippingAddress: raw["shipping_address"] as Address | null,
      billingAddress: raw["billing_address"] as Address | null,
      promotionCodes: (raw["promotion_codes"] as string[] | null) ?? [],
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      total,
      completedAt: raw["completed_at"] as string | null,
      metadata: raw["metadata"] as Record<string, unknown> | null,
      createdAt: raw["created_at"] as string,
      updatedAt: raw["updated_at"] as string,
      lineItems,
      shippingMethods,
    };
  }

  private mapLineItem(raw: unknown): CartLineItem {
    const r = raw as Record<string, unknown>;
    return {
      id: r["id"] as string,
      cartId: r["cart_id"] as string,
      variantId: r["variant_id"] as string | null,
      productId: r["product_id"] as string | null,
      title: r["title"] as string,
      subtitle: r["subtitle"] as string | null,
      thumbnail: r["thumbnail"] as string | null,
      quantity: r["quantity"] as number,
      unitPrice: r["unit_price"] as number,
      subtotal: r["subtotal"] as number,
      metadata: r["metadata"] as Record<string, unknown> | null,
      createdAt: r["created_at"] as string,
      updatedAt: r["updated_at"] as string,
    };
  }

  private mapShippingMethod(raw: unknown): CartShippingMethod {
    const r = raw as Record<string, unknown>;
    return {
      id: r["id"] as string,
      cartId: r["cart_id"] as string,
      shippingOptionId: r["shipping_option_id"] as string | null,
      name: r["name"] as string,
      price: r["price"] as number,
      data: r["data"] as Record<string, unknown> | null,
    };
  }
}
