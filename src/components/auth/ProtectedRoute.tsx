
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-invoice-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Remove the role-based restriction for settings and backup pages
  // This allows all authenticated users to access these pages
  
  // Only specific admin-only routes that should be restricted
  // For example, if you have admin-only routes in the future:
  // const adminOnlyRoutes = ['/admin-dashboard', '/user-management'];
  // if (adminOnlyRoutes.some(route => location.pathname.startsWith(route)) && user?.role !== 'admin') {
  //   toast.error('You do not have permission to access this page');
  //   return <Navigate to="/" replace />;
  // }
  
  // Render children if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
