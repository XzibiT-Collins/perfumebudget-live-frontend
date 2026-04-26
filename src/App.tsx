/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';

// Pages
import { Home } from './pages/Home';
import { ProductListingPage } from './pages/ProductListing';
import { ProductDetails } from './pages/ProductDetails';
import { CategoryListing } from './pages/CategoryListing';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OrderHistory } from './pages/OrderHistory';
import { AdminDashboard } from './pages/AdminDashboard';
import { Analytics } from './pages/Analytics';
import { ProductManagement } from './pages/ProductManagement';
import { AdminProductDetails } from './pages/AdminProductDetails';
import { CategoryManagement } from './pages/CategoryManagement';
import { OrderManagement } from './pages/OrderManagement';
import { OrderDetail } from './pages/OrderDetail';
import { CouponManagement } from './pages/CouponManagement';
import { TaxManagement } from './pages/TaxManagement';
import { CustomerManagement } from './pages/CustomerManagement';
import { CustomerDetails } from './pages/CustomerDetails';
import { CustomerProfile } from './pages/CustomerProfile';
import { WalkInOrderList } from './pages/WalkInOrderList';
import { WalkInOrderCreation } from './pages/WalkInOrderCreation';
import { WalkInOrderDetail } from './pages/WalkInOrderDetail';
import { Accounting } from './pages/Accounting';
import { Bookkeeping } from './pages/Bookkeeping';
import { CartDrawer } from './components/CartDrawer';
import { OAuth2RedirectHandler } from './pages/OAuth2RedirectHandler';
import { VerifyOtp } from './pages/VerifyOtp';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { FeatureFlagManagement } from './pages/FeatureFlagManagement';
import { FrontDeskUserManagement } from './pages/FrontDeskUserManagement';
import { FrontDeskTemplate } from './pages/FrontDeskTemplate';
import { FrontDeskUserPermissions } from './pages/FrontDeskUserPermissions';
import { AdminHomeRedirect } from './components/AdminHomeRedirect';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Layout>
              <CartDrawer />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/products/:slug" element={<ProductDetails />} />
                <Route path="/categories" element={<CategoryListing />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
                <Route path="/verify-email" element={<VerifyOtp />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Customer Routes */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.ADMIN]} />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/profile" element={<CustomerProfile />} />
                </Route>

                {/* Admin/Front Desk Shared Routes */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.FRONT_DESK]} />}>
                  <Route path="/admin" element={<AdminHomeRedirect />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<ProductManagement />} />
                  <Route path="/admin/products/:productId" element={<AdminProductDetails />} />
                  <Route path="/admin/walk-in" element={<WalkInOrderList />} />
                  <Route path="/admin/walk-in/new" element={<WalkInOrderCreation />} />
                  <Route path="/admin/walk-in/:orderNumber" element={<WalkInOrderDetail />} />
                  <Route path="/admin/customers" element={<CustomerManagement />} />
                  <Route path="/admin/customers/:id" element={<CustomerDetails />} />
                </Route>

                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/categories" element={<CategoryManagement />} />
                  <Route path="/admin/orders" element={<OrderManagement />} />
                  <Route path="/admin/orders/:orderNumber" element={<OrderDetail />} />
                  <Route path="/admin/coupons" element={<CouponManagement />} />
                  <Route path="/admin/taxes" element={<TaxManagement />} />
                  <Route path="/admin/accounting" element={<Accounting />} />
                  <Route path="/admin/bookkeeping" element={<Bookkeeping />} />
                  <Route path="/admin/settings" element={<FeatureFlagManagement />} />
                  <Route path="/admin/front-desk" element={<FrontDeskUserManagement />} />
                  <Route path="/admin/front-desk/template" element={<FrontDeskTemplate />} />
                  <Route path="/admin/front-desk/users/:userId/permissions" element={<FrontDeskUserPermissions />} />
                </Route>
              </Routes>
            </Layout>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '16px',
                  background: '#1A1A1A',
                  color: '#fff',
                  padding: '16px 24px',
                },
              }}
            />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
