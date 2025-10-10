import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Shield, Globe, Star, Video, FileText, Upload, CheckCircle2, ArrowRight, MessageCircle, Heart, Clock, Phone, MapPin, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from "sonner@2.0.3";
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';
import { OTPSignupModal } from '../../components/OTPSignupModal';
import { getUserTimezone, getPricingForTimezone, getCountryFromTimezone } from '../../utils/timezoneUtils';

// Simple Login Modal Component
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
          <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to your NephroConsult account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <Label>Password</Label>
            <Input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#006f6f] hover:bg-[#005555]"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center">
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
        </div>
      </DialogContent>
    </Dialog>
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

// (Removed duplicate/broken Navigation and unused local SignupModal)

// Navigation Component (Embedded for standalone use)
function Navigation({ onLoginOpen, onSignupOpen }: { 
  onLoginOpen?: () => void; 
  onSignupOpen?: () => void; 
}) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = window.location;

  const handleNavigation = (path: string) => {
    if (!user && (path === '/booking' || path === '/profile' || path.includes('dashboard'))) {
      if (onLoginOpen) onLoginOpen();
      return;
    }
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
            <div className="w-10 h-10 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">NephroConsult</h1>
              <p className="text-xs text-[#006f6f]">International Kidney Care</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/')}
              className={location.pathname === '/' ? 'text-[#006f6f]' : ''}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/booking')}
              className="text-[#006f6f] hover:text-[#005555]"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/contact')}
              className={location.pathname === '/contact' ? 'text-[#006f6f]' : ''}
            >
              Contact
            </Button>
            
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/profile')}
                  className={location.pathname === '/profile' ? 'text-[#006f6f]' : ''}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" onClick={logout}>
                  <ArrowRight className="w-4 h-4 mr-2" />
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
                onClick={() => navigate('/profile')}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
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
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/profile')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={logout}>
                  <ArrowRight className="w-4 h-4 mr-2" />
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
      </div>
    </motion.header>
  );
}

// Main HomePage Component with Optimized Responsive Design
export default function HomePage() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [userTimezone, setUserTimezone] = useState('');
  const [userCountry, setUserCountry] = useState('');
  const [pricing, setPricing] = useState({ initial: 150, followup: 105, currency: 'USD', symbol: '$' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user's timezone and pricing
    const tz = getUserTimezone();
    setUserTimezone(tz);
    setUserCountry(getCountryFromTimezone(tz));
    setPricing(getPricingForTimezone(tz));
  }, []);

  // Check if redirected from booking page with showLogin state
  useEffect(() => {
    if (location.state?.showLogin && !user) {
      setIsLoginOpen(true);
      // Clear the state to avoid reopening login on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, user, navigate, location.pathname]);

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
              className="text-[28px] leading-[1.15] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-5 sm:mb-6 md:mb-8 px-3 sm:px-4"
            >
              <span className="bg-gradient-to-r from-gray-900 via-[#006f6f] to-gray-900 bg-clip-text text-transparent block">
                Expert Kidney Care
              </span>
              <span className="text-gray-800 block mt-1 sm:mt-2">
                with{' '}
                <motion.span
                  className="relative inline-block"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="bg-gradient-to-r from-[#006f6f] to-[#004f4f] bg-clip-text text-transparent">
                    Dr. ILANGO (Sr. Nephrologist)
                  </span>
                  <motion.div
                    className="absolute -bottom-0.5 sm:-bottom-1 md:-bottom-2 left-0 right-0 h-[2px] sm:h-0.5 md:h-1 bg-gradient-to-r from-[#006f6f] to-[#004f4f] rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                  />
                </motion.span>
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
            
            {/* Location-based pricing display */}
            <motion.div
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-2xl mx-auto mb-7 sm:mb-10"
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">
                  Your Location: {userCountry || 'Detecting...'}
                </p>
              </div>
              <div className="text-sm text-blue-700">
                <p className="mb-2">Regional Pricing for {userCountry}:</p>
                <div className="flex justify-center space-x-6">
                  <div className="text-center">
                    <span className="block text-xs text-blue-600 mb-1">Initial Consultation</span>
                    <span className="font-bold text-blue-900 text-lg">
                      {pricing.symbol}{pricing.initial}
                    </span>
                  </div>
                  <div className="w-px bg-blue-300"></div>
                  <div className="text-center">
                    <span className="block text-xs text-blue-600 mb-1">Follow-up</span>
                    <span className="font-bold text-blue-900 text-lg">
                      {pricing.symbol}{pricing.followup}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-3 text-center">
                  All consultations during Dr. ILANGO's evening hours (6-10 PM IST)
                </p>
              </div>
            </motion.div>
            
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
                { icon: Globe, text: "Global Access", desc: "6-10 PM IST Daily" },
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
                className="group relative"
              >
                {/* Glass morphism card */}
                <div className={`relative h-full p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500`}>
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
                  src="https://images.unsplash.com/photo-1715111183886-5048b76cc917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRuZXklMjBhbmF0b215JTIwbWVkaWNhbHxlbnwxfHx8fDE3NTkyNDUwMTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
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
                  Dr. ILANGO specializes in comprehensive nephrology care, treating a wide range of kidney conditions with personalized treatment plans and cutting-edge medical expertise.
                </p>
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  {[
                    "Chronic Kidney Disease (CKD)",
                    "Acute Kidney Injury",
                    "Diabetic Nephropathy",
                    "Hypertensive Kidney Disease",
                    "Glomerulonephritis",
                    "Kidney Stones & Prevention"
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
                image: "/src/asset/Yg8YS5lw1695273494.jpg",
                title: "Prevention & Wellness",
                description: "Learn lifestyle modifications, dietary guidelines, and preventive measures to maintain healthy kidney function and prevent disease progression."
              },
              {
                image: "/src/asset/WhatsApp Image 2025-10-09 at 20.08.46.jpeg",
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
                Schedule a consultation with Dr. ILANGO to discuss your kidney health concerns and receive expert guidance on prevention, diagnosis, and treatment.
              </p>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[#006f6f] to-[#004f4f] hover:from-[#005555] hover:to-[#003f3f] text-white px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-[13px] sm:text-sm md:text-base min-h-[48px]"
                onClick={() => {
                  if (!user) {
                    setIsLoginOpen(true);
                  } else {
                    navigate('/booking');
                  }
                }}
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
              Join thousands of patients who trust Dr. ILANGO for their nephrology needs. 
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
