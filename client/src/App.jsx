/**
 * App.jsx — Root component with React Router configuration.
 *
 * Routes:
 *   Landing:  /
 *   Auth:     /login, /signup
 *   Customer: /:slug/menu, /:slug/cart, /:slug/order/:orderId
 *   Admin:    /admin/*
 *   Staff:    /staff/*
 *   Biller:   /biller/*
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Landing
import LandingPage from './pages/landing/LandingPage';

// Customer pages
import CustomerLayout from './pages/customer/CustomerLayout';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1E1E1E',
                color: '#E0E0E0',
                border: '1px solid #272727',
                borderRadius: '12px',
                fontWeight: 600,
              },
            }}
          />

          <Routes>
            {/* ---- Landing page ---- */}
            <Route path="/" element={<LandingPage />} />

            {/* ---- Auth ---- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* ---- Customer routes (no auth) ---- */}
            <Route path="/:slug" element={<CustomerLayout />}>
              <Route path="menu" element={<MenuPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="order/:orderId" element={<OrderStatusPage />} />
            </Route>

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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
