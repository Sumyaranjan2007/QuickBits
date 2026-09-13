import { IApiResponse } from '@quickbite/types';

const DEFAULT_BASE_URL = 'http://localhost:3000/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
};

let _baseUrl = DEFAULT_BASE_URL;
let _getToken: (() => Promise<string | null>) | null = null;

export function configureApiClient(options: {
  baseUrl?: string;
  getToken?: () => Promise<string | null>;
}) {
  if (options.baseUrl) _baseUrl = options.baseUrl;
  if (options.getToken) _getToken = options.getToken;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  let url = `${_baseUrl}${path}`;
  if (params) {
    const filtered = Object.entries(params).filter(([, v]) => v !== undefined);
    if (filtered.length > 0) {
      url += '?' + filtered.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
    }
  }
  return url;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<IApiResponse<T>> {
  const { method = 'GET', body, headers = {}, params } = options;
  const url = buildUrl(path, params);

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as any;

  if (!res.ok) {
    const error = new Error(json?.message || `API Error: ${res.status}`) as Error & { status: number; data: unknown };
    error.status = res.status;
    error.data = json;
    throw error;
  }

  return json as IApiResponse<T>;
}

// ─── Auth ────────────────────────────────────────────────

export const authApi = {
  register: (data: { email?: string; phone?: string; password: string; firstName: string; lastName: string; role?: string }) =>
    request('/auth/register', { method: 'POST', body: data }),

  login: (data: { email?: string; phone?: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: data }),

  sendOtp: (phone: string) =>
    request('/auth/otp/send', { method: 'POST', body: { phone } }),

  verifyOtp: (phone: string, otp: string) =>
    request('/auth/otp/verify', { method: 'POST', body: { phone, otp } }),

  refreshToken: (refreshToken: string) =>
    request('/auth/refresh', { method: 'POST', body: { refreshToken } }),

  getProfile: () => request('/auth/profile'),

  logout: () => request('/auth/logout', { method: 'POST' }),
};

// ─── Restaurants ─────────────────────────────────────────

export const restaurantsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; cuisine?: string }) =>
    request('/restaurants', { params }),

  getById: (id: string) =>
    request(`/restaurants/${id}`),

  create: (data: Record<string, unknown>) =>
    request('/restaurants', { method: 'POST', body: data }),

  update: (id: string, data: Record<string, unknown>) =>
    request(`/restaurants/${id}`, { method: 'PATCH', body: data }),

  getMyRestaurant: () =>
    request('/restaurants/my/restaurant'),

  // Menu
  createCategory: (restaurantId: string, data: { name: string; sortOrder?: number }) =>
    request(`/restaurants/${restaurantId}/categories`, { method: 'POST', body: data }),

  updateCategory: (restaurantId: string, categoryId: string, data: Record<string, unknown>) =>
    request(`/restaurants/${restaurantId}/categories/${categoryId}`, { method: 'PATCH', body: data }),

  deleteCategory: (restaurantId: string, categoryId: string) =>
    request(`/restaurants/${restaurantId}/categories/${categoryId}`, { method: 'DELETE' }),

  createMenuItem: (restaurantId: string, data: Record<string, unknown>) =>
    request(`/restaurants/${restaurantId}/menu-items`, { method: 'POST', body: data }),

  updateMenuItem: (restaurantId: string, itemId: string, data: Record<string, unknown>) =>
    request(`/restaurants/${restaurantId}/menu-items/${itemId}`, { method: 'PATCH', body: data }),

  toggleItemAvailability: (restaurantId: string, itemId: string) =>
    request(`/restaurants/${restaurantId}/menu-items/${itemId}/toggle`, { method: 'PATCH' }),
};

// ─── Cart ────────────────────────────────────────────────

export const cartApi = {
  get: () => request('/cart'),

  addItem: (data: { restaurantId: string; menuItemId: string; quantity?: number; addons?: string[]; specialInstructions?: string }) =>
    request('/cart/items', { method: 'POST', body: data }),

  updateItem: (itemId: string, data: { quantity: number }) =>
    request(`/cart/items/${itemId}`, { method: 'PUT', body: data }),

  removeItem: (itemId: string) =>
    request(`/cart/items/${itemId}`, { method: 'DELETE' }),

  clear: () => request('/cart', { method: 'DELETE' }),
};

// ─── Orders ──────────────────────────────────────────────

export const ordersApi = {
  create: (data: { deliveryAddressId: string; paymentMethod: string; couponId?: string; specialInstructions?: string }) =>
    request('/orders', { method: 'POST', body: data }),

  getMyOrders: (params?: { page?: number; limit?: number }) =>
    request('/orders/my-orders', { params }),

  getById: (id: string) =>
    request(`/orders/${id}`),

  getStatusHistory: (id: string) =>
    request(`/orders/${id}/history`),

  updateStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),

  getRestaurantOrders: (restaurantId: string, params?: { status?: string }) =>
    request(`/orders/restaurant/${restaurantId}`, { params }),
};

