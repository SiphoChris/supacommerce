-- =============================================================================
-- supacommerce — Row Level Security Policies
-- =============================================================================
--
-- Apply these policies to your Supabase project after running your migrations.
--
-- How to apply:
--   Option A: Copy into a new migration file and run `supabase db push`
--   Option B: Paste directly into the Supabase SQL Editor
--
-- These are sensible defaults. Read, understand, and adjust them to fit
-- your specific access requirements. Delete any policies you don't need.
--
-- Convention:
--   - Customers access their own data via auth.uid()
--   - Admins are identified by the is_admin() helper function below
--   - Public read is granted where appropriate (products, categories, etc.)
--   - All write operations require authentication
--   - Admins and customers are completely separate personas — an admin signup
--     does NOT create a customers row
-- =============================================================================


-- =============================================================================
-- Drop all existing policies before re-applying (idempotent)
-- =============================================================================

drop policy if exists "currencies_public_read" on public.currencies;
drop policy if exists "currencies_admin_write" on public.currencies;
drop policy if exists "regions_public_read" on public.regions;
drop policy if exists "regions_admin_write" on public.regions;
drop policy if exists "countries_public_read" on public.countries;
drop policy if exists "countries_admin_write" on public.countries;
drop policy if exists "customers_select_own" on public.customers;
drop policy if exists "customers_insert_own" on public.customers;
drop policy if exists "customers_update_own" on public.customers;
drop policy if exists "customer_groups_public_read" on public.customer_groups;
drop policy if exists "customer_groups_admin_write" on public.customer_groups;
drop policy if exists "customer_addresses_select_own" on public.customer_addresses;
drop policy if exists "customer_addresses_insert_own" on public.customer_addresses;
drop policy if exists "customer_addresses_update_own" on public.customer_addresses;
drop policy if exists "customer_addresses_delete_own" on public.customer_addresses;
drop policy if exists "products_public_read" on public.products;
drop policy if exists "products_admin_write" on public.products;
drop policy if exists "product_variants_public_read" on public.product_variants;
drop policy if exists "product_variants_admin_write" on public.product_variants;
drop policy if exists "product_categories_public_read" on public.product_categories;
drop policy if exists "product_categories_admin_write" on public.product_categories;
drop policy if exists "product_category_products_public_read" on public.product_category_products;
drop policy if exists "product_category_products_admin_write" on public.product_category_products;
drop policy if exists "product_collections_public_read" on public.product_collections;
drop policy if exists "product_collections_admin_write" on public.product_collections;
drop policy if exists "product_collection_products_public_read" on public.product_collection_products;
drop policy if exists "product_collection_products_admin_write" on public.product_collection_products;
drop policy if exists "product_tags_public_read" on public.product_tags;
drop policy if exists "product_tags_admin_write" on public.product_tags;
drop policy if exists "product_tag_products_public_read" on public.product_tag_products;
drop policy if exists "product_tag_products_admin_write" on public.product_tag_products;
drop policy if exists "product_options_public_read" on public.product_options;
drop policy if exists "product_options_admin_write" on public.product_options;
drop policy if exists "product_option_values_public_read" on public.product_option_values;
drop policy if exists "product_option_values_admin_write" on public.product_option_values;
drop policy if exists "product_variant_option_values_public_read" on public.product_variant_option_values;
drop policy if exists "product_variant_option_values_admin_write" on public.product_variant_option_values;
drop policy if exists "product_images_public_read" on public.product_images;
drop policy if exists "product_images_admin_write" on public.product_images;
drop policy if exists "stock_locations_public_read" on public.stock_locations;
drop policy if exists "stock_locations_admin_write" on public.stock_locations;
drop policy if exists "inventory_items_authenticated_read" on public.inventory_items;
drop policy if exists "inventory_items_admin_write" on public.inventory_items;
drop policy if exists "inventory_levels_authenticated_read" on public.inventory_levels;
drop policy if exists "inventory_levels_admin_write" on public.inventory_levels;
drop policy if exists "inventory_reservations_admin_only" on public.inventory_reservations;
drop policy if exists "price_sets_public_read" on public.price_sets;
drop policy if exists "price_sets_admin_write" on public.price_sets;
drop policy if exists "prices_public_read" on public.prices;
drop policy if exists "prices_admin_write" on public.prices;
drop policy if exists "price_lists_public_read" on public.price_lists;
drop policy if exists "price_lists_admin_write" on public.price_lists;
drop policy if exists "price_list_customer_groups_public_read" on public.price_list_customer_groups;
drop policy if exists "price_list_customer_groups_admin_write" on public.price_list_customer_groups;
drop policy if exists "price_list_prices_public_read" on public.price_list_prices;
drop policy if exists "price_list_prices_admin_write" on public.price_list_prices;
drop policy if exists "promotions_authenticated_read" on public.promotions;
drop policy if exists "promotions_admin_write" on public.promotions;
drop policy if exists "promotion_rules_authenticated_read" on public.promotion_rules;
drop policy if exists "promotion_rules_admin_write" on public.promotion_rules;
drop policy if exists "promotion_usages_own_read" on public.promotion_usages;
drop policy if exists "tax_regions_public_read" on public.tax_regions;
drop policy if exists "tax_regions_admin_write" on public.tax_regions;
drop policy if exists "tax_rates_public_read" on public.tax_rates;
drop policy if exists "tax_rates_admin_write" on public.tax_rates;
drop policy if exists "tax_rate_product_categories_public_read" on public.tax_rate_product_categories;
drop policy if exists "tax_rate_product_categories_admin_write" on public.tax_rate_product_categories;
drop policy if exists "shipping_profiles_public_read" on public.shipping_profiles;
drop policy if exists "shipping_profiles_admin_write" on public.shipping_profiles;
drop policy if exists "fulfillment_providers_public_read" on public.fulfillment_providers;
drop policy if exists "fulfillment_providers_admin_write" on public.fulfillment_providers;
drop policy if exists "shipping_options_public_read" on public.shipping_options;
drop policy if exists "shipping_options_admin_write" on public.shipping_options;
drop policy if exists "shipping_option_requirements_public_read" on public.shipping_option_requirements;
drop policy if exists "shipping_option_requirements_admin_write" on public.shipping_option_requirements;
drop policy if exists "carts_select_own" on public.carts;
drop policy if exists "carts_insert_own" on public.carts;
drop policy if exists "carts_update_own" on public.carts;
drop policy if exists "cart_line_items_select_own" on public.cart_line_items;
drop policy if exists "cart_line_items_insert_own" on public.cart_line_items;
drop policy if exists "cart_line_items_update_own" on public.cart_line_items;
drop policy if exists "cart_line_items_delete_own" on public.cart_line_items;
drop policy if exists "cart_shipping_methods_select_own" on public.cart_shipping_methods;
drop policy if exists "cart_shipping_methods_insert_own" on public.cart_shipping_methods;
drop policy if exists "cart_shipping_methods_delete_own" on public.cart_shipping_methods;
drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "order_line_items_select_own" on public.order_line_items;
drop policy if exists "order_fulfillments_select_own" on public.order_fulfillments;
drop policy if exists "order_fulfillment_items_select_own" on public.order_fulfillment_items;
drop policy if exists "order_returns_select_own" on public.order_returns;
drop policy if exists "order_return_items_select_own" on public.order_return_items;
drop policy if exists "order_refunds_select_own" on public.order_refunds;
drop policy if exists "payment_collections_select_own" on public.payment_collections;
drop policy if exists "payment_sessions_select_own" on public.payment_sessions;
drop policy if exists "sales_channels_public_read" on public.sales_channels;
drop policy if exists "sales_channels_admin_write" on public.sales_channels;
drop policy if exists "sales_channel_products_public_read" on public.sales_channel_products;
drop policy if exists "sales_channel_products_admin_write" on public.sales_channel_products;
drop policy if exists "admin_users_select_self" on public.admin_users;
drop policy if exists "admin_users_admin_write" on public.admin_users;
drop policy if exists "admin_users_insert_via_invitation" on public.admin_users;
drop policy if exists "admin_invitations_admin_only" on public.admin_invitations;
drop policy if exists "admin_invitations_anon_token_lookup" on public.admin_invitations;
drop policy if exists "admin_invitations_accept_own" on public.admin_invitations;


