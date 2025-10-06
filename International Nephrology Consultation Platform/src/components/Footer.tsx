import React from 'react';
import { motion } from 'motion/react';
import { Heart, Mail, Phone, MapPin, Globe, Shield, Clock, Star, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container-medical">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-b border-gray-700 py-12"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Stay Updated on Kidney Health</h3>
            <p className="text-gray-400 mb-6">
              Get the latest insights, tips, and health advice directly from Dr. Ilango S. Prakasam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button className="bg-[#006f6f] hover:bg-[#005555] whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-16"
        >
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Company Info */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-[#006f6f] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">NephroConsult</h3>
                  <p className="text-sm text-[#006f6f]">International Kidney Care</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                World-class nephrology consultations with Dr. Ilango S. Prakasam. 
                Providing expert kidney care through secure telemedicine worldwide.
              </p>
              
              {/* Trust Indicators */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-[#006f6f]" />
                  <span className="text-sm text-gray-300">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-300">4.9/5 Patient Rating</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-[#006f6f]" />
                  <span className="text-sm text-gray-300">Available Globally</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Book Consultation', href: '/booking' },
                  { name: 'About Dr. Ilango', href: '/about' },
                  { name: 'Patient Dashboard', href: '/patient/dashboard' },
                  { name: 'My Profile', href: '/profile' },
                  { name: 'Medical History', href: '/medical-history' },
                  { name: 'Prescriptions', href: '/prescriptions' }
                ].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#006f6f] transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-2 h-2 bg-[#006f6f] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6">Our Services</h4>
              <ul className="space-y-3">
                {[
                  'Video Consultations',
                  'Lab Report Analysis',
                  'Digital Prescriptions',
                  'Follow-up Care',
                  'Urgent Consultations',
                  'Health Monitoring'
                ].map((service) => (
                  <li key={service} className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
                    {service}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <h5 className="font-medium mb-4">Emergency Support</h5>
                <p className="text-sm text-gray-400">
                  For medical emergencies, contact your local emergency services immediately.
                </p>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#006f6f] mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-400">contact@nephroconsult.com</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#006f6f] mt-0.5" />
                  <div>
                    <p className="font-medium">Consultation Hours</p>
                    <p className="text-gray-400">24/7 Available</p>
                    <p className="text-sm text-gray-500">Multiple timezone support</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h5 className="font-medium mb-4">Follow Us</h5>
                <div className="flex space-x-4">
                  {[
                    { icon: Facebook, label: 'Facebook' },
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Instagram, label: 'Instagram' },
                    { icon: Linkedin, label: 'LinkedIn' }
                  ].map(({ icon: Icon, label }) => (
                    <motion.a
                      key={label}
                      href="#"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-white/10 hover:bg-[#006f6f] rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label={label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-700 py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400">
                © 2024 NephroConsult. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Made with care for better kidney health</span>
              </div>
              
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-[#006f6f] hover:bg-[#005555] rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements for Visual Appeal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-20 h-20 bg-[#006f6f]/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 right-20 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"
        />
      </div>
    </footer>
  );
}