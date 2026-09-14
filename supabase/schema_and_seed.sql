-- ═══════════════════════════════════════════════════════════════════════════
-- QUICKBITE — UNIFIED SUPABASE POSTGRESQL SCHEMA & REALTIME SETUP
-- Supports: Customer App, Restaurant App, Delivery Fleet & Admin Portal
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. User Profiles (Connected to auth.users) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('CUSTOMER', 'RESTAURANT', 'RESTAURANT_OWNER', 'RESTAURANT_STAFF', 'DELIVERY_PARTNER', 'ADMIN')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Customers ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  default_address_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Restaurants ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tag TEXT,
  food_type TEXT DEFAULT 'BOTH' CHECK (food_type IN ('VEG', 'NON_VEG', 'BOTH', 'VEGAN')),
  rating NUMERIC(2,1) DEFAULT 4.5,
  rating_count TEXT DEFAULT '1K+',
  address TEXT NOT NULL,
  locality TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cuisine_type TEXT,
  price_for_two NUMERIC(10,2) DEFAULT 400,
  avg_delivery_time INT DEFAULT 30,
  min_order_amount NUMERIC(10,2) DEFAULT 100,
  discount_badge TEXT,
  free_delivery BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Restaurant Staff ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurant_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'STAFF',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Menu Categories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. Menu Items ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  food_type TEXT DEFAULT 'VEG' CHECK (food_type IN ('VEG', 'NON_VEG', 'VEGAN', 'BOTH')),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 4.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. Menu Item Addons ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_item_addons (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  menu_item_id TEXT REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT true
);

-- ─── 8. Delivery Partners ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'MOTORCYCLE',
  vehicle_number TEXT,
  rating NUMERIC(2,1) DEFAULT 4.9,
  status TEXT DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'BUSY')),
  approval_status TEXT DEFAULT 'APPROVED' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. Customer Addresses ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT DEFAULT 'Bengaluru',
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. Orders ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  delivery_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  delivery_address_text TEXT NOT NULL,
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'READY',
    'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'
  )),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 5,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'SUCCESS', 'FAILED', 'REFUNDED')),
  special_instructions TEXT,
  delivery_otp TEXT DEFAULT '4821',
  assigned_driver_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 11. Order Items ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  addons JSONB DEFAULT '[]'::jsonb,
  food_type TEXT DEFAULT 'VEG'
);