-- =============================================================================
-- Helper functions
-- =============================================================================

-- Returns true if the current user has an active admin_users record.
-- Used by policies that allow admin-only access.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_active = true
      and deleted_at is null
  )
$$;

-- Returns the customers.id for the currently authenticated user.
-- Returns null for unauthenticated requests or admin users.
create or replace function public.current_customer_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select id
  from public.customers
  where user_id = auth.uid()
  limit 1
$$;


-- =============================================================================
-- Trigger: auto-create customer profile on auth.users insert
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Skip customer creation for admin invitees
  if exists (
    select 1 from public.admin_invitations
    where email = new.email
      and accepted_at is null
      and expires_at > now()
  ) then
    return new;
  end if;

  insert into public.customers (user_id, email, is_anonymous)
  values (
    new.id,
    new.email,
    coalesce((new.raw_app_meta_data->>'provider') = 'anonymous', false)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =============================================================================
-- Enable RLS on all tables
-- =============================================================================

alter table public.currencies                    enable row level security;
alter table public.regions                       enable row level security;
alter table public.countries                     enable row level security;
alter table public.customers                     enable row level security;
alter table public.customer_groups               enable row level security;
alter table public.customer_addresses            enable row level security;
alter table public.products                      enable row level security;
alter table public.product_categories            enable row level security;
alter table public.product_category_products     enable row level security;
alter table public.product_collections           enable row level security;
alter table public.product_collection_products   enable row level security;
alter table public.product_tags                  enable row level security;
alter table public.product_tag_products          enable row level security;
alter table public.product_options               enable row level security;
alter table public.product_option_values         enable row level security;
alter table public.product_variants              enable row level security;
alter table public.product_variant_option_values enable row level security;
alter table public.product_images                enable row level security;
alter table public.stock_locations               enable row level security;
alter table public.inventory_items               enable row level security;
alter table public.inventory_levels              enable row level security;
alter table public.inventory_reservations        enable row level security;
alter table public.price_sets                    enable row level security;
alter table public.prices                        enable row level security;
alter table public.price_lists                   enable row level security;
alter table public.price_list_customer_groups    enable row level security;
alter table public.price_list_prices             enable row level security;
alter table public.promotions                    enable row level security;
alter table public.promotion_rules               enable row level security;
alter table public.promotion_usages              enable row level security;
alter table public.tax_regions                   enable row level security;
alter table public.tax_rates                     enable row level security;
alter table public.tax_rate_product_categories   enable row level security;
alter table public.shipping_profiles             enable row level security;
alter table public.fulfillment_providers         enable row level security;
alter table public.shipping_options              enable row level security;
alter table public.shipping_option_requirements  enable row level security;
alter table public.carts                         enable row level security;
alter table public.cart_line_items               enable row level security;
alter table public.cart_shipping_methods         enable row level security;
alter table public.orders                        enable row level security;
alter table public.order_line_items              enable row level security;
alter table public.order_fulfillments            enable row level security;
alter table public.order_fulfillment_items       enable row level security;
alter table public.order_returns                 enable row level security;
alter table public.order_return_items            enable row level security;
alter table public.order_refunds                 enable row level security;
alter table public.payment_collections           enable row level security;
alter table public.payment_sessions              enable row level security;
alter table public.sales_channels                enable row level security;
alter table public.sales_channel_products        enable row level security;
alter table public.admin_users                   enable row level security;
alter table public.admin_invitations             enable row level security;


-- =============================================================================
-- currencies — public read, admin write
-- =============================================================================

create policy "currencies_public_read"
  on public.currencies for select
  using (true);

create policy "currencies_admin_write"
  on public.currencies for all
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- regions / countries — public read, admin write
-- =============================================================================

create policy "regions_public_read"
  on public.regions for select
  using (true);

create policy "regions_admin_write"
  on public.regions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "countries_public_read"
  on public.countries for select
  using (true);

create policy "countries_admin_write"
  on public.countries for all
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- customers — own data only, admin can read/write all
-- =============================================================================

create policy "customers_select_own"
  on public.customers for select
  using (user_id = auth.uid() or public.is_admin());

create policy "customers_insert_own"
  on public.customers for insert
  with check (user_id = auth.uid() or public.is_admin());

create policy "customers_update_own"
  on public.customers for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());


