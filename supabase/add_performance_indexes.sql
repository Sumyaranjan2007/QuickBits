-- ═══════════════════════════════════════════════════════════════════════════
-- QUICKBITE — DATABASE PERFORMANCE INDEXES
-- Accelerates real-time feeds, live orders, driver queries, and join operations.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status 
  ON public.orders (restaurant_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_customer_created 
  ON public.orders (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON public.orders (status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order_id 
  ON public.delivery_assignments (order_id);

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_partner_status 
  ON public.delivery_assignments (delivery_partner_id, status);

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status 
  ON public.delivery_assignments (status);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available 
  ON public.menu_items (restaurant_id, is_available);

CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant 
  ON public.menu_categories (restaurant_id, display_order);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant 
  ON public.reviews (restaurant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_earnings_entity 
  ON public.earnings (entity_id, entity_type);

CREATE INDEX IF NOT EXISTS idx_coupons_code_active 
  ON public.coupons (code, is_active);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order 
  ON public.order_status_history (order_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_notifications_user 
  ON public.notifications (user_id, is_read, created_at DESC);
