import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"

/**
 * inventory-reserve
 *
 * Creates a soft inventory hold before payment is captured. Useful for
 * high-demand products where two customers might try to buy the last unit
 * simultaneously.
 *
 * Uses the reserve_inventory Postgres function for atomic
 * check-and-decrement — no race conditions.
 *
 * Call this after the customer selects a shipping method but before
 * initiating payment. Release the reservation if payment fails or
 * the customer abandons checkout.
 *
 * Request body:
 *   {
 *     lineItems: Array<{
 *       lineItemId: string
 *       variantId: string
 *       quantity: number
 *     }>
 *     locationId?: string   // defaults to first active stock location
 *   }
 *
 * Response:
 *   {
 *     reservations: Array<{
 *       lineItemId: string
 *       reserved: boolean
 *       reason?: string       // only present if reserved = false
 *     }>
 *   }
 */

interface LineItemInput {
  lineItemId: string
  variantId: string
  quantity: number
}

interface ReserveBody {
  lineItems: LineItemInput[]
  locationId?: string
}

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req)
  if (preflight) return preflight

  try {
    const body: ReserveBody = await req.json()
    const { lineItems, locationId } = body

    if (!lineItems || lineItems.length === 0) {
      return errorResponse("lineItems is required and must not be empty", 400)
    }

    // ── 1. Resolve location ──────────────────────────────────────────────────
    let resolvedLocationId = locationId

    if (!resolvedLocationId) {
      const { data: location } = await supabaseAdmin
        .from("stock_locations")
        .select("id")
        .eq("is_active", true)
        .order("created_at")
        .limit(1)
        .single()

      if (!location) {
        return errorResponse("No active stock location found", 422)
      }

      resolvedLocationId = (location as { id: string }).id
    }

    // ── 2. Reserve each line item ────────────────────────────────────────────
    const results: Array<{ lineItemId: string; reserved: boolean; reason?: string }> = []

    for (const item of lineItems) {
      // Look up the inventory item for this variant
      const { data: invItem } = await supabaseAdmin
        .from("inventory_items")
        .select("id")
        .eq("variant_id", item.variantId)
        .is("deleted_at", null)
        .single()

      if (!invItem) {
        // No inventory item tracked — treat as always available
        results.push({ lineItemId: item.lineItemId, reserved: true })
        continue
      }

      const { data: reserved, error: rpcError } = await supabaseAdmin.rpc(
        "reserve_inventory",
        {
          p_inventory_item_id: (invItem as { id: string }).id,
          p_location_id: resolvedLocationId,
          p_line_item_id: item.lineItemId,
          p_quantity: item.quantity,
        }
      )

      if (rpcError) {
        console.error("reserve_inventory RPC error:", rpcError)
        results.push({
          lineItemId: item.lineItemId,
          reserved: false,
          reason: "Reservation failed — internal error",
        })
      } else if (!reserved) {
        results.push({
          lineItemId: item.lineItemId,
          reserved: false,
          reason: "Insufficient stock",
        })
      } else {
        results.push({ lineItemId: item.lineItemId, reserved: true })
      }
    }

    // ── 3. Check if all items were reserved ──────────────────────────────────
    const allReserved = results.every((r) => r.reserved)

    if (!allReserved) {
      // TODO: decide whether to release the successful reservations here
      // (strict all-or-nothing) or let the client handle partial failures.
      // Currently returns which items failed so the client can decide.
    }

    return jsonResponse({ reservations: results, allReserved })
  } catch (err) {
    console.error("inventory-reserve error:", err)
    return errorResponse("Internal server error", 500)
  }
})