-- =============================================================================
-- customer_groups — public read
-- =============================================================================

create policy "customer_groups_public_read"
  on public.customer_groups for select
  using (true);

create policy "customer_groups_admin_write"
  on public.customer_groups for all
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- customer_addresses — own data only
-- =============================================================================

create policy "customer_addresses_select_own"
  on public.customer_addresses for select
  using (customer_id = public.current_customer_id() or public.is_admin());

create policy "customer_addresses_insert_own"
  on public.customer_addresses for insert
  with check (customer_id = public.current_customer_id());

create policy "customer_addresses_update_own"
  on public.customer_addresses for update
  using (customer_id = public.current_customer_id())
  with check (customer_id = public.current_customer_id());

create policy "customer_addresses_delete_own"
  on public.customer_addresses for delete
  using (customer_id = public.current_customer_id());


-- =============================================================================
-- catalog — products, variants, categories, etc.
-- =============================================================================

create policy "products_public_read"
  on public.products for select
  using (status = 'published' or public.is_admin());

create policy "products_admin_write"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- Variants are readable by anyone (needed for cart operations).
-- Draft product filtering is enforced at the products level.
create policy "product_variants_public_read"
  on public.product_variants for select
  using (
    deleted_at is null
    or public.is_admin()
  );

create policy "product_variants_admin_write"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_categories_public_read"
  on public.product_categories for select
  using (is_active = true or public.is_admin());

