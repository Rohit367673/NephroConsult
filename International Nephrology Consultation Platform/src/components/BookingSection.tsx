import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookingFlow } from './BookingFlow';
import { Video, MessageCircle, Phone, Calendar, Clock, DollarSign, Users, MapPin } from 'lucide-react';

export const BookingSection: React.FC = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const consultationTypes = [
    {
      icon: Video,
      type: 'Video Consultation',
      duration: '45 minutes',
      price: '$3300',
      description: 'Face-to-face consultation via secure video call',
      features: ['HD Video Quality', 'Screen Sharing', 'Recording Available', 'Instant Prescription'],
      recommended: true
    },
    {
      icon: MessageCircle,
      type: 'Chat Consultation',
      duration: '30 minutes',
      price: '$3300',
      description: 'Text-based consultation with file sharing',
      features: ['Real-time Chat', 'File Upload', 'Message History', 'Follow-up Questions'],
      recommended: false
    },
    {
      icon: Phone,
      type: 'Follow-up Consultation',
      duration: '30 minutes',
      price: '$2310',
      description: 'Follow-up voice consultation for existing patients',
      features: ['Clear Audio', 'Call Recording', 'Post-call Summary', 'Prescription via Email'],
      recommended: false
    },
    {
      icon: Phone,
      type: 'Phone Consultation',
      duration: '30 minutes',
      price: '$3300',
      description: 'Voice consultation for new patients',
      features: ['Clear Audio', 'Call Recording', 'Post-call Summary', 'Prescription via Email'],
      recommended: false
    }
  ];

  const quickStats = [
    { icon: Calendar, label: 'Same Day', value: 'Available' },
    { icon: Clock, label: 'Response Time', value: '< 2 hours' },
    { icon: Users, label: 'Patients Served', value: '5,000+' },
    { icon: DollarSign, label: 'Starting From', value: '$100' }
  ];

  return (
    <section className="py-20">
      <div className="container-medical">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Your Consultation</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your preferred consultation method and get expert nephrology care 
            from the comfort of your home.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6 text-center rounded-2xl shadow-sm border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-[#006f6f]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-[#006f6f]" />
                </div>
                <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                <div className="font-semibold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Consultation Types */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {consultationTypes.map((consultation, index) => (
            <Card key={index} className={`p-6 rounded-2xl shadow-lg transition-all hover:shadow-xl ${
              consultation.recommended ? 'border-[#006f6f] border-2 relative' : 'border-gray-200'
            }`}>
              {consultation.recommended && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#006f6f] text-white">
                  Recommended
                </Badge>
              )}
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    consultation.recommended ? 'bg-[#006f6f]' : 'bg-gray-100'
                  }`}>
                    <consultation.icon className={`w-8 h-8 ${
                      consultation.recommended ? 'text-white' : 'text-[#006f6f]'
                    }`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{consultation.type}</h3>
                  <p className="text-gray-600 text-sm mb-4">{consultation.description}</p>
                  
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <span className="text-2xl font-bold text-[#006f6f]">{consultation.price}</span>
                    <span className="text-gray-500">({consultation.duration})</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {consultation.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  className={`w-full py-3 rounded-xl ${
                    consultation.recommended 
                      ? 'bg-[#006f6f] hover:bg-[#005555] text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Book {consultation.type}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <Card className="p-8 rounded-2xl shadow-lg border-gray-200 bg-gradient-to-r from-[#006f6f]/5 to-[#059669]/5">
            <CardContent className="p-0">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Book your consultation now and get expert nephrology care. Our team will contact you 
                within 2 hours to confirm your appointment.
              </p>
              <Button
                onClick={() => setIsBookingModalOpen(true)}
                size="lg"
                className="bg-[#006f6f] hover:bg-[#005555] text-white px-8 py-4 rounded-xl text-lg"
              >
                Open Booking Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Patient Information */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
            <CardContent className="p-0">
              <h4 className="font-semibold text-gray-900 mb-4">What to Prepare</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Current medications list</li>
                <li>• Recent lab results (if available)</li>
                <li>• Insurance information</li>
                <li>• Medical history summary</li>
                <li>• List of current symptoms</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
            <CardContent className="p-0">
              <h4 className="font-semibold text-gray-900 mb-4">Technical Requirements</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Stable internet connection</li>
                <li>• Camera and microphone (for video)</li>
                <li>• Updated web browser</li>
                <li>• Quiet, private space</li>
                <li>• Mobile or desktop device</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingFlow onClose={() => setIsBookingModalOpen(false)} />
      )}
    </section>
  );
};