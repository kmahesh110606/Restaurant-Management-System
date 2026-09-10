/**
 * ProtectedRoute — Role-based route protection.
 * Redirects to login if not authenticated.
 * Restricts access based on allowed roles.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <LoadingSpinner fullPage={false} text="Verifying access..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user's role is not in the list
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
