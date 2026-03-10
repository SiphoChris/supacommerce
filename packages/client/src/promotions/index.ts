import type { AnySupabaseClient, PromotionType } from "../types.js"

export interface PromotionRule {
  id: string
  type: string
  value: string
  description: string | null
}

export interface Promotion {
  id: string
  code: string | null
  type: PromotionType
  status: string
  value: number
  usageLimit: number | null
  usageCount: number
  usageLimitPerCustomer: number | null
  startsAt: string | null
  endsAt: string | null
  isAutomatic: boolean
  rules: PromotionRule[]
}

export interface ValidatePromotionParams {
  code: string
  cartSubtotal: number
  customerId?: string
  productIds?: string[]
  categoryIds?: string[]
}

export interface ValidationResult {
  valid: boolean
  promotion: Promotion | null
  /** Calculated discount amount in smallest currency unit */
  discountAmount: number
  reason?: string
}

export class PromotionsClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Validate a promotion code and calculate the discount amount.
   * Does not apply the promotion — call commerce.cart.applyPromotion() for that.
   */
  async validate(params: ValidatePromotionParams): Promise<ValidationResult> {
    const { code, cartSubtotal, customerId } = params

    const { data: promo, error } = await this.supabase
      .from("promotions")
      .select("*, promotion_rules(*)")
      .eq("code", code.toUpperCase())
      .eq("status", "active")
      .is("deleted_at", null)
      .single()

    if (error || !promo) {
      return { valid: false, promotion: null, discountAmount: 0, reason: "Code not found or inactive" }
    }

    const p = promo as Record<string, unknown>
    const now = new Date()

    // Check date validity
    if (p["starts_at"] && new Date(p["starts_at"] as string) > now) {
      return { valid: false, promotion: null, discountAmount: 0, reason: "Promotion not yet active" }
    }

    if (p["ends_at"] && new Date(p["ends_at"] as string) < now) {
      return { valid: false, promotion: null, discountAmount: 0, reason: "Promotion has expired" }
    }

    // Check global usage limit
    if (
      p["usage_limit"] !== null &&
      (p["usage_count"] as number) >= (p["usage_limit"] as number)
    ) {
      return { valid: false, promotion: null, discountAmount: 0, reason: "Promotion usage limit reached" }
    }

    // Check per-customer usage limit
    if (customerId && p["usage_limit_per_customer"] !== null) {
      const { count } = await this.supabase
        .from("promotion_usages")
        .select("id", { count: "exact" })
        .eq("promotion_id", p["id"] as string)
        .eq("customer_id", customerId)

      if ((count ?? 0) >= (p["usage_limit_per_customer"] as number)) {
        return {
          valid: false,
          promotion: null,
          discountAmount: 0,
          reason: "You have already used this promotion",
        }
      }
    }

    // Check rules
    const rules = (p["promotion_rules"] as PromotionRule[]) ?? []

    for (const rule of rules) {
      if (rule.type === "cart_total") {
        const minTotal = parseInt(rule.value, 10)
        if (cartSubtotal < minTotal) {
          return {
            valid: false,
            promotion: null,
            discountAmount: 0,
            reason: `Minimum order amount not reached`,
          }
        }
      }
      // Add more rule types here as needed (product, category, customer_group)
    }

    // Calculate discount amount
    const promotion = this.mapPromotion(promo)
    let discountAmount = 0

    switch (promotion.type) {
      case "percentage":
        discountAmount = Math.round(cartSubtotal * (promotion.value / 100))
        break
      case "fixed_amount":
        discountAmount = Math.min(promotion.value, cartSubtotal)
        break
      case "free_shipping":
        // Shipping discount is calculated at checkout
        discountAmount = 0
        break
      case "buy_x_get_y":
        // TODO: implement buy-X-get-Y logic based on rules
        discountAmount = 0
        break
    }

    return { valid: true, promotion, discountAmount }
  }

  /**
   * List all currently active automatic promotions.
   * These are applied without a code when cart conditions are met.
   */
  async listAutomatic(): Promise<Promotion[]> {
    const now = new Date().toISOString()

    const { data, error } = await this.supabase
      .from("promotions")
      .select("*, promotion_rules(*)")
      .eq("status", "active")
      .eq("is_automatic", true)
      .is("deleted_at", null)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)

    if (error) throw new Error(`Failed to list promotions: ${error.message}`)

    return (data ?? []).map(this.mapPromotion)
  }

  // ─── Private mappers ────────────────────────────────────────────────────────

  private mapPromotion(raw: unknown): Promotion {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      code: r["code"] as string | null,
      type: r["type"] as PromotionType,
      status: r["status"] as string,
      value: r["value"] as number,
      usageLimit: r["usage_limit"] as number | null,
      usageCount: r["usage_count"] as number,
      usageLimitPerCustomer: r["usage_limit_per_customer"] as number | null,
      startsAt: r["starts_at"] as string | null,
      endsAt: r["ends_at"] as string | null,
      isAutomatic: r["is_automatic"] as boolean,
      rules: ((r["promotion_rules"] as unknown[]) ?? []).map((rule) => {
        const ru = rule as Record<string, unknown>
        return {
          id: ru["id"] as string,
          type: ru["type"] as string,
          value: ru["value"] as string,
          description: ru["description"] as string | null,
        } satisfies PromotionRule
      }),
    }
  }
}
