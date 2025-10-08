import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

// Admin email addresses
const ADMIN_EMAILS = [
  'rohit367673@gmail.com',
  'suyambu54321@gmail.com'
];

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only show unauthorized toast if we're sure user is not an admin after loading is complete
    // And only if we actually tried to access the admin panel
    if (!loading && user && !ADMIN_EMAILS.includes(user.email || '')) {
      console.log('User not authorized for admin panel:', user.email);
      toast.error('🚫 Unauthorized access to admin panel');
    }
  }, [user, loading]);

  console.log('ProtectedAdminRoute check:', { 
    user: !!user, 
    loading, 
    email: user?.email,
    isAdmin: user ? ADMIN_EMAILS.includes(user.email || '') : false
  });

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-[#006f6f]/5">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#006f6f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return <Navigate to="/" replace />;
  }

  // Render admin dashboard if authorized
  return <>{children}</>;
}

export default ProtectedAdminRoute;
