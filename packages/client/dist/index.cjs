"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createClient: () => createClient
});
module.exports = __toCommonJS(index_exports);

// src/cart/index.ts
var import_utils = require("@supacommerce/utils");
var CartClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * Get the current customer's active cart, or create one if none exists.
   * The customer must be authenticated (including anonymous auth).
   */
  async getOrCreate(regionId, currencyCode) {
    const {
      data: { user }
    } = await this.supabase.auth.getUser();
    if (!user)
      throw new import_utils.ValidationError("User must be authenticated to access a cart");
    let { data: customer } = await this.supabase.from("customers").select("id").eq("user_id", user.id).maybeSingle();
    if (!customer) {
      const { data: created2, error: createError } = await this.supabase.from("customers").insert({
        user_id: user.id,
        email: user.email ?? null,
        is_anonymous: false
      }).select("id").single();
      if (createError || !created2) throw new import_utils.NotFoundError("Customer profile");
      customer = created2;
    }
    const customerId = customer.id;
    const { data: existing } = await this.supabase.from("carts").select(`*, cart_line_items(*), cart_shipping_methods(*)`).eq("customer_id", customerId).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) return this.mapCart(existing);
    const { data: created, error } = await this.supabase.from("carts").insert({
      customer_id: customerId,
      region_id: regionId ?? null,
      currency_code: currencyCode ?? null,
      status: "active"
    }).select(`*, cart_line_items(*), cart_shipping_methods(*)`).single();
    if (error || !created)
      throw new Error(`Failed to create cart: ${error?.message ?? "unknown"}`);
    return this.mapCart(created);
  }
  /**
   * Get a cart by ID.
   */
  async get(cartId) {
    const { data, error } = await this.supabase.from("carts").select(`*, cart_line_items(*), cart_shipping_methods(*)`).eq("id", cartId).single();
    if (error || !data) throw new import_utils.NotFoundError("Cart", cartId);
    return this.mapCart(data);
  }
  /**
   * Add an item to the cart.
   * If the variant is already in the cart, increments the quantity.
   */
  async addItem(cartId, input) {
    if (input.quantity < 1)
      throw new import_utils.ValidationError("Quantity must be at least 1");
    const { data: existing } = await this.supabase.from("cart_line_items").select("id, quantity, unit_price").eq("cart_id", cartId).eq("variant_id", input.variantId).maybeSingle();
    if (existing) {
      const e = existing;
      const newQty = e.quantity + input.quantity;
      await this.supabase.from("cart_line_items").update({
        quantity: newQty,
        subtotal: newQty * e.unit_price,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", e.id);
      return this.get(cartId);
    }
    let title = input.title;
    let thumbnail = input.thumbnail ?? null;
    let productId = input.productId;
    let unitPrice = input.unitPrice;
    if (!title || unitPrice === void 0) {
      const { data: variant } = await this.supabase.from("product_variants").select("title, thumbnail, product_id").eq("id", input.variantId).maybeSingle();
      if (variant) {
        const v = variant;
        productId = productId ?? v.product_id;
        const { data: product } = await this.supabase.from("products").select("title, thumbnail").eq("id", v.product_id).maybeSingle();
        const p = product;
        title = title ?? `${p?.title ?? ""} \u2014 ${v.title}`.trim();
        thumbnail = thumbnail ?? p?.thumbnail ?? null;
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
      metadata: input.metadata ?? null
    });
    if (error) throw new Error(`Failed to add item: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Update a line item's quantity. Set to 0 to remove the item.
   */
  async updateItem(cartId, lineItemId, input) {
    if (input.quantity < 0)
      throw new import_utils.ValidationError("Quantity cannot be negative");
    if (input.quantity === 0) return this.removeItem(cartId, lineItemId);
    const { data: item } = await this.supabase.from("cart_line_items").select("unit_price").eq("id", lineItemId).eq("cart_id", cartId).maybeSingle();
    if (!item) throw new import_utils.NotFoundError("Cart line item", lineItemId);
    const unitPrice = item.unit_price;
    const { error } = await this.supabase.from("cart_line_items").update({
      quantity: input.quantity,
      subtotal: unitPrice * input.quantity,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", lineItemId).eq("cart_id", cartId);
    if (error) throw new Error(`Failed to update item: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Remove a line item from the cart.
   */
  async removeItem(cartId, lineItemId) {
    const { error } = await this.supabase.from("cart_line_items").delete().eq("id", lineItemId).eq("cart_id", cartId);
    if (error) throw new Error(`Failed to remove item: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Set the shipping address on the cart.
   */
  async setShippingAddress(cartId, address) {
    const { error } = await this.supabase.from("carts").update({
      shipping_address: address,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", cartId);
    if (error)
      throw new Error(`Failed to set shipping address: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Set the billing address on the cart.
   */
  async setBillingAddress(cartId, address) {
    const { error } = await this.supabase.from("carts").update({
      billing_address: address,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", cartId);
    if (error)
      throw new Error(`Failed to set billing address: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Set the customer's email on the cart (required for checkout).
   */
  async setEmail(cartId, email) {
    const { error } = await this.supabase.from("carts").update({ email, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", cartId);
    if (error) throw new Error(`Failed to set email: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Set or replace the shipping method on the cart.
   */
  async setShippingMethod(cartId, shippingOptionId) {
    const { data: option } = await this.supabase.from("shipping_options").select("id, name, amount").eq("id", shippingOptionId).maybeSingle();
    if (!option) throw new import_utils.NotFoundError("Shipping option", shippingOptionId);
    const opt = option;
    await this.supabase.from("cart_shipping_methods").delete().eq("cart_id", cartId);
    const { error } = await this.supabase.from("cart_shipping_methods").insert({
      cart_id: cartId,
      shipping_option_id: opt.id,
      name: opt.name,
      price: opt.amount
    });
    if (error)
      throw new Error(`Failed to set shipping method: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Apply a promotion code to the cart.
   */
  async applyPromotion(cartId, code) {
    const { data: cart } = await this.supabase.from("carts").select("promotion_codes").eq("id", cartId).maybeSingle();
    if (!cart) throw new import_utils.NotFoundError("Cart", cartId);
    const existing = cart.promotion_codes ?? [];
    const normalised = code.toUpperCase();
    if (existing.includes(normalised)) return this.get(cartId);
    const { error } = await this.supabase.from("carts").update({
      promotion_codes: [...existing, normalised],
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", cartId);
    if (error) throw new Error(`Failed to apply promotion: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Remove a promotion code from the cart.
   */
  async removePromotion(cartId, code) {
    const { data: cart } = await this.supabase.from("carts").select("promotion_codes").eq("id", cartId).maybeSingle();
    if (!cart) throw new import_utils.NotFoundError("Cart", cartId);
    const existing = cart.promotion_codes ?? [];
    const normalised = code.toUpperCase();
    const { error } = await this.supabase.from("carts").update({
      promotion_codes: existing.filter((c) => c !== normalised),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", cartId);
    if (error) throw new Error(`Failed to remove promotion: ${error.message}`);
    return this.get(cartId);
  }
  /**
   * Initiate checkout. Calls the cart-checkout edge function.
   */
  async checkout(cartId, options) {
    const { data, error } = await this.supabase.functions.invoke(
      "cart-checkout",
      {
        body: {
          cartId,
          paymentProvider: options.paymentProvider,
          billingAddress: options.billingAddress
        }
      }
    );
    if (error) throw new Error(`Checkout failed: ${error.message}`);
    return data;
  }
  // ─── Private helpers ────────────────────────────────────────────────────────
  mapCart(raw) {
    const lineItems = (raw["cart_line_items"] ?? []).map(
      this.mapLineItem
    );
    const shippingMethods = (raw["cart_shipping_methods"] ?? []).map(this.mapShippingMethod);
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingTotal = shippingMethods.reduce((sum, m) => sum + m.price, 0);
    const discountTotal = raw["discount_total"] ?? 0;
    const taxTotal = raw["tax_total"] ?? 0;
    const total = subtotal + shippingTotal + taxTotal - discountTotal;
    return {
      id: raw["id"],
      customerId: raw["customer_id"],
      regionId: raw["region_id"],
      currencyCode: raw["currency_code"],
      email: raw["email"],
      status: raw["status"],
      shippingAddress: raw["shipping_address"],
      billingAddress: raw["billing_address"],
      promotionCodes: raw["promotion_codes"] ?? [],
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      total,
      completedAt: raw["completed_at"],
      metadata: raw["metadata"],
      createdAt: raw["created_at"],
      updatedAt: raw["updated_at"],
      lineItems,
      shippingMethods
    };
  }
  mapLineItem(raw) {
    const r = raw;
    return {
      id: r["id"],
      cartId: r["cart_id"],
      variantId: r["variant_id"],
      productId: r["product_id"],
      title: r["title"],
      subtitle: r["subtitle"],
      thumbnail: r["thumbnail"],
      quantity: r["quantity"],
      unitPrice: r["unit_price"],
      subtotal: r["subtotal"],
      metadata: r["metadata"],
      createdAt: r["created_at"],
      updatedAt: r["updated_at"]
    };
  }
  mapShippingMethod(raw) {
    const r = raw;
    return {
      id: r["id"],
      cartId: r["cart_id"],
      shippingOptionId: r["shipping_option_id"],
      name: r["name"],
      price: r["price"],
      data: r["data"]
    };
  }
};

// src/catalog/index.ts
var import_utils2 = require("@supacommerce/utils");
var CatalogClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * List products. Defaults to published only (respects RLS).
   */
  async listProducts(params = {}) {
    const { limit = 20, offset = 0, status, categoryId, collectionId, search } = params;
    let query = this.supabase.from("products").select(
      `
        *,
        product_variants(
          *,
          product_variant_option_values(
            option_value_id,
            product_option_values(id, option_id, value, rank)
          )
        ),
        product_options(*, product_option_values(*)),
        product_images(*)
      `,
      { count: "exact" }
    ).is("deleted_at", null).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (status) query = query.eq("status", status);
    if (search) query = query.ilike("title", `%${search}%`);
    if (categoryId) {
      const { data: rows } = await this.supabase.from("product_category_products").select("product_id").eq("category_id", categoryId);
      const ids = (rows ?? []).map((r) => r["product_id"]);
      if (ids.length === 0) return (0, import_utils2.buildPaginatedResult)([], 0, params);
      query = query.in("id", ids);
    }
    if (collectionId) {
      const { data: rows } = await this.supabase.from("product_collection_products").select("product_id").eq("collection_id", collectionId);
      const ids = (rows ?? []).map((r) => r["product_id"]);
      if (ids.length === 0) return (0, import_utils2.buildPaginatedResult)([], 0, params);
      query = query.in("id", ids);
    }
    if (params.salesChannelId) {
      const { data: rows } = await this.supabase.from("sales_channel_products").select("product_id").eq("sales_channel_id", params.salesChannelId);
      const ids = (rows ?? []).map((r) => r["product_id"]);
      if (ids.length === 0) return (0, import_utils2.buildPaginatedResult)([], 0, params);
      query = query.in("id", ids);
    }
    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to list products: ${error.message}`);
    return (0, import_utils2.buildPaginatedResult)(
      (data ?? []).map(this.mapProduct),
      count ?? 0,
      params
    );
  }
  /**
   * Get a single product by ID.
   */
  async getProduct(productId) {
    const { data, error } = await this.supabase.from("products").select(`
        *,
        product_variants(
          *,
          product_variant_option_values(
            option_value_id,
            product_option_values(id, option_id, value, rank)
          )
        ),
        product_options(*, product_option_values(*)),
        product_images(*)
      `).eq("id", productId).is("deleted_at", null).maybeSingle();
    if (error || !data) throw new import_utils2.NotFoundError("Product", productId);
    return this.mapProduct(data);
  }
  /**
   * Get a single product by handle (URL slug).
   */
  async getProductByHandle(handle) {
    const { data, error } = await this.supabase.from("products").select(`
        *,
        product_variants(
          *,
          product_variant_option_values(
            option_value_id,
            product_option_values(id, option_id, value, rank)
          )
        ),
        product_options(*, product_option_values(*)),
        product_images(*)
      `).eq("handle", handle).is("deleted_at", null).maybeSingle();
    if (error || !data) throw new import_utils2.NotFoundError("Product");
    return this.mapProduct(data);
  }
  /**
   * Get a single variant by ID.
   */
  async getVariant(variantId) {
    const { data, error } = await this.supabase.from("product_variants").select(`
        *,
        product_variant_option_values(
          option_value_id,
          product_option_values(id, option_id, value, rank)
        )
      `).eq("id", variantId).is("deleted_at", null).maybeSingle();
    if (error || !data) throw new import_utils2.NotFoundError("ProductVariant", variantId);
    return this.mapVariant(data);
  }
  /**
   * List categories.
   * Pass parentId = null to get top-level categories only.
   * Pass parentId = "<uuid>" to get children of that category.
   * Omit parentId to get all active categories.
   */
  async listCategories(parentId) {
    let query = this.supabase.from("product_categories").select("*").eq("is_active", true).order("rank");
    if (parentId !== void 0) {
      query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list categories: ${error.message}`);
    return (data ?? []).map(this.mapCategory);
  }
  /**
   * List collections.
   */
  async listCollections(params = {}) {
    const { limit = 20, offset = 0 } = params;
    const { data, error, count } = await this.supabase.from("product_collections").select("*", { count: "exact" }).is("deleted_at", null).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw new Error(`Failed to list collections: ${error.message}`);
    return (0, import_utils2.buildPaginatedResult)((data ?? []).map(this.mapCollection), count ?? 0, params);
  }
  // ─── Private mappers ────────────────────────────────────────────────────────
  mapProduct(raw) {
    const r = raw;
    return {
      id: r["id"],
      title: r["title"],
      subtitle: r["subtitle"],
      description: r["description"],
      handle: r["handle"],
      status: r["status"],
      thumbnail: r["thumbnail"],
      isGiftcard: r["is_giftcard"],
      discountable: r["discountable"],
      metadata: r["metadata"],
      createdAt: r["created_at"],
      updatedAt: r["updated_at"],
      variants: (r["product_variants"] ?? []).map(
        (v) => ({
          id: v["id"],
          productId: v["product_id"],
          title: v["title"],
          sku: v["sku"],
          barcode: v["barcode"],
          weight: v["weight"],
          allowBackorder: v["allow_backorder"],
          manageInventory: v["manage_inventory"],
          rank: v["rank"],
          metadata: v["metadata"],
          optionValues: v["product_variant_option_values"]?.map((ov) => {
            const o = ov["product_option_values"];
            return {
              id: o["id"],
              optionId: o["option_id"],
              value: o["value"],
              rank: o["rank"]
            };
          }) ?? []
        })
      ),
      options: (r["product_options"] ?? []).map((o) => {
        const opt = o;
        return {
          id: opt["id"],
          productId: opt["product_id"],
          title: opt["title"],
          rank: opt["rank"],
          values: (opt["product_option_values"] ?? []).map((v) => {
            const val = v;
            return {
              id: val["id"],
              optionId: val["option_id"],
              value: val["value"],
              rank: val["rank"]
            };
          })
        };
      }),
      images: (r["product_images"] ?? []).map((i) => {
        const img = i;
        return {
          id: img["id"],
          productId: img["product_id"],
          url: img["url"],
          alt: img["alt"],
          rank: img["rank"]
        };
      }).sort((a, b) => a.rank - b.rank)
    };
  }
  mapVariant(raw) {
    const r = raw;
    return {
      id: r["id"],
      productId: r["product_id"],
      title: r["title"],
      sku: r["sku"],
      barcode: r["barcode"],
      weight: r["weight"],
      allowBackorder: r["allow_backorder"],
      manageInventory: r["manage_inventory"],
      rank: r["rank"],
      metadata: r["metadata"],
      optionValues: (r["product_variant_option_values"] ?? []).map((ov) => {
        const o = ov["product_option_values"];
        return {
          id: o["id"],
          optionId: o["option_id"],
          value: o["value"],
          rank: o["rank"]
        };
      })
    };
  }
  mapCategory(raw) {
    const r = raw;
    return {
      id: r["id"],
      name: r["name"],
      handle: r["handle"],
      description: r["description"],
      parentId: r["parent_id"],
      rank: r["rank"],
      isActive: r["is_active"]
    };
  }
  mapCollection(raw) {
    const r = raw;
    return {
      id: r["id"],
      title: r["title"],
      handle: r["handle"],
      metadata: r["metadata"]
    };
  }
};

// src/orders/index.ts
var import_utils3 = require("@supacommerce/utils");
var OrdersClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * List the current customer's orders.
   */
  async list(params = {}) {
    const { limit = 20, offset = 0, status } = params;
    let query = this.supabase.from("orders").select(
      `
        *,
        order_line_items(*),
        order_fulfillments(*)
      `,
      { count: "exact" }
    ).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (status) query = query.eq("status", status);
    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to list orders: ${error.message}`);
    return (0, import_utils3.buildPaginatedResult)((data ?? []).map(this.mapOrder), count ?? 0, params);
  }
  /**
   * Get a single order by ID.
   */
  async get(orderId) {
    const { data, error } = await this.supabase.from("orders").select(`
        *,
        order_line_items(*),
        order_fulfillments(*)
      `).eq("id", orderId).maybeSingle();
    if (error || !data) throw new import_utils3.NotFoundError("Order", orderId);
    return this.mapOrder(data);
  }
  /**
   * Get a single order by display ID (the human-readable order number).
   */
  async getByDisplayId(displayId) {
    const { data, error } = await this.supabase.from("orders").select(`
        *,
        order_line_items(*),
        order_fulfillments(*)
      `).eq("display_id", displayId).maybeSingle();
    if (error || !data) throw new import_utils3.NotFoundError("Order");
    return this.mapOrder(data);
  }
  // ─── Private mappers ────────────────────────────────────────────────────────
  mapOrder(raw) {
    const r = raw;
    return {
      id: r["id"],
      displayId: r["display_id"],
      customerId: r["customer_id"],
      cartId: r["cart_id"],
      regionId: r["region_id"],
      currencyCode: r["currency_code"],
      email: r["email"],
      status: r["status"],
      paymentStatus: r["payment_status"],
      fulfillmentStatus: r["fulfillment_status"],
      shippingAddress: r["shipping_address"],
      billingAddress: r["billing_address"],
      subtotal: r["subtotal"],
      discountTotal: r["discount_total"],
      shippingTotal: r["shipping_total"],
      taxTotal: r["tax_total"],
      refundedTotal: r["refunded_total"],
      total: r["total"],
      cancelledAt: r["cancelled_at"],
      createdAt: r["created_at"],
      updatedAt: r["updated_at"],
      lineItems: (r["order_line_items"] ?? []).map((item) => {
        const i = item;
        return {
          id: i["id"],
          orderId: i["order_id"],
          variantId: i["variant_id"],
          title: i["title"],
          subtitle: i["subtitle"],
          thumbnail: i["thumbnail"],
          quantity: i["quantity"],
          fulfilledQuantity: i["fulfilled_quantity"],
          returnedQuantity: i["returned_quantity"],
          unitPrice: i["unit_price"],
          subtotal: i["subtotal"],
          taxTotal: i["tax_total"],
          discountTotal: i["discount_total"],
          total: i["total"]
        };
      }),
      fulfillments: (r["order_fulfillments"] ?? []).map((f) => {
        const fulf = f;
        return {
          id: fulf["id"],
          orderId: fulf["order_id"],
          providerId: fulf["provider_id"],
          trackingNumber: fulf["tracking_number"],
          trackingUrl: fulf["tracking_url"],
          shippedAt: fulf["shipped_at"],
          cancelledAt: fulf["cancelled_at"],
          createdAt: fulf["created_at"]
        };
      })
    };
  }
};

// src/customers/index.ts
var import_utils4 = require("@supacommerce/utils");
var CustomersClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * Get the current authenticated customer's profile.
   */
  async me() {
    const {
      data: { user }
    } = await this.supabase.auth.getUser();
    if (!user) throw new import_utils4.ValidationError("Not authenticated");
    const { data, error } = await this.supabase.from("customers").select("*").eq("user_id", user.id).maybeSingle();
    if (error || !data) throw new import_utils4.NotFoundError("Customer profile");
    return this.mapCustomer(data);
  }
  /**
   * Update the current customer's profile.
   */
  async updateProfile(input) {
    const {
      data: { user }
    } = await this.supabase.auth.getUser();
    if (!user) throw new import_utils4.ValidationError("Not authenticated");
    const { data, error } = await this.supabase.from("customers").update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      avatar_url: input.avatarUrl,
      metadata: input.metadata,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("user_id", user.id).select().maybeSingle();
    if (error || !data) throw new Error(`Failed to update profile: ${error?.message ?? "unknown"}`);
    return this.mapCustomer(data);
  }
  /**
   * List the current customer's saved addresses.
   */
  async listAddresses() {
    const customer = await this.me();
    const { data, error } = await this.supabase.from("customer_addresses").select("*").eq("customer_id", customer.id).order("is_default", { ascending: false }).order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list addresses: ${error.message}`);
    return (data ?? []).map(this.mapAddress);
  }
  /**
   * Add a new address to the customer's account.
   */
  async addAddress(input) {
    const customer = await this.me();
    if (input.isDefault) {
      await this.supabase.from("customer_addresses").update({ is_default: false }).eq("customer_id", customer.id).eq("is_default", true);
    }
    const { data, error } = await this.supabase.from("customer_addresses").insert({
      customer_id: customer.id,
      first_name: input.firstName ?? null,
      last_name: input.lastName ?? null,
      company: input.company ?? null,
      address_1: input.address1,
      address_2: input.address2 ?? null,
      city: input.city,
      province: input.province ?? null,
      postal_code: input.postalCode ?? null,
      country_code: input.countryCode,
      phone: input.phone ?? null,
      is_default: input.isDefault ?? false
    }).select().maybeSingle();
    if (error || !data) throw new Error(`Failed to add address: ${error?.message ?? "unknown"}`);
    return this.mapAddress(data);
  }
  /**
   * Update a saved address.
   */
  async updateAddress(addressId, input) {
    const customer = await this.me();
    if (input.isDefault) {
      await this.supabase.from("customer_addresses").update({ is_default: false }).eq("customer_id", customer.id).eq("is_default", true);
    }
    const { data, error } = await this.supabase.from("customer_addresses").update({
      first_name: input.firstName,
      last_name: input.lastName,
      company: input.company,
      address_1: input.address1,
      address_2: input.address2,
      city: input.city,
      province: input.province,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      phone: input.phone,
      is_default: input.isDefault,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", addressId).eq("customer_id", customer.id).select().maybeSingle();
    if (error || !data) throw new Error(`Failed to update address: ${error?.message ?? "unknown"}`);
    return this.mapAddress(data);
  }
  /**
   * Delete a saved address.
   */
  async deleteAddress(addressId) {
    const customer = await this.me();
    const { error } = await this.supabase.from("customer_addresses").delete().eq("id", addressId).eq("customer_id", customer.id);
    if (error) throw new Error(`Failed to delete address: ${error.message}`);
  }
  // ─── Private mappers ────────────────────────────────────────────────────────
  mapCustomer(raw) {
    const r = raw;
    return {
      id: r["id"],
      userId: r["user_id"],
      email: r["email"],
      firstName: r["first_name"],
      lastName: r["last_name"],
      phone: r["phone"],
      avatarUrl: r["avatar_url"],
      isAnonymous: r["is_anonymous"],
      metadata: r["metadata"],
      createdAt: r["created_at"],
      updatedAt: r["updated_at"]
    };
  }
  mapAddress(raw) {
    const r = raw;
    return {
      id: r["id"],
      customerId: r["customer_id"],
      firstName: r["first_name"],
      lastName: r["last_name"],
      company: r["company"],
      address1: r["address_1"],
      address2: r["address_2"],
      city: r["city"],
      province: r["province"],
      postalCode: r["postal_code"],
      countryCode: r["country_code"],
      phone: r["phone"],
      isDefault: r["is_default"],
      createdAt: r["created_at"],
      updatedAt: r["updated_at"]
    };
  }
};

// src/inventory/index.ts
var InventoryClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * Get total available stock for a variant across all locations.
   */
  async getTotalAvailable(variantId) {
    const { data: invItem } = await this.supabase.from("inventory_items").select("id, inventory_levels(quantity_available)").eq("variant_id", variantId).is("deleted_at", null).maybeSingle();
    if (!invItem) return 0;
    const levels = invItem.inventory_levels ?? [];
    return levels.reduce((sum, l) => sum + l.quantity_available, 0);
  }
  /**
   * Get full availability details for a variant, including per-location breakdown.
   */
  async getAvailability(variantId) {
    const { data: invItem } = await this.supabase.from("inventory_items").select(`
        id,
        inventory_levels(
          location_id,
          stocked_quantity,
          reserved_quantity,
          quantity_available,
          stock_locations(id, name)
        )
      `).eq("variant_id", variantId).is("deleted_at", null).maybeSingle();
    if (!invItem) {
      return {
        variantId,
        inventoryItemId: null,
        totalAvailable: 0,
        isAvailable: false,
        levels: []
      };
    }
    const item = invItem;
    const levels = (item.inventory_levels ?? []).map((l) => ({
      locationId: l.location_id,
      locationName: l.stock_locations?.name ?? "Unknown",
      stockedQuantity: l.stocked_quantity,
      reservedQuantity: l.reserved_quantity,
      quantityAvailable: l.quantity_available
    }));
    const totalAvailable = levels.reduce((sum, l) => sum + l.quantityAvailable, 0);
    return {
      variantId,
      inventoryItemId: item.id,
      totalAvailable,
      isAvailable: totalAvailable > 0,
      levels
    };
  }
  /**
   * Check availability for multiple variants at once.
   */
  async getBulkAvailability(variantIds) {
    const { data } = await this.supabase.from("inventory_items").select("variant_id, inventory_levels(quantity_available)").in("variant_id", variantIds).is("deleted_at", null);
    const result = /* @__PURE__ */ new Map();
    for (const id of variantIds) result.set(id, 0);
    for (const item of data ?? []) {
      const i = item;
      if (!i.variant_id) continue;
      const total = (i.inventory_levels ?? []).reduce((s, l) => s + l.quantity_available, 0);
      result.set(i.variant_id, total);
    }
    return result;
  }
};

// src/pricing/index.ts
var PricingClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
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
  async getVariantPrice(params) {
    const { variantId, regionId, currencyCode, quantity = 1 } = params;
    const now = /* @__PURE__ */ new Date();
    const { data: priceListPrices } = await this.supabase.from("price_list_prices").select(`
        amount, currency_code, region_id, min_quantity, max_quantity, price_list_id,
        price_lists(id, type, status, starts_at, ends_at)
      `).eq("variant_id", variantId);
    const validListPrices = (priceListPrices ?? []).filter((p) => {
      const pp = p;
      const pl = pp["price_lists"];
      if (!pl) return false;
      if (pl["status"] !== "active") return false;
      if (pl["starts_at"] && new Date(pl["starts_at"]) > now) return false;
      if (pl["ends_at"] && new Date(pl["ends_at"]) < now) return false;
      if (regionId && pp["region_id"] && pp["region_id"] !== regionId) return false;
      if (currencyCode && pp["currency_code"] !== currencyCode) return false;
      if (pp["min_quantity"] !== null && pp["min_quantity"] > quantity) return false;
      if (pp["max_quantity"] !== null && pp["max_quantity"] < quantity) return false;
      return true;
    });
    if (validListPrices.length > 0) {
      const best = validListPrices.reduce((min, p) => {
        const pRec = p;
        const minRec = min;
        return pRec["amount"] < minRec["amount"] ? p : min;
      });
      const b = best;
      return {
        variantId,
        amount: b["amount"],
        currencyCode: b["currency_code"],
        regionId: b["region_id"],
        priceListId: b["price_list_id"],
        minQuantity: b["min_quantity"],
        maxQuantity: b["max_quantity"]
      };
    }
    const { data: priceSet } = await this.supabase.from("price_sets").select(`
        id,
        prices(amount, currency_code, region_id, min_quantity, max_quantity)
      `).eq("variant_id", variantId).maybeSingle();
    if (!priceSet) return null;
    const ps = priceSet;
    const candidates = ps.prices.filter((p) => {
      if (p.min_quantity !== null && p.min_quantity > quantity) return false;
      if (p.max_quantity !== null && p.max_quantity < quantity) return false;
      return true;
    });
    const regionAndCurrency = candidates.find(
      (p) => p.region_id === regionId && p.currency_code === currencyCode
    );
    if (regionAndCurrency) {
      return {
        variantId,
        amount: regionAndCurrency.amount,
        currencyCode: regionAndCurrency.currency_code,
        regionId: regionAndCurrency.region_id,
        priceListId: null,
        minQuantity: regionAndCurrency.min_quantity,
        maxQuantity: regionAndCurrency.max_quantity
      };
    }
    const regionOnly = candidates.find((p) => p.region_id === regionId);
    if (regionOnly) {
      return {
        variantId,
        amount: regionOnly.amount,
        currencyCode: regionOnly.currency_code,
        regionId: regionOnly.region_id,
        priceListId: null,
        minQuantity: regionOnly.min_quantity,
        maxQuantity: regionOnly.max_quantity
      };
    }
    const currencyOnly = candidates.find((p) => p.currency_code === currencyCode);
    if (currencyOnly) {
      return {
        variantId,
        amount: currencyOnly.amount,
        currencyCode: currencyOnly.currency_code,
        regionId: currencyOnly.region_id,
        priceListId: null,
        minQuantity: currencyOnly.min_quantity,
        maxQuantity: currencyOnly.max_quantity
      };
    }
    const fallback = candidates[0];
    if (!fallback) return null;
    return {
      variantId,
      amount: fallback.amount,
      currencyCode: fallback.currency_code,
      regionId: fallback.region_id,
      priceListId: null,
      minQuantity: fallback.min_quantity,
      maxQuantity: fallback.max_quantity
    };
  }
  /**
   * Get prices for multiple variants at once.
   * Returns a map of variantId → VariantPrice | null.
   */
  async getBulkVariantPrices(variantIds, params) {
    const result = /* @__PURE__ */ new Map();
    await Promise.all(
      variantIds.map(async (variantId) => {
        const price = await this.getVariantPrice({ variantId, ...params });
        result.set(variantId, price);
      })
    );
    return result;
  }
};

// src/promotions/index.ts
var PromotionsClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * Validate a promotion code and calculate the discount amount.
   * Does not apply the promotion — call commerce.cart.applyPromotion() for that.
   */
  async validate(params) {
    const { code, cartSubtotal, customerId } = params;
    const { data: promo, error } = await this.supabase.from("promotions").select("*, promotion_rules(*)").eq("code", code.toUpperCase()).eq("status", "active").is("deleted_at", null).maybeSingle();
    if (error || !promo) {
      return { valid: false, promotion: null, discountAmount: 0, reason: "Code not found or inactive" };
    }
    const p = promo;
    const now = /* @__PURE__ */ new Date();
    if (p["starts_at"] && new Date(p["starts_at"]) > now) {
      return { valid: false, promotion: null, discountAmount: 0, reason: "Promotion not yet active" };
    }
    if (p["ends_at"] && new Date(p["ends_at"]) < now) {
      return { valid: false, promotion: null, discountAmount: 0, reason: "Promotion has expired" };
    }
    if (p["usage_limit"] !== null && p["usage_count"] >= p["usage_limit"]) {
      return { valid: false, promotion: null, discountAmount: 0, reason: "Promotion usage limit reached" };
    }
    if (customerId && p["usage_limit_per_customer"] !== null) {
      const { count } = await this.supabase.from("promotion_usages").select("id", { count: "exact" }).eq("promotion_id", p["id"]).eq("customer_id", customerId);
      if ((count ?? 0) >= p["usage_limit_per_customer"]) {
        return {
          valid: false,
          promotion: null,
          discountAmount: 0,
          reason: "You have already used this promotion"
        };
      }
    }
    const rules = p["promotion_rules"] ?? [];
    for (const rule of rules) {
      if (rule.type === "cart_total") {
        const minTotal = parseInt(rule.value, 10);
        if (cartSubtotal < minTotal) {
          return {
            valid: false,
            promotion: null,
            discountAmount: 0,
            reason: `Minimum order amount not reached`
          };
        }
      }
    }
    const promotion = this.mapPromotion(promo);
    let discountAmount = 0;
    switch (promotion.type) {
      case "percentage":
        discountAmount = Math.round(cartSubtotal * (promotion.value / 100));
        break;
      case "fixed_amount":
        discountAmount = Math.min(promotion.value, cartSubtotal);
        break;
      case "free_shipping":
        discountAmount = 0;
        break;
      case "buy_x_get_y":
        discountAmount = 0;
        break;
    }
    return { valid: true, promotion, discountAmount };
  }
  /**
   * List all currently active automatic promotions.
   */
  async listAutomatic() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { data, error } = await this.supabase.from("promotions").select("*, promotion_rules(*)").eq("status", "active").eq("is_automatic", true).is("deleted_at", null).or(`starts_at.is.null,starts_at.lte.${now}`).or(`ends_at.is.null,ends_at.gte.${now}`);
    if (error) throw new Error(`Failed to list promotions: ${error.message}`);
    return (data ?? []).map(this.mapPromotion);
  }
  // ─── Private mappers ────────────────────────────────────────────────────────
  mapPromotion(raw) {
    const r = raw;
    return {
      id: r["id"],
      code: r["code"],
      type: r["type"],
      status: r["status"],
      value: r["value"],
      usageLimit: r["usage_limit"],
      usageCount: r["usage_count"],
      usageLimitPerCustomer: r["usage_limit_per_customer"],
      startsAt: r["starts_at"],
      endsAt: r["ends_at"],
      isAutomatic: r["is_automatic"],
      rules: (r["promotion_rules"] ?? []).map((rule) => {
        const ru = rule;
        return {
          id: ru["id"],
          type: ru["type"],
          value: ru["value"],
          description: ru["description"]
        };
      })
    };
  }
};

// src/regions/index.ts
var import_utils5 = require("@supacommerce/utils");
var RegionsClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  async list() {
    const { data, error } = await this.supabase.from("regions").select("*, countries(*)").eq("is_active", true).is("deleted_at", null).order("name");
    if (error) throw new Error(`Failed to list regions: ${error.message}`);
    return (data ?? []).map(this.mapRegion);
  }
  async get(regionId) {
    const { data, error } = await this.supabase.from("regions").select("*, countries(*)").eq("id", regionId).maybeSingle();
    if (error || !data) throw new import_utils5.NotFoundError("Region", regionId);
    return this.mapRegion(data);
  }
  /** Find the region that includes a given ISO 2 country code. */
  async getByCountry(countryCode) {
    const { data: country } = await this.supabase.from("countries").select("region_id").eq("iso2", countryCode.toUpperCase()).maybeSingle();
    if (!country) return null;
    const regionId = country.region_id;
    return this.get(regionId);
  }
  mapRegion(raw) {
    const r = raw;
    return {
      id: r["id"],
      name: r["name"],
      currencyCode: r["currency_code"],
      taxRate: r["tax_rate"],
      taxIncluded: r["tax_included"],
      isActive: r["is_active"],
      countries: (r["countries"] ?? []).map((c) => {
        const co = c;
        return {
          id: co["id"],
          iso2: co["iso2"],
          iso3: co["iso3"],
          name: co["name"],
          displayName: co["display_name"]
        };
      })
    };
  }
};

// src/fulfillment/index.ts
var import_utils6 = require("@supacommerce/utils");
var FulfillmentClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * List available shipping options for a region.
   * Optionally filters by cart subtotal to exclude options with unmet requirements.
   * Requirements are always included in the returned objects.
   */
  async listShippingOptions(params = {}) {
    const { regionId, cartSubtotal } = params;
    let query = this.supabase.from("shipping_options").select("*, shipping_option_requirements(*)").eq("is_active", true).eq("is_return", false).is("deleted_at", null);
    if (regionId) query = query.eq("region_id", regionId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list shipping options: ${error.message}`);
    let options = data ?? [];
    if (cartSubtotal !== void 0) {
      options = options.filter((opt) => {
        const reqs = opt.shipping_option_requirements ?? [];
        for (const req of reqs) {
          if (req.type === "min_subtotal" && cartSubtotal < req.amount) return false;
          if (req.type === "max_subtotal" && cartSubtotal > req.amount) return false;
        }
        return true;
      });
    }
    return options.map(this.mapOption);
  }
  /**
   * Get a single shipping option by ID including its requirements.
   */
  async getShippingOption(optionId) {
    const { data, error } = await this.supabase.from("shipping_options").select("*, shipping_option_requirements(*)").eq("id", optionId).maybeSingle();
    if (error || !data) throw new import_utils6.NotFoundError("ShippingOption", optionId);
    return this.mapOption(data);
  }
  mapOption(raw) {
    const r = raw;
    const requirements = (r["shipping_option_requirements"] ?? []).map((req) => {
      const rq = req;
      return {
        id: rq["id"],
        type: rq["type"],
        amount: rq["amount"]
      };
    });
    return {
      id: r["id"],
      name: r["name"],
      regionId: r["region_id"],
      providerId: r["provider_id"],
      type: r["type"],
      amount: r["amount"],
      isActive: r["is_active"],
      data: r["data"],
      requirements
    };
  }
};

// src/tax/index.ts
var TaxClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * Calculate tax for a given subtotal and location.
   * Uses the tax_regions / tax_rates tables.
   *
   * For production, consider using a dedicated tax provider
   * (TaxJar, Avalara, Stripe Tax) via the cart-checkout edge function.
   */
  async calculate(params) {
    const { subtotal, countryCode, provinceCode } = params;
    const { data: taxRegions } = await this.supabase.from("tax_regions").select("*, tax_rates(*)").eq("country_code", countryCode.toUpperCase()).is("deleted_at", null);
    if (!taxRegions || taxRegions.length === 0) {
      return { taxable: subtotal, rate: 0, taxTotal: 0, taxRegion: null };
    }
    let matchedRegion = taxRegions.find(
      (r) => r["province_code"] === (provinceCode?.toUpperCase() ?? null)
    );
    if (!matchedRegion) {
      matchedRegion = taxRegions.find(
        (r) => r["province_code"] === null
      );
    }
    if (!matchedRegion) {
      return { taxable: subtotal, rate: 0, taxTotal: 0, taxRegion: null };
    }
    const mr = matchedRegion;
    const rates = mr["tax_rates"] ?? [];
    const defaultRate = rates.find((r) => r["is_default"]) ?? rates[0];
    if (!defaultRate) {
      return { taxable: subtotal, rate: 0, taxTotal: 0, taxRegion: null };
    }
    const rate = defaultRate["rate"];
    const taxTotal = Math.round(subtotal * rate);
    const taxRegion = {
      id: mr["id"],
      countryCode: mr["country_code"],
      provinceCode: mr["province_code"],
      name: mr["name"],
      rates: rates.map((r) => ({
        id: r["id"],
        name: r["name"],
        code: r["code"],
        rate: r["rate"],
        isDefault: r["is_default"]
      }))
    };
    return { taxable: subtotal, rate, taxTotal, taxRegion };
  }
  /** Get all tax regions with their rates. */
  async listTaxRegions(countryCode) {
    let query = this.supabase.from("tax_regions").select("*, tax_rates(*)").is("deleted_at", null);
    if (countryCode) query = query.eq("country_code", countryCode.toUpperCase());
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list tax regions: ${error.message}`);
    return (data ?? []).map((r) => {
      const raw = r;
      return {
        id: raw["id"],
        countryCode: raw["country_code"],
        provinceCode: raw["province_code"],
        name: raw["name"],
        rates: (raw["tax_rates"] ?? []).map((rate) => {
          const rt = rate;
          return {
            id: rt["id"],
            name: rt["name"],
            code: rt["code"],
            rate: rt["rate"],
            isDefault: rt["is_default"]
          };
        })
      };
    });
  }
};

// src/sales-channels/index.ts
var import_utils7 = require("@supacommerce/utils");
var SalesChannelsClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /** List all active sales channels. */
  async list() {
    const { data, error } = await this.supabase.from("sales_channels").select("*").eq("is_disabled", false).is("deleted_at", null).order("is_default", { ascending: false }).order("name");
    if (error) throw new Error(`Failed to list sales channels: ${error.message}`);
    return (data ?? []).map(this.mapChannel);
  }
  /** Get the default sales channel. */
  async getDefault() {
    const { data } = await this.supabase.from("sales_channels").select("*").eq("is_default", true).eq("is_disabled", false).is("deleted_at", null).maybeSingle();
    return data ? this.mapChannel(data) : null;
  }
  async get(channelId) {
    const { data, error } = await this.supabase.from("sales_channels").select("*").eq("id", channelId).is("deleted_at", null).maybeSingle();
    if (error || !data) throw new import_utils7.NotFoundError("SalesChannel", channelId);
    return this.mapChannel(data);
  }
  mapChannel(raw) {
    const r = raw;
    return {
      id: r["id"],
      name: r["name"],
      description: r["description"],
      isDefault: r["is_default"],
      isDisabled: r["is_disabled"],
      createdAt: r["created_at"],
      updatedAt: r["updated_at"]
    };
  }
};

// src/admin/index.ts
var import_utils8 = require("@supacommerce/utils");
var AdminClient = class {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * Get the current admin user's record.
   * Throws ForbiddenError if the authenticated user is not an admin.
   */
  async me() {
    const {
      data: { user }
    } = await this.supabase.auth.getUser();
    if (!user) throw new import_utils8.ForbiddenError("Not authenticated");
    const { data, error } = await this.supabase.from("admin_users").select("*").eq("user_id", user.id).eq("is_active", true).is("deleted_at", null).single();
    if (error || !data) throw new import_utils8.ForbiddenError("Not an admin user");
    return this.mapAdmin(data);
  }
  /** List all admin users. Requires admin access (enforced by RLS). */
  async list(params = {}) {
    const { limit = 20, offset = 0 } = params;
    const { data, error, count } = await this.supabase.from("admin_users").select("*", { count: "exact" }).is("deleted_at", null).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw new Error(`Failed to list admin users: ${error.message}`);
    return (0, import_utils8.buildPaginatedResult)((data ?? []).map(this.mapAdmin), count ?? 0, params);
  }
  /** Get a single admin user by ID. */
  async get(adminId) {
    const { data, error } = await this.supabase.from("admin_users").select("*").eq("id", adminId).is("deleted_at", null).single();
    if (error || !data) throw new import_utils8.NotFoundError("AdminUser", adminId);
    return this.mapAdmin(data);
  }
  /** Create a new admin user. Requires super_admin or admin role. */
  async create(input) {
    const { data, error } = await this.supabase.from("admin_users").insert({
      user_id: input.userId,
      email: input.email,
      first_name: input.firstName ?? null,
      last_name: input.lastName ?? null,
      role: input.role ?? "viewer",
      is_active: true
    }).select().single();
    if (error || !data)
      throw new Error(`Failed to create admin user: ${error?.message ?? "unknown"}`);
    return this.mapAdmin(data);
  }
  /** Update an admin user's role or status. */
  async update(adminId, input) {
    const { data, error } = await this.supabase.from("admin_users").update({
      first_name: input.firstName,
      last_name: input.lastName,
      role: input.role,
      is_active: input.isActive,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", adminId).select().single();
    if (error || !data)
      throw new Error(`Failed to update admin user: ${error?.message ?? "unknown"}`);
    return this.mapAdmin(data);
  }
  /** Soft-delete an admin user. */
  async deactivate(adminId) {
    const { error } = await this.supabase.from("admin_users").update({
      is_active: false,
      deleted_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", adminId);
    if (error) throw new Error(`Failed to deactivate admin user: ${error.message}`);
  }
  /** Record last login timestamp for the current admin. */
  async recordLogin() {
    const {
      data: { user }
    } = await this.supabase.auth.getUser();
    if (!user) return;
    await this.supabase.from("admin_users").update({ last_login_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", user.id);
  }
  mapAdmin(raw) {
    const r = raw;
    return {
      id: r["id"],
      userId: r["user_id"],
      email: r["email"],
      firstName: r["first_name"],
      lastName: r["last_name"],
      avatarUrl: r["avatar_url"],
      role: r["role"],
      isActive: r["is_active"],
      lastLoginAt: r["last_login_at"],
      createdAt: r["created_at"],
      updatedAt: r["updated_at"]
    };
  }
};

// src/index.ts
function createClient(supabase) {
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
    admin: new AdminClient(supabase)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createClient
});
//# sourceMappingURL=index.cjs.map