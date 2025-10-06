import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <Navigation />
      
      {/* Spacer for fixed navigation */}
      <div className="h-20"></div>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-border">
        <div className="container-medical py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">NephroConsult</span>
              </Link>
              <p className="text-muted-foreground">
                International kidney care and consultation platform connecting patients with expert nephrologists worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link to="/login" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Patient Login
                </Link>
                <Link to="/signup" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Register
                </Link>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Services</h4>
              <div className="space-y-2">
                <p className="text-muted-foreground">Video Consultations</p>
                <p className="text-muted-foreground">Digital Prescriptions</p>
                <p className="text-muted-foreground">Lab Report Analysis</p>
                <p className="text-muted-foreground">Treatment Plans</p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>contact@nephroconsult.com</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Global Telemedicine</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground space-y-2">
            <p>&copy; 2024 NephroConsult. All rights reserved.</p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}