import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, Video, MessageSquare, FileText, CreditCard, CheckCircle, Globe, Info } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getUserTimezone, 
  getPricingForTimezone, 
  getAvailableTimeSlotsForUser, 
  getCountryFromTimezone,
  formatAppointmentTime 
} from '../../utils/timezoneUtils';

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userTimezone, setUserTimezone] = useState('');
  const [userCountry, setUserCountry] = useState('');
  const [pricing, setPricing] = useState({ initial: 150, followup: 105, currency: 'USD', symbol: '$' });
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string, istTime: string, available: boolean }>>([]);
  const [bookingData, setBookingData] = useState({
    consultationType: '',
    consultationCategory: 'initial', // 'initial' or 'followup'
    date: '',
    time: '',
    istTime: '',
    symptoms: '',
    medicalHistory: '',
    files: [] as File[],
    paymentMethod: ''
  });

  useEffect(() => {
    // Get user's timezone and pricing
    const tz = getUserTimezone();
    setUserTimezone(tz);
    setUserCountry(getCountryFromTimezone(tz));
    setPricing(getPricingForTimezone(tz));
  }, []);

  useEffect(() => {
    // Update available time slots when date changes
    if (bookingData.date && userTimezone) {
      const selectedDate = new Date(bookingData.date);
      const slots = getAvailableTimeSlotsForUser(selectedDate, userTimezone);
      setAvailableSlots(slots);
    }
  }, [bookingData.date, userTimezone]);

  const steps = [
    { number: 1, title: 'Consultation Type', icon: Video },
    { number: 2, title: 'Date & Time', icon: Calendar },
    { number: 3, title: 'Medical Information', icon: FileText },
    { number: 4, title: 'Payment', icon: CreditCard }
  ];

  const consultationCategories = [
    {
      id: 'initial',
      title: 'Initial Consultation',
      description: 'Comprehensive first-time assessment',
      price: pricing.initial,
      features: ['Full Medical History Review', 'Diagnosis & Treatment Plan', 'Prescription & Lab Orders']
    },
    {
      id: 'followup',
      title: 'Follow-up Consultation',
      description: 'Ongoing care for existing patients',
      price: pricing.followup,
      features: ['Progress Evaluation', 'Treatment Adjustments', 'Prescription Refills']
    }
  ];

  const consultationTypes = [
    {
      id: 'video',
      title: 'Video Consultation',
      description: 'Face-to-face consultation via secure HD video call',
      duration: '30-45 minutes',
      icon: Video,
      features: ['HD Video Quality', 'Screen Sharing', 'Session Recording']
    }
  ];


  const paymentMethods = [
    { id: 'card', title: 'Credit/Debit Card', description: 'Pay with Visa, MasterCard, or American Express' },
    { id: 'paypal', title: 'PayPal', description: 'Pay securely with your PayPal account' },
    { id: 'bank', title: 'Bank Transfer', description: 'Direct bank transfer (may take 1-2 business days)' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to payment page with booking details
      const selectedType = consultationTypes.find(t => t.id === bookingData.consultationType);
      const amount = bookingData.consultationCategory === 'initial' ? pricing.initial : pricing.followup;
      
      const paymentParams = new URLSearchParams({
        type: selectedType?.title || 'Video Consultation',
        category: bookingData.consultationCategory,
        date: bookingData.date,
        time: bookingData.time,
        istTime: bookingData.istTime,
        patient: 'Patient Name', // In real app, get from auth context
        amount: amount.toString(),
        currency: pricing.currency
      });

      navigate(`/payment?${paymentParams.toString()}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setBookingData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index: number) => {
    setBookingData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.consultationType !== '' && bookingData.consultationCategory !== '';
      case 2:
        return bookingData.date !== '' && bookingData.time !== '' && bookingData.istTime !== '';
      case 3:
        return bookingData.symptoms !== '';
      case 4:
        return bookingData.paymentMethod !== '';
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Book Appointment</h1>
        <p className="text-muted-foreground">
          Schedule your consultation with Dr. Ilango in a few simple steps
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : isActive 
                          ? 'border-primary text-primary bg-primary/10' 
                          : 'border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {/* Step 1: Consultation Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Choose Consultation Type</h2>
                <p className="text-muted-foreground">Select your consultation category and type</p>
              </div>
              
              {/* Location and Pricing Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-blue-900">
                      Your Location: {userCountry} ({userTimezone})
                    </p>
                    <p className="text-blue-700">
                      Regional Pricing: {pricing.symbol}{pricing.initial} (Initial) / {pricing.symbol}{pricing.followup} (Follow-up)
                    </p>
                    <p className="text-blue-600">
                      All consultations are conducted during Dr. Ilango's evening hours (6-10 PM IST)
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation Category */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">1. Select Consultation Category</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {consultationCategories.map((category) => {
                    const isSelected = bookingData.consultationCategory === category.id;
                    
                    return (
                      <div 
                        key={category.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setBookingData(prev => ({ ...prev, consultationCategory: category.id }))}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{category.title}</h4>
                            <Badge variant={isSelected ? 'default' : 'secondary'}>
                              {pricing.symbol}{category.price}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          
                          <ul className="space-y-1">
                            {category.features.map((feature, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center">
                                <CheckCircle className="h-3 w-3 text-success mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Consultation Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">2. Select Consultation Method</h3>
                <div className="grid md:grid-cols-1 gap-4">
                  {consultationTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = bookingData.consultationType === type.id;
                    
                    return (
                      <div 
                        key={type.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setBookingData(prev => ({ ...prev, consultationType: type.id }))}
                      >
                        <div className="flex items-start space-x-4">
                          <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{type.title}</h4>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">Duration: {type.duration}</p>
                            </div>
                            
                            <ul className="flex flex-wrap gap-2">
                              {type.features.map((feature, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center">
                                  <CheckCircle className="h-3 w-3 text-success mr-1" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Select Date & Time</h2>
                <p className="text-muted-foreground">Choose your preferred date and time for the consultation</p>
              </div>
              
              {/* Timezone Information */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Globe className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-amber-900">
                      Your Timezone: {userTimezone}
                    </p>
                    <p className="text-amber-700">
                      Dr. Ilango is available from 6:00 PM to 10:00 PM IST (India Standard Time)
                    </p>
                    <p className="text-amber-600">
                      Available slots below are shown in your local time
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">Select Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value, time: '', istTime: '' }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  {bookingData.date && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {new Date(bookingData.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">
                    Available Time Slots {bookingData.date && `(${userCountry} Time)`}
                  </label>
                  {bookingData.date ? (
                    <div className="space-y-2">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={bookingData.time === slot.time ? 'default' : 'outline'}
                            className="w-full justify-between"
                            disabled={!slot.available}
                            onClick={() => setBookingData(prev => ({ 
                              ...prev, 
                              time: slot.time,
                              istTime: slot.istTime 
                            }))}
                          >
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{slot.time}</span>
                            </div>
                            <span className="text-xs opacity-75">{slot.istTime} IST</span>
                          </Button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No available slots for this date. Please select another date.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Please select a date to see available time slots
                    </p>
                  )}
                </div>
              </div>
              
              {bookingData.time && bookingData.istTime && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Selected Time:</strong> {bookingData.time} in {userCountry} ({bookingData.istTime} IST)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Medical Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Medical Information</h2>
                <p className="text-muted-foreground">Please provide details about your symptoms and medical history</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Current Symptoms or Concerns *</label>
                  <textarea
                    value={bookingData.symptoms}
                    onChange={(e) => setBookingData(prev => ({ ...prev, symptoms: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background h-24 resize-none"
                    placeholder="Please describe your current symptoms, concerns, or the reason for this consultation..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Medical History (Optional)</label>
                  <textarea
                    value={bookingData.medicalHistory}
                    onChange={(e) => setBookingData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background h-24 resize-none"
                    placeholder="Any relevant medical history, current medications, or previous treatments..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Upload Medical Documents (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Click to upload lab reports, test results, or other medical documents
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Supported formats: PDF, JPG, PNG (Max 10MB each)
                      </p>
                    </label>
                  </div>
                  
                  {bookingData.files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Uploaded Files:</p>
                      {bookingData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-foreground">{file.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Payment Information</h2>
                <p className="text-muted-foreground">Choose your preferred payment method to complete the booking</p>
              </div>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      bookingData.paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: method.id }))}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        bookingData.paymentMethod === method.id ? 'border-primary bg-primary' : 'border-gray-300'
                      }`} />
                      <div>
                        <h3 className="font-medium text-foreground">{method.title}</h3>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultation Category:</span>
                    <span className="font-medium text-foreground">
                      {consultationCategories.find(c => c.id === bookingData.consultationCategory)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultation Type:</span>
                    <span className="font-medium text-foreground">
                      {consultationTypes.find(t => t.id === bookingData.consultationType)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium text-foreground">{bookingData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium text-foreground">
                      {bookingData.time} ({bookingData.istTime} IST)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-medium text-foreground">Dr. Ilango</span>
                  </div>
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total Amount:</span>
                      <span className="font-semibold text-foreground">
                        {pricing.symbol}{bookingData.consultationCategory === 'initial' ? pricing.initial : pricing.followup} {pricing.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!canProceed()}
          className="px-8"
        >
          {currentStep === 4 ? 'Complete Booking' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
}