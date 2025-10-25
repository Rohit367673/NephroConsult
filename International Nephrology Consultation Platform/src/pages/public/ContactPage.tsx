import React from 'react';
import { motion } from 'motion/react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Phone, Mail, MapPin, Clock, MessageCircle,
  Video, Calendar, Users, Award, Star
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const ContactPage = () => {
  return (
    <>
      <SEOHead
        title="Contact NephroConsult - Book Kidney Specialist Consultation"
        description="Contact NephroConsult to book your online nephrology consultation with Dr. Rohit Kumar. Get expert kidney care through secure video consultations. Available internationally with region-specific pricing. Schedule your appointment today."
        keywords="contact nephrologist, book kidney consultation, nephrology appointment, kidney specialist contact, online doctor booking, nephrology consultation contact, Dr Rohit Kumar contact, kidney doctor appointment"
        canonical="https://www.nephroconsultation.com/contact"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#006f6f]/5">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="container-medical">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-[#006f6f]/10 to-[#004f4f]/10 text-[#006f6f] border-[#006f6f]/30">
                <MessageCircle className="w-4 h-4 mr-2" />
                Get In Touch
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-[#006f6f] to-gray-900 bg-clip-text text-transparent">
                Contact NephroConsult
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Ready to start your kidney health journey? Book a consultation with Dr. Rohit Kumar
                or get in touch for any questions about our nephrology services.
              </p>

              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center bg-white px-4 py-3 rounded-full shadow-sm">
                  <Phone className="w-5 h-5 text-[#006f6f] mr-2" />
                  <span className="font-semibold">+91 XXXXX XXXXX</span>
                </div>
                <div className="flex items-center bg-white px-4 py-3 rounded-full shadow-sm">
                  <Mail className="w-5 h-5 text-[#006f6f] mr-2" />
                  <span className="font-semibold">contact@nephroconsultation.com</span>
                </div>
                <div className="flex items-center bg-white px-4 py-3 rounded-full shadow-sm">
                  <Clock className="w-5 h-5 text-[#006f6f] mr-2" />
                  <span className="font-semibold">Available 24/7</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 bg-white">
          <div className="container-medical">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Video,
                  title: "Online Consultation",
                  description: "Book a secure video consultation with Dr. Rohit Kumar from anywhere in the world",
                  action: "Book Now",
                  href: "/booking"
                },
                {
                  icon: Phone,
                  title: "Phone Consultation",
                  description: "Speak directly with our nephrology specialist for urgent kidney health concerns",
                  action: "Call Now",
                  href: "tel:+91XXXXXXXXXX"
                },
                {
                  icon: Mail,
                  title: "Email Support",
                  description: "Send us your questions or medical reports for detailed review and guidance",
                  action: "Email Us",
                  href: "mailto:contact@nephroconsultation.com"
                }
              ].map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-full flex items-center justify-center mx-auto mb-4">
                        <method.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-[#006f6f]">{method.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 mb-6">{method.description}</p>
                      <Button
                        asChild
                        className="w-full bg-[#006f6f] hover:bg-[#005555]"
                      >
                        <a href={method.href}>{method.action}</a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 bg-gray-50">
          <div className="container-medical">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Send us a Message</h2>
                <p className="text-lg text-gray-600">
                  Have questions about kidney health or our services? We're here to help!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What can we help you with?"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Please describe your kidney health concerns or questions..."
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#006f6f] hover:bg-[#005555] text-lg py-6"
                  >
                    Send Message
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Office Information */}
        <section className="py-16 bg-white">
          <div className="container-medical">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Practice Information</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Dr. Rohit Kumar provides international nephrology consultations through secure online platforms
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-br from-[#006f6f]/5 to-[#004f4f]/5 rounded-2xl p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#006f6f]/10 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-[#006f6f]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Service Area</h3>
                    <p className="text-gray-600">International</p>
                  </div>
                </div>

                <div className="space-y-3 text-gray-600">
                  <p>🌍 Available worldwide through online consultations</p>
                  <p>🏥 Specialized kidney care from India</p>
                  <p>⏰ Flexible scheduling across time zones</p>
                  <p>💰 Region-specific pricing (USD, INR, GBP, EUR)</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-br from-[#006f6f]/5 to-[#004f4f]/5 rounded-2xl p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#006f6f]/10 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-[#006f6f]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Consultation Hours</h3>
                    <p className="text-gray-600">By Appointment</p>
                  </div>
                </div>

                <div className="space-y-3 text-gray-600">
                  <p>📅 Monday - Saturday: 9:00 AM - 6:00 PM IST</p>
                  <p>🆘 Emergency consultations available 24/7</p>
                  <p>🌐 Follow-up appointments scheduled as needed</p>
                  <p>📞 Same-day appointments often available</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#006f6f] to-[#004f4f] text-white">
          <div className="container-medical text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Book Your Consultation?</h2>
              <p className="text-xl mb-8 opacity-90">
                Don't wait for kidney health concerns. Schedule your appointment with Dr. Rohit Kumar today.
              </p>

              <motion.a
                href="/booking"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-white text-[#006f6f] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Book Appointment Now
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