create policy "product_categories_admin_write"
  on public.product_categories for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_category_products_public_read"
  on public.product_category_products for select
  using (true);

create policy "product_category_products_admin_write"
  on public.product_category_products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_collections_public_read"
  on public.product_collections for select
  using (deleted_at is null or public.is_admin());

create policy "product_collections_admin_write"
  on public.product_collections for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_collection_products_public_read"
  on public.product_collection_products for select
  using (true);

create policy "product_collection_products_admin_write"
  on public.product_collection_products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_tags_public_read"
  on public.product_tags for select
  using (true);

create policy "product_tags_admin_write"
  on public.product_tags for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_tag_products_public_read"
  on public.product_tag_products for select
  using (true);

create policy "product_tag_products_admin_write"
  on public.product_tag_products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_options_public_read"
  on public.product_options for select
  using (true);

create policy "product_options_admin_write"
  on public.product_options for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_option_values_public_read"
  on public.product_option_values for select
  using (true);

create policy "product_option_values_admin_write"
  on public.product_option_values for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_variant_option_values_public_read"
  on public.product_variant_option_values for select
  using (true);

create policy "product_variant_option_values_admin_write"
  on public.product_variant_option_values for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_images_public_read"
  on public.product_images for select
  using (true);

create policy "product_images_admin_write"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- inventory — authenticated read, admin write
-- =============================================================================

create policy "stock_locations_public_read"
  on public.stock_locations for select
  using (is_active = true or public.is_admin());

create policy "stock_locations_admin_write"
  on public.stock_locations for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "inventory_items_authenticated_read"
  on public.inventory_items for select
  using (auth.uid() is not null or public.is_admin());

create policy "inventory_items_admin_write"
  on public.inventory_items for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "inventory_levels_authenticated_read"
  on public.inventory_levels for select
  using (auth.uid() is not null or public.is_admin());

create policy "inventory_levels_admin_write"
  on public.inventory_levels for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "inventory_reservations_admin_only"
  on public.inventory_reservations for all
  using (public.is_admin());


-- =============================================================================
-- pricing — public read, admin write
-- =============================================================================

create policy "price_sets_public_read"
  on public.price_sets for select
  using (true);

create policy "price_sets_admin_write"
  on public.price_sets for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "prices_public_read"
  on public.prices for select
  using (true);

create policy "prices_admin_write"
  on public.prices for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "price_lists_public_read"
  on public.price_lists for select
  using (status = 'active' and deleted_at is null or public.is_admin());

create policy "price_lists_admin_write"
  on public.price_lists for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "price_list_customer_groups_public_read"
  on public.price_list_customer_groups for select
  using (true);

create policy "price_list_customer_groups_admin_write"
  on public.price_list_customer_groups for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "price_list_prices_public_read"
  on public.price_list_prices for select
  using (true);

create policy "price_list_prices_admin_write"
  on public.price_list_prices for all
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- promotions — authenticated read, admin write
-- =============================================================================

create policy "promotions_authenticated_read"
  on public.promotions for select
  using (
    (auth.uid() is not null and status = 'active' and deleted_at is null)
    or public.is_admin()
  );

create policy "promotions_admin_write"
  on public.promotions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "promotion_rules_authenticated_read"
  on public.promotion_rules for select
  using (auth.uid() is not null or public.is_admin());

create policy "promotion_rules_admin_write"
  on public.promotion_rules for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "promotion_usages_own_read"
  on public.promotion_usages for select
  using (customer_id = public.current_customer_id() or public.is_admin());


-- =============================================================================
-- tax — public read, admin write
-- =============================================================================

create policy "tax_regions_public_read"
  on public.tax_regions for select
  using (true);

create policy "tax_regions_admin_write"
  on public.tax_regions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "tax_rates_public_read"
  on public.tax_rates for select
  using (true);

create policy "tax_rates_admin_write"
  on public.tax_rates for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "tax_rate_product_categories_public_read"
  on public.tax_rate_product_categories for select
  using (true);

create policy "tax_rate_product_categories_admin_write"
  on public.tax_rate_product_categories for all
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- fulfillment — public read, admin write
-- =============================================================================

create policy "shipping_profiles_public_read"
  on public.shipping_profiles for select
  using (true);

create policy "shipping_profiles_admin_write"
  on public.shipping_profiles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "fulfillment_providers_public_read"
  on public.fulfillment_providers for select
  using (is_installed = true or public.is_admin());

create policy "fulfillment_providers_admin_write"
  on public.fulfillment_providers for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "shipping_options_public_read"
  on public.shipping_options for select
  using ((is_active = true and deleted_at is null) or public.is_admin());

create policy "shipping_options_admin_write"
  on public.shipping_options for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "shipping_option_requirements_public_read"
  on public.shipping_option_requirements for select
  using (true);

create policy "shipping_option_requirements_admin_write"
  on public.shipping_option_requirements for all
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- carts — own data only
-- Customers can read/write their own active cart.
-- Service role (edge functions) bypasses RLS entirely.
-- =============================================================================

create policy "carts_select_own"
  on public.carts for select
  using (customer_id = public.current_customer_id() or public.is_admin());

create policy "carts_insert_own"
  on public.carts for insert
  with check (customer_id = public.current_customer_id());

create policy "carts_update_own"
  on public.carts for update
  using (customer_id = public.current_customer_id() or public.is_admin())
  with check (customer_id = public.current_customer_id() or public.is_admin());

create policy "cart_line_items_select_own"
  on public.cart_line_items for select
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_line_items.cart_id
        and (c.customer_id = public.current_customer_id() or public.is_admin())
    )
  );

create policy "cart_line_items_insert_own"
  on public.cart_line_items for insert
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_line_items.cart_id
        and c.customer_id = public.current_customer_id()
        and c.status = 'active'
    )
  );

create policy "cart_line_items_update_own"
  on public.cart_line_items for update
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_line_items.cart_id
        and c.customer_id = public.current_customer_id()
        and c.status = 'active'
    )
  );

create policy "cart_line_items_delete_own"
  on public.cart_line_items for delete
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_line_items.cart_id
        and c.customer_id = public.current_customer_id()
        and c.status = 'active'
    )
  );

create policy "cart_shipping_methods_select_own"
  on public.cart_shipping_methods for select
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_shipping_methods.cart_id
        and (c.customer_id = public.current_customer_id() or public.is_admin())
    )
  );

