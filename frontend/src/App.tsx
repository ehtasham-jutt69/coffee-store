import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Common
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';

// Store Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Collections } from './pages/Collections';
import { CoffeeGuide } from './pages/CoffeeGuide';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Wishlist } from './pages/Wishlist';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { ShippingReturns } from './pages/ShippingReturns';

// Customer Portal
import { AccountLayout } from './pages/customer/AccountLayout';
import { AccountDashboard } from './pages/customer/AccountDashboard';
import { Orders } from './pages/customer/Orders';
import { OrderDetail } from './pages/customer/OrderDetail';
import { Profile } from './pages/customer/Profile';
import { Addresses } from './pages/customer/Addresses';

// Admin Portal
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminReviews } from './pages/admin/AdminReviews';

// Public Layout Wrapper
const StoreLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-espresso-950 font-sans text-espresso-100 antialiased selection:bg-amber-500 selection:text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// 404 Page
const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="font-serif text-6xl font-bold text-amber-500 mb-2">404</span>
      <h2 className="font-serif text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-xs text-espresso-400 mb-6 max-w-sm">
        The coffee roast or page you're searching for seems to have been retired or moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
      >
        Return to Roastery Home
      </Link>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                {/* PUBLIC STORE ROUTES */}
                <Route element={<StoreLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/guide" element={<CoffeeGuide />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/shipping" element={<ShippingReturns />} />

                  {/* CUSTOMER PORTAL */}
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AccountDashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:orderNumber" element={<OrderDetail />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="addresses" element={<Addresses />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* ADMIN PORTAL (ISOLATED FULL-SCREEN LAYOUT) */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="reviews" element={<AdminReviews />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
