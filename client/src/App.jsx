/**
 * App.jsx — Root component with React Router configuration.
 *
 * Routes:
 *   Customer: /:slug/menu, /:slug/cart, /:slug/order/:orderId
 *   Auth:     /login
 *   Admin:    /admin/*
 *   Staff:    /staff/*
 *   Biller:   /biller/*
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Customer pages
import CustomerLayout from './pages/customer/CustomerLayout';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import RecipeManagement from './pages/admin/RecipeManagement';
import TableManagement from './pages/admin/TableManagement';
import StaffManagement from './pages/admin/StaffManagement';
import ConfigPage from './pages/admin/ConfigPage';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import AdminOrders from './pages/admin/AdminOrders';

// Staff pages
import StaffLayout from './pages/staff/StaffLayout';
import KitchenDashboard from './pages/staff/KitchenDashboard';
import WaiterDashboard from './pages/staff/WaiterDashboard';

// Biller pages
import BillerLayout from './pages/biller/BillerLayout';
import BillerDashboard from './pages/biller/BillerDashboard';
import BillerHistory from './pages/biller/BillerHistory';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            },
          }}
        />

        <Routes>
          {/* ---- Customer routes (no auth) ---- */}
          <Route path="/:slug" element={<CustomerLayout />}>
            <Route path="menu" element={<MenuPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="order/:orderId" element={<OrderStatusPage />} />
          </Route>

          {/* ---- Auth ---- */}
          <Route path="/login" element={<LoginPage />} />

          {/* ---- Admin routes ---- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="recipes" element={<RecipeManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="config" element={<ConfigPage />} />
          </Route>

          {/* ---- Staff routes ---- */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['admin', 'waiter', 'kitchen']}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route path="kitchen" element={<KitchenDashboard />} />
            <Route path="waiter" element={<WaiterDashboard />} />
          </Route>

          {/* ---- Biller routes ---- */}
          <Route
            path="/biller"
            element={
              <ProtectedRoute allowedRoles={['admin', 'biller']}>
                <BillerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BillerDashboard />} />
            <Route path="history" element={<BillerHistory />} />
          </Route>

          {/* ---- Fallback ---- */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
