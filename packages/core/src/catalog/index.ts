import type { AnySupabaseClient, ProductStatus } from "../types.js"
import { buildPaginatedResult, NotFoundError } from "@supacommerce/utils"
import type { PaginationParams, PaginatedResult } from "@supacommerce/utils"

export interface ProductOptionValue {
  id: string
  optionId: string
  value: string
  rank: number
}

export interface ProductOption {
  id: string
  productId: string
  title: string
  rank: number
  values: ProductOptionValue[]
}

export interface ProductVariant {
  id: string
  productId: string
  title: string
  sku: string | null
  barcode: string | null
  weight: number | null
  allowBackorder: boolean
  manageInventory: boolean
  rank: number
  metadata: Record<string, unknown> | null
  optionValues: ProductOptionValue[]
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  alt: string | null
  rank: number
}

export interface Product {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string
  status: ProductStatus
  thumbnail: string | null
  isGiftcard: boolean
  discountable: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  variants: ProductVariant[]
  options: ProductOption[]
  images: ProductImage[]
}

export interface ProductCategory {
  id: string
  name: string
  handle: string
  description: string | null
  parentId: string | null
  rank: number
  isActive: boolean
}

export interface ProductCollection {
  id: string
  title: string
  handle: string
  metadata: Record<string, unknown> | null
}

export interface ListProductsParams extends PaginationParams {
  status?: ProductStatus
  categoryId?: string
  collectionId?: string
  tagIds?: string[]
  salesChannelId?: string
  search?: string
}

export class CatalogClient {
  constructor(private readonly supabase: AnySupabaseClient) {}

  /**
   * List products. Defaults to published only (respects RLS).
   */
  async listProducts(params: ListProductsParams = {}): Promise<PaginatedResult<Product>> {
    const { limit = 20, offset = 0, status, categoryId, collectionId, search } = params

    let query = this.supabase
      .from("products")
      .select(
        `
        *,
        product_variants(
          *,
          product_variant_option_values(
            option_value_id,
            product_option_values(id, option_id, value, rank)
          )
        ),
        product_options(*, product_option_values(*)),
        product_images(*)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq("status", status)
    if (search) query = query.ilike("title", `%${search}%`)

    // Supabase's .in() does not accept a subquery builder — fetch IDs first.
    if (categoryId) {
      const { data: rows } = await this.supabase
        .from("product_category_products")
        .select("product_id")
        .eq("category_id", categoryId)
      const ids = (rows ?? []).map((r: Record<string, unknown>) => r["product_id"] as string)
      query = query.in("id", ids.length ? ids : [""])
    }

    if (collectionId) {
      const { data: rows } = await this.supabase
        .from("product_collection_products")
        .select("product_id")
        .eq("collection_id", collectionId)
      const ids = (rows ?? []).map((r: Record<string, unknown>) => r["product_id"] as string)
      query = query.in("id", ids.length ? ids : [""])
    }

    if (params.salesChannelId) {
      const { data: rows } = await this.supabase
        .from("sales_channel_products")
        .select("product_id")
        .eq("sales_channel_id", params.salesChannelId)
      const ids = (rows ?? []).map((r: Record<string, unknown>) => r["product_id"] as string)
      query = query.in("id", ids.length ? ids : [""])
    }

    const { data, error, count } = await query

    if (error) throw new Error(`Failed to list products: ${error.message}`)

    return buildPaginatedResult(
      (data ?? []).map(this.mapProduct),
      count ?? 0,
      params
    )
  }

  /**
   * Get a single product by ID.
   */
  async getProduct(productId: string): Promise<Product> {
    const { data, error } = await this.supabase
      .from("products")
      .select(`
        *,
        product_variants(
          *,
          product_variant_option_values(
            option_value_id,
            product_option_values(id, option_id, value, rank)
          )
        ),
        product_options(*, product_option_values(*)),
        product_images(*)
      `)
      .eq("id", productId)
      .is("deleted_at", null)
      .single()

    if (error || !data) throw new NotFoundError("Product", productId)

    return this.mapProduct(data)
  }

  /**
   * Get a single product by handle (URL slug).
   */
  async getProductByHandle(handle: string): Promise<Product> {
    const { data, error } = await this.supabase
      .from("products")
      .select(`
        *,
        product_variants(
          *,
          product_variant_option_values(
            option_value_id,
            product_option_values(id, option_id, value, rank)
          )
        ),
        product_options(*, product_option_values(*)),
        product_images(*)
      `)
      .eq("handle", handle)
      .is("deleted_at", null)
      .single()

    if (error || !data) throw new NotFoundError("Product")

    return this.mapProduct(data)
  }

  /**
   * Get a single variant by ID.
   */
  async getVariant(variantId: string): Promise<ProductVariant> {
    const { data, error } = await this.supabase
      .from("product_variants")
      .select(`
        *,
        product_variant_option_values(
          option_value_id,
          product_option_values(id, option_id, value, rank)
        )
      `)
      .eq("id", variantId)
      .is("deleted_at", null)
      .single()

    if (error || !data) throw new NotFoundError("ProductVariant", variantId)

    return this.mapVariant(data)
  }

  /**
   * List categories.
   */
  async listCategories(parentId?: string): Promise<ProductCategory[]> {
    let query = this.supabase
      .from("product_categories")
      .select("*")
      .eq("is_active", true)
      .order("rank")

    if (parentId !== undefined) {
      query = parentId
        ? query.eq("parent_id", parentId)
        : query.is("parent_id", null)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to list categories: ${error.message}`)

    return (data ?? []).map(this.mapCategory)
  }

