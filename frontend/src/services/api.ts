import {
  IProduct,
  ICategory,
  IUser,
  IOrder,
  IReview,
  ICoupon,
  IAddress
} from '../types';

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const API_BASE = `${API_URL}/api`;

// Helper for HTTP requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('kavah_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during request.');
  }

  return data;
}

export const api = {
  // Auth & Account
  signup: (userData: any) => request<{ success: boolean; token: string; user: IUser; message: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  login: (credentials: { email: string; password: string }) => request<{ success: boolean; token: string; user: IUser; message: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) => request<{ success: boolean; message: string; resetToken?: string; resetUrl?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  resetPassword: (payload: { token: string; password: string; confirmPassword?: string }) => request<{ success: boolean; token: string; user: IUser; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: () => request<{ success: boolean; user: IUser }>('/auth/me'),
  updateProfile: (profileData: { firstName?: string; lastName?: string; phone?: string }) => request<{ success: boolean; user: IUser; message: string }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  changePassword: (passwords: { currentPassword: string; newPassword: string; confirmPassword: string }) => request<{ success: boolean; message: string }>('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwords)
  }),

  // Customer Addresses
  addAddress: (address: IAddress) => request<{ success: boolean; addresses: IAddress[]; message: string }>('/auth/addresses', {
    method: 'POST',
    body: JSON.stringify(address)
  }),
  updateAddress: (id: string, address: IAddress) => request<{ success: boolean; addresses: IAddress[]; message: string }>(`/auth/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(address)
  }),
  deleteAddress: (id: string) => request<{ success: boolean; addresses: IAddress[]; message: string }>(`/auth/addresses/${id}`, {
    method: 'DELETE'
  }),

  // Products
  getProducts: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ success: boolean; products: IProduct[]; total: number; page: number; pages: number }>(`/products${query}`);
  },
  getFeaturedProducts: () => request<{ success: boolean; products: IProduct[] }>('/products?featured=true&limit=8'),
  getProductBySlug: (slug: string) => request<{ success: boolean; product: IProduct; relatedProducts: IProduct[] }>(`/products/slug/${slug}`),
  getProductById: (id: string) => request<{ success: boolean; product: IProduct }>(`/products/${id}`),
  createProduct: (productData: any) => request<{ success: boolean; product: IProduct; message: string }>('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),
  updateProduct: (id: string, productData: any) => request<{ success: boolean; product: IProduct; message: string }>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),
  deleteProduct: (id: string) => request<{ success: boolean; message: string }>(`/products/${id}`, {
    method: 'DELETE'
  }),
  updateInventory: (id: string, inventory: number) => request<{ success: boolean; inventory: number; message: string }>(`/products/${id}/inventory`, {
    method: 'PATCH',
    body: JSON.stringify({ inventory })
  }),

  // Categories
  getCategories: () => request<{ success: boolean; categories: ICategory[] }>('/categories'),

  // Orders
  createOrder: (orderPayload: any) => request<{ success: boolean; order: IOrder; message: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload)
  }),
  getMyOrders: (email?: string) => {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    return request<{ success: boolean; count: number; orders: IOrder[] }>(`/orders/my${query}`);
  },
  getOrderById: (identifier: string) => request<{ success: boolean; order: IOrder }>(`/orders/${identifier}`),
  getOrderByNumber: (orderNumber: string) => request<{ success: boolean; order: IOrder }>(`/orders/${orderNumber}`),
  getAllOrdersAdmin: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params as any);
    return request<{ success: boolean; orders: IOrder[]; total: number; page: number; pages: number }>(`/orders?${searchParams.toString()}`);
  },
  getAdminOrders: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params as any);
    return request<{ success: boolean; orders: IOrder[]; total: number; page: number; pages: number }>(`/orders?${searchParams.toString()}`);
  },
  updateOrderStatusAdmin: (id: string, statusPayload: { orderStatus?: string; paymentStatus?: string; trackingNumber?: string }) => request<{ success: boolean; order: IOrder; message: string }>(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusPayload)
  }),
  updateOrderStatus: (id: string, statusPayload: { orderStatus?: string; paymentStatus?: string; trackingNumber?: string }) => request<{ success: boolean; order: IOrder; message: string }>(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusPayload)
  }),

  // Coupons
  validateCoupon: (code: string, subtotal: number) => request<{ success: boolean; message: string; coupon: { code: string; discountType: string; discountValue: number; discountAmount: number; description: string } }>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal })
  }),
  getCouponsAdmin: () => request<{ success: boolean; coupons: ICoupon[] }>('/coupons'),
  getAdminCoupons: () => request<{ success: boolean; coupons: ICoupon[] }>('/coupons'),
  createCouponAdmin: (data: any) => request<{ success: boolean; coupon: ICoupon; message: string }>('/coupons', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  createCoupon: (data: any) => request<{ success: boolean; coupon: ICoupon; message: string }>('/coupons', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCouponAdmin: (id: string, data: any) => request<{ success: boolean; coupon: ICoupon; message: string }>(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateCoupon: (id: string, data: any) => request<{ success: boolean; coupon: ICoupon; message: string }>(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCouponAdmin: (id: string) => request<{ success: boolean; message: string }>(`/coupons/${id}`, {
    method: 'DELETE'
  }),
  deleteCoupon: (id: string) => request<{ success: boolean; message: string }>(`/coupons/${id}`, {
    method: 'DELETE'
  }),

  // Reviews
  getProductReviews: (productId: string) => request<{ success: boolean; total: number; averageRating: number; distribution: Record<number, number>; reviews: IReview[] }>(`/reviews/product/${productId}`),
  createReview: (reviewData: { productId: string; rating: number; title: string; comment: string; customerName?: string }) => request<{ success: boolean; review: IReview; message: string }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),
  getAllReviewsAdmin: () => request<{ success: boolean; count: number; reviews: IReview[] }>('/reviews'),
  getAdminReviews: () => request<{ success: boolean; count: number; reviews: IReview[] }>('/reviews'),
  updateReviewStatusAdmin: (id: string, approved: boolean) => request<{ success: boolean; review: IReview; message: string }>(`/reviews/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ approved })
  }),
  updateReview: (id: string, payload: { approved: boolean }) => request<{ success: boolean; review: IReview; message: string }>(`/reviews/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),
  deleteReview: (id: string) => request<{ success: boolean; message: string }>(`/reviews/${id}`, {
    method: 'DELETE'
  }),

  // Wishlist
  getWishlist: () => request<{ success: boolean; wishlist: IProduct[] }>('/wishlist'),
  addToWishlist: (productId: string) => request<{ success: boolean; wishlist: IProduct[]; message: string }>(`/wishlist/${productId}`, {
    method: 'POST'
  }),
  removeFromWishlist: (productId: string) => request<{ success: boolean; wishlist: IProduct[]; message: string }>(`/wishlist/${productId}`, {
    method: 'DELETE'
  }),
  syncWishlist: (productIds: string[]) => request<{ success: boolean; wishlist: IProduct[]; message: string }>('/wishlist/sync', {
    method: 'POST',
    body: JSON.stringify({ productIds })
  }),

  // Admin Dashboard
  getAdminStats: () => request<{
    success: boolean;
    stats: { totalRevenue: number; totalOrders: number; totalCustomers: number; totalProducts: number; lowStockCount: number };
    lowStockProducts: any[];
    recentOrders: any[];
    recentCustomers: any[];
    statusCounts: any[];
    recentSalesTrend: any[];
  }>('/admin/dashboard'),
  getAdminCustomers: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params as any);
    return request<{ success: boolean; customers: any[]; total: number; page: number; pages: number }>(`/admin/customers?${searchParams.toString()}`);
  },
  getAdminUsers: async (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params as any);
    const res = await request<{ success: boolean; customers: any[]; total: number; page: number; pages: number }>(`/admin/customers?${searchParams.toString()}`);
    return {
      success: res.success,
      users: res.customers.map(c => ({
        id: c._id || c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        role: c.role || 'customer',
        phone: c.phone,
        addresses: c.addresses || []
      }))
    };
  }
};
