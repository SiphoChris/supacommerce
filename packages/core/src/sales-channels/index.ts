import type { AnySupabaseClient } from "../types.js"
import { NotFoundError } from "@supacommerce/utils"

export interface SalesChannel {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

export class SalesChannelsClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /** List all active sales channels. */
  async list(): Promise<SalesChannel[]> {
    const { data, error } = await this.supabase
      .from("sales_channels")
      .select("*")
      .eq("is_disabled", false)
      .is("deleted_at", null)
      .order("is_default", { ascending: false })
      .order("name")

    if (error) throw new Error(`Failed to list sales channels: ${error.message}`)

    return (data ?? []).map(this.mapChannel)
  }

  /** Get the default sales channel. */
  async getDefault(): Promise<SalesChannel | null> {
    const { data } = await this.supabase
      .from("sales_channels")
      .select("*")
      .eq("is_default", true)
      .eq("is_disabled", false)
      .is("deleted_at", null)
      .single()

    return data ? this.mapChannel(data) : null
  }

  async get(channelId: string): Promise<SalesChannel> {
    const { data, error } = await this.supabase
      .from("sales_channels")
      .select("*")
      .eq("id", channelId)
      .is("deleted_at", null)
      .single()

    if (error || !data) throw new NotFoundError("SalesChannel", channelId)

    return this.mapChannel(data)
  }

  private mapChannel(raw: unknown): SalesChannel {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      name: r["name"] as string,
      description: r["description"] as string | null,
      isDefault: r["is_default"] as boolean,
      isDisabled: r["is_disabled"] as boolean,
      createdAt: r["created_at"] as string,
      updatedAt: r["updated_at"] as string,
    }
  }
}
