import { Bell, ChevronDown, Menu, User, Video, Calendar, FileText, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userType?: 'patient' | 'doctor' | 'admin';
}

export function Header({ currentView, onNavigate, userType = 'patient' }: HeaderProps) {
  return (
    <header className="bg-white border-b border-border px-4 py-3 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="font-medium text-lg hidden md:block">NephroConsult</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button 
              onClick={() => onNavigate('doctors')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentView === 'doctors' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
              }`}
            >
              Find Doctors
            </button>
            <button 
              onClick={() => onNavigate('appointments')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentView === 'appointments' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
              }`}
            >
              My Appointments
            </button>
            <button 
              onClick={() => onNavigate('reports')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentView === 'reports' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
              }`}
            >
              Lab Reports
            </button>
            <button 
              onClick={() => onNavigate('history')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentView === 'history' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
              }`}
            >
              Medical History
            </button>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('book-consultation')}
            >
              Book Consultation
            </Button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="hidden md:block">John Doe</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onNavigate('profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('appointments')}>
                <Calendar className="w-4 h-4 mr-2" />
                Appointments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('reports')}>
                <FileText className="w-4 h-4 mr-2" />
                Lab Reports
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Button variant="ghost" size="sm" className="p-2 lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}