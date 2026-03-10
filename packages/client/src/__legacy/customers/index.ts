import type { AnySupabaseClient } from "../types.js"
import { NotFoundError, ValidationError } from "@supacommerce/utils"

export interface CustomerAddress {
  id: string
  customerId: string
  firstName: string | null
  lastName: string | null
  company: string | null
  address1: string
  address2: string | null
  city: string
  province: string | null
  postalCode: string | null
  countryCode: string
  phone: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  userId: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  avatarUrl: string | null
  isAnonymous: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
  metadata?: Record<string, unknown>
}

export interface AddAddressInput {
  firstName?: string
  lastName?: string
  company?: string
  address1: string
  address2?: string
  city: string
  province?: string
  postalCode?: string
  countryCode: string
  phone?: string
  isDefault?: boolean
}

export class CustomersClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Get the current authenticated customer's profile.
   */
  async me(): Promise<Customer> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) throw new ValidationError("Not authenticated")

    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error || !data) throw new NotFoundError("Customer profile")

    return this.mapCustomer(data)
  }

  /**
   * Update the current customer's profile.
   */
  async updateProfile(input: UpdateProfileInput): Promise<Customer> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) throw new ValidationError("Not authenticated")

    const { data, error } = await this.supabase
      .from("customers")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        avatar_url: input.avatarUrl,
        metadata: input.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to update profile: ${error?.message ?? "unknown"}`)

    return this.mapCustomer(data)
  }

  /**
   * List the current customer's saved addresses.
   */
  async listAddresses(): Promise<CustomerAddress[]> {
    const customer = await this.me()

    const { data, error } = await this.supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", customer.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to list addresses: ${error.message}`)

    return (data ?? []).map(this.mapAddress)
  }

  /**
   * Add a new address to the customer's account.
   */
  async addAddress(input: AddAddressInput): Promise<CustomerAddress> {
    const customer = await this.me()

    // If this is the default address, unset any existing default
    if (input.isDefault) {
      await this.supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", customer.id)
        .eq("is_default", true)
    }

    const { data, error } = await this.supabase
      .from("customer_addresses")
      .insert({
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
        is_default: input.isDefault ?? false,
      })
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to add address: ${error?.message ?? "unknown"}`)

    return this.mapAddress(data)
  }

  /**
   * Update a saved address.
   */
  async updateAddress(addressId: string, input: Partial<AddAddressInput>): Promise<CustomerAddress> {
    const customer = await this.me()

    if (input.isDefault) {
      await this.supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", customer.id)
        .eq("is_default", true)
    }

    const { data, error } = await this.supabase
      .from("customer_addresses")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", addressId)
      .eq("customer_id", customer.id)
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to update address: ${error?.message ?? "unknown"}`)

    return this.mapAddress(data)
  }

  /**
   * Delete a saved address.
   */
  async deleteAddress(addressId: string): Promise<void> {
    const customer = await this.me()

    const { error } = await this.supabase
      .from("customer_addresses")
      .delete()
      .eq("id", addressId)
      .eq("customer_id", customer.id)

    if (error) throw new Error(`Failed to delete address: ${error.message}`)
  }

  // ─── Private mappers ────────────────────────────────────────────────────────

  private mapCustomer(raw: unknown): Customer {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      userId: r["user_id"] as string | null,
      email: r["email"] as string | null,
      firstName: r["first_name"] as string | null,
      lastName: r["last_name"] as string | null,
      phone: r["phone"] as string | null,
      avatarUrl: r["avatar_url"] as string | null,
      isAnonymous: r["is_anonymous"] as boolean,
      metadata: r["metadata"] as Record<string, unknown> | null,
      createdAt: r["created_at"] as string,
      updatedAt: r["updated_at"] as string,
    }
  }

  private mapAddress(raw: unknown): CustomerAddress {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      customerId: r["customer_id"] as string,
      firstName: r["first_name"] as string | null,
      lastName: r["last_name"] as string | null,
      company: r["company"] as string | null,
      address1: r["address_1"] as string,
      address2: r["address_2"] as string | null,
      city: r["city"] as string,
      province: r["province"] as string | null,
      postalCode: r["postal_code"] as string | null,
      countryCode: r["country_code"] as string,
      phone: r["phone"] as string | null,
      isDefault: r["is_default"] as boolean,
      createdAt: r["created_at"] as string,
      updatedAt: r["updated_at"] as string,
    }
  }
}
