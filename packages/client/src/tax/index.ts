import type { AnySupabaseClient } from "../types.js"

export interface TaxRate {
  id: string
  name: string
  code: string | null
  rate: number
  isDefault: boolean
}

export interface TaxRegion {
  id: string
  countryCode: string
  provinceCode: string | null
  name: string
  rates: TaxRate[]
}

export interface CalculateTaxParams {
  subtotal: number
  countryCode: string
  provinceCode?: string
  regionId?: string
}

export interface TaxCalculation {
  taxable: number
  rate: number
  taxTotal: number
  taxRegion: TaxRegion | null
}

export class TaxClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Calculate tax for a given subtotal and location.
   * Uses the tax_regions / tax_rates tables.
   *
   * For production, consider using a dedicated tax provider
   * (TaxJar, Avalara, Stripe Tax) via the cart-checkout edge function.
   */
  async calculate(params: CalculateTaxParams): Promise<TaxCalculation> {
    const { subtotal, countryCode, provinceCode } = params

    const { data: taxRegions } = await this.supabase
      .from("tax_regions")
      .select("*, tax_rates(*)")
      .eq("country_code", countryCode.toUpperCase())
      .is("deleted_at", null)

    if (!taxRegions || taxRegions.length === 0) {
      return { taxable: subtotal, rate: 0, taxTotal: 0, taxRegion: null }
    }

    // Prefer province-specific match, fallback to country-level (province_code IS NULL)
    let matchedRegion = taxRegions.find(
      (r) =>
        (r as Record<string, unknown>)["province_code"] ===
        (provinceCode?.toUpperCase() ?? null)
    )

    if (!matchedRegion) {
      matchedRegion = taxRegions.find(
        (r) => (r as Record<string, unknown>)["province_code"] === null
      )
    }

    if (!matchedRegion) {
      return { taxable: subtotal, rate: 0, taxTotal: 0, taxRegion: null }
    }

    const mr = matchedRegion as Record<string, unknown>
    const rates = (mr["tax_rates"] as Array<Record<string, unknown>>) ?? []
    const defaultRate = rates.find((r) => r["is_default"]) ?? rates[0]

    if (!defaultRate) {
      return { taxable: subtotal, rate: 0, taxTotal: 0, taxRegion: null }
    }

    const rate = defaultRate["rate"] as number
    const taxTotal = Math.round(subtotal * rate)

    const taxRegion: TaxRegion = {
      id: mr["id"] as string,
      countryCode: mr["country_code"] as string,
      provinceCode: mr["province_code"] as string | null,
      name: mr["name"] as string,
      rates: rates.map((r) => ({
        id: r["id"] as string,
        name: r["name"] as string,
        code: r["code"] as string | null,
        rate: r["rate"] as number,
        isDefault: r["is_default"] as boolean,
      })),
    }

    return { taxable: subtotal, rate, taxTotal, taxRegion }
  }

  /** Get all tax regions with their rates. */
  async listTaxRegions(countryCode?: string): Promise<TaxRegion[]> {
    let query = this.supabase
      .from("tax_regions")
      .select("*, tax_rates(*)")
      .is("deleted_at", null)

    if (countryCode) query = query.eq("country_code", countryCode.toUpperCase())

    const { data, error } = await query

    if (error) throw new Error(`Failed to list tax regions: ${error.message}`)

    return (data ?? []).map((r) => {
      const raw = r as Record<string, unknown>
      return {
        id: raw["id"] as string,
        countryCode: raw["country_code"] as string,
        provinceCode: raw["province_code"] as string | null,
        name: raw["name"] as string,
        rates: ((raw["tax_rates"] as unknown[]) ?? []).map((rate) => {
          const rt = rate as Record<string, unknown>
          return {
            id: rt["id"] as string,
            name: rt["name"] as string,
            code: rt["code"] as string | null,
            rate: rt["rate"] as number,
            isDefault: rt["is_default"] as boolean,
          } satisfies TaxRate
        }),
      } satisfies TaxRegion
    })
  }
}
