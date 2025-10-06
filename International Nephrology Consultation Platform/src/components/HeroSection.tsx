import React from 'react';
import { Button } from './ui/button';
import { Shield, Globe, Lock, Video, Clock, Award, Users, CheckCircle } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const trustSignals = [
    {
      icon: Video,
      label: 'Telemedicine',
      description: 'HIPAA-compliant video consultations'
    },
    {
      icon: Globe,
      label: 'International Payments',
      description: 'Support for 50+ currencies'
    },
    {
      icon: Lock,
      label: 'Secure Data',
      description: 'End-to-end encrypted patient data'
    }
  ];

  return (
    <section className="pt-24 pb-16 bg-white">
      <div className="container-medical">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                International Nephrology 
                <span className="block text-[#006f6f] mt-2">Consultations — Book Online</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Expert kidney care from anywhere in the world. Get personalized treatment plans, 
                medication management, and ongoing support from board-certified nephrologists.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => scrollToSection('booking')}
                className="bg-[#006f6f] hover:bg-[#005555] text-white text-lg px-8 py-4 rounded-xl"
              >
                Book Consultation
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('about')}
                className="border-[#006f6f] text-[#006f6f] hover:bg-[#006f6f]/5 text-lg px-8 py-4 rounded-xl"
              >
                View Services
              </Button>
            </div>

            {/* Trust Signals Row */}
            <div className="flex flex-wrap gap-6 pt-4">
              {trustSignals.map((signal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#006f6f]/10 rounded-lg flex items-center justify-center">
                    <signal.icon className="w-4 h-4 text-[#006f6f]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{signal.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual/Stats Card */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {/* Doctor Preview */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#006f6f] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for Consultation</h3>
                <p className="text-gray-600">High-quality, secure video calls</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#006f6f] mb-1">5,000+</div>
                  <div className="text-sm text-gray-600">Patients Served</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#006f6f] mb-1">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#006f6f] mb-1">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#006f6f] mb-1">24/7</div>
                  <div className="text-sm text-gray-600">Support Available</div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#059669]" />
                  <span className="text-sm text-gray-700">Board-certified nephrologists</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#059669]" />
                  <span className="text-sm text-gray-700">Instant prescription delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#059669]" />
                  <span className="text-sm text-gray-700">Secure medical records</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};