create policy "cart_shipping_methods_insert_own"
  on public.cart_shipping_methods for insert
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_shipping_methods.cart_id
        and c.customer_id = public.current_customer_id()
        and c.status = 'active'
    )
  );

create policy "cart_shipping_methods_delete_own"
  on public.cart_shipping_methods for delete
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_shipping_methods.cart_id
        and c.customer_id = public.current_customer_id()
        and c.status = 'active'
    )
  );


-- =============================================================================
-- orders — own data only, read-only for customers
-- Orders are created by edge functions (service role).
-- =============================================================================

create policy "orders_select_own"
  on public.orders for select
  using (customer_id = public.current_customer_id() or public.is_admin());

create policy "order_line_items_select_own"
  on public.order_line_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_line_items.order_id
        and (o.customer_id = public.current_customer_id() or public.is_admin())
    )
  );

create policy "order_fulfillments_select_own"
  on public.order_fulfillments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_fulfillments.order_id
        and (o.customer_id = public.current_customer_id() or public.is_admin())
    )
  );

create policy "order_fulfillment_items_select_own"
  on public.order_fulfillment_items for select
  using (
    exists (
      select 1 from public.order_fulfillments f
      join public.orders o on o.id = f.order_id
      where f.id = order_fulfillment_items.fulfillment_id
        and (o.customer_id = public.current_customer_id() or public.is_admin())
    )
  );

create policy "order_returns_select_own"
  on public.order_returns for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_returns.order_id
        and (o.customer_id = public.current_customer_id() or public.is_admin())
    )
  );

create policy "order_return_items_select_own"
  on public.order_return_items for select
  using (
    exists (
      select 1 from public.order_returns r
      join public.orders o on o.id = r.order_id
      where r.id = order_return_items.return_id
        and (o.customer_id = public.current_customer_id() or public.is_admin())
    )
  );

create policy "order_refunds_select_own"
  on public.order_refunds for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_refunds.order_id
        and (o.customer_id = public.current_customer_id() or public.is_admin())
    )
  );


-- =============================================================================
-- payments — own data only, read-only for customers
-- =============================================================================

create policy "payment_collections_select_own"
  on public.payment_collections for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = payment_collections.order_id
        and (o.customer_id = public.current_customer_id() or public.is_admin())
    )
  );

create policy "payment_sessions_select_own"
  on public.payment_sessions for select
  using (
    exists (
      select 1 from public.payment_collections pc
      join public.orders o on o.id = pc.order_id
      where pc.id = payment_sessions.payment_collection_id
        and (o.customer_id = public.current_customer_id() or public.is_admin())
    )
  );


-- =============================================================================
-- sales_channels — public read, admin write
-- =============================================================================

create policy "sales_channels_public_read"
  on public.sales_channels for select
  using ((is_disabled = false and deleted_at is null) or public.is_admin());

create policy "sales_channels_admin_write"
  on public.sales_channels for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "sales_channel_products_public_read"
  on public.sales_channel_products for select
  using (true);

create policy "sales_channel_products_admin_write"
  on public.sales_channel_products for all
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- admin_users — self select to avoid RLS recursion deadlock, admin write,
--               invitation-based insert
-- =============================================================================

create policy "admin_users_select_self"
  on public.admin_users for select
  using (user_id = auth.uid());

create policy "admin_users_admin_write"
  on public.admin_users for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_users_insert_via_invitation"
  on public.admin_users for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.admin_invitations
      where email = (select email from auth.users where id = auth.uid())
        and accepted_at is null
        and expires_at > now()
    )
  );


-- =============================================================================
-- admin_invitations — admin write, anonymous token lookup, self-accept
-- =============================================================================

create policy "admin_invitations_admin_only"
  on public.admin_invitations for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_invitations_anon_token_lookup"
  on public.admin_invitations for select
  to anon
  using (
    accepted_at is null
    and expires_at > now()
  );

create policy "admin_invitations_accept_own"
  on public.admin_invitations for update
  to authenticated
  using (
    email = (select email from auth.users where id = auth.uid())
    and accepted_at is null
    and expires_at > now()
  )
  with check (true);