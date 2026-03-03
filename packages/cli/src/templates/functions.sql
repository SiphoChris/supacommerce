-- =============================================================================
-- supacommerce — Postgres RPC Functions
-- =============================================================================
--
-- These functions handle operations that must be atomic — where a partial
-- failure would leave your database in an inconsistent state.
--
-- Apply to your Supabase project alongside your migrations:
--   Option A: Add to a migration file and run `supabase db push`
--   Option B: Paste into the Supabase SQL Editor
--
-- The edge functions call these via supabase.rpc("function_name", params).
-- All functions run with SECURITY DEFINER so they bypass RLS — only call
-- them from trusted server-side code (edge functions with service role key).
-- =============================================================================


-- =============================================================================
-- checkout_cart
--
-- Atomically converts a cart into an order.
-- Called by the cart-checkout edge function.
--
-- Steps (all-or-nothing):
--   1. Validate the cart exists and is active
--   2. Create the order record
--   3. Copy cart line items to order line items
--   4. Create a payment collection
--   5. Mark the cart as completed
--
-- Returns the new order ID.
-- =============================================================================

create or replace function public.checkout_cart(
  p_cart_id       uuid,
  p_discount_total integer default 0,
  p_tax_total      integer default 0,
  p_shipping_total integer default 0,
  p_billing_address jsonb  default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cart          record;
  v_order_id      uuid;
  v_subtotal      integer;
  v_total         integer;
begin
  -- ── 1. Load and lock the cart ───────────────────────────────────────────────
  select * into v_cart
  from public.carts
  where id = p_cart_id
    and status = 'active'
    and completed_at is null
  for update;                    -- row-level lock prevents concurrent checkouts

  if not found then
    raise exception 'Cart % not found or already completed', p_cart_id
      using errcode = 'P0002';
  end if;

  -- ── 2. Compute subtotal from line items ────────────────────────────────────
  select coalesce(sum(subtotal), 0)
  into v_subtotal
  from public.cart_line_items
  where cart_id = p_cart_id;

  v_total := v_subtotal + p_tax_total + p_shipping_total - p_discount_total;

  -- ── 3. Create the order ────────────────────────────────────────────────────
  insert into public.orders (
    customer_id, cart_id, region_id, currency_code,
    email, status, payment_status, fulfillment_status,
    shipping_address, billing_address,
    subtotal, discount_total, shipping_total, tax_total, total
  )
  values (
    v_cart.customer_id, p_cart_id, v_cart.region_id, v_cart.currency_code,
    v_cart.email, 'pending', 'pending', 'not_fulfilled',
    v_cart.shipping_address,
    coalesce(p_billing_address, v_cart.billing_address),
    v_subtotal, p_discount_total, p_shipping_total, p_tax_total, v_total
  )
  returning id into v_order_id;

  -- ── 4. Copy line items from cart to order ─────────────────────────────────
  insert into public.order_line_items (
    order_id, variant_id, title, subtitle, thumbnail, product_id,
    quantity, unit_price, subtotal, tax_total, discount_total, total
  )
  select
    v_order_id,
    variant_id, title, subtitle, thumbnail, product_id,
    quantity, unit_price, subtotal,
    0,  -- tax_total: per-item tax breakdown is a TODO
    0,  -- discount_total: per-item discount is a TODO
    subtotal
  from public.cart_line_items
  where cart_id = p_cart_id;

  -- ── 5. Create payment collection ──────────────────────────────────────────
  insert into public.payment_collections (
    order_id, currency_code, amount, status
  )
  values (
    v_order_id, v_cart.currency_code, v_total, 'not_paid'
  );

  -- ── 6. Mark cart as completed ─────────────────────────────────────────────
  update public.carts
  set
    status       = 'completed',
    completed_at = now(),
    subtotal     = v_subtotal,
    discount_total = p_discount_total,
    shipping_total = p_shipping_total,
    tax_total      = p_tax_total,
    total          = v_total,
    billing_address = coalesce(p_billing_address, billing_address),
    updated_at   = now()
  where id = p_cart_id;

  return v_order_id;
end;
$$;


-- =============================================================================
-- confirm_order
--
-- Atomically marks an order as processing after payment is captured.
-- Called by the order-confirmed edge function.
--
-- Steps (all-or-nothing):
--   1. Update order status → processing
--   2. Update payment session → captured
--   3. Update payment collection → captured
--   4. Reserve inventory for all line items
-- =============================================================================

create or replace function public.confirm_order(
  p_order_id          uuid,
  p_payment_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order       record;
  v_line_item   record;
  v_inv_item    record;
  v_location_id uuid;
begin
  -- ── 1. Load and lock the order ────────────────────────────────────────────
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order % not found', p_order_id
      using errcode = 'P0002';
  end if;

  if v_order.status not in ('pending', 'requires_action') then
    raise exception 'Order % cannot be confirmed (status: %)', p_order_id, v_order.status
      using errcode = 'P0001';
  end if;

  -- ── 2. Update order status ────────────────────────────────────────────────
  update public.orders
  set
    status         = 'processing',
    payment_status = 'captured',
    updated_at     = now()
  where id = p_order_id;

  -- ── 3. Update payment session ─────────────────────────────────────────────
  update public.payment_sessions
  set
    status      = 'captured',
    captured_at = now(),
    updated_at  = now()
  where id = p_payment_session_id;

  -- ── 4. Update payment collection ─────────────────────────────────────────
  update public.payment_collections
  set
    status           = 'captured',
    captured_amount  = amount,
    updated_at       = now()
  where order_id = p_order_id;

  -- ── 5. Reserve inventory ──────────────────────────────────────────────────
  -- Find the default location (first active location). For multi-location
  -- inventory, implement your own location-selection logic here.
  select id into v_location_id
  from public.stock_locations
  where is_active = true
  order by created_at
  limit 1;

  if v_location_id is not null then
    for v_line_item in
      select * from public.order_line_items where order_id = p_order_id
    loop
      -- Get the inventory item for this variant
      select * into v_inv_item
      from public.inventory_items
      where variant_id = v_line_item.variant_id
        and deleted_at is null
      limit 1;

      if v_inv_item.id is not null then
        -- Create reservation record
        insert into public.inventory_reservations (
          inventory_item_id, location_id, line_item_id,
          quantity, status
        )
        values (
          v_inv_item.id, v_location_id, v_line_item.id,
          v_line_item.quantity, 'confirmed'
        );

        -- Decrement quantity_available and increment reserved_quantity
        update public.inventory_levels
        set
          reserved_quantity  = reserved_quantity + v_line_item.quantity,
          quantity_available = quantity_available - v_line_item.quantity,
          updated_at         = now()
        where inventory_item_id = v_inv_item.id
          and location_id = v_location_id;
      end if;
    end loop;
  end if;
end;
$$;


-- =============================================================================
-- reserve_inventory
--
-- Atomically creates a soft inventory hold before payment is captured.
-- Useful for high-demand products. Called by inventory-reserve edge fn.
--
-- Returns false if insufficient stock exists.
-- =============================================================================

create or replace function public.reserve_inventory(
  p_inventory_item_id uuid,
  p_location_id       uuid,
  p_line_item_id      uuid,
  p_quantity          integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_available integer;
begin
  -- Lock the inventory level row
  select quantity_available into v_available
  from public.inventory_levels
  where inventory_item_id = p_inventory_item_id
    and location_id = p_location_id
  for update;

  if not found or v_available < p_quantity then
    return false;
  end if;

  -- Create the reservation
  insert into public.inventory_reservations (
    inventory_item_id, location_id, line_item_id, quantity, status
  )
  values (
    p_inventory_item_id, p_location_id, p_line_item_id, p_quantity, 'pending'
  );

  -- Decrement available quantity
  update public.inventory_levels
  set
    reserved_quantity  = reserved_quantity + p_quantity,
    quantity_available = quantity_available - p_quantity,
    updated_at         = now()
  where inventory_item_id = p_inventory_item_id
    and location_id = p_location_id;

  return true;
end;
$$;


-- =============================================================================
-- release_inventory_reservation
--
-- Releases a pending reservation and restores available quantity.
-- Call this when a checkout is abandoned or payment fails.
-- =============================================================================

create or replace function public.release_inventory_reservation(
  p_reservation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation record;
begin
  select * into v_reservation
  from public.inventory_reservations
  where id = p_reservation_id
    and status = 'pending'
  for update;

  if not found then
    return; -- Already released or confirmed — no-op
  end if;

  -- Mark as released
  update public.inventory_reservations
  set status = 'released', updated_at = now()
  where id = p_reservation_id;

  -- Restore available quantity
  update public.inventory_levels
  set
    reserved_quantity  = reserved_quantity - v_reservation.quantity,
    quantity_available = quantity_available + v_reservation.quantity,
    updated_at         = now()
  where inventory_item_id = v_reservation.inventory_item_id
    and location_id = v_reservation.location_id;
end;
$$;