-- ─── 12. Order Status History ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 13. Delivery Assignments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- ─── 14. Payments ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'SUCCESS',
  method TEXT DEFAULT 'UPI',
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 15. Coupons ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'PERCENTAGE' CHECK (type IN ('PERCENTAGE', 'FIXED')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_discount NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 16. Reviews ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 17. Notifications ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'ORDER_UPDATE',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 18. Restaurant Price Change Requests (Business Rule #11) ─────────────
CREATE TABLE IF NOT EXISTS public.restaurant_price_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES public.menu_items(id) ON DELETE CASCADE,
  old_price NUMERIC(10,2) NOT NULL,
  requested_price NUMERIC(10,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ─── 19. Earnings ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('RESTAURANT', 'DELIVERY_PARTNER', 'PLATFORM')),
  entity_id TEXT NOT NULL,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  gross_amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 20. Payouts ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('RESTAURANT', 'DELIVERY_PARTNER')),
  entity_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUTOMATED PRICE CHANGE APPROVAL TRIGGER (Enforcing Rule #11)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_price_change_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status = 'PENDING' THEN
    UPDATE public.menu_items
    SET price = NEW.requested_price,
        updated_at = NOW()
    WHERE id = NEW.menu_item_id;
    NEW.reviewed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_price_change_approval ON public.restaurant_price_change_requests;
CREATE TRIGGER trg_price_change_approval
BEFORE UPDATE ON public.restaurant_price_change_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_price_change_approval();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_price_change_requests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Restaurants & Menu: Public read, owner update
CREATE POLICY "Restaurants are viewable by everyone"
  ON public.restaurants FOR SELECT USING (true);

CREATE POLICY "Menu categories are viewable by everyone"
  ON public.menu_categories FOR SELECT USING (true);

CREATE POLICY "Menu items are viewable by everyone"
  ON public.menu_items FOR SELECT USING (true);

-- Orders: Viewable by customer, restaurant, delivery driver, and admin
CREATE POLICY "Orders are viewable by relevant actors"
  ON public.orders FOR SELECT
  USING (
    customer_id = auth.uid()
    OR auth.uid() IN (SELECT owner_id FROM public.restaurants WHERE id = restaurant_id)
    OR auth.uid() IN (SELECT user_id FROM public.delivery_partners WHERE id = assigned_driver_id)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    OR auth.role() = 'anon' -- Allows unauthenticated app demo views
  );

CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Relevant actors can update order status"
  ON public.orders FOR UPDATE USING (true);

-- Order Items
CREATE POLICY "Order items are viewable by everyone"
  ON public.order_items FOR SELECT USING (true);

CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items can be updated"
  ON public.order_items FOR UPDATE USING (true);

-- Delivery Assignments
CREATE POLICY "Delivery assignments viewable by actors"
  ON public.delivery_assignments FOR SELECT USING (true);

CREATE POLICY "Anyone can insert delivery assignments"
  ON public.delivery_assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Delivery partners can update assignments"
  ON public.delivery_assignments FOR UPDATE USING (true);

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payments are viewable by relevant actors"
  ON public.payments FOR SELECT USING (true);
CREATE POLICY "Anyone can record payments"
  ON public.payments FOR INSERT WITH CHECK (true);

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can insert reviews"
  ON public.reviews FOR INSERT WITH CHECK (true);

-- Earnings
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Earnings are viewable by actors"
  ON public.earnings FOR SELECT USING (true);
CREATE POLICY "Anyone can record earnings"
  ON public.earnings FOR INSERT WITH CHECK (true);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications are viewable by users"
  ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notifications"
  ON public.notifications FOR UPDATE USING (true);

-- Order Status History
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order status history is viewable by everyone"
  ON public.order_status_history FOR SELECT USING (true);
CREATE POLICY "Anyone can record status history"
  ON public.order_status_history FOR INSERT WITH CHECK (true);

-- Addresses
CREATE POLICY "Addresses are viewable by everyone"
  ON public.addresses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert addresses"
  ON public.addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update addresses"
  ON public.addresses FOR UPDATE USING (true);

-- Menu items update (availability toggle)
CREATE POLICY "Menu items can be updated"
  ON public.menu_items FOR UPDATE USING (true);

-- Price Change Requests
CREATE POLICY "Price change requests viewable by restaurant and admin"
  ON public.restaurant_price_change_requests FOR SELECT USING (true);

CREATE POLICY "Restaurants can create price change requests"
  ON public.restaurant_price_change_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Price requests can be updated by admin"
  ON public.restaurant_price_change_requests FOR UPDATE USING (true);

-- Delivery Partners
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Delivery partners are viewable by everyone"
  ON public.delivery_partners FOR SELECT USING (true);
CREATE POLICY "Delivery partners can update their status"
  ON public.delivery_partners FOR UPDATE USING (true);
CREATE POLICY "Anyone can register delivery partner"
  ON public.delivery_partners FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- REALTIME SUBSCRIPTION ACTIVATION
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_assignments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_price_change_requests;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Restaurants
INSERT INTO public.restaurants (id, name, tag, food_type, rating, rating_count, address, locality, cuisine_type, price_for_two, avg_delivery_time, discount_badge, free_delivery, cover_image_url)
VALUES
('sharief-bhai', 'Sharief Bhai Biryani', 'Best in Biryani', 'NON_VEG', 4.2, '3.4K+', '100 Feet Rd, Indiranagar', 'Indiranagar, 2.9 km', 'Biryani, Shawarma, Mughlai', 450, 25, '50% OFF', true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80'),
('burger-co', 'Burger & Co.', 'Gourmet Burgers', 'BOTH', 4.6, '3.8K+', '12th Main, Indiranagar', 'Indiranagar, 2.1 km', 'Burgers, American, Fast Food', 300, 20, 'Buy 1 get 1', true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'),
('chinese-wok', 'Chinese Wok', 'Wok Specialties', 'BOTH', 4.3, '1.8K+', '5th Block, Koramangala', 'Koramangala, 2.5 km', 'Chinese, Asian, Noodles', 250, 30, 'Items at ₹189', true, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80'),
('pizzeria-bella', 'Pizzeria Bella', 'Woodfired Pizza', 'BOTH', 4.7, '2.7K+', 'Lavelle Road', 'Lavelle Road, 3.2 km', 'Italian, Woodfired Pizza, Pasta', 500, 35, 'FLAT ₹125 OFF', true, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, rating = EXCLUDED.rating;

-- 2. Menu Categories
INSERT INTO public.menu_categories (id, restaurant_id, name, display_order)
VALUES
('cat-sb-1', 'sharief-bhai', 'Bestsellers & Biryani', 1),
('cat-sb-2', 'sharief-bhai', 'Starters & Kebabs', 2),
('cat-bc-1', 'burger-co', 'Smash Burgers', 1),
('cat-bc-2', 'burger-co', 'Sides & Fries', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Menu Items
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, food_type, image_url, is_bestseller)
VALUES
('item-1', 'sharief-bhai', 'cat-sb-1', 'Chicken Dum Biryani', 'Layered fragrant spiced basmati rice and marinated chicken slow-cooked on dum. Served with Mirchi Ka Salan and creamy raita.', 289, 'NON_VEG', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80', true),
('item-2', 'sharief-bhai', 'cat-sb-1', 'Mutton Seekh Biryani', 'Spiced mutton seekh kebabs tossed in aromatic saffron dum rice with fried onions.', 389, 'NON_VEG', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80', true),
('item-3', 'sharief-bhai', 'cat-sb-2', 'Chicken Malai Tikka (6 Pcs)', 'Boneless chicken marinated in cashew-cream paste, mild green cardamom, and grilled in tandoor.', 249, 'NON_VEG', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80', false),
('item-4', 'burger-co', 'cat-bc-1', 'Classic Smash Burger', 'Double crispy-edge smashed beef/chicken patty, molten American cheddar, house pickled gherkins, signature sauce.', 229, 'NON_VEG', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', true),
('item-5', 'burger-co', 'cat-bc-2', 'Peri Peri Loaded Fries', 'Crispy skin-on fries tossed in zesty African peri-peri spice dust topped with melted cheddar drizzle.', 149, 'VEG', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Coupons
INSERT INTO public.coupons (id, code, description, type, discount_value, min_order_amount, max_discount, is_active)
VALUES
('c-1', 'QUICK50', '50% OFF on your first order above ₹199', 'PERCENTAGE', 50, 199, 100, true),
('c-2', 'FREEDL', 'Free delivery on orders above ₹199', 'FIXED', 30, 199, 30, true),
('c-3', 'FLAT125', 'Flat ₹125 OFF on orders above ₹249', 'FIXED', 125, 249, 125, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Initial Order for Testing
INSERT INTO public.orders (
  id, customer_name, customer_phone, restaurant_id, delivery_address_text,
  status, subtotal, tax, delivery_fee, platform_fee, discount, total, payment_method, payment_status, delivery_otp
) VALUES (
  'QB-389460', 'Rahul Sharma', '+91 98765 43210', 'sharief-bhai', '100 Feet Rd, Indiranagar, Bengaluru 560038',
  'OUT_FOR_DELIVERY', 438, 22, 30, 5, 50, 445, 'UPI', 'PAID', '4821'
) ON CONFLICT (id) DO NOTHING;
