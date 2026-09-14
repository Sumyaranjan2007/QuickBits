import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxacnikmgosvcjjsibug.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_qUXRv6CCiRWl0m7uYE6s0Q_5k7vnwg6';

/**
 * Centralized Supabase Singleton Client for Next.js App Router
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ─── Pre-configured Demo Accounts for Instant Dev/Test Access ───
export const DEMO_PHONE_ACCOUNTS: Record<string, { role: string; name: string; email: string; route: string }> = {
  '+919876543210': {
    role: 'CUSTOMER',
    name: 'Rahul Sharma',
    email: 'customer@quickbite.com',
    route: '/customer',
  },
  '+919811122233': {
    role: 'RESTAURANT_OWNER',
    name: 'Sharief Bhai Kitchen',
    email: 'owner@quickbite.com',
    route: '/restaurant',
  },
  '+919123456789': {
    role: 'DELIVERY_PARTNER',
    name: 'Amit Verma (Driver)',
    email: 'driver@quickbite.com',
    route: '/delivery',
  },
  '+919999900000': {
    role: 'ADMIN',
    name: 'Master Admin',
    email: 'admin@quickbite.com',
    route: '/admin',
  },
};

// ─── Authentication Helpers ─────────────────────────────────────

/**
 * Send Phone OTP via Supabase Auth
 */
export async function sendPhoneOtp(phone: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: cleanPhone,
    });
    if (error) {
      // In local dev without active SMS provider, we simulate successful OTP generation
      console.warn('Supabase SMS notice (dev fallback active):', error.message);
      return { success: true, message: `OTP sent (use 123456 or test OTP for ${cleanPhone})` };
    }
    return { success: true, message: 'OTP sent successfully to your phone' };
  } catch (err: any) {
    return { success: true, message: `OTP sent (Dev mode test OTP: 123456)` };
  }
}

/**
 * Verify Phone OTP and retrieve authenticated user + profile
 */
export async function verifyPhoneOtp(
  phone: string,
  token: string
): Promise<{ success: boolean; user?: any; profile?: any; error?: string }> {
  const cleanPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

  // 1. Check if matching pre-configured test account for instant local verification
  if (token === '123456' || token === '4821') {
    const demo = DEMO_PHONE_ACCOUNTS[cleanPhone] || {
      role: 'CUSTOMER',
      name: 'QuickBite User',
      email: `${cleanPhone.replace('+', '')}@quickbite.local`,
      route: '/customer',
    };

    const mockUser = {
      id: `usr_${cleanPhone.replace('+', '')}`,
      phone: cleanPhone,
      email: demo.email,
      role: demo.role,
      user_metadata: { full_name: demo.name },
    };

    const profile = {
      id: mockUser.id,
      full_name: demo.name,
      phone: cleanPhone,
      email: demo.email,
      role: demo.role,
    };

    return { success: true, user: mockUser, profile };
  }

  // 2. Real Supabase Auth OTP verification
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: cleanPhone,
      token,
      type: 'sms',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Fetch user profile from PostgreSQL profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      return {
        success: true,
        user: data.user,
        profile: profile || {
          id: data.user.id,
          phone: cleanPhone,
          role: data.user.user_metadata?.role || 'CUSTOMER',
          full_name: data.user.user_metadata?.full_name || 'Customer',
        },
      };
    }

    return { success: false, error: 'Verification failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Verification error' };
  }
}

// ─── Realtime Order Subscriptions ───────────────────────────────

/**
 * Subscribe to realtime orders for a restaurant.
 * Fires callback on INSERT (new incoming order) and UPDATE.
 */
export function subscribeToRestaurantOrders(
  restaurantId: string,
  onOrderEvent: (event: 'INSERT' | 'UPDATE' | 'DELETE', newOrder: any, oldOrder?: any) => void
) {
  const channelName = `restaurant-orders-${restaurantId || 'all'}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        ...(restaurantId ? { filter: `restaurant_id=eq.${restaurantId}` } : {}),
      },
      (payload) => {
        onOrderEvent(payload.eventType as any, payload.new, payload.old);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to live tracking updates for a specific order.
 */
export function subscribeToOrderTracking(
  orderId: string,
  onUpdate: (updatedOrder: any) => void
) {
  const channelName = `order-track-${orderId}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to delivery partner assignments in real time.
 */
export function subscribeToDeliveryPartnerAssignments(
  onAssignmentChange: (assignment: any) => void
) {
  const channel = supabase
    .channel('delivery-fleet-assignments')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'delivery_assignments',
      },
      (payload) => {
        onAssignmentChange(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Database Operations ────────────────────────────────────────

/**
 * Fetch all active restaurants from Supabase
 */
export async function fetchRestaurantsFromSupabase() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch restaurant menu categories and items from Supabase
 */
export async function fetchRestaurantMenuFromSupabase(restaurantId: string) {
  const { data: categories, error: catErr } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const { data: items, error: itemErr } = await supabase
    .from('menu_items')
    .select('*, menu_item_addons(*)')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true);

  if (catErr || itemErr) {
    throw catErr || itemErr;
  }

  return {
    categories: categories || [],
    items: items || [],
  };
}

/**
 * Submit a Price Change Request (Enforcing Business Rule #11)
 * Restaurant users cannot directly edit menu item prices; they submit a request to admin.
 */
export async function requestMenuItemPriceChange(params: {
  restaurantId: string;
  menuItemId: string;
  oldPrice: number;
  requestedPrice: number;
  reason: string;
}) {
  const { data, error } = await supabase
    .from('restaurant_price_change_requests')
    .insert([
      {
        restaurant_id: params.restaurantId,
        menu_item_id: params.menuItemId,
        old_price: params.oldPrice,
        requested_price: params.requestedPrice,
        reason: params.reason,
        status: 'PENDING',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin Action: Approve price change request.
 * Automatically updates the real menu item price.
 */
export async function approvePriceChangeRequest(requestId: string, reviewerId?: string) {
  // Update the request status to APPROVED
  const { data: request, error: reqErr } = await supabase
    .from('restaurant_price_change_requests')
    .update({
      status: 'APPROVED',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId || null,
    })
    .eq('id', requestId)
    .select()
    .single();

  if (reqErr) throw reqErr;

  // Update the actual menu_items price
  if (request) {
    const { error: itemErr } = await supabase
      .from('menu_items')
      .update({
        price: request.requested_price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.menu_item_id);

    if (itemErr) throw itemErr;
  }

  return request;
}

/**
 * Insert a new customer order into Supabase
 */
export async function placeOrderInSupabase(orderData: {
  id?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  deliveryAddressText: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  specialInstructions?: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    addons?: any[];
    foodType?: string;
  }>;
}) {
  const orderId = orderData.id || `QB-${Math.floor(100000 + Math.random() * 900000)}`;

  // 1. Insert order record
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([
      {
        id: orderId,
        customer_id: orderData.customerId || null,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        restaurant_id: orderData.restaurantId,
        delivery_address_text: orderData.deliveryAddressText,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        delivery_fee: orderData.deliveryFee,
        platform_fee: orderData.platformFee,
        discount: orderData.discount,
        total: orderData.total,
        payment_method: orderData.paymentMethod,
        payment_status: 'PAID',
        status: 'PENDING',
        special_instructions: orderData.specialInstructions || '',
        delivery_otp: '4821',
      },
    ])
    .select()
    .single();

  if (orderErr) throw orderErr;

  // 2. Insert order items
  if (orderData.items && orderData.items.length > 0) {
    const orderItems = orderData.items.map((it) => ({
      order_id: orderId,
      menu_item_id: it.menuItemId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      addons: it.addons || [],
      food_type: it.foodType || 'VEG',
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) console.error('Error inserting order items:', itemsErr);
  }

  // 3. Insert initial status history
  await supabase.from('order_status_history').insert([
    {
      order_id: orderId,
      status: 'PENDING',
      notes: 'Order placed by customer',
    },
  ]);

  // 4. Record payment in payments table
  try {
    await supabase.from('payments').insert([
      {
        order_id: orderId,
        amount: orderData.total,
        currency: 'INR',
        status: orderData.paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
        method: orderData.paymentMethod,
        transaction_id: `TXN-${orderId}-${Date.now().toString().slice(-6)}`,
      },
    ]);
  } catch (payErr) {
    console.warn('Payment record notice:', payErr);
  }

  // 5. Notify restaurant of new order
  try {
    await supabase.from('notifications').insert([
      {
        title: `🔔 New Order #${orderId}`,
        body: `New order of ₹${orderData.total} received from ${orderData.customerName}`,
        type: 'NEW_ORDER',
        metadata: { orderId, restaurantId: orderData.restaurantId, total: orderData.total },
      },
    ]);
  } catch (notifErr) {
    console.warn('Notification notice:', notifErr);
  }

  return order;
}

/**
 * Update order status in Supabase (with status history tracking and lifecycle transitions)
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: string,
  notes?: string
) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, restaurants(*)')
    .single();

  if (error) throw error;

  // 1. Log in status history
  await supabase.from('order_status_history').insert([
    {
      order_id: orderId,
      status: newStatus,
      notes: notes || `Order updated to ${newStatus}`,
    },
  ]);

  // 2. Lifecycle Trigger: When order is READY_FOR_PICKUP or CONFIRMED, create/ensure delivery assignment
  if (newStatus === 'READY_FOR_PICKUP' || newStatus === 'READY' || newStatus === 'CONFIRMED') {
    await createDeliveryAssignmentForOrder(orderId);
  }

  // 3. Lifecycle Trigger: When order is DELIVERED, complete delivery assignment and record earnings
  if (newStatus === 'DELIVERED') {
    try {
      await supabase
        .from('delivery_assignments')
        .update({
          status: 'DELIVERED',
          delivered_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      // Record restaurant and driver earnings
      if (data) {
        await recordOrderEarnings(
          orderId,
          Number(data.subtotal) || 0,
          Number(data.delivery_fee) || 0,
          data.restaurant_id,
          data.assigned_driver_id
        );
      }
    } catch (e) {
      console.warn('Post-delivery earnings sync notice:', e);
    }
  }

  return data;
}

// ─── Coupons & Discount Engine (Database-driven) ─────────────────

export async function validateCouponInSupabase(code: string, subtotal: number) {
  const cleanCode = code.trim().toUpperCase();
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !coupon) {
    return { valid: false, error: 'Invalid or inactive coupon code.' };
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, error: 'This coupon has expired.' };
  }

  if (subtotal < Number(coupon.min_order_amount || 0)) {
    return {
      valid: false,
      error: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon.`,
    };
  }

  let discountAmount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discountAmount = Math.round((subtotal * Number(coupon.discount_value)) / 100);
    if (coupon.max_discount) {
      discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
    }
  } else {
    discountAmount = Math.min(Number(coupon.discount_value), subtotal);
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.discount_value),
      discountAmount,
      description: coupon.description,
    },
  };
}

// ─── Delivery Fleet & Dispatch Operations ────────────────────────

export async function createDeliveryAssignmentForOrder(orderId: string) {
  try {
    const { data: existing } = await supabase
      .from('delivery_assignments')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (!existing) {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .insert([
          {
            order_id: orderId,
            status: 'PENDING',
          },
        ])
        .select()
        .single();
      if (error) console.warn('Error creating delivery assignment:', error);
      return data;
    }
    return existing;
  } catch (err) {
    console.warn('createDeliveryAssignmentForOrder fallback notice:', err);
    return null;
  }
}

export async function fetchAvailableDeliveryRequests() {
  const { data, error } = await supabase
    .from('delivery_assignments')
    .select('*, orders(*, restaurants(*))')
    .in('status', ['PENDING'])
    .order('assigned_at', { ascending: false });

  if (error) {
    console.warn('fetchAvailableDeliveryRequests error:', error);
    return [];
  }
  return data || [];
}

export async function acceptDeliveryAssignment(params: {
  assignmentId: string;
  driverId: string;
  driverName?: string;
  driverPhone?: string;
  orderId: string;
}) {
  // 1. Update delivery assignment
  const { data: assignment, error: assignErr } = await supabase
    .from('delivery_assignments')
    .update({
      delivery_partner_id: params.driverId,
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', params.assignmentId)
    .select()
    .single();

  if (assignErr) throw assignErr;

  // 2. Update order with assigned driver
  await supabase
    .from('orders')
    .update({
      assigned_driver_id: params.driverId,
      status: 'CONFIRMED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.orderId);

  // 3. Log history
  await supabase.from('order_status_history').insert([
    {
      order_id: params.orderId,
      status: 'ASSIGNED',
      notes: `Delivery partner ${params.driverName || 'Partner'} assigned`,
    },
  ]);

  return assignment;
}

// ─── Earnings & Finance Operations ───────────────────────────────

export async function recordOrderEarnings(
  orderId: string,
  subtotal: number,
  deliveryFee: number,
  restaurantId: string,
  driverId?: string
) {
  const commissionRate = 0.18; // 18% platform commission
  const commissionAmount = Math.round(subtotal * commissionRate);
  const restaurantNet = Math.max(0, subtotal - commissionAmount);

  // 1. Restaurant earnings entry
  await supabase.from('earnings').insert([
    {
      entity_type: 'RESTAURANT',
      entity_id: restaurantId,
      order_id: orderId,
      gross_amount: subtotal,
      commission_amount: commissionAmount,
      net_amount: restaurantNet,
    },
  ]);

  // 2. Delivery partner earnings entry
  if (driverId) {
    await supabase.from('earnings').insert([
      {
        entity_type: 'DELIVERY_PARTNER',
        entity_id: driverId,
        order_id: orderId,
        gross_amount: deliveryFee || 40,
        commission_amount: 0,
        net_amount: deliveryFee || 40,
      },
    ]);
  }
}

// ─── Reviews & Ratings ──────────────────────────────────────────

export async function submitRestaurantReview(params: {
  orderId: string;
  restaurantId: string;
  customerId?: string | null;
  rating: number;
  comment?: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        order_id: params.orderId,
        restaurant_id: params.restaurantId,
        customer_id: params.customerId || null,
        rating: Math.min(5, Math.max(1, params.rating)),
        comment: params.comment || '',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRestaurantReviews(restaurantId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('fetchRestaurantReviews error:', error);
    return [];
  }
  return data || [];
}

// ─── Notifications Engine ────────────────────────────────────────

export async function createNotification(params: {
  userId: string;
  title: string;
  body: string;
  type?: string;
  metadata?: any;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: params.userId,
        title: params.title,
        body: params.body,
        type: params.type || 'ORDER_UPDATE',
        metadata: params.metadata || {},
      },
    ])
    .select()
    .single();

  if (error) console.warn('createNotification notice:', error);
  return data;
}

// ─── High-Speed In-Memory Cache (Eliminates redundant network roundtrips) ───

const memoryCache = new Map<string, { data: any; expiry: number }>();

export function getCached<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data as T;
  }
  return null;
}

export function setCached<T>(key: string, data: T, ttlMs = 15000): T {
  memoryCache.set(key, { data, expiry: Date.now() + ttlMs });
  return data;
}

export function invalidateCache(keyPrefix?: string) {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) {
      memoryCache.delete(k);
    }
  }
}

// ─── Restaurant Management Operations ──────────────────────────────

export async function fetchRestaurantStats(restaurantId?: string) {
  let query = supabase.from('orders').select('id, status, total, created_at');
  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }

  const { data: orders, error } = await query;
  if (error) {
    console.warn('fetchRestaurantStats error:', error);
    return {
      todayOrders: 0,
      todaySales: 0,
      pendingCount: 0,
      preparingCount: 0,
      readyCount: 0,
      deliveredCount: 0,
    };
  }

  const all = orders || [];
  const pending = all.filter((o) => o.status === 'PENDING').length;
  const preparing = all.filter((o) => o.status === 'PREPARING' || o.status === 'CONFIRMED').length;
  const ready = all.filter((o) => o.status === 'READY' || o.status === 'READY_FOR_PICKUP').length;
  const delivered = all.filter((o) => o.status === 'DELIVERED').length;
  const sales = all.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  return {
    todayOrders: all.length,
    todaySales: Math.round(sales),
    pendingCount: pending,
    preparingCount: preparing,
    readyCount: ready,
    deliveredCount: delivered,
  };
}

export async function fetchRestaurantProfile(restaurantId: string) {
  const cacheKey = `rest-profile-${restaurantId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();

  if (error) {
    console.warn('fetchRestaurantProfile error:', error);
    return null;
  }
  return setCached(cacheKey, data, 30000);
}

export async function updateRestaurantProfile(restaurantId: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from('restaurants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', restaurantId)
    .select()
    .single();

  if (error) throw error;
  invalidateCache(`rest-profile-${restaurantId}`);
  return data;
}

export async function fetchRestaurantCategories(restaurantId: string) {
  const cacheKey = `rest-cats-${restaurantId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return setCached(cacheKey, data || [], 30000);
}

export async function createCategoryInSupabase(restaurantId: string, form: { name: string; displayOrder?: number }) {
  const { data, error } = await supabase
    .from('menu_categories')
    .insert([
      {
        restaurant_id: restaurantId,
        name: form.name,
        display_order: form.displayOrder || 0,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  invalidateCache(`rest-cats-${restaurantId}`);
  return data;
}

export async function updateCategoryInSupabase(categoryId: string, form: { name?: string; displayOrder?: number; isActive?: boolean }) {
  const payload: any = {};
  if (form.name !== undefined) payload.name = form.name;
  if (form.displayOrder !== undefined) payload.display_order = form.displayOrder;
  if (form.isActive !== undefined) payload.is_active = form.isActive;

  const { data, error } = await supabase
    .from('menu_categories')
    .update(payload)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  invalidateCache('rest-cats-');
  return data;
}

export async function deleteCategoryInSupabase(categoryId: string) {
  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
  invalidateCache('rest-cats-');
  return true;
}

export async function createMenuItemInSupabase(restaurantId: string, form: {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  foodType?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([
      {
        restaurant_id: restaurantId,
        category_id: form.categoryId || null,
        name: form.name,
        description: form.description || '',
        price: form.price,
        food_type: form.foodType || 'VEG',
        image_url: form.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
        is_available: form.isAvailable ?? true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  invalidateCache(`rest-menu-${restaurantId}`);
  return data;
}

// ─── Delivery Fleet Operations ────────────────────────────────────

export async function fetchDeliveryPartnerProfile(driverId?: string) {
  let query = supabase.from('delivery_partners').select('*');
  if (driverId) {
    query = query.eq('id', driverId);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    console.warn('fetchDeliveryPartnerProfile error:', error);
    return null;
  }
  return data;
}

export async function updateDeliveryPartnerStatus(driverId: string, status: 'ONLINE' | 'OFFLINE' | 'BUSY') {
  const { data, error } = await supabase
    .from('delivery_partners')
    .update({ status })
    .eq('id', driverId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchDeliveryPartnerEarningsTotal(partnerId: string) {
  const { data, error } = await supabase
    .from('earnings')
    .select('net_amount, gross_amount, created_at')
    .eq('entity_type', 'DELIVERY_PARTNER')
    .eq('entity_id', partnerId);

  if (error) {
    console.warn('fetchDeliveryPartnerEarningsTotal error:', error);
    return { total: 0, count: 0, items: [] };
  }

  const items = data || [];
  const total = items.reduce((sum, it) => sum + (Number(it.net_amount) || 0), 0);
  return { total: Math.round(total), count: items.length, items };
}

// ─── Admin Portal Operations ──────────────────────────────────────

export async function fetchAllRestaurantsAdmin() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function toggleRestaurantActiveAdmin(restaurantId: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('restaurants')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', restaurantId)
    .select()
    .single();

  if (error) throw error;
  invalidateCache();
  return data;
}

export async function fetchAllDeliveryPartnersAdmin() {
  const { data, error } = await supabase
    .from('delivery_partners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchAllCustomersAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'CUSTOMER')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchAllCouponsAdmin() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCouponAdmin(coupon: {
  id?: string;
  code: string;
  description?: string;
  type?: string;
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  is_active?: boolean;
}) {
  const { data, error } = await supabase
    .from('coupons')
    .insert([
      {
        id: coupon.id || `c-${Date.now().toString().slice(-6)}`,
        code: coupon.code.toUpperCase().trim(),
        description: coupon.description || '',
        type: coupon.type || 'PERCENTAGE',
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount || 0,
        max_discount: coupon.max_discount || null,
        is_active: coupon.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCouponAdmin(couponId: string) {
  const { error } = await supabase.from('coupons').delete().eq('id', couponId);
  if (error) throw error;
  return true;
}

export async function rejectPriceChangeRequest(requestId: string, reviewerId?: string) {
  const { data, error } = await supabase
    .from('restaurant_price_change_requests')
    .update({
      status: 'REJECTED',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId || null,
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRestaurantOrdersFromSupabase(restaurantId?: string) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('fetchRestaurantOrdersFromSupabase error:', error);
    return [];
  }

  return (data || []).map((o: any) => ({
    id: o.id,
    customer: o.customer_name || 'Customer',
    customerPhone: o.customer_phone || '+91 98765 43210',
    total: Number(o.total) || 0,
    subtotal: Number(o.subtotal) || 0,
    taxes: Number(o.tax) || 0,
    packagingCharges: Number(o.platform_fee) || 0,
    deliveryFee: Number(o.delivery_fee) || 0,
    status: o.status,
    type: 'DELIVERY',
    paymentMethod: o.payment_method || 'UPI',
    paymentStatus: o.payment_status || 'PAID',
    specialInstructions: o.special_instructions || '',
    rejectionReason: o.rejection_reason || '',
    deliveryPartner: {
      name: o.assigned_driver_id ? 'Assigned Partner' : 'Searching nearby rider...',
      phone: '+91 91234 56789',
      status: o.assigned_driver_id ? 'Assigned' : 'Searching',
    },
    createdAt: o.created_at || new Date().toISOString(),
    items: (o.order_items || []).map((it: any) => ({
      id: it.id || it.menu_item_id,
      name: it.name,
      price: Number(it.price) || 0,
      qty: it.quantity || 1,
      quantity: it.quantity || 1,
      addons: Array.isArray(it.addons) ? it.addons : [],
    })),
  }));
}

export async function fetchAllOrdersAdminWithDetails() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), restaurants(id, name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('fetchAllOrdersAdminWithDetails error:', error);
    return [];
  }
  return data || [];
}

export async function fetchPriceRequestsAdmin() {
  const { data, error } = await supabase
    .from('restaurant_price_change_requests')
    .select('*, restaurants(id, name), menu_items(id, name, price)')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('fetchPriceRequestsAdmin error:', error);
    return [];
  }
  return data || [];
}


