/**
 * ProtectedRoute — Route guard that checks JWT auth and role.
 */  // Component header docstring explaining route guard functionality

import { Navigate, useLocation } from 'react-router-dom';  // Import Navigate and useLocation hooks from react-router-dom
import { useAuth } from '../contexts/AuthContext';  // Import custom authentication hook from AuthContext
import LoadingSpinner from './LoadingSpinner';  // Import LoadingSpinner component

export default function ProtectedRoute({ children, allowedRoles = [] }) {  // Export ProtectedRoute component receiving children and allowedRoles array
  const { isAuthenticated, role, loading } = useAuth();  // Extract auth state, user role, and loading state from AuthContext hook
  const location = useLocation();  // Get current location object from Router

  if (loading) {  // Check if authentication status check is still loading
    return (  // Return loading UI centered on full screen
      <div className="flex items-center justify-center min-h-screen">  {/* Centered screen container */}
        <LoadingSpinner size="lg" />  {/* Render large loading spinner */}
      </div>  {/* Close loading wrapper */}
    );  // End loading return block
  }  // End loading check

  if (!isAuthenticated) {  // Check if user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;  // Redirect user to login page, saving target location for post-login redirect
  }  // End authentication check

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {  // Check if allowed roles specified and user role is not permitted
    // Redirect to appropriate dashboard based on role
    const dashboardPaths = {  // Define role-to-dashboard path lookup dictionary
      admin: '/admin',  // Admin dashboard path
      waiter: '/staff/waiter',  // Waiter dashboard path
      kitchen: '/staff/kitchen',  // Kitchen dashboard path
      biller: '/biller',  // Biller dashboard path
    };  // End dashboardPaths lookup dictionary
    return <Navigate to={dashboardPaths[role] || '/login'} replace />;  // Redirect unauthorized staff member to their designated home dashboard
  }  // End role authorization check

  return children;  // Render protected child routes/components if authenticated and authorized
}  // End ProtectedRoute component