// ─── Delivery ────────────────────────────────────────────

export const deliveryApi = {
  register: (data: { vehicleType: string; vehicleNumber: string; licenseNumber: string }) =>
    request('/delivery/register', { method: 'POST', body: data }),

  getProfile: () => request('/delivery/profile'),

  toggleOnline: (isOnline: boolean) =>
    request('/delivery/toggle-online', { method: 'PATCH', body: { isOnline } }),

  getPendingAssignments: () =>
    request('/delivery/assignments/pending'),

  getActiveAssignment: () =>
    request('/delivery/assignments/active'),

  updateAssignmentStatus: (assignmentId: string, status: string) =>
    request(`/delivery/assignments/${assignmentId}/status`, { method: 'PATCH', body: { status } }),

  updateLocation: (latitude: number, longitude: number) =>
    request('/delivery/location', { method: 'PATCH', body: { latitude, longitude } }),

  getEarnings: () => request('/delivery/earnings'),

  getHistory: () => request('/delivery/history'),
};

// ─── Addresses ───────────────────────────────────────────

export const addressesApi = {
  list: () => request('/addresses'),

  create: (data: Record<string, unknown>) =>
    request('/addresses', { method: 'POST', body: data }),

  update: (id: string, data: Record<string, unknown>) =>
    request(`/addresses/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    request(`/addresses/${id}`, { method: 'DELETE' }),

  setDefault: (id: string) =>
    request(`/addresses/${id}/default`, { method: 'PATCH' }),
};

// ─── Reviews ─────────────────────────────────────────────

export const reviewsApi = {
  create: (data: { orderId: string; restaurantRating: number; foodRating: number; deliveryRating?: number; comment?: string }) =>
    request('/reviews', { method: 'POST', body: data }),

  getByRestaurant: (restaurantId: string) =>
    request(`/reviews/restaurant/${restaurantId}`),

  getByOrder: (orderId: string) =>
    request(`/reviews/order/${orderId}`),
};

// ─── Coupons ─────────────────────────────────────────────

export const couponsApi = {
  list: () => request('/coupons'),

  getActive: () => request('/coupons/active'),

  validate: (code: string, orderAmount: number) =>
    request('/coupons/validate', { method: 'POST', body: { code, orderAmount } }),
};

// ─── Notifications ───────────────────────────────────────

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    request('/notifications', { params }),

  getUnreadCount: () =>
    request('/notifications/unread-count'),

  markRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    request('/notifications/read-all', { method: 'PATCH' }),
};

// ─── Admin ───────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => request('/admin/dashboard'),

  getCustomers: (params?: { page?: number; limit?: number; search?: string }) =>
    request('/admin/customers', { params }),

  toggleCustomerBlock: (userId: string) =>
    request(`/admin/customers/${userId}/toggle-block`, { method: 'PATCH' }),

  getRestaurants: (params?: { page?: number; limit?: number; status?: string }) =>
    request('/admin/restaurants', { params }),

  updateRestaurantApproval: (id: string, status: string) =>
    request(`/admin/restaurants/${id}/approval`, { method: 'PATCH', body: { status } }),

  updateRestaurantCommission: (id: string, rate: number) =>
    request(`/admin/restaurants/${id}/commission`, { method: 'PATCH', body: { rate } }),

  getDeliveryPartners: (params?: { page?: number; limit?: number; status?: string }) =>
    request('/admin/delivery-partners', { params }),

  updatePartnerApproval: (id: string, status: string) =>
    request(`/admin/delivery-partners/${id}/approval`, { method: 'PATCH', body: { status } }),

  getOrders: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    request('/admin/orders', { params }),

  getRevenueReport: (days?: number) =>
    request('/admin/reports/revenue', { params: { days } }),
};

// ─── Price Requests ──────────────────────────────────────

export const priceRequestsApi = {
  create: (restaurantId: string, itemId: string, data: { requestedPrice: number; reason: string; note?: string }) =>
    request(`/restaurants/${restaurantId}/items/${itemId}/price-request`, { method: 'POST', body: data }),

  getByRestaurant: (restaurantId: string) =>
    request(`/restaurants/${restaurantId}/price-requests`),

  listAllAdmin: () =>
    request('/restaurants/admin/price-requests'),

  approve: (requestId: string) =>
    request(`/restaurants/admin/price-requests/${requestId}/approve`, { method: 'POST' }),

  reject: (requestId: string, data: { reason: string }) =>
    request(`/restaurants/admin/price-requests/${requestId}/reject`, { method: 'POST', body: data }),

  getAuditLogs: () =>
    request('/restaurants/admin/price-requests/audit'),
};

