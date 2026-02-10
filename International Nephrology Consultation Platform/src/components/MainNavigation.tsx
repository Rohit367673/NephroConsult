import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface Props {
  onLoginOpen?: () => void;
  onSignupOpen?: () => void;
}

export function MainNavigation({ onLoginOpen, onSignupOpen }: Props) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    if (!user && (path === '/booking' || path === '/profile' || path.includes('dashboard'))) {
      if (onLoginOpen) {
        onLoginOpen();
        toast.info('🔐 Please log in to access this feature');
      } else {
        toast.info('🔐 Please log in to access this feature');
        navigate('/');
      }
      setIsMenuOpen(false);
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
            className="flex items-center space-x-3 cursor-pointer shrink-0"
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
          <nav className="hidden md:flex flex-1 min-w-0 items-center justify-end gap-2 lg:gap-6 flex-nowrap">
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/')}
              className={`whitespace-nowrap text-sm lg:text-base ${location.pathname === '/' ? 'text-[#006f6f]' : ''}`}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/about')}
              className={`whitespace-nowrap text-sm lg:text-base ${location.pathname === '/about' ? 'text-[#006f6f]' : ''}`}
            >
              About
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/booking')}
              className={`whitespace-nowrap text-sm lg:text-base ${location.pathname === '/booking' ? 'text-[#006f6f]' : ''}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/contact')}
              className={`whitespace-nowrap text-sm lg:text-base ${location.pathname === '/contact' ? 'text-[#006f6f]' : ''}`}
            >
              Contact
            </Button>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/profile')}
                  className={`whitespace-nowrap text-sm lg:text-base ${location.pathname === '/profile' ? 'text-[#006f6f]' : ''}`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" onClick={logout} className="whitespace-nowrap">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => (onLoginOpen ? onLoginOpen() : navigate('/login'))}
                  className="whitespace-nowrap"
                >
                  Login
                </Button>
                <Button
                  onClick={() => (onSignupOpen ? onSignupOpen() : navigate('/signup'))}
                  className="bg-[#006f6f] hover:bg-[#005555] whitespace-nowrap"
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
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
              <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation('/')}>Home</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation('/about')}>About</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation('/booking')}>
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation('/contact')}>Contact</Button>

              {user ? (
                <>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation('/profile')}>
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
                  <Button variant="outline" className="w-full justify-start" onClick={() => (onLoginOpen ? onLoginOpen() : navigate('/login'))}>Login</Button>
                  <Button className="w-full justify-start bg-[#006f6f] hover:bg-[#005555]" onClick={() => (onSignupOpen ? onSignupOpen() : navigate('/signup'))}>Sign Up</Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
