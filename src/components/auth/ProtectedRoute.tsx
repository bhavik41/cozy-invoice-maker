
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
  
  // Company access validation would be handled in AppContext
  // We can add specific route-based restrictions here if needed
  
  // For example, if certain routes should only be accessible to admins:
  const adminOnlyRoutes = ['/settings', '/backup'];
  if (adminOnlyRoutes.some(route => location.pathname.startsWith(route)) && user?.role !== 'admin') {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" replace />;
  }
  
  // Render children if authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;
