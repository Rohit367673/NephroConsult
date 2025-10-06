import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  Home, 
  Calendar, 
  FileText, 
  User, 
  Bell, 
  LogOut,
  Menu,
  X,
  Pill
} from 'lucide-react';

export function PatientLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: Home },
    { name: 'Book Appointment', href: '/patient/book-appointment', icon: Calendar },
    { name: 'Medical History', href: '/patient/medical-history', icon: FileText },
    { name: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
    { name: 'Profile', href: '/patient/profile', icon: User },
    { name: 'Notifications', href: '/patient/notifications', icon: Bell },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container-medical">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/patient/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">NephroConsult</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications Badge */}
              <Link 
                to="/patient/notifications"
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  2
                </Badge>
              </Link>

              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">Patient</p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Logout Button (Desktop) */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="container-medical py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start space-x-3 mt-4"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="py-6">
        <div className="container-medical">
          <Outlet />
        </div>
      </main>
    </div>
  );
}