import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  TrendingUp, 
  Calendar, 
  Bot 
} from 'lucide-react';

interface NavigationProps {
  onLoginOpen?: () => void;
  onSignupOpen?: () => void;
}

export function Navigation({ onLoginOpen, onSignupOpen }: NavigationProps) {
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
    if (!hasValidSession && (path === '/booking' || path === '/profile' || path === '/ai-doctor' || path.includes('dashboard'))) {
      console.log('No valid session, blocking navigation to:', path);
      try {
        sessionStorage.setItem('redirect_after_login', path);
      } catch {}
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
      className="bg-white/95 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16"
    >
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer shrink-0" 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src="/logo.svg" alt="NephroConsult Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">NephroConsult</h1>
              <p className="text-xs text-[#0d9488] whitespace-nowrap">International Kidney Care</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 ml-8">
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

            {/* AI Doctor Link */}
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/ai-doctor')}
              className={location.pathname === '/ai-doctor' ? 'text-[#006f6f]' : 'text-[#006f6f] hover:text-[#005555] transition-colors duration-200 font-medium whitespace-nowrap flex items-center gap-1'}
            >
              <Bot className="w-4 h-4" />
              <span>AI Doctor</span>
              <span className="text-xs bg-[#006f6f]/10 text-[#006f6f] px-2 py-0.5 rounded-full">New</span>
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
              className="md:hidden border-t border-gray-200 py-4 px-4 space-y-2 overflow-hidden bg-white shadow-lg"
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

              {/* AI Doctor Link - Mobile */}
              <Button
                variant="ghost"
                className="w-full justify-start text-[#006f6f] hover:text-[#005555] transition-colors duration-200 font-medium py-2 flex items-center gap-2"
                onClick={() => {
                  handleNavigation('/ai-doctor');
                  setIsMenuOpen(false);
                }}
              >
                <Bot className="w-4 h-4" />
                <span>AI Doctor</span>
                <span className="text-xs bg-[#006f6f]/10 text-[#006f6f] px-2 py-0.5 rounded-full">New</span>
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