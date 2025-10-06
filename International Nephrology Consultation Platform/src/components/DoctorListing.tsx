import { Search, Filter, MapPin, Clock, Star, Globe, Video, MessageSquare, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface DoctorListingProps {
  onNavigate: (view: string, data?: any) => void;
}

export function DoctorListing({ onNavigate }: DoctorListingProps) {
  const doctors = [
    {
      id: 1,
      name: "Dr. Asha Verma",
      specialty: "Senior Nephrologist",
      experience: "12 years experience",
      languages: ["English", "Hindi"],
      rating: 4.9,
      reviewCount: 156,
      location: "Mumbai, India",
      timezone: "IST (GMT+5:30)",
      consultationFee: { amount: 60, currency: "USD" },
      availability: "Available today",
      image: "https://images.unsplash.com/photo-1631217872822-1c2546d6b864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBjb25zdWx0YXRpb24lMjBtZWRpY2FsfGVufDF8fHx8MTc1Nzg3MzgzOXww&ixlib=rb-4.1.0&q=80&w=400",
      specializations: ["Chronic Kidney Disease", "Dialysis", "Hypertension"],
      consultationTypes: ["video", "chat", "audio"]
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Pediatric Nephrologist",
      experience: "15 years experience",
      languages: ["English", "Mandarin"],
      rating: 4.8,
      reviewCount: 203,
      location: "Toronto, Canada",
      timezone: "EST (GMT-5)",
      consultationFee: { amount: 85, currency: "USD" },
      availability: "Available in 2 hours",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzU3OTI2NTg5fDA&ixlib=rb-4.1.0&q=80&w=400",
      specializations: ["Pediatric Kidney Disease", "Congenital Disorders", "Transplantation"],
      consultationTypes: ["video", "chat"]
    },
    {
      id: 3,
      name: "Dr. Sarah Williams",
      specialty: "Transplant Specialist",
      experience: "18 years experience",
      languages: ["English", "Spanish"],
      rating: 4.9,
      reviewCount: 289,
      location: "London, UK",
      timezone: "GMT (GMT+0)",
      consultationFee: { amount: 95, currency: "USD" },
      availability: "Available tomorrow",
      image: "https://images.unsplash.com/photo-1700832082200-af7deeb63d9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGV0aG9zY29wZSUyMG1lZGljYWwlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzU3ODY2MTAyfDA&ixlib=rb-4.1.0&q=80&w=400",
      specializations: ["Kidney Transplantation", "Post-transplant Care", "Immunosuppression"],
      consultationTypes: ["video", "audio"]
    },
    {
      id: 4,
      name: "Dr. Ahmed Hassan",
      specialty: "Interventional Nephrologist",
      experience: "10 years experience",
      languages: ["English", "Arabic"],
      rating: 4.7,
      reviewCount: 134,
      location: "Dubai, UAE",
      timezone: "GST (GMT+4)",
      consultationFee: { amount: 70, currency: "USD" },
      availability: "Available today",
      image: "https://images.unsplash.com/photo-1631217872822-1c2546d6b864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBjb25zdWx0YXRpb24lMjBtZWRpY2FsfGVufDF8fHx8MTc1Nzg3MzgzOXww&ixlib=rb-4.1.0&q=80&w=400",
      specializations: ["Vascular Access", "Dialysis Access", "Interventional Procedures"],
      consultationTypes: ["video", "chat", "audio"]
    },
    {
      id: 5,
      name: "Dr. Maria Rodriguez",
      specialty: "Clinical Nephrologist",
      experience: "14 years experience",
      languages: ["English", "Spanish", "Portuguese"],
      rating: 4.8,
      reviewCount: 178,
      location: "São Paulo, Brazil",
      timezone: "BRT (GMT-3)",
      consultationFee: { amount: 55, currency: "USD" },
      availability: "Available in 1 hour",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzU3OTI2NTg5fDA&ixlib=rb-4.1.0&q=80&w=400",
      specializations: ["Diabetic Nephropathy", "Glomerulonephritis", "Acute Kidney Injury"],
      consultationTypes: ["video", "chat"]
    },
    {
      id: 6,
      name: "Dr. James Thompson",
      specialty: "Geriatric Nephrologist",
      experience: "20 years experience",
      languages: ["English"],
      rating: 4.9,
      reviewCount: 245,
      location: "Sydney, Australia",
      timezone: "AEST (GMT+10)",
      consultationFee: { amount: 80, currency: "USD" },
      availability: "Available today",
      image: "https://images.unsplash.com/photo-1700832082200-af7deeb63d9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGV0aG9zY29wZSUyMG1lZGljYWwlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzU3ODY2MTAyfDA&ixlib=rb-4.1.0&q=80&w=400",
      specializations: ["Elderly Kidney Care", "Polycystic Kidney Disease", "Chronic Care"],
      consultationTypes: ["video", "phone"]
    }
  ];

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'chat': return MessageSquare;
      case 'audio': 
      case 'phone': return Phone;
      default: return Video;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Find a Nephrologist</h1>
          <p className="text-muted-foreground">
            Connect with certified kidney specialists worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, specialty, or condition..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="general">General Nephrology</SelectItem>
                <SelectItem value="pediatric">Pediatric Nephrology</SelectItem>
                <SelectItem value="transplant">Transplant Specialist</SelectItem>
                <SelectItem value="interventional">Interventional Nephrology</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="mandarin">Mandarin</SelectItem>
                <SelectItem value="arabic">Arabic</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="today">Available Today</SelectItem>
                <SelectItem value="tomorrow">Available Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              {doctors.length} doctors found
            </div>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="grid gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Doctor Image and Basic Info */}
                  <div className="flex flex-col sm:flex-row gap-4 lg:w-1/3">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                      <ImageWithFallback
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-lg">{doctor.name}</h3>
                      <p className="text-primary mb-1">{doctor.specialty}</p>
                      <p className="text-sm text-muted-foreground mb-2">{doctor.experience}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-sm text-muted-foreground">({doctor.reviewCount} reviews)</span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{doctor.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{doctor.timezone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specializations and Details */}
                  <div className="lg:w-1/3">
                    <h4 className="mb-2 font-medium">Specializations:</h4>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {doctor.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    <h4 className="mb-2 font-medium">Languages:</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {doctor.languages.join(", ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {doctor.consultationTypes.map((type, index) => {
                        const Icon = getConsultationIcon(type);
                        return (
                          <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon className="w-3 h-3" />
                            <span className="capitalize">{type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="lg:w-1/3 lg:text-right">
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-primary mb-1">
                        ${doctor.consultationFee.amount}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {doctor.consultationFee.currency}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Per consultation</p>
                    </div>

                    <div className="mb-4">
                      <Badge 
                        variant={doctor.availability.includes("today") ? "default" : "secondary"}
                        className="mb-2"
                      >
                        {doctor.availability}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        className="w-full"
                        onClick={() => onNavigate('book-consultation', { doctorId: doctor.id, doctor })}
                      >
                        Book Consultation
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => onNavigate('doctor-profile', { doctorId: doctor.id, doctor })}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">
            Load More Doctors
          </Button>
        </div>
      </div>
    </div>
  );
}