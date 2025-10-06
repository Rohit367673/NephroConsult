import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Award, Users, Clock, Globe, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const AboutDoctor: React.FC = () => {
  const specialties = [
    'Chronic Kidney Disease',
    'Hypertension',
    'Dialysis Management',
    'Kidney Transplant',
    'Glomerulonephritis',
    'Electrolyte Disorders'
  ];

  const consultationTimes = [
    { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM EST' },
    { day: 'Saturday', time: '10:00 AM - 2:00 PM EST' },
    { day: 'Sunday', time: 'Emergency Only' }
  ];

  const credentials = [
    'MD, Johns Hopkins University',
    'Fellowship, Mayo Clinic Nephrology',
    'Board Certified Nephrologist',
    'American Society of Nephrology Member'
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20">
      <div className="container-medical">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About Dr. Sarah Chen</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leading nephrologist with over 15 years of experience in treating kidney diseases 
            and providing comprehensive care to patients worldwide.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Profile Card */}
          <div className="lg:col-span-2">
            <Card className="p-8 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Doctor Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-48 h-48 bg-gradient-to-br from-[#006f6f] to-[#059669] rounded-2xl flex items-center justify-center">
                      <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center">
                        <Users className="w-20 h-20 text-[#006f6f]" />
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr. Sarah Chen, MD</h3>
                      <p className="text-[#006f6f] font-semibold mb-4">Board-Certified Nephrologist</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>New York, NY</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>Serves Globally</span>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-6">
                        Dr. Chen specializes in comprehensive nephrology care with a focus on 
                        chronic kidney disease management, hypertension treatment, and dialysis 
                        optimization. She provides personalized care plans tailored to each patient's 
                        unique needs and cultural background.
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {specialties.slice(0, 4).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="bg-[#dcfce7] text-[#166534]">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={() => scrollToSection('booking')}
                        className="bg-[#006f6f] hover:bg-[#005555] text-white px-6 py-3 rounded-xl"
                      >
                        Book Consultation
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats & Info */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 text-[#006f6f] mr-2" />
                  Quick Stats
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Patients Served</span>
                    <span className="font-semibold text-[#006f6f]">5,000+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Years Experience</span>
                    <span className="font-semibold text-[#006f6f]">15+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-[#006f6f]">98%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Languages</span>
                    <span className="font-semibold text-[#006f6f]">6</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Times */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 text-[#006f6f] mr-2" />
                  Consultation Hours
                </h4>
                <div className="space-y-3">
                  {consultationTimes.map((time, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{time.day}</span>
                      <span className="text-sm text-gray-600">{time.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Credentials */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-[#006f6f] mr-2" />
                  Credentials
                </h4>
                <div className="space-y-2">
                  {credentials.map((credential, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      • {credential}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Specialties */}
        <div className="mt-16">
          <Card className="p-8 rounded-2xl shadow-lg border-gray-200">
            <CardContent className="p-0">
              <h4 className="font-semibold text-gray-900 mb-6">Areas of Specialization</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-2 h-2 bg-[#006f6f] rounded-full"></div>
                    <span className="text-gray-700">{specialty}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};