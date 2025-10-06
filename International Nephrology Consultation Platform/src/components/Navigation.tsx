import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    if (location.pathname === '/' && path.startsWith('#')) {
      // If on homepage and clicking anchor link, scroll to section
      const sectionId = path.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      // Navigate to different page
      navigate(path);
    }
    setIsOpen(false);
  };

  // Different nav items based on user type and current page
  const getNavItems = () => {
    if (location.pathname === '/') {
      // Homepage navigation - use anchor links
      return [
        { name: 'About', path: '#about' },
        { name: 'Services', path: '#services' },
        { name: 'How It Works', path: '#how-it-works' },
        { name: 'Contact', path: '#contact' },
      ];
    } else if (user?.role === 'patient') {
      // Patient navigation
      return [
        { name: 'Dashboard', path: '/patient/dashboard' },
        { name: 'Book Appointment', path: '/patient/book-appointment' },
        { name: 'Medical History', path: '/patient/medical-history' },
        { name: 'Prescriptions', path: '/patient/prescriptions' },
        { name: 'Profile', path: '/patient/profile' },
      ];
    } else if (user?.role === 'doctor') {
      // Doctor navigation
      return [
        { name: 'Dashboard', path: '/doctor/dashboard' },
        { name: 'Appointments', path: '/doctor/appointments' },
        { name: 'Patients', path: '/doctor/patients' },
      ];
    } else {
      // Public/guest navigation
      return [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/#about' },
        { name: 'Services', path: '/#services' },
        { name: 'Contact', path: '/#contact' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg backdrop-blur-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="container-medical">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#006f6f] rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-lg text-gray-900">Dr. Ilango Krishnamurthy</div>
              <div className="text-sm text-[#006f6f]">Nephrology Specialist</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className="text-gray-700 hover:text-[#006f6f] transition-colors duration-200 font-medium"
              >
                {item.name}
              </button>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Profile Image */}
                {user.avatar && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#006f6f]/20">
                    <img 
                      src={user.avatar}
                      alt={`${user.name}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Profile image failed to load, trying fallback methods');
                        
                        // Try alternative Google image URL
                        const currentSrc = e.currentTarget.src;
                        if (currentSrc.includes('googleusercontent.com') && !currentSrc.includes('proxy')) {
                          const newSrc = `https://images.weserv.nl/?url=${encodeURIComponent(currentSrc)}&w=100&h=100&fit=cover&mask=circle`;
                          e.currentTarget.src = newSrc;
                          return;
                        }
                        
                        // Final fallback to initials
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-8 h-8 bg-[#006f6f] rounded-full flex items-center justify-center text-white text-sm font-semibold">${user.name.charAt(0).toUpperCase()}</div>`;
                        }
                      }}
                    />
                  </div>
                )}
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="text-gray-700 border-gray-300"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="text-gray-700 border-gray-300"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  className="bg-[#006f6f] hover:bg-[#005555] text-white px-6 py-2 rounded-lg"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className="text-left text-gray-700 hover:text-[#006f6f] transition-colors duration-200 font-medium py-2"
                >
                  {item.name}
                </button>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center space-x-3">
                    {/* Mobile Profile Image */}
                    {user.avatar && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#006f6f]/20">
                        <img 
                          src={user.avatar}
                          alt={`${user.name}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Mobile profile image failed to load, trying fallback methods');
                            
                            // Try alternative Google image URL
                            const currentSrc = e.currentTarget.src;
                            if (currentSrc.includes('googleusercontent.com') && !currentSrc.includes('proxy')) {
                              const newSrc = `https://images.weserv.nl/?url=${encodeURIComponent(currentSrc)}&w=120&h=120&fit=cover&mask=circle`;
                              e.currentTarget.src = newSrc;
                              return;
                            }
                            
                            // Final fallback to initials
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-10 h-10 bg-[#006f6f] rounded-full flex items-center justify-center text-white font-semibold">${user.name.charAt(0).toUpperCase()}</div>`;
                            }
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full text-gray-700 border-gray-300"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button
                    variant="outline" 
                    onClick={() => navigate('/login')}
                    className="w-full text-gray-700 border-gray-300"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="bg-[#006f6f] hover:bg-[#005555] text-white w-full"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};