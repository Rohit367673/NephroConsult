import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Toaster, toast } from 'sonner';
import { 
  Heart, Shield, Calendar, Clock, Video, Phone, FileText, User, 
  Mail, MapPin, Star, Award, Stethoscope, Globe, Menu, X, 
  Eye, EyeOff, LogOut, Linkedin, Twitter, ChevronDown, 
  CheckCircle2, Users, TrendingUp, ArrowRight, PlayCircle,
  MessageCircle, Upload
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GoogleLoginButton } from './components/GoogleLoginButton';
import { OTPSignupModal } from './components/OTPSignupModal';
import { SimpleChatbot } from './components/SimpleChatbot';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import { PaymentPage } from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
// Images
import DoctorPhoto from './asset/PHOTO-2025-09-26-17-36-15.jpg';
import KidneyAnatomyImage from './asset/images.jpeg';
import HeroImage from './assets/hero-nephrology.jpg';
import TermsPage from './pages/public/TermsPage';
import CookiesPolicyPage from './pages/public/CookiesPolicyPage';
import { hasFirebaseCredentials } from './config/firebase';

// Regional pricing (aligned with timezoneUtils.ts)
const regionalPricing: Record<string, { consultation: number; currency: string; symbol: string }> = {
  'IN': { consultation: 2500, currency: 'INR', symbol: '₹' },
  'US': { consultation: 30, currency: 'USD', symbol: '$' },
  'GB': { consultation: 25, currency: 'GBP', symbol: '£' },
  'AU': { consultation: 45, currency: 'AUD', symbol: 'A$' },
  'CA': { consultation: 40, currency: 'CAD', symbol: 'C$' },
  'default': { consultation: 30, currency: 'USD', symbol: '$' }
};

const getUserCountry = (): string => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.includes('Kolkata') || timezone.includes('Mumbai')) return 'IN';
  if (timezone.includes('New_York') || timezone.includes('Chicago')) return 'US';
  if (timezone.includes('London')) return 'GB';
  if (timezone.includes('Sydney')) return 'AU';
  if (timezone.includes('Toronto')) return 'CA';
  return 'default';
};

// Login Modal Component
function LoginModal({ isOpen, onClose, onSignupOpen }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSignupOpen: () => void; 
}) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(formData.email, formData.password);
    
    if (success) {
      onClose();
      toast.success('Welcome back!');
      navigate('/profile');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Login to NephroConsult</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in to your NephroConsult account to access your dashboard and book appointments
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="text-center mb-6">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-white text-2xl font-bold">N</span>
            </motion.div>
            <motion.h1 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900"
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mt-2"
            >
              Sign in to your NephroConsult account
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Label>Email Address</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full bg-[#006f6f] hover:bg-[#005555]"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </motion.div>
          </form>

          {/* Google Login Button */}
            {hasFirebaseCredentials && (
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
                <div className="mt-4">
                  <GoogleLoginButton 
                    onSuccess={onClose}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  onClick={() => {
                    onClose();
                    onSignupOpen();
                }}
                className="text-[#006f6f] hover:underline p-0"
              >
                Sign up here
              </Button>
            </p>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Signup Modal Component
function SignupModal({ isOpen, onClose, onLoginOpen }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onLoginOpen: () => void; 
}) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    country: getUserCountry()
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    const success = await register(formData);
    
    if (success) {
      onClose();
      toast.success('Account created successfully! Welcome to NephroConsult.');
      navigate('/profile');
    } else {
      toast.error('Failed to create account. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Create NephroConsult Account</DialogTitle>
          <DialogDescription className="sr-only">
            Join NephroConsult to access expert nephrology care and book consultations with Dr. Ilango S. Prakasam
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="text-center mb-6">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-white text-2xl font-bold">N</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join NephroConsult today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Account Type</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#006f6f] hover:bg-[#005555]"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Google Login Button */}
          {hasFirebaseCredentials && (
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="mt-4">
                <GoogleLoginButton 
                  onSuccess={onClose}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Button
                variant="link"
                onClick={() => {
                  onClose();
                  onLoginOpen();
                }}
                className="text-[#006f6f] hover:underline p-0"
              >
                Sign in here
              </Button>
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}


// Navigation Component
function Navigation({ onLoginOpen, onSignupOpen }: { 
  onLoginOpen?: () => void; 
  onSignupOpen?: () => void; 
}) {
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    console.log('Navigation attempt:', { path, user: !!user, loading, hasUserData: !!user?.email });
    
    // Always allow navigation if still loading user data
    if (loading) {
      console.log('Still loading, allowing navigation to:', path);
      navigate(path);
      setIsMenuOpen(false);
      return;
    }
    
    // Check if user has valid session data (email is a good indicator)
    const hasValidSession = user && user.email;
    
    // Only block navigation for protected routes if no valid session
    if (!hasValidSession && (path === '/booking' || path === '/profile' || path.includes('dashboard'))) {
      console.log('No valid session, blocking navigation to:', path);
      if (onLoginOpen) onLoginOpen();
      return;
    }
    
    console.log('Navigating to:', path);
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
    >
      <div className="container-medical">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src="/logo.svg" alt="NephroConsult Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">NephroConsult</h1>
              <p className="text-xs text-[#0d9488]">International Kidney Care</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/')}
              className={location.pathname === '/' ? 'text-[#0d9488]' : ''}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/about')}
              className={location.pathname === '/about' ? 'text-[#0d9488]' : ''}
            >
              About
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/booking')}
              className="text-[#0d9488] hover:text-[#0f766e]"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/contact')}
              className={location.pathname === '/contact' ? 'text-[#0d9488]' : ''}
            >
              Contact
            </Button>
            
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/admin')}
                    className={location.pathname === '/admin' ? 'text-[#006f6f]' : ''}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/profile')}
                  className={location.pathname === '/profile' ? 'text-[#006f6f]' : ''}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onLoginOpen}>
                  Login
                </Button>
                <Button onClick={onSignupOpen} className="bg-[#006f6f] hover:bg-[#005555]">
                  Sign Up
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu and profile */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Profile Photo for Mobile */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation('/profile')}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.log('Profile image failed to load, trying fallback methods');
                        
                        // Try alternative Google image URL
                        const currentSrc = e.currentTarget.src;
                        if (currentSrc.includes('googleusercontent.com') && !currentSrc.includes('proxy')) {
                          const newSrc = `https://images.weserv.nl/?url=${encodeURIComponent(currentSrc)}&w=200&h=200&fit=cover&mask=circle`;
                          e.currentTarget.src = newSrc;
                          return;
                        }
                        
                        // If all methods fail, show fallback
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full bg-gradient-to-br from-[#006f6f] to-[#004f4f] flex items-center justify-center"
                    style={{ display: user.avatar ? 'none' : 'flex' }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              </motion.button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-2 overflow-hidden"
            >
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/')}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/about')}
              >
                About
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[#006f6f]"
                onClick={() => handleNavigation('/booking')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/contact')}
              >
                Contact
              </Button>
              
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/admin')}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full justify-start" onClick={onLoginOpen}>
                    Login
                  </Button>
                  <Button className="w-full justify-start bg-[#006f6f] hover:bg-[#005555]" onClick={onSignupOpen}>
                    Sign Up
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

// Floating Elements Component
function FloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#006f6f]/10 to-[#004f4f]/5"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute top-40 right-20 w-16 h-16 rounded-lg bg-gradient-to-br from-[#006f6f]/5 to-transparent"
        animate={{
          y: [0, 30, 0],
          rotate: [0, -90, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-[#006f6f]/8 to-[#004f4f]/3"
        animate={{
          y: [0, -40, 0],
          x: [0, -15, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-60 right-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#006f6f]/6 to-transparent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

// Enhanced Home Page Component
function HomePage() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const navigate = useNavigate();
  
  // Use user's country if logged in, otherwise detect from timezone
  const userCountry = user?.country || getUserCountry();
  const pricing = regionalPricing[userCountry] || regionalPricing.default;


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#006f6f]/5"
    >
      <Navigation 
        onLoginOpen={() => setIsLoginOpen(true)}
        onSignupOpen={() => setIsSignupOpen(true)}
      />
      
      {/* Enhanced Hero Section */}
      <section className="relative py-10 sm:py-16 md:py-20 lg:py-24 xl:py-28 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#006f6f]/8 via-[#006f6f]/3 to-[#004f4f]/8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,111,111,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,111,111,0.08),transparent_50%)]" />
        </div>
        
        <FloatingElements />
        
        {/* Grid pattern overlay - hidden on mobile for better performance */}
        <div className="absolute inset-0 opacity-20 hidden sm:block">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(0,111,111,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,111,111,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container-medical relative z-10">
          <motion.div 
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Glowing badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative inline-block mb-5 sm:mb-6 md:mb-8"
            >
              <div className="absolute inset-0 bg-[#006f6f]/20 rounded-full blur-xl hidden md:block" />
              <Badge className="relative mb-2 px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-[#006f6f]/10 to-[#004f4f]/10 text-[#006f6f] border-[#006f6f]/30 backdrop-blur-sm text-[10px] sm:text-xs md:text-sm">
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mr-1.5 sm:mr-2"
                >
                  ✦
                </motion.span>
                <span className="hidden sm:inline">International Nephrology Care Excellence</span>
                <span className="sm:hidden">Expert Kidney Care</span>
              </Badge>
            </motion.div>
            
            {/* Enhanced main heading */}
            <motion.h1 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-[26px] leading-[1.2] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-5 sm:mb-6 md:mb-8 px-3 sm:px-4"
            >
              <span className="bg-gradient-to-r from-gray-900 via-[#006f6f] to-gray-900 bg-clip-text text-transparent block">
                Expert Kidney Care
              </span>
              <span className="text-gray-800 block mt-2 sm:mt-3">
                with{' '}
                <motion.span
                  className="relative inline-block"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="bg-gradient-to-r from-[#006f6f] to-[#004f4f] bg-clip-text text-transparent">
                    Dr. ILANGO
                  </span>
                  <motion.div
                    className="absolute -bottom-0.5 sm:-bottom-1 md:-bottom-2 left-0 right-0 h-[2px] sm:h-0.5 md:h-1 bg-gradient-to-r from-[#006f6f] to-[#004f4f] rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                  />
                </motion.span>
              </span>
              <span className="text-gray-600 block mt-1 sm:mt-2 text-[14px] sm:text-base md:text-lg lg:text-xl font-medium">
                (Sr. Nephrologist)
              </span>
            </motion.h1>
            
            {/* Enhanced description */}
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-sm leading-relaxed sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-7 sm:mb-10 md:mb-12 max-w-4xl mx-auto px-3 sm:px-4"
            >
              Experience{' '}
              <span className="font-semibold text-[#006f6f]">world-class nephrology consultations</span>{' '}
              through secure, AI-powered video calls. <span className="hidden sm:inline">Available globally with{' '}
              <span className="font-semibold text-[#006f6f]">region-specific pricing</span>{' '}
              and 24/7 support.</span>
            </motion.p>
            
            {/* Enhanced CTA buttons */}
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center mb-10 sm:mb-14 md:mb-16 px-3 sm:px-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative group w-full sm:w-auto"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#006f6f] to-[#004f4f] rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300 hidden sm:block" />
                <Button
                  size="lg"
                  className="relative w-full sm:w-auto px-5 sm:px-7 md:px-10 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-[#006f6f] to-[#004f4f] hover:from-[#005555] hover:to-[#003f3f] text-white border-0 rounded-xl shadow-xl text-[13px] sm:text-sm md:text-base lg:text-lg min-h-[48px] sm:min-h-[52px]"
                  onClick={() => {
                    if (!user) {
                      setIsLoginOpen(true);
                    } else {
                      navigate('/booking');
                    }
                  }}
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" />
                  <span className="font-semibold">
                    <span className="hidden sm:inline">Book Consultation</span>
                    <span className="sm:hidden">Book Now</span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative group w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-5 sm:px-7 md:px-10 py-4 sm:py-5 md:py-6 border-2 border-[#006f6f]/30 text-[#006f6f] hover:bg-[#006f6f] hover:text-white backdrop-blur-sm bg-white/70 rounded-xl shadow-lg text-[13px] sm:text-sm md:text-base lg:text-lg font-semibold transition-all duration-300 min-h-[48px] sm:min-h-[52px]"
                  onClick={() => navigate('/contact')}
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" />
                  Contact Us
                </Button>
              </motion.div>
            </motion.div>

            {/* Enhanced trust indicators */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-3xl mx-auto"
            >
              {[
                { icon: Shield, text: "HIPAA Compliant", desc: "Bank-level security" },
                { icon: Globe, text: "Global Access", desc: "Available worldwide" },
                { icon: Star, text: "4.9/5 Rating", desc: "5000+ patients" }
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="flex flex-col items-center p-3 sm:p-4 md:p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-[#006f6f]/10 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]"
                >
                  <motion.div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-lg flex-shrink-0"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </motion.div>
                  <span className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-center">{item.text}</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 text-center leading-tight">{item.desc}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #006f6f 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="container-medical relative z-10">
          <motion.div 
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge className="mb-3 sm:mb-4 md:mb-6 px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-[#006f6f]/10 to-[#004f4f]/10 text-[#006f6f] border-[#006f6f]/20 text-[10px] sm:text-xs md:text-sm">
                Advanced Technology
              </Badge>
            </motion.div>
            <h2 className="text-xl leading-tight sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-[#006f6f] to-gray-900 bg-clip-text text-transparent">
                Comprehensive Nephrology Care
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              From initial consultations to ongoing kidney health management, 
              we provide complete care through our cutting-edge digital platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {[
              {
                icon: Video,
                title: "HD Video Consultations",
                description: "Secure, high-quality video calls with encrypted communication for complete privacy and comfort.",
                features: ["End-to-end encryption", "Screen sharing capability", "Recording for medical records"],
                gradient: "from-blue-500/10 to-[#006f6f]/10"
              },
              {
                icon: FileText,
                title: "Digital Prescriptions",
                description: "Receive digital prescriptions instantly with direct pharmacy integration and medication reminders.",
                features: ["Instant prescription delivery", "Pharmacy integration", "Medication tracking"],
                gradient: "from-green-500/10 to-[#006f6f]/10"
              },
              {
                icon: Upload,
                title: "Lab Report Analysis",
                description: "Upload and share lab reports securely. Get expert analysis and recommendations for your kidney health.",
                features: ["Secure file upload", "AI-assisted analysis", "Trend tracking"],
                gradient: "from-purple-500/10 to-[#006f6f]/10"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative cursor-pointer"
                onClick={() => {
                  if (!user) {
                    setIsLoginOpen(true);
                  } else {
                    navigate('/booking');
                  }
                }}
              >
                {/* Glass morphism card */}
                <div className={`relative h-full p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl hover:border-[#006f6f]/30 transition-all duration-500`}>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#006f6f]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Floating icon */}
                  <motion.div 
                    className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 md:mb-8 shadow-xl"
                    whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white relative z-10" />
                  </motion.div>

                  <div className="text-center relative z-10">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 md:mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] sm:text-sm md:text-base text-gray-600 mb-3.5 sm:mb-4 md:mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="text-[11px] sm:text-xs md:text-sm text-gray-500 space-y-1.5 sm:space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <motion.li 
                          key={itemIndex}
                          initial={{ x: -10, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + itemIndex * 0.1 }}
                          className="flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-[#006f6f] mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    {/* Book Now button - appears on hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="mt-4 sm:mt-5 md:mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Button
                        size="sm"
                        className="bg-[#006f6f] hover:bg-[#005555] text-white px-4 py-2 text-xs sm:text-sm"
                      >
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                        Book Now
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Kidney Health Education Section */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 bg-white relative overflow-hidden">
        {/* Decorative elements - hidden on mobile */}
        <div className="absolute inset-0 opacity-5 hidden sm:block">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #006f6f 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container-medical relative z-10">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-10 md:mb-16"
          >
            <Badge className="mb-3 sm:mb-4 md:mb-6 px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-[#006f6f]/10 to-[#004f4f]/10 text-[#006f6f] border-[#006f6f]/20 text-[10px] sm:text-xs md:text-sm">
              Patient Education
            </Badge>
            <h2 className="text-xl leading-tight sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-[#006f6f] to-gray-900 bg-clip-text text-transparent">
                Understanding Your Kidney Health
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              Learn about kidney function, common conditions, and how our advanced care can help you maintain optimal kidney health.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12 md:mb-16">
            {/* Kidney Anatomy & Function */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl mb-4 sm:mb-5 md:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#006f6f]/20 to-transparent z-10" />
                <img
                  src={KidneyAnatomyImage}
                  alt="Kidney anatomy and structure"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg z-20">
                  <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#006f6f]">Kidney Anatomy</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#006f6f]/5 to-transparent p-4 sm:p-5 md:p-8 rounded-xl sm:rounded-2xl border border-[#006f6f]/10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 md:mb-4">How Your Kidneys Work</h3>
                <p className="text-[13px] sm:text-sm md:text-base text-gray-600 mb-3.5 sm:mb-4 md:mb-6 leading-relaxed">
                  Your kidneys are vital organs that filter waste and excess fluids from your blood, regulate blood pressure, and maintain electrolyte balance. Understanding their function is crucial for maintaining optimal health.
                </p>
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  {[
                    "Filter 200 liters of blood daily",
                    "Regulate fluid and electrolyte balance",
                    "Control blood pressure",
                    "Produce hormones for red blood cell production"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#006f6f] mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-[13px] sm:text-sm md:text-base text-gray-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Common Kidney Conditions */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl mb-4 sm:mb-5 md:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#006f6f]/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1631217873430-6eabf5ee1b0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwY29uc3VsdGF0aW9ufGVufDF8fHx8MTc1OTI5NDI2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Medical consultation for kidney health"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg z-20">
                  <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#006f6f]">Expert Care</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/5 to-transparent p-4 sm:p-5 md:p-8 rounded-xl sm:rounded-2xl border border-[#006f6f]/10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 md:mb-4">Conditions We Treat</h3>
                <p className="text-[13px] sm:text-sm md:text-base text-gray-600 mb-3.5 sm:mb-4 md:mb-6 leading-relaxed">
                  Dr. Ilango specializes in comprehensive nephrology care, treating a wide range of kidney conditions with personalized treatment plans and cutting-edge medical expertise.
                </p>
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  {[
                    "Chronic Kidney Disease (CKD)",
                    "Acute Kidney Injury",
                    "Diabetic Nephropathy",
                    "Hypertensive Kidney Disease",
                    "Glomerulonephritis",
                    "Kidney Stones & Prevention",
                    "Renal transplantation management"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#006f6f] mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-[13px] sm:text-sm md:text-base text-gray-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Bottom Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {[
              {
                image: "/images/Yg8YS5lw1695273494.jpg",
                title: "Prevention & Wellness",
                description: "Learn lifestyle modifications, dietary guidelines, and preventive measures to maintain healthy kidney function and prevent disease progression."
              },
              {
                image: "/images/WhatsApp Image 2025-10-09 at 20.08.46.jpeg",
                title: "Advanced Diagnostics",
                description: "State-of-the-art lab analysis, imaging interpretation, and AI-assisted diagnostic tools for accurate kidney health assessment."
              },
              {
                image: "https://images.unsplash.com/photo-1631217873430-6eabf5ee1b0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwY29uc3VsdGF0aW9ufGVufDF8fHx8MTc1OTI5NDI2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
                title: "Personalized Treatment",
                description: "Customized treatment plans tailored to your specific condition, medical history, and health goals with ongoing monitoring."
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="relative h-44 sm:h-52 md:h-56 lg:h-64 rounded-xl sm:rounded-2xl overflow-hidden mb-3 md:mb-4 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6 z-20">
                    <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{card.title}</h4>
                  </div>
                </div>
                <p className="text-[13px] sm:text-sm md:text-base text-gray-600 leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8 sm:mt-12 md:mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-[#006f6f]/10 via-[#006f6f]/5 to-[#004f4f]/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-[#006f6f]/20">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 md:mb-4">
                Take Control of Your Kidney Health Today
              </h3>
              <p className="text-[13px] sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-5 md:mb-6 max-w-2xl mx-auto leading-relaxed">
                Schedule a consultation with Dr. Ilango to discuss your kidney health concerns and receive expert guidance on prevention, diagnosis, and treatment.
              </p>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[#006f6f] to-[#004f4f] hover:from-[#005555] hover:to-[#003f3f] text-white px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-[13px] sm:text-sm md:text-base min-h-[48px]"
                onClick={() => window.location.href = '/booking'}
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
                Book Your Consultation
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 flex-shrink-0" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#006f6f]/8 via-[#006f6f]/5 to-[#004f4f]/8">
          <motion.div
            className="absolute inset-0 hidden sm:block"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(0,111,111,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(0,111,111,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 50%, rgba(0,111,111,0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container-medical relative z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-center"
          >
            {[
              { value: "5000+", label: "Patients Treated", icon: Heart },
              { value: "15+", label: "Years Experience", icon: Star },
              { value: "98%", label: "Satisfaction Rate", icon: CheckCircle2 },
              { value: "24/7", label: "Support Available", icon: Clock }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                whileInView={{ scale: 1, opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                {/* Glass card */}
                <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 min-h-[140px] sm:min-h-[160px] flex flex-col justify-center">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#006f6f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon */}
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 md:mb-4 shadow-lg flex-shrink-0"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                  </motion.div>

                  {/* Value with counter animation */}
                  <motion.div 
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#006f6f] mb-1.5 sm:mb-2 md:mb-3 leading-none"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.5, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-gray-700 font-medium text-[10px] leading-tight sm:text-xs md:text-sm lg:text-base px-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 bg-gradient-to-br from-white via-gray-50 to-[#006f6f]/5 relative overflow-hidden">
        {/* Background elements - hidden on mobile */}
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute top-20 left-20 w-40 h-40 bg-[#006f6f]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-[#004f4f]/5 rounded-full blur-3xl" />
        </div>

        <div className="container-medical text-center relative z-10">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge className="mb-5 sm:mb-6 md:mb-8 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-gradient-to-r from-[#006f6f]/10 to-[#004f4f]/10 text-[#006f6f] border-[#006f6f]/20 text-xs sm:text-sm md:text-base lg:text-lg">
                Start Your Journey Today
              </Badge>
            </motion.div>
            
            <h2 className="text-xl leading-tight sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              Ready to Transform Your{' '}
              <span className="bg-gradient-to-r from-[#006f6f] to-[#004f4f] bg-clip-text text-transparent">
                Kidney Care?
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-7 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Join thousands of patients who trust Dr. Ilango for their nephrology needs. 
              Book your consultation today and take the first step towards better kidney health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="relative group w-full sm:w-auto"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#006f6f] to-[#004f4f] rounded-xl sm:rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-300 hidden sm:block" />
                <Button
                  size="lg"
                  className="relative w-full sm:w-auto px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-[#006f6f] to-[#004f4f] hover:from-[#005555] hover:to-[#003f3f] text-white border-0 rounded-xl sm:rounded-2xl shadow-2xl text-[13px] sm:text-sm md:text-base lg:text-lg font-semibold min-h-[48px] sm:min-h-[52px]"
                  onClick={() => {
                    if (!user) {
                      setIsLoginOpen(true);
                    } else {
                      navigate('/booking');
                    }
                  }}
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Book Consultation Now</span>
                  <span className="sm:hidden">Book Now</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 flex-shrink-0" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 border-2 border-[#006f6f]/30 text-[#006f6f] hover:bg-[#006f6f] hover:text-white backdrop-blur-sm bg-white/80 rounded-xl sm:rounded-2xl shadow-lg text-[13px] sm:text-sm md:text-base lg:text-lg font-semibold transition-all duration-300 min-h-[48px] sm:min-h-[52px]"
                  onClick={() => navigate('/contact')}
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" />
                  Contact Us
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSignupOpen={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <OTPSignupModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)}
      />
    </motion.div>
  );
}



// Contact Page Component
function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the data to your backend
      console.log('Contact form submitted:', formData);
      
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        urgency: 'normal'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      <Navigation 
        onLoginOpen={() => setIsLoginOpen(true)}
        onSignupOpen={() => setIsSignupOpen(true)}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#006f6f]/5 to-[#006f6f]/10 py-20">
        <div className="container-medical">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Contact NephroConsult
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8">
              Get in touch with Dr. Ilango S. Prakasam's team for expert nephrology consultation and support
            </motion.p>
            <motion.div variants={itemVariants} className="flex justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#006f6f]" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#006f6f]" />
                <span>Global Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#006f6f]" />
                <span>Secure Communication</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods & Form */}
      <section className="py-20 bg-white">
        <div className="container-medical">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                  <p className="text-gray-600 mb-8">
                    Multiple ways to reach our team for consultation, support, or emergency assistance.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      icon: MessageCircle,
                      title: "Email Support", 
                      primary: "contact@nephroconsult.com",
                      secondary: "Response within 24 hours",
                      description: "For non-urgent inquiries and appointment requests"
                    },
                    {
                      icon: Video,
                      title: "Emergency Consultation",
                      primary: "Book Urgent Appointment",
                      secondary: "Same-day availability",
                      description: "For urgent kidney health concerns"
                    }
                  ].map((contact, index) => (
                    <motion.div
                      key={contact.title}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-[#006f6f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <contact.icon className="w-6 h-6 text-[#006f6f]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{contact.title}</h3>
                        <p className="text-[#006f6f] font-medium mb-1">{contact.primary}</p>
                        <p className="text-sm text-gray-600 mb-1">{contact.secondary}</p>
                        <p className="text-sm text-gray-500">{contact.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <p className="text-gray-600">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name</Label>
                          <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter your email"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Phone Number</Label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter your phone"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Urgency Level</Label>
                          <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal Inquiry</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Subject</Label>
                        <Input
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="What can we help you with?"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Message</Label>
                        <Textarea
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Describe your inquiry or concern in detail..."
                          className="mt-1 min-h-32"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-[#006f6f] hover:bg-[#005555]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-[#006f6f]/5">
        <div className="container-medical">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive nephrology care delivered through advanced telemedicine technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Video,
                  title: "Video Consultations",
                  description: "HD video calls with screen sharing, recording, and secure communication",
                  features: ["End-to-end encryption", "Multi-device support", "Session recording"]
                },
                {
                  icon: FileText,
                  title: "Digital Prescriptions",
                  description: "Electronic prescriptions with pharmacy integration and medication tracking",
                  features: ["Instant delivery", "Refill reminders", "Drug interaction alerts"]
                },
                {
                  icon: Upload,
                  title: "Lab Report Analysis",
                  description: "Secure upload and expert analysis of laboratory results and imaging",
                  features: ["AI-assisted review", "Trend analysis", "Report archiving"]
                },
                {
                  icon: Calendar,
                  title: "Appointment Scheduling",
                  description: "Flexible scheduling with automated reminders and calendar integration",
                  features: ["Google Calendar sync", "SMS reminders", "Easy rescheduling"]
                },
                {
                  icon: Clock,
                  title: "24/7 Support",
                  description: "Round-the-clock medical support for urgent consultations and queries",
                  features: ["Emergency hotline", "Nurse helpline", "Technical support"]
                },
                {
                  icon: Globe,
                  title: "Global Access",
                  description: "International consultations with region-specific pricing and timing",
                  features: ["Multi-timezone support", "Local currency", "Regional compliance"]
                }
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
                >
                  <service.icon className="w-12 h-12 text-[#006f6f] mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-500 flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </motion.div>
  );
}



// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute check:', { user: !!user, loading, hasEmail: !!user?.email, role: user?.role });
  
  // Show loading while checking authentication
  if (loading) {
    console.log('ProtectedRoute: Still loading, showing spinner');
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
    console.log('ProtectedRoute: No valid user session, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// About Page Component
function AboutPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      <Navigation 
        onLoginOpen={() => setIsLoginOpen(true)}
        onSignupOpen={() => setIsSignupOpen(true)}
      />
      
      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-[#006f6f]/5 to-[#006f6f]/10">
        <div className="container-medical">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-[#006f6f]/10 text-[#006f6f] border-[#006f6f]/20">
                Leading Nephrologist
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Meet Dr. Ilango S. Prakasam
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Senior Nephrologist with over 15 years of experience in kidney care, 
                specializing in advanced treatments and patient-centered healthcare.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mx-auto">
                  <div className="w-80 sm:w-96 md:w-[400px] lg:w-[450px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                    <img 
                      src={DoctorPhoto}
                      alt="Dr. Ilango Krishnamurthy"
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Education & Qualifications</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-[#006f6f] mr-2" />
                        MBBS 1983
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-[#006f6f] mr-2" />
                        MD (Medicine) 1991
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-[#006f6f] mr-2" />
                        DM (Nephrology) 2010
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-[#006f6f] mr-2" />
                        Cert. Diabetology 2006
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Specializations</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-[#006f6f] mr-2" />
                        Chronic Kidney Disease Management
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-[#006f6f] mr-2" />
                        Hypertension & Diabetes Related Kidney Disease
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-[#006f6f] mr-2" />
                        Dialysis & Kidney Transplant Consultation
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-[#006f6f] mr-2" />
                        Glomerulonephritis & Electrolyte Disorders
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      size="lg"
                      className="bg-[#006f6f] hover:bg-[#005555]"
                      onClick={() => window.location.href = '/booking'}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Consultation
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-[#006f6f] text-[#006f6f] hover:bg-[#006f6f] hover:text-white"
                      onClick={() => window.location.href = '/contact'}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Doctor
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Stats */}
      <section className="py-16 bg-white">
        <div className="container-medical">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15+", label: "Years Experience" },
              { value: "5000+", label: "Patients Treated" },
              { value: "98%", label: "Success Rate" },
              { value: "24/7", label: "Availability" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-6"
              >
                <div className="text-4xl font-bold text-[#006f6f] mb-2">{stat.value}</div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSignupOpen={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <OTPSignupModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)}
      />
    </motion.div>
  );
}

// Main App Component
function ConditionalChatbot() {
  const location = useLocation();
  
  // Don't show chatbot on admin pages
  if (location.pathname.includes('/admin')) {
    return null;
  }
  
  return <SimpleChatbot />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPolicyPage />} />
            
            {/* Booking Routes */}
            <Route path="/booking" element={<BookingPage />} />
            
            {/* Payment Routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            
            {/* Profile Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Panel Route - Protected for specific emails only */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            
            {/* Advanced Routes - Coming Soon */}
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        <ConditionalChatbot />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}