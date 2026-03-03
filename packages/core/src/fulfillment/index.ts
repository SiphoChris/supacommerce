import type { AnySupabaseClient } from "../types.js"
import { NotFoundError } from "@supacommerce/utils"

export interface ShippingOption {
  id: string
  name: string
  regionId: string
  providerId: string | null
  type: string
  amount: number
  isActive: boolean
  data: Record<string, unknown> | null
}

export interface ListShippingOptionsParams {
  regionId?: string
  cartSubtotal?: number
}

export class FulfillmentClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * List available shipping options for a region.
   * Optionally filters by cart subtotal to exclude options with unmet requirements.
   */
  async listShippingOptions(params: ListShippingOptionsParams = {}): Promise<ShippingOption[]> {
    const { regionId, cartSubtotal } = params

    let query = this.supabase
      .from("shipping_options")
      .select("*, shipping_option_requirements(*)")
      .eq("is_active", true)
      .eq("is_return", false)
      .is("deleted_at", null)

    if (regionId) query = query.eq("region_id", regionId)

    const { data, error } = await query

    if (error) throw new Error(`Failed to list shipping options: ${error.message}`)

    let options = data ?? []

    // Filter by cart subtotal requirements if provided
    if (cartSubtotal !== undefined) {
      options = options.filter((opt) => {
        const reqs = (
          opt as unknown as {
            shipping_option_requirements: Array<{ type: string; amount: number }>
          }
        ).shipping_option_requirements ?? []

        for (const req of reqs) {
          if (req.type === "min_subtotal" && cartSubtotal < req.amount) return false
          if (req.type === "max_subtotal" && cartSubtotal > req.amount) return false
        }
        return true
      })
    }

    return options.map(this.mapOption)
  }

  async getShippingOption(optionId: string): Promise<ShippingOption> {
    const { data, error } = await this.supabase
      .from("shipping_options")
      .select("*")
      .eq("id", optionId)
      .single()

    if (error || !data) throw new NotFoundError("ShippingOption", optionId)
    return this.mapOption(data)
  }

  private mapOption(raw: unknown): ShippingOption {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      name: r["name"] as string,
      regionId: r["region_id"] as string,
      providerId: r["provider_id"] as string | null,
      type: r["type"] as string,
      amount: r["amount"] as number,
      isActive: r["is_active"] as boolean,
      data: r["data"] as Record<string, unknown> | null,
    }
  }
}
