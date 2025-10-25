import React from 'react';
import { motion } from 'motion/react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Award, GraduationCap, Clock, Users, Heart,
  Stethoscope, MapPin, Mail, Phone, Star
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const AboutPage = () => {
  return (
    <>
      <SEOHead
        title="About Dr. Rohit Kumar - Expert Nephrologist | NephroConsult"
        description="Meet Dr. Rohit Kumar, MBBS, MD, DM Nephrology - leading kidney specialist with 15+ years experience in chronic kidney disease treatment, dialysis planning, and kidney transplant counseling. Expert nephrology care with international consultation services."
        keywords="Dr Rohit Kumar nephrologist, kidney specialist doctor, nephrology expert India, chronic kidney disease specialist, dialysis expert, kidney transplant doctor, renal medicine specialist, nephrology qualifications, kidney doctor experience, DM nephrology"
        canonical="https://www.nephroconsultation.com/about"
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
                <Award className="w-4 h-4 mr-2" />
                Senior Nephrologist
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-[#006f6f] to-gray-900 bg-clip-text text-transparent">
                Dr. Rohit Kumar
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-4">
                MBBS, MD (Medicine), DM (Nephrology)
              </p>

              <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
                Leading kidney specialist with over 15 years of experience in comprehensive nephrology care,
                specializing in chronic kidney disease management, dialysis planning, and kidney transplant counseling.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                  <Users className="w-5 h-5 text-[#006f6f] mr-2" />
                  <span className="font-semibold">5000+ Patients</span>
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                  <Clock className="w-5 h-5 text-[#006f6f] mr-2" />
                  <span className="font-semibold">15+ Years Experience</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Credentials Section */}
        <section className="py-16 bg-white">
          <div className="container-medical">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                  Professional Qualifications
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#006f6f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-[#006f6f]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">DM Nephrology</h3>
                      <p className="text-gray-600">Super-specialty degree in Nephrology</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#006f6f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-[#006f6f]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">MD Medicine</h3>
                      <p className="text-gray-600">Post-graduate degree in Internal Medicine</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#006f6f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-[#006f6f]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">MBBS</h3>
                      <p className="text-gray-600">Bachelor of Medicine and Bachelor of Surgery</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-[#006f6f]/5 to-[#004f4f]/5 rounded-2xl p-8">
                  <div className="w-48 h-48 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-white text-6xl font-bold">DR</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 mb-2">Registered Medical Practitioner</p>
                    <p className="text-gray-600">Medical Council of India</p>
                    <p className="text-gray-600">Registration Number: [Registration Number]</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Specializations Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-medical">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Areas of Expertise</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive nephrology care covering all aspects of kidney health and renal medicine
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Chronic Kidney Disease",
                  description: "Comprehensive management of CKD stages 1-5, progression monitoring, and treatment planning"
                },
                {
                  title: "Dialysis Planning",
                  description: "Hemodialysis and peritoneal dialysis preparation, access planning, and ongoing management"
                },
                {
                  title: "Kidney Transplant",
                  description: "Pre-transplant evaluation, donor matching guidance, and post-transplant care planning"
                },
                {
                  title: "Acute Kidney Injury",
                  description: "Rapid assessment and treatment of sudden kidney function decline and renal emergencies"
                },
                {
                  title: "Diabetic Nephropathy",
                  description: "Specialized care for diabetes-related kidney complications and progression prevention"
                },
                {
                  title: "Hypertensive Kidney Disease",
                  description: "Management of high blood pressure-related kidney damage and renal complications"
                }
              ].map((specialty, index) => (
                <motion.div
                  key={specialty.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#006f6f]">{specialty.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{specialty.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-16 bg-white">
          <div className="container-medical">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Professional Experience</h2>

                <div className="space-y-6">
                  <div className="border-l-4 border-[#006f6f] pl-6">
                    <h3 className="font-semibold text-lg text-gray-900">Senior Consultant Nephrologist</h3>
                    <p className="text-gray-600 mb-2">NephroConsult • 2020 - Present</p>
                    <p className="text-gray-600">Leading online nephrology consultation platform providing international kidney care services</p>
                  </div>

                  <div className="border-l-4 border-[#006f6f] pl-6">
                    <h3 className="font-semibold text-lg text-gray-900">Nephrology Specialist</h3>
                    <p className="text-gray-600 mb-2">Major Hospitals • 2015 - 2020</p>
                    <p className="text-gray-600">Managed complex kidney disease cases and performed renal procedures</p>
                  </div>

                  <div className="border-l-4 border-[#006f6f] pl-6">
                    <h3 className="font-semibold text-lg text-gray-900">Junior Nephrologist</h3>
                    <p className="text-gray-600 mb-2">Teaching Hospital • 2010 - 2015</p>
                    <p className="text-gray-600">Post-DM training and initial nephrology practice development</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="bg-gradient-to-br from-[#006f6f]/5 to-[#004f4f]/5 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Key Achievements</h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#006f6f]/10 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#006f6f]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">5000+ Patients Treated</p>
                        <p className="text-sm text-gray-600">Successful outcomes across all kidney conditions</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#006f6f]/10 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-[#006f6f]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">98% Success Rate</p>
                        <p className="text-sm text-gray-600">In dialysis planning and transplant counseling</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#006f6f]/10 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[#006f6f]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">International Practice</p>
                        <p className="text-sm text-gray-600">Serving patients across India and globally</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gradient-to-r from-[#006f6f] to-[#004f4f] text-white">
          <div className="container-medical text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Kidney Health Journey?</h2>
              <p className="text-xl mb-8 opacity-90">
                Book a consultation with Dr. Rohit Kumar for expert nephrology care
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/booking"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#006f6f] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Book Consultation
                </motion.a>

                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#006f6f] transition-colors"
                >
                  Get in Touch
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
