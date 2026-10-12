import ErrorBoundary from './components/ErrorBoundary';
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';

// Layouts & Route Protection
import WorkspaceLayout from './components/WorkspaceLayout';
import ProtectedRoute from './components/ProtectedRoute';
const CustomerLayout = lazy(() => import('./pages/customer/CustomerLayout'));

// Public & Auth Pages
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const DemoPortalPage = lazy(() => import('./pages/demo/DemoPortalPage'));

// Customer QR Portal Pages
const MenuPage = lazy(() => import('./pages/customer/MenuPage'));
const OrderPayPage = lazy(() => import('./pages/customer/OrderPayPage'));
const OrderStatusPage = lazy(() => import('./pages/customer/OrderStatusPage'));
const BookTablePage = lazy(() => import('./pages/customer/BookTablePage'));

// Staff & Operations Pages
const KitchenKanbanPage = lazy(() => import('./pages/staff/KitchenKanbanPage'));
const KitchenDashboard = lazy(() => import('./pages/staff/KitchenDashboard'));
const WaiterDashboard = lazy(() => import('./pages/staff/WaiterDashboard'));

// Biller & POS Pages
const BillerDashboard = lazy(() => import('./pages/biller/BillerDashboard'));
const BillerHistory = lazy(() => import('./pages/biller/BillerHistory'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const MenuManagement = lazy(() => import('./pages/admin/MenuManagement'));
const TableManagement = lazy(() => import('./pages/admin/TableManagement'));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement'));
const RecipeManagement = lazy(() => import('./pages/admin/RecipeManagement'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'));
const ConfigPage = lazy(() => import('./pages/admin/ConfigPage'));
const PlatformAdminPage = lazy(() => import('./pages/admin/PlatformAdminPage'));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
function OptionalGoogleProvider({ children }) {
  return GOOGLE_CLIENT_ID ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider> : children;
}

export default function App() {
  return (
    <OptionalGoogleProvider>
      <ErrorBoundary><BrowserRouter>
        <ThemeProvider>
          <CartProvider>
            <AuthProvider>
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(16px)',
                    color: '#111827',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '13px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  },
                }}
              />

              <Suspense fallback={<LoadingSpinner />}><Routes>
                {/* ═══════════ MARKETING & AUTH ═══════════ */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<Navigate to="/" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/demo" element={<DemoPortalPage />} />

                {/* ═══════════ CUSTOMER-FACING QR EXPERIENCES ═══════════ */}
                {/* Multi-tenant scoped routes */}
                <Route path="/:slug" element={<CustomerLayout />}>
                  <Route index element={<MenuPage />} />
                  <Route path="menu" element={<MenuPage />} />
                  <Route path="cart" element={<OrderPayPage />} />
                  <Route path="book" element={<BookTablePage />} />
                  <Route path="order" element={<OrderStatusPage />} />
                  <Route path="order/:orderId" element={<OrderStatusPage />} />
                </Route>

                {/* Direct customer aliases */}
                <Route path="/menu" element={<Navigate to="/" replace />} />
                <Route path="/cart" element={<Navigate to="/" replace />} />
                <Route path="/book" element={<Navigate to="/" replace />} />

                {/* ═══════════ AUTHENTICATED STAFF WORKSPACE ═══════════ */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<WorkspaceLayout />}>
                    {/* Admin Core */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}><Route path="/dashboard" element={<AdminDashboard />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}><Route path="/menu-management" element={<MenuManagement />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}><Route path="/tables" element={<TableManagement />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}><Route path="/staff" element={<StaffManagement />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'kitchen']} />}><Route path="/recipes" element={<RecipeManagement />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}><Route path="/orders" element={<AdminOrders />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}><Route path="/analytics" element={<AnalyticsDashboard />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}><Route path="/config" element={<ConfigPage />} /></Route>
                    {/* Platform Superadmin Only (Strictly forbidden to hotel owners and staff) */}
                    <Route element={<ProtectedRoute requireSuperuser allowedRoles={['platform_admin']} />}>
                      <Route path="/platform" element={<PlatformAdminPage />} />
                      <Route path="/superadmin" element={<Navigate to="/platform" replace />} />
                    </Route>

                    {/* Kitchen Operations */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'kitchen', 'waiter']} />}><Route path="/kitchen" element={<KitchenKanbanPage />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'kitchen']} />}><Route path="/kitchen-terminal" element={<KitchenDashboard />} /></Route>

                    {/* Waiter Operations */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'waiter']} />}><Route path="/waiter" element={<WaiterDashboard />} /></Route>

                    {/* Cashier & Biller */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'biller']} />}><Route path="/billing" element={<BillerDashboard />} /></Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'biller']} />}><Route path="/bill-history" element={<BillerHistory />} /></Route>

                    {/* Backwards Compatibility & Quick Redirects */}
                    <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/admin/config" element={<Navigate to="/config" replace />} />
                    <Route path="/admin/analytics" element={<Navigate to="/analytics" replace />} />
                    <Route path="/admin/menu" element={<Navigate to="/menu-management" replace />} />
                    <Route path="/admin/tables" element={<Navigate to="/tables" replace />} />
                    <Route path="/admin/staff" element={<Navigate to="/staff" replace />} />
                    <Route path="/admin/orders" element={<Navigate to="/orders" replace />} />
                    <Route path="/admin/recipes" element={<Navigate to="/recipes" replace />} />
                    <Route path="/manager" element={<Navigate to="/analytics" replace />} />
                    <Route path="/staff/kitchen" element={<Navigate to="/kitchen" replace />} />
                    <Route path="/staff/waiter" element={<Navigate to="/waiter" replace />} />
                    <Route path="/biller" element={<Navigate to="/billing" replace />} />
                  </Route>
                </Route>

                {/* Fallback 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes></Suspense>
            </AuthProvider>
          </CartProvider>
        </ThemeProvider>
      </BrowserRouter></ErrorBoundary>
    </OptionalGoogleProvider>
  );
}
