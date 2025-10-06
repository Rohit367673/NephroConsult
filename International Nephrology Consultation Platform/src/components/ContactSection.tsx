import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Clock, Phone, Mail, MessageCircle, Calendar, Globe, CheckCircle } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    urgency: 'normal'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-6PM EST'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@nephrologycare.com',
      description: 'Response within 24 hours'
    },
    {
      icon: MessageCircle,
      label: 'Live Chat',
      value: 'Available now',
      description: 'Instant support available'
    },
    {
      icon: Calendar,
      label: 'Emergency Line',
      value: '+1 (555) 911-HELP',
      description: '24/7 urgent care'
    }
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
    { day: 'Saturday', hours: '10:00 AM - 2:00 PM EST' },
    { day: 'Sunday', hours: 'Emergency consultations only' }
  ];

  const timeZones = [
    { zone: 'Eastern (EST)', time: '2:30 PM' },
    { zone: 'Central (CST)', time: '1:30 PM' },
    { zone: 'Pacific (PST)', time: '11:30 AM' },
    { zone: 'London (GMT)', time: '7:30 PM' },
    { zone: 'Dubai (GST)', time: '11:30 PM' }
  ];

  if (isSubmitted) {
    return (
      <section className="py-20">
        <div className="container-medical">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for reaching out. Our team will get back to you within 24 hours.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-[#006f6f] hover:bg-[#005555] text-white"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container-medical">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our nephrology team. We're here to help with your kidney health journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        className="mt-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="urgency">Urgency Level</Label>
                      <Select
                        value={formData.urgency}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - General inquiry</SelectItem>
                          <SelectItem value="normal">Normal - Standard response</SelectItem>
                          <SelectItem value="high">High - Need prompt response</SelectItem>
                          <SelectItem value="urgent">Urgent - Same day response needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your inquiry"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please describe your question or concern in detail..."
                      rows={6}
                      className="mt-2"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#006f6f] hover:bg-[#005555] text-white py-3 rounded-xl"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-6">Get in Touch</h4>
                
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#006f6f]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-[#006f6f]" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{info.label}</h5>
                        <p className="text-[#006f6f] font-medium">{info.value}</p>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 text-[#006f6f] mr-2" />
                  Office Hours
                </h4>
                
                <div className="space-y-3">
                  {officeHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{schedule.day}</span>
                      <span className="font-medium text-gray-900">{schedule.hours}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Emergency:</strong> For life-threatening situations, 
                    call 911 or go to your nearest emergency room.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Time Zones */}
            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 text-[#006f6f] mr-2" />
                  Current Time Zones
                </h4>
                
                <div className="space-y-2">
                  {timeZones.map((tz, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{tz.zone}</span>
                      <span className="font-medium text-gray-900">{tz.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-[#006f6f] mr-2" />
                  Office Location
                </h4>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">Nephrology Care Center</p>
                  <p className="text-gray-700">123 Medical Plaza Drive</p>
                  <p className="text-gray-700">Suite 456</p>
                  <p className="text-gray-700">New York, NY 10001</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 border-[#006f6f] text-[#006f6f] hover:bg-[#006f6f]/5"
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};