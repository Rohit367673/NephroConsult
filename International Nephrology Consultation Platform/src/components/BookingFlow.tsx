import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Video, Calendar as CalendarIcon, Clock, User, CreditCard, CheckCircle, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { apiService } from '../services/apiService';

interface BookingFlowProps {
  onClose: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    consultationType: '',
    date: null as Date | null,
    timeSlot: '',
    patientInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      currency: 'USD'
    },
    paymentMethod: ''
  });

  const consultationTypes = [
    {
      id: 'initial',
      icon: Video,
      name: 'Initial Consultation',
      duration: '45 minutes',
      price: 49, // $49 USD
      description: 'First-time comprehensive nephrology consultation'
    },
    {
      id: 'followup',
      icon: Video,
      name: 'Follow-up Consultation',
      duration: '30 minutes',
      price: 39, // $39 USD
      description: 'Follow-up appointment for existing patients'
    },
    {
      id: 'urgent',
      icon: Video,
      name: 'Urgent Consultation',
      duration: '45 minutes',
      price: 99, // $99 USD
      description: 'Priority consultation for urgent kidney concerns'
    }
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  // Function to check if a time slot is available based on current time
  const isTimeSlotAvailable = (slot: string) => {
    if (!bookingData.date) return true;
    
    // Fix: Parse date string properly to avoid timezone shifts
    const selectedDate = bookingData.date instanceof Date 
      ? bookingData.date 
      : new Date(bookingData.date + 'T00:00:00'); // Force local timezone
    
    const today = new Date();
    
    // Normalize dates for comparison
    const selectedDateNorm = new Date(selectedDate);
    const todayNorm = new Date(today);
    selectedDateNorm.setHours(0, 0, 0, 0);
    todayNorm.setHours(0, 0, 0, 0);
    
    // If selected date is in the future, all slots are available
    if (selectedDateNorm.getTime() > todayNorm.getTime()) {
      return true;
    }
    
    // If selected date is in the past, no slots are available
    if (selectedDateNorm.getTime() < todayNorm.getTime()) {
      return false;
    }
    
    // For today's bookings, only allow slots that are at least 1 hour from now
    const currentTime = new Date();
    const slotTime = new Date();
    
    // Parse the time slot
    const [time, period] = slot.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let slotHours = hours;
    if (period === 'PM' && hours !== 12) {
      slotHours += 12;
    } else if (period === 'AM' && hours === 12) {
      slotHours = 0;
    }
    
    slotTime.setHours(slotHours, minutes || 0, 0, 0);
    
    // Add 1 hour buffer to current time
    const minAllowedTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    
    return slotTime >= minAllowedTime;
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: '$', name: 'Australian Dollar' }
  ];

  const getSelectedConsultation = () => {
    return consultationTypes.find(type => type.id === bookingData.consultationType);
  };

  const getSelectedCurrency = () => {
    return currencies.find(curr => curr.code === bookingData.patientInfo.currency) || currencies[0];
  };

  const [pricingData, setPricingData] = useState<any>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  // Fetch pricing when consultation type or country changes
  useEffect(() => {
    if (bookingData.consultationType && bookingData.patientInfo.country) {
      fetchPricing();
    }
  }, [bookingData.consultationType, bookingData.patientInfo.country]);

  const fetchPricing = async () => {
    setIsLoadingPricing(true);
    try {
      const response = await apiService.getPricing(
        bookingData.consultationType,
        bookingData.patientInfo.country,
        false // We'll check for first-time status later
      );
      if (response.success) {
        setPricingData(response.pricing);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const calculatePrice = () => {
    if (!pricingData) return '';

    const { display } = pricingData;
    return `${display.currency === 'INR' ? '₹' : '$'}${display.value}`;
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return bookingData.consultationType !== '';
      case 2:
        return bookingData.date && bookingData.timeSlot !== '';
      case 3:
        return bookingData.patientInfo.firstName && bookingData.patientInfo.lastName && 
               bookingData.patientInfo.email && bookingData.patientInfo.phone;
      case 4:
        return bookingData.paymentMethod !== '';
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Select Consultation Type</h3>
              <p className="text-gray-600">Choose the type of consultation that works best for you</p>
            </div>

            <div className="grid gap-4">
              {consultationTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`p-6 cursor-pointer transition-all ${
                    bookingData.consultationType === type.id
                      ? 'border-[#006f6f] border-2 bg-[#006f6f]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, consultationType: type.id }))}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        bookingData.consultationType === type.id ? 'bg-[#006f6f]' : 'bg-gray-100'
                      }`}>
                        <type.icon className={`w-6 h-6 ${
                          bookingData.consultationType === type.id ? 'text-white' : 'text-[#006f6f]'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{type.name}</h4>
                          <span className="font-semibold text-[#006f6f]">${type.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{type.description}</p>
                        <span className="text-xs text-gray-500">{type.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Select Date & Time</h3>
              <p className="text-gray-600">Choose your preferred appointment slot</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Label className="text-base font-medium mb-4 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={bookingData.date || undefined}
                  onSelect={(date) => setBookingData(prev => ({ ...prev, date: date || null }))}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
                    const selectedDate = new Date(date);
                    selectedDate.setHours(0, 0, 0, 0);
                    
                    // Disable past dates (not including today) and Sundays
                    return selectedDate < today || date.getDay() === 0;
                  }}
                  className="rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Available Time Slots</Label>
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {timeSlots.map((slot) => {
                    const isAvailable = isTimeSlotAvailable(slot);
                    return (
                      <Button
                        key={slot}
                        variant={bookingData.timeSlot === slot ? "default" : "outline"}
                        onClick={() => isAvailable && setBookingData(prev => ({ ...prev, timeSlot: slot }))}
                        disabled={!isAvailable}
                        className={`p-3 ${
                          !isAvailable
                            ? 'opacity-50 cursor-not-allowed border-gray-100 text-gray-400'
                            : bookingData.timeSlot === slot
                            ? 'bg-[#006f6f] hover:bg-[#005555] text-white'
                            : 'border-gray-200 hover:border-[#006f6f] hover:text-[#006f6f]'
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {slot}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Patient Information</h3>
              <p className="text-gray-600">Please provide your basic information</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={bookingData.patientInfo.firstName}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, firstName: e.target.value }
                  }))}
                  placeholder="Enter your first name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={bookingData.patientInfo.lastName}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, lastName: e.target.value }
                  }))}
                  placeholder="Enter your last name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={bookingData.patientInfo.email}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, email: e.target.value }
                  }))}
                  placeholder="your.email@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={bookingData.patientInfo.phone}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, phone: e.target.value }
                  }))}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={bookingData.patientInfo.country}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, country: e.target.value }
                  }))}
                  placeholder="United States"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="currency">Preferred Currency</Label>
                <Select
                  value={bookingData.patientInfo.currency}
                  onValueChange={(value) => setBookingData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, currency: value }
                  }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Payment & Confirmation</h3>
              <p className="text-gray-600">Review your booking and complete payment</p>
            </div>

            {/* Booking Summary */}
            <Card className="p-6 rounded-xl border-gray-200 bg-gray-50">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Type</span>
                    <span className="font-medium">{getSelectedConsultation()?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time</span>
                    <span className="font-medium">
                      {bookingData.date?.toLocaleDateString()} at {bookingData.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{getSelectedConsultation()?.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient</span>
                    <span className="font-medium">
                      {bookingData.patientInfo.firstName} {bookingData.patientInfo.lastName}
                    </span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="font-semibold text-[#006f6f] text-lg">{calculatePrice()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div>
              <Label className="text-base font-medium mb-4 block">Payment Method</Label>
              <div className="grid gap-4">
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    bookingData.paymentMethod === 'card'
                      ? 'border-[#006f6f] border-2 bg-[#006f6f]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'card' }))}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-[#006f6f]" />
                      <span className="font-medium">Credit/Debit Card</span>
                      <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    bookingData.paymentMethod === 'paypal'
                      ? 'border-[#006f6f] border-2 bg-[#006f6f]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">P</div>
                      <span className="font-medium">PayPal</span>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    bookingData.paymentMethod === 'bank'
                      ? 'border-[#006f6f] border-2 bg-[#006f6f]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-600 rounded text-white flex items-center justify-center text-xs font-bold">B</div>
                      <span className="font-medium">Bank Transfer (International)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your consultation has been successfully booked. You will receive a confirmation 
                email with meeting details shortly.
              </p>
            </div>

            <Card className="p-6 rounded-xl border-gray-200 bg-gray-50 text-left">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Booking ID:</strong> #NEP-{Date.now().toString().slice(-6)}</div>
                  <div><strong>Consultation:</strong> {getSelectedConsultation()?.name}</div>
                  <div><strong>Date & Time:</strong> {bookingData.date?.toLocaleDateString()} at {bookingData.timeSlot}</div>
                  <div><strong>Amount Paid:</strong> {calculatePrice()}</div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-600">
              <p>Next Steps:</p>
              <ul className="mt-2 space-y-1">
                <li>• Check your email for meeting link and instructions</li>
                <li>• Download our mobile app for better experience</li>
                <li>• Prepare your medical history and current medications</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Book Consultation</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / 4) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6"
            >
              Previous
            </Button>
            
            <Button
              onClick={currentStep === 4 ? () => setCurrentStep(5) : nextStep}
              disabled={!isStepValid(currentStep)}
              className="bg-[#006f6f] hover:bg-[#005555] text-white px-6"
            >
              {currentStep === 4 ? 'Confirm & Pay' : 'Next Step'}
            </Button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              className="bg-[#006f6f] hover:bg-[#005555] text-white px-8"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};