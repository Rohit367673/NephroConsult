import { ArrowRight, Check, Clock, Globe, Shield, Star, Users, Video } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const features = [
    {
      icon: Video,
      title: "Video Consultations",
      description: "Connect with nephrologists worldwide through secure video calls"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Access to kidney specialists across different time zones and languages"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "HIPAA-compliant platform ensuring your medical data stays protected"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Book consultations at your convenience with flexible scheduling"
    }
  ];

  const doctors = [
    {
      name: "Dr. Asha Verma",
      specialty: "Senior Nephrologist",
      experience: "12 years experience",
      languages: "English, Hindi",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1631217872822-1c2546d6b864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBjb25zdWx0YXRpb24lMjBtZWRpY2FsfGVufDF8fHx8MTc1Nzg3MzgzOXww&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Pediatric Nephrologist",
      experience: "15 years experience",
      languages: "English, Mandarin",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzU3OTI2NTg5fDA&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      name: "Dr. Sarah Williams",
      specialty: "Transplant Specialist",
      experience: "18 years experience",
      languages: "English, Spanish",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1700832082200-af7deeb63d9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGV0aG9zY29wZSUyMG1lZGljYWwlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzU3ODY2MTAyfDA&ixlib=rb-4.1.0&q=80&w=400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Trusted by 50,000+ patients worldwide
          </Badge>
          
          <h1 className="mb-6 max-w-4xl mx-auto text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Connect with Top 
            <span className="text-primary"> Nephrologists</span> Worldwide
          </h1>
          
          <p className="mb-8 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Get expert kidney care from certified nephrologists. Schedule consultations, 
            share lab reports, and receive prescriptions - all from the comfort of your home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={() => onNavigate('doctors')}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Book Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto"
            >
              Sign Up Free
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              500+ Specialists
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              4.9/5 Rating
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">
              Why Choose NephroConsult?
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Experience world-class nephrology care with our comprehensive platform 
              designed for patients and healthcare providers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">
              Meet Our Expert Nephrologists
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Connect with board-certified kidney specialists from around the world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{doctor.rating}</span>
                  </div>
                  <h3 className="mb-1 font-semibold">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{doctor.specialty}</p>
                  <p className="text-sm text-muted-foreground mb-2">{doctor.experience}</p>
                  <p className="text-sm text-muted-foreground mb-4">Languages: {doctor.languages}</p>
                  <Button className="w-full" onClick={() => onNavigate('book-consultation')}>
                    Book Consultation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">
              How It Works
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Get started with your kidney care journey in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Find a Specialist", description: "Browse our network of certified nephrologists and filter by language, specialty, and availability" },
              { step: "2", title: "Book Appointment", description: "Select your preferred time slot and consultation type. Pay securely with multiple currency options" },
              { step: "3", title: "Start Consultation", description: "Join your video call, share reports, and receive personalized treatment recommendations" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 text-3xl md:text-4xl font-bold">
            Ready to Start Your Kidney Care Journey?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of patients who trust NephroConsult for their kidney health needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onNavigate('doctors')}
              className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary"
            >
              Browse Doctors
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}