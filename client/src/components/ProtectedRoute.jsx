/**
 * ProtectedRoute — Route guard that checks JWT auth and role.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPaths = {
      admin: '/admin',
      waiter: '/staff/waiter',
      kitchen: '/staff/kitchen',
      biller: '/biller',
    };
    return <Navigate to={dashboardPaths[role] || '/login'} replace />;
  }

  return children;
}
