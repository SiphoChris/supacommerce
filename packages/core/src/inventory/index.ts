import type { AnySupabaseClient } from "../types.js"


export interface InventoryLevel {
  locationId: string
  locationName: string
  stockedQuantity: number
  reservedQuantity: number
  quantityAvailable: number
}

export interface InventoryAvailability {
  variantId: string
  inventoryItemId: string | null
  totalAvailable: number
  isAvailable: boolean
  levels: InventoryLevel[]
}

export class InventoryClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Get total available stock for a variant across all locations.
   */
  async getTotalAvailable(variantId: string): Promise<number> {
    const { data: invItem } = await this.supabase
      .from("inventory_items")
      .select("id, inventory_levels(quantity_available)")
      .eq("variant_id", variantId)
      .is("deleted_at", null)
      .single()

    if (!invItem) return 0

    const levels = (
      invItem as unknown as { inventory_levels: Array<{ quantity_available: number }> }
    ).inventory_levels ?? []

    return levels.reduce((sum, l) => sum + l.quantity_available, 0)
  }

  /**
   * Get full availability details for a variant, including per-location breakdown.
   */
  async getAvailability(variantId: string): Promise<InventoryAvailability> {
    const { data: invItem } = await this.supabase
      .from("inventory_items")
      .select(`
        id,
        inventory_levels(
          location_id,
          stocked_quantity,
          reserved_quantity,
          quantity_available,
          stock_locations(id, name)
        )
      `)
      .eq("variant_id", variantId)
      .is("deleted_at", null)
      .single()

    if (!invItem) {
      return {
        variantId,
        inventoryItemId: null,
        totalAvailable: 0,
        isAvailable: false,
        levels: [],
      }
    }

    const item = invItem as unknown as {
      id: string
      inventory_levels: Array<{
        location_id: string
        stocked_quantity: number
        reserved_quantity: number
        quantity_available: number
        stock_locations: { id: string; name: string }
      }>
    }

    const levels: InventoryLevel[] = (item.inventory_levels ?? []).map((l) => ({
      locationId: l.location_id,
      locationName: l.stock_locations?.name ?? "Unknown",
      stockedQuantity: l.stocked_quantity,
      reservedQuantity: l.reserved_quantity,
      quantityAvailable: l.quantity_available,
    }))

    const totalAvailable = levels.reduce((sum, l) => sum + l.quantityAvailable, 0)

    return {
      variantId,
      inventoryItemId: item.id,
      totalAvailable,
      isAvailable: totalAvailable > 0,
      levels,
    }
  }

  /**
   * Check availability for multiple variants at once.
   * More efficient than calling getAvailability in a loop.
   */
  async getBulkAvailability(variantIds: string[]): Promise<Map<string, number>> {
    const { data } = await this.supabase
      .from("inventory_items")
      .select("variant_id, inventory_levels(quantity_available)")
      .in("variant_id", variantIds)
      .is("deleted_at", null)

    const result = new Map<string, number>()

    // Initialise all to 0
    for (const id of variantIds) result.set(id, 0)

    for (const item of data ?? []) {
      const i = item as unknown as {
        variant_id: string
        inventory_levels: Array<{ quantity_available: number }>
      }
      if (!i.variant_id) continue
      const total = (i.inventory_levels ?? []).reduce((s, l) => s + l.quantity_available, 0)
      result.set(i.variant_id, total)
    }

    return result
  }
}
