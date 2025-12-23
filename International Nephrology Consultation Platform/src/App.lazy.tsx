import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import existing page components
const HomePage = lazy(() => import('./pages/public/HomePage'));
const TermsPage = lazy(() => import('./pages/public/TermsPage'));
const CookiesPolicyPage = lazy(() => import('./pages/public/CookiesPolicyPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProtectedAdminRoute = lazy(() => import('./components/ProtectedAdminRoute'));

// For now, using placeholder components for About and Contact pages
// These are still defined in App.tsx and should be extracted to separate files
const AboutPage = lazy(() => Promise.resolve({ default: () => <div>About Page - Coming Soon</div> }));
const ContactPage = lazy(() => Promise.resolve({ default: () => <div>Contact Page - Coming Soon</div> }));
const PaymentPage = lazy(() => import('./pages/PaymentPage').then(module => ({ default: module.PaymentPage })));

// Protected Route Component (copied from App.tsx)
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#006f6f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Check for valid session (user with email)
  if (!user || !user.email) {
    return <Navigate to="/" replace state={{ showLogin: true }} />;
  }
  
  return <>{children}</>;
};

// Simplified chatbot component
const SimpleChatbot = lazy(() => import('./components/SimpleChatbot').then(module => ({ default: module.SimpleChatbot })));

// Loading component for suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
  </div>
);

// Conditional chatbot component
const ConditionalChatbot = () => {
  const isVisible = window.location.pathname !== '/booking' && 
                   window.location.pathname !== '/admin' &&
                   window.location.pathname !== '/profile';
  
  if (!isVisible) return null;
  
  return (
    <Suspense fallback={null}>
      <SimpleChatbot />
    </Suspense>
  );
};

function AppLazy() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiesPolicyPage />} />
              
              {/* Booking Route */}
              <Route
                path="/booking"
                element={
                  <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Payment Route */}
              <Route path="/payment" element={<PaymentPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
                      <ProfilePage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              
              {/* Admin Route */}
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  </Suspense>
                }
              />
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
        <ConditionalChatbot />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default AppLazy;
