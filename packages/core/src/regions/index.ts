import type { AnySupabaseClient } from "../types.js"
import { NotFoundError } from "@supacommerce/utils"

// ─── Regions ──────────────────────────────────────────────────────────────────

export interface Country {
  id: string
  iso2: string
  iso3: string | null
  name: string
  displayName: string | null
}

export interface Region {
  id: string
  name: string
  currencyCode: string
  taxRate: string
  taxIncluded: boolean
  isActive: boolean
  countries: Country[]
}

export class RegionsClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  async list(): Promise<Region[]> {
    const { data, error } = await this.supabase
      .from("regions")
      .select("*, countries(*)")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name")

    if (error) throw new Error(`Failed to list regions: ${error.message}`)
    return (data ?? []).map(this.mapRegion)
  }

  async get(regionId: string): Promise<Region> {
    const { data, error } = await this.supabase
      .from("regions")
      .select("*, countries(*)")
      .eq("id", regionId)
      .single()

    if (error || !data) throw new NotFoundError("Region", regionId)
    return this.mapRegion(data)
  }

  /** Find the region that includes a given ISO 2 country code. */
  async getByCountry(countryCode: string): Promise<Region | null> {
    const { data: country } = await this.supabase
      .from("countries")
      .select("region_id")
      .eq("iso2", countryCode.toUpperCase())
      .single()

    if (!country) return null

    const regionId = (country as { region_id: string }).region_id
    return this.get(regionId)
  }

  private mapRegion(raw: unknown): Region {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      name: r["name"] as string,
      currencyCode: r["currency_code"] as string,
      taxRate: r["tax_rate"] as string,
      taxIncluded: r["tax_included"] as boolean,
      isActive: r["is_active"] as boolean,
      countries: ((r["countries"] as unknown[]) ?? []).map((c) => {
        const co = c as Record<string, unknown>
        return {
          id: co["id"] as string,
          iso2: co["iso2"] as string,
          iso3: co["iso3"] as string | null,
          name: co["name"] as string,
          displayName: co["display_name"] as string | null,
        } satisfies Country
      }),
    }
  }
}
