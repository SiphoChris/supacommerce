import type { AnySupabaseClient } from "../types.js"

export interface VariantPrice {
  variantId: string
  amount: number
  currencyCode: string
  regionId: string | null
  priceListId: string | null
  minQuantity: number | null
  maxQuantity: number | null
}

export interface GetVariantPriceParams {
  variantId: string
  regionId?: string
  currencyCode?: string
  quantity?: number
  customerId?: string
}

export class PricingClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

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
  async getVariantPrice(params: GetVariantPriceParams): Promise<VariantPrice | null> {
    const { variantId, regionId, currencyCode, quantity = 1 } = params

    // ── 1. Check for active price list prices ──────────────────────────────
    const now = new Date().toISOString()

    const { data: priceListPrices } = await this.supabase
      .from("price_list_prices")
      .select(`
        amount, currency_code, region_id, min_quantity, max_quantity, price_list_id,
        price_lists!inner(id, type, status, starts_at, ends_at)
      `)
      .eq("variant_id", variantId)
      .eq("price_lists.status", "active")
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)

    const validListPrices = (priceListPrices ?? []).filter((p) => {
      const pp = p as Record<string, unknown>
      if (regionId && pp["region_id"] && pp["region_id"] !== regionId) return false
      if (currencyCode && pp["currency_code"] !== currencyCode) return false
      if (pp["min_quantity"] !== null && (pp["min_quantity"] as number) > quantity) return false
      if (pp["max_quantity"] !== null && (pp["max_quantity"] as number) < quantity) return false
      return true
    })

    if (validListPrices.length > 0) {
      // Pick lowest amount (best deal for customer)
      const best = validListPrices.reduce((min, p) => {
        const pRec = p as Record<string, unknown>
        const minRec = min as Record<string, unknown>
        return (pRec["amount"] as number) < (minRec["amount"] as number) ? p : min
      })

      const b = best as Record<string, unknown>
      return {
        variantId,
        amount: b["amount"] as number,
        currencyCode: b["currency_code"] as string,
        regionId: b["region_id"] as string | null,
        priceListId: b["price_list_id"] as string | null,
        minQuantity: b["min_quantity"] as number | null,
        maxQuantity: b["max_quantity"] as number | null,
      }
    }

    // ── 2. Get regular prices from price set ───────────────────────────────
    const { data: priceSet } = await this.supabase
      .from("price_sets")
      .select(`
        id,
        prices(amount, currency_code, region_id, min_quantity, max_quantity)
      `)
      .eq("variant_id", variantId)
      .single()

    if (!priceSet) return null

    const ps = priceSet as unknown as {
      id: string
      prices: Array<{
        amount: number
        currency_code: string
        region_id: string | null
        min_quantity: number | null
        max_quantity: number | null
      }>
    }

    // Filter to matching prices and pick the most specific one
    const candidates = ps.prices.filter((p) => {
      if (p.min_quantity !== null && p.min_quantity > quantity) return false
      if (p.max_quantity !== null && p.max_quantity < quantity) return false
      return true
    })

    // Prefer region + currency match > region match > currency match
    const regionAndCurrency = candidates.find(
      (p) => p.region_id === regionId && p.currency_code === currencyCode
    )
    if (regionAndCurrency) {
      return {
        variantId,
        amount: regionAndCurrency.amount,
        currencyCode: regionAndCurrency.currency_code,
        regionId: regionAndCurrency.region_id,
        priceListId: null,
        minQuantity: regionAndCurrency.min_quantity,
        maxQuantity: regionAndCurrency.max_quantity,
      }
    }

    const regionOnly = candidates.find((p) => p.region_id === regionId)
    if (regionOnly) {
      return {
        variantId,
        amount: regionOnly.amount,
        currencyCode: regionOnly.currency_code,
        regionId: regionOnly.region_id,
        priceListId: null,
        minQuantity: regionOnly.min_quantity,
        maxQuantity: regionOnly.max_quantity,
      }
    }

    const currencyOnly = candidates.find((p) => p.currency_code === currencyCode)
    if (currencyOnly) {
      return {
        variantId,
        amount: currencyOnly.amount,
        currencyCode: currencyOnly.currency_code,
        regionId: currencyOnly.region_id,
        priceListId: null,
        minQuantity: currencyOnly.min_quantity,
        maxQuantity: currencyOnly.max_quantity,
      }
    }

    // Fallback: first available price
    const fallback = candidates[0]
    if (!fallback) return null

    return {
      variantId,
      amount: fallback.amount,
      currencyCode: fallback.currency_code,
      regionId: fallback.region_id,
      priceListId: null,
      minQuantity: fallback.min_quantity,
      maxQuantity: fallback.max_quantity,
    }
  }

  /**
   * Get prices for multiple variants at once.
   * Returns a map of variantId → VariantPrice | null.
   */
  async getBulkVariantPrices(
    variantIds: string[],
    params: Omit<GetVariantPriceParams, "variantId">
  ): Promise<Map<string, VariantPrice | null>> {
    const result = new Map<string, VariantPrice | null>()

    await Promise.all(
      variantIds.map(async (variantId) => {
        const price = await this.getVariantPrice({ variantId, ...params })
        result.set(variantId, price)
      })
    )

    return result
  }
}
