import type { AnySupabaseClient, OrderStatus, OrderPaymentStatus, OrderFulfillmentStatus, Address } from "../types.js"
import { buildPaginatedResult, NotFoundError } from "@supacommerce/utils"
import type { PaginationParams, PaginatedResult } from "@supacommerce/utils"

export interface OrderLineItem {
  id: string
  orderId: string
  variantId: string | null
  title: string
  subtitle: string | null
  thumbnail: string | null
  quantity: number
  fulfilledQuantity: number
  returnedQuantity: number
  unitPrice: number
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
}

export interface OrderFulfillment {
  id: string
  orderId: string
  providerId: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  shippedAt: string | null
  cancelledAt: string | null
  createdAt: string
}

export interface Order {
  id: string
  displayId: number
  customerId: string | null
  cartId: string | null
  regionId: string | null
  currencyCode: string | null
  email: string
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  fulfillmentStatus: OrderFulfillmentStatus
  shippingAddress: Address | null
  billingAddress: Address | null
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  refundedTotal: number
  total: number
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  lineItems: OrderLineItem[]
  fulfillments: OrderFulfillment[]
}

export interface ListOrdersParams extends PaginationParams {
  status?: OrderStatus
}

export class OrdersClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * List the current customer's orders.
   */
  async list(params: ListOrdersParams = {}): Promise<PaginatedResult<Order>> {
    const { limit = 20, offset = 0, status } = params

    let query = this.supabase
      .from("orders")
      .select(
        `
        *,
        order_line_items(*),
        order_fulfillments(*)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq("status", status)

    const { data, error, count } = await query

    if (error) throw new Error(`Failed to list orders: ${error.message}`)

    return buildPaginatedResult((data ?? []).map(this.mapOrder), count ?? 0, params)
  }

  /**
   * Get a single order by ID.
   */
  async get(orderId: string): Promise<Order> {
    const { data, error } = await this.supabase
      .from("orders")
      .select(`
        *,
        order_line_items(*),
        order_fulfillments(*)
      `)
      .eq("id", orderId)
      .single()

    if (error || !data) throw new NotFoundError("Order", orderId)

    return this.mapOrder(data)
  }

  /**
   * Get a single order by display ID (the human-readable order number).
   */
  async getByDisplayId(displayId: number): Promise<Order> {
    const { data, error } = await this.supabase
      .from("orders")
      .select(`
        *,
        order_line_items(*),
        order_fulfillments(*)
      `)
      .eq("display_id", displayId)
      .single()

    if (error || !data) throw new NotFoundError("Order")

    return this.mapOrder(data)
  }

  // ─── Private mappers ────────────────────────────────────────────────────────

  private mapOrder(raw: unknown): Order {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      displayId: r["display_id"] as number,
      customerId: r["customer_id"] as string | null,
      cartId: r["cart_id"] as string | null,
      regionId: r["region_id"] as string | null,
      currencyCode: r["currency_code"] as string | null,
      email: r["email"] as string,
      status: r["status"] as OrderStatus,
      paymentStatus: r["payment_status"] as OrderPaymentStatus,
      fulfillmentStatus: r["fulfillment_status"] as OrderFulfillmentStatus,
      shippingAddress: r["shipping_address"] as Address | null,
      billingAddress: r["billing_address"] as Address | null,
      subtotal: r["subtotal"] as number,
      discountTotal: r["discount_total"] as number,
      shippingTotal: r["shipping_total"] as number,
      taxTotal: r["tax_total"] as number,
      refundedTotal: r["refunded_total"] as number,
      total: r["total"] as number,
      cancelledAt: r["cancelled_at"] as string | null,
      createdAt: r["created_at"] as string,
      updatedAt: r["updated_at"] as string,
      lineItems: ((r["order_line_items"] as unknown[]) ?? []).map((item) => {
        const i = item as Record<string, unknown>
        return {
          id: i["id"] as string,
          orderId: i["order_id"] as string,
          variantId: i["variant_id"] as string | null,
          title: i["title"] as string,
          subtitle: i["subtitle"] as string | null,
          thumbnail: i["thumbnail"] as string | null,
          quantity: i["quantity"] as number,
          fulfilledQuantity: i["fulfilled_quantity"] as number,
          returnedQuantity: i["returned_quantity"] as number,
          unitPrice: i["unit_price"] as number,
          subtotal: i["subtotal"] as number,
          taxTotal: i["tax_total"] as number,
          discountTotal: i["discount_total"] as number,
          total: i["total"] as number,
        } satisfies OrderLineItem
      }),
      fulfillments: ((r["order_fulfillments"] as unknown[]) ?? []).map((f) => {
        const fulf = f as Record<string, unknown>
        return {
          id: fulf["id"] as string,
          orderId: fulf["order_id"] as string,
          providerId: fulf["provider_id"] as string | null,
          trackingNumber: fulf["tracking_number"] as string | null,
          trackingUrl: fulf["tracking_url"] as string | null,
          shippedAt: fulf["shipped_at"] as string | null,
          cancelledAt: fulf["cancelled_at"] as string | null,
          createdAt: fulf["created_at"] as string,
        } satisfies OrderFulfillment
      }),
    }
  }
}
