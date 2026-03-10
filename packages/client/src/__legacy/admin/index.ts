import type { AnySupabaseClient, AdminRole } from "../types.js"
import { NotFoundError, ForbiddenError, buildPaginatedResult } from "@supacommerce/utils"
import type { PaginationParams, PaginatedResult } from "@supacommerce/utils"

export interface AdminUser {
  id: string
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  role: AdminRole
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAdminInput {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  role?: AdminRole
}

export interface UpdateAdminInput {
  firstName?: string
  lastName?: string
  role?: AdminRole
  isActive?: boolean
}

export class AdminClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * Get the current admin user's record.
   * Throws ForbiddenError if the authenticated user is not an admin.
   */
  async me(): Promise<AdminUser> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) throw new ForbiddenError("Not authenticated")

    const { data, error } = await this.supabase
      .from("admin_users")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .single()

    if (error || !data) throw new ForbiddenError("Not an admin user")

    return this.mapAdmin(data)
  }

  /** List all admin users. Requires admin access (enforced by RLS). */
  async list(params: PaginationParams = {}): Promise<PaginatedResult<AdminUser>> {
    const { limit = 20, offset = 0 } = params

    const { data, error, count } = await this.supabase
      .from("admin_users")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Failed to list admin users: ${error.message}`)

    return buildPaginatedResult((data ?? []).map(this.mapAdmin), count ?? 0, params)
  }

  /** Get a single admin user by ID. */
  async get(adminId: string): Promise<AdminUser> {
    const { data, error } = await this.supabase
      .from("admin_users")
      .select("*")
      .eq("id", adminId)
      .is("deleted_at", null)
      .single()

    if (error || !data) throw new NotFoundError("AdminUser", adminId)

    return this.mapAdmin(data)
  }

  /** Create a new admin user. Requires super_admin or admin role. */
  async create(input: CreateAdminInput): Promise<AdminUser> {
    const { data, error } = await this.supabase
      .from("admin_users")
      .insert({
        user_id: input.userId,
        email: input.email,
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        role: input.role ?? "viewer",
        is_active: true,
      })
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to create admin user: ${error?.message ?? "unknown"}`)

    return this.mapAdmin(data)
  }

  /** Update an admin user's role or status. */
  async update(adminId: string, input: UpdateAdminInput): Promise<AdminUser> {
    const { data, error } = await this.supabase
      .from("admin_users")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        role: input.role,
        is_active: input.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", adminId)
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to update admin user: ${error?.message ?? "unknown"}`)

    return this.mapAdmin(data)
  }

  /** Soft-delete an admin user. */
  async deactivate(adminId: string): Promise<void> {
    const { error } = await this.supabase
      .from("admin_users")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", adminId)

    if (error) throw new Error(`Failed to deactivate admin user: ${error.message}`)
  }

  /** Record last login timestamp for the current admin. */
  async recordLogin(): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) return

    await this.supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
  }

  private mapAdmin(raw: unknown): AdminUser {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      userId: r["user_id"] as string,
      email: r["email"] as string,
      firstName: r["first_name"] as string | null,
      lastName: r["last_name"] as string | null,
      avatarUrl: r["avatar_url"] as string | null,
      role: r["role"] as AdminRole,
      isActive: r["is_active"] as boolean,
      lastLoginAt: r["last_login_at"] as string | null,
      createdAt: r["created_at"] as string,
      updatedAt: r["updated_at"] as string,
    }
  }
}
