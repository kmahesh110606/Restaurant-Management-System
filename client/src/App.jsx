/**
 * App.jsx — Complete application routing for Savoré Restaurant Management System.
 * Production-ready route tree across Marketing, Auth, Customer QR Portal, and Staff Workspace.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';

// Layouts & Route Protection
import WorkspaceLayout from './components/WorkspaceLayout';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './pages/customer/CustomerLayout';

// Public & Auth Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Customer QR Portal Pages
import MenuPage from './pages/customer/MenuPage';
import OrderPayPage from './pages/customer/OrderPayPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';
import BookTablePage from './pages/customer/BookTablePage';

// Staff & Operations Pages
import KitchenKanbanPage from './pages/staff/KitchenKanbanPage';
import KitchenDashboard from './pages/staff/KitchenDashboard';
import WaiterDashboard from './pages/staff/WaiterDashboard';

// Biller & POS Pages
import BillerDashboard from './pages/biller/BillerDashboard';
import BillerHistory from './pages/biller/BillerHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import TableManagement from './pages/admin/TableManagement';
import StaffManagement from './pages/admin/StaffManagement';
import RecipeManagement from './pages/admin/RecipeManagement';
import AdminOrders from './pages/admin/AdminOrders';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import ConfigPage from './pages/admin/ConfigPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
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

              <Routes>
                {/* ═══════════ MARKETING & AUTH ═══════════ */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<Navigate to="/" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* ═══════════ CUSTOMER-FACING QR EXPERIENCES ═══════════ */}
                {/* Multi-tenant scoped routes */}
                <Route path="/:slug" element={<CustomerLayout />}>
                  <Route index element={<MenuPage />} />
                  <Route path="menu" element={<MenuPage />} />
                  <Route path="cart" element={<OrderPayPage />} />
                  <Route path="book" element={<BookTablePage />} />
                  <Route path="order/:orderId" element={<OrderStatusPage />} />
                </Route>

                {/* Direct customer aliases */}
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<OrderPayPage />} />
                <Route path="/book" element={<BookTablePage />} />

                {/* ═══════════ AUTHENTICATED STAFF WORKSPACE ═══════════ */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<WorkspaceLayout />}>
                    {/* Admin Core */}
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/menu-management" element={<MenuManagement />} />
                    <Route path="/tables" element={<TableManagement />} />
                    <Route path="/staff" element={<StaffManagement />} />
                    <Route path="/recipes" element={<RecipeManagement />} />
                    <Route path="/orders" element={<AdminOrders />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    <Route path="/config" element={<ConfigPage />} />

                    {/* Kitchen Operations */}
                    <Route path="/kitchen" element={<KitchenKanbanPage />} />
                    <Route path="/kitchen-terminal" element={<KitchenDashboard />} />

                    {/* Waiter Operations */}
                    <Route path="/waiter" element={<WaiterDashboard />} />

                    {/* Cashier & Biller */}
                    <Route path="/billing" element={<BillerDashboard />} />
                    <Route path="/bill-history" element={<BillerHistory />} />

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
              </Routes>
            </AuthProvider>
          </CartProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