  /**
   * List collections.
   */
  async listCollections(params: PaginationParams = {}): Promise<PaginatedResult<ProductCollection>> {
    const { limit = 20, offset = 0 } = params

    const { data, error, count } = await this.supabase
      .from("product_collections")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Failed to list collections: ${error.message}`)

    return buildPaginatedResult((data ?? []).map(this.mapCollection), count ?? 0, params)
  }

  // ─── Private mappers ────────────────────────────────────────────────────────

  private mapProduct(raw: unknown): Product {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      title: r["title"] as string,
      subtitle: r["subtitle"] as string | null,
      description: r["description"] as string | null,
      handle: r["handle"] as string,
      status: r["status"] as ProductStatus,
      thumbnail: r["thumbnail"] as string | null,
      isGiftcard: r["is_giftcard"] as boolean,
      discountable: r["discountable"] as boolean,
      metadata: r["metadata"] as Record<string, unknown> | null,
      createdAt: r["created_at"] as string,
      updatedAt: r["updated_at"] as string,
      variants: ((r["product_variants"] as unknown[]) ?? []).map(
        (v) => ({
          id: (v as Record<string, unknown>)["id"] as string,
          productId: (v as Record<string, unknown>)["product_id"] as string,
          title: (v as Record<string, unknown>)["title"] as string,
          sku: (v as Record<string, unknown>)["sku"] as string | null,
          barcode: (v as Record<string, unknown>)["barcode"] as string | null,
          weight: (v as Record<string, unknown>)["weight"] as number | null,
          allowBackorder: (v as Record<string, unknown>)["allow_backorder"] as boolean,
          manageInventory: (v as Record<string, unknown>)["manage_inventory"] as boolean,
          rank: (v as Record<string, unknown>)["rank"] as number,
          metadata: (v as Record<string, unknown>)["metadata"] as Record<string, unknown> | null,
          optionValues: (
            (v as Record<string, unknown>)["product_variant_option_values"] as unknown[]
          )?.map((ov) => {
            const o = (ov as Record<string, unknown>)["product_option_values"] as Record<string, unknown>
            return {
              id: o["id"] as string,
              optionId: o["option_id"] as string,
              value: o["value"] as string,
              rank: o["rank"] as number,
            }
          }) ?? [],
        } satisfies ProductVariant)
      ),
      options: ((r["product_options"] as unknown[]) ?? []).map((o) => {
        const opt = o as Record<string, unknown>
        return {
          id: opt["id"] as string,
          productId: opt["product_id"] as string,
          title: opt["title"] as string,
          rank: opt["rank"] as number,
          values: ((opt["product_option_values"] as unknown[]) ?? []).map((v) => {
            const val = v as Record<string, unknown>
            return {
              id: val["id"] as string,
              optionId: val["option_id"] as string,
              value: val["value"] as string,
              rank: val["rank"] as number,
            } satisfies ProductOptionValue
          }),
        } satisfies ProductOption
      }),
      images: ((r["product_images"] as unknown[]) ?? [])
        .map((i) => {
          const img = i as Record<string, unknown>
          return {
            id: img["id"] as string,
            productId: img["product_id"] as string,
            url: img["url"] as string,
            alt: img["alt"] as string | null,
            rank: img["rank"] as number,
          } satisfies ProductImage
        })
        .sort((a, b) => a.rank - b.rank),
    }
  }

  private mapVariant(raw: unknown): ProductVariant {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      productId: r["product_id"] as string,
      title: r["title"] as string,
      sku: r["sku"] as string | null,
      barcode: r["barcode"] as string | null,
      weight: r["weight"] as number | null,
      allowBackorder: r["allow_backorder"] as boolean,
      manageInventory: r["manage_inventory"] as boolean,
      rank: r["rank"] as number,
      metadata: r["metadata"] as Record<string, unknown> | null,
      optionValues: (
        (r["product_variant_option_values"] as unknown[]) ?? []
      ).map((ov) => {
        const o = (ov as Record<string, unknown>)["product_option_values"] as Record<string, unknown>
        return {
          id: o["id"] as string,
          optionId: o["option_id"] as string,
          value: o["value"] as string,
          rank: o["rank"] as number,
        }
      }),
    }
  }

  private mapCategory(raw: unknown): ProductCategory {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      name: r["name"] as string,
      handle: r["handle"] as string,
      description: r["description"] as string | null,
      parentId: r["parent_id"] as string | null,
      rank: r["rank"] as number,
      isActive: r["is_active"] as boolean,
    }
  }

  private mapCollection(raw: unknown): ProductCollection {
    const r = raw as Record<string, unknown>
    return {
      id: r["id"] as string,
      title: r["title"] as string,
      handle: r["handle"] as string,
      metadata: r["metadata"] as Record<string, unknown> | null,
    }
  }
}
