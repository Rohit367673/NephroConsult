import React, { useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Video, Phone, FileText, Upload, CreditCard, CheckCircle2, ArrowRight, User, Star, Heart, Menu, X, LogOut, MapPin, Globe, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { getUserTimezone, getCountryFromTimezone, getPricingForTimezone, getAvailableTimeSlotsForUser } from '../utils/timezoneUtils';
import { loadCashfreeScript, initiateCashfreePayment, verifyCashfreePayment } from '../utils/cashfreeUtils';
import { 
  validatePatientInfo, 
  validatePhoneNumber, 
  validateEmail, 
  validateAge, 
  validateName, 
  validateMedicalHistory,
  formatPhoneNumber
} from '../utils/formValidation';
import Footer from '../components/Footer';

// Type definitions
interface BookingDetails {
  consultationType: string;
  date: string;
  time: string;
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    age: string;
    gender: string;
    medicalHistory: string;
    currentMedications: string;
  };
  amount: number;
  currency: string;
}

interface CashfreeResponse {
  payment_id: string;
  order_id: string;
  payment_status: string;
}

// Helper functions (outside component to prevent re-creation)
const getCountryPriceMultiplier = (country: string): number => {
  const lowIncomeCountries = ['IN', 'PK', 'BD', 'NP', 'LK', 'MM', 'KH', 'LA', 'AF', 'BT'];
  const middleIncomeCountries = ['BR', 'TH', 'TR', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'UY', 'EC', 'BO', 'PY', 'MY', 'ID', 'PH', 'VN', 'EG', 'MA', 'DZ', 'TN', 'JO', 'LB', 'IQ', 'IR', 'AZ', 'GE', 'AM', 'BY', 'UA', 'MD', 'RS', 'BA', 'MK', 'AL', 'ME', 'XK', 'BG', 'RO', 'HR', 'HU', 'SK', 'CZ', 'PL', 'LT', 'LV', 'EE', 'SI'];
  
  if (lowIncomeCountries.includes(country)) {
    return 1.0; // Base price
  } else if (middleIncomeCountries.includes(country)) {
    return 1.8; // 80% increase
  } else {
    return 3.3; // 230% increase for high-income countries
  }
};

const getBasePricesINR = () => {
  return {
    'Initial Consultation': 1000,
    'Follow-up Consultation': 700,
    'Urgent Consultation': 2000
  };
};

const getConsultationPrice = (type: string, country: string, currency: string) => {
  const basePrices = getBasePricesINR();
  const multiplier = getCountryPriceMultiplier(country);
  
  // Map consultation types
  const typeMapping: { [key: string]: string } = {
    'initial': 'Initial Consultation',
    'followup': 'Follow-up Consultation', 
    'urgent': 'Urgent Consultation'
  };
  
  const consultationType = typeMapping[type] || 'Initial Consultation';
  if (type === 'followup' && currency === 'INR') {
    return 5;
  }
  const basePrice = basePrices[consultationType as keyof typeof basePrices];
  const adjustedPriceINR = Math.round(basePrice * multiplier);
  
  // Convert to different currencies
  const exchangeRates = {
    'INR': 1,
    'USD': 0.012, // 1 INR = 0.012 USD (1 USD = 83 INR)
    'EUR': 0.011, // 1 INR = 0.011 EUR
    'GBP': 0.0095 // 1 INR = 0.0095 GBP
  };
  
  const rate = exchangeRates[currency as keyof typeof exchangeRates] || exchangeRates['USD'];
  
  if (currency === 'INR') {
    return adjustedPriceINR;
  } else {
    return Math.round(adjustedPriceINR * rate);
  }
};

// Get formatted price with currency symbol
const getFormattedPrice = (amount: number, currency: string) => {
  const symbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  const symbol = symbols[currency as keyof typeof symbols] || '$';
  return `${symbol}${amount.toLocaleString()}`;
};

// Animation variants (outside component to prevent re-creation)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Date formatting options (outside component to prevent re-creation)
const dateFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

// Navigation state for login redirect (outside component to prevent re-creation)
const loginRedirectState = { state: { showLogin: true } };

// Calendar Component
interface CalendarComponentProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

function CalendarComponent({ selectedDate, onDateSelect }: CalendarComponentProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const formatDate = (day: number) => {
    // Fix: Create date string directly to avoid timezone issues
    const monthStr = (month + 1).toString().padStart(2, '0'); // month is 0-indexed
    const dayStr = day.toString().padStart(2, '0');
    const dateString = `${year}-${monthStr}-${dayStr}`;
    console.log(`📅 Calendar: Formatting day ${day} of month ${month + 1}/${year} -> ${dateString}`);
    return dateString;
  };
  
  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };
  
  const isDateSelected = (day: number) => {
    return selectedDate === formatDate(day);
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Build a 6x7 matrix for the month
  const buildMatrix = (): (number | null)[][] => {
    const matrix: (number | null)[][] = [];
    let dayCounter = 1;
    for (let week = 0; week < 6; week++) {
      const row: (number | null)[] = [];
      for (let dow = 0; dow < 7; dow++) {
        const cellIndex = week * 7 + dow;
        if (cellIndex < startingDayOfWeek || dayCounter > daysInMonth) {
          row.push(null);
        } else {
          row.push(dayCounter);
          dayCounter++;
        }
      }
      matrix.push(row);
    }
    return matrix;
  };
  const matrix = buildMatrix();
  
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="p-1 h-8 w-8 hover:bg-gray-200 rounded"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="p-1 h-8 w-8 hover:bg-gray-200 rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Table Calendar */}
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            {dayNames.map((d) => (
              <th key={d} className="py-2 text-xs font-semibold text-gray-600 text-center">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((week, wIdx) => (
            <tr key={wIdx} className="h-12">
              {week.map((day, dIdx) => {
                if (day === null) {
                  return <td key={`e-${dIdx}`} className="border border-gray-200 bg-gray-50" />;
                }
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const disabled = isDateDisabled(day);
                const selected = isDateSelected(day);
                return (
                  <td key={dIdx} className="border border-gray-200 p-0">
                    <button
                      className={`w-full h-12 flex items-center justify-center text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-blue-500 text-white'
                          : isToday
                          ? 'bg-blue-100 text-blue-600 font-bold'
                          : disabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => !disabled && onDateSelect(formatDate(day))}
                      disabled={disabled}
                    >
                      {day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Navigation Component (same as App.tsx)
function Navigation() {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
    >
      <div className="container-medical">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NephroConsult</h1>
              <p className="text-xs text-gray-500">International Platform</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/')}
              className={location.pathname === '/' ? 'text-[#006f6f]' : ''}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/about')}
              className={location.pathname === '/about' ? 'text-[#006f6f]' : ''}
            >
              About
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/booking')}
              className="text-[#006f6f] hover:text-[#005555]"
            >
              Book Appointment
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/contact')}
              className={location.pathname === '/contact' ? 'text-[#006f6f]' : ''}
            >
              Contact
            </Button>
            
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/profile')}
                  className={location.pathname === '/profile' ? 'text-[#006f6f]' : ''}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline">
                  Login
                </Button>
                <Button className="bg-[#006f6f] hover:bg-[#005555]">
                  Sign Up
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu and profile */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Profile Photo for Mobile */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                  {user.avatar ? (
                    <>
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full object-cover absolute inset-0"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onLoad={(e) => {
                          // Hide fallback when image loads
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'none';
                        }}
                        onError={(e) => {
                          console.log('BookingPage nav image failed to load, trying fallback methods');
                          
                          // Try alternative Google image URL
                          const currentSrc = e.currentTarget.src;
                          if (currentSrc.includes('googleusercontent.com') && !currentSrc.includes('proxy')) {
                            const newSrc = `https://images.weserv.nl/?url=${encodeURIComponent(currentSrc)}&w=200&h=200&fit=cover&mask=circle`;
                            e.currentTarget.src = newSrc;
                            return;
                          }
                          
                          // If all methods fail, hide image and show fallback
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-full h-full bg-gradient-to-br from-[#006f6f] to-[#004f4f] flex items-center justify-center absolute inset-0"
                        style={{ display: 'flex' }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#006f6f] to-[#004f4f] flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-2 overflow-hidden"
            >
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/')}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/about')}
              >
                About
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[#006f6f]"
                onClick={() => handleNavigation('/booking')}
              >
                Book Appointment
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/contact')}
              >
                Contact
              </Button>
              
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full justify-start">
                    Login
                  </Button>
                  <Button className="w-full justify-start bg-[#006f6f] hover:bg-[#005555]">
                    Sign Up
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export default function BookingPage() {
  // Get user context and enforce authentication
  const authContext = useContext(AuthContext);
  const { user, logout, loading } = authContext || {};
  const navigate = useNavigate();
  
  // All hooks must be declared at the top before any conditional logic
  const [step, setStep] = useState(1);
  const [userTimezone, setUserTimezone] = useState('');
  const [userCountry, setUserCountry] = useState('');
  const [pricing, setPricing] = useState({ initial: 150, followup: 105, currency: 'USD', symbol: '$' });
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string, istTime: string, available: boolean, isBooked?: boolean }>>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState<Array<{ date: string, time: string, patientName: string }>>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isValidating, setIsValidating] = useState(false);
  const countrySetRef = useRef(false);
  const [bookingData, setBookingData] = useState({
    consultationType: '',
    date: '',
    time: '',
    istTime: '',
    patientInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      age: '',
      gender: '',
      medicalHistory: '',
      currentMedications: ''
    },
    uploadedFiles: [] as File[],
    paymentMethod: '',
    country: ''
  });

  // Redirect to home with login prompt if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please login to book an appointment');
      navigate('/', loginRedirectState);
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Get user's timezone and pricing (only run once on mount)
    const tz = getUserTimezone();
    setUserTimezone(tz);
    const country = getCountryFromTimezone(tz);
    setUserCountry(country);
    setPricing(getPricingForTimezone(tz));
    
    // Initialize with some mock booked appointments for demonstration
    const mockBookedAppointments = [
      { date: '2025-10-05', time: '10:00 AM', patientName: 'John Doe' },
      { date: '2025-10-05', time: '2:30 PM', patientName: 'Jane Smith' },
      { date: '2025-10-06', time: '11:00 AM', patientName: 'Mike Johnson' },
      { date: '2025-10-07', time: '3:00 PM', patientName: 'Sarah Wilson' },
    ];
    setBookedAppointments(mockBookedAppointments);
  }, []);

  // Set country only once when userCountry is available
  useEffect(() => {
    if (userCountry && !countrySetRef.current) {
      setBookingData(prev => ({ ...prev, country: userCountry }));
      countrySetRef.current = true;
    }
  }, [userCountry]);

  useEffect(() => {
    // Update available time slots when date or consultation type changes
    if (bookingData.date && userTimezone) {
      // Fix: Parse date string as local date to avoid timezone shifts
      const [year, month, day] = bookingData.date.split('-');
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      console.log(`📅 BookingPage: Selected date string: "${bookingData.date}" -> Parsed date: ${selectedDate.toString()}`);
      
      const isUrgent = bookingData.consultationType === 'urgent';
      const slots = getAvailableTimeSlotsForUser(selectedDate, userTimezone, isUrgent);
      
      // Check for booking conflicts and mark slots as booked
      const slotsWithBookingStatus = slots.map(slot => {
        const isBooked = bookedAppointments.some(booking => 
          booking.date === bookingData.date && booking.time === slot.time
        );
        return {
          ...slot,
          available: slot.available && !isBooked,
          isBooked: isBooked
        };
      });
      
      setAvailableSlots(slotsWithBookingStatus);
    }
  }, [bookingData.date, userTimezone, bookingData.consultationType]); // Removed bookedAppointments from deps

  // Validation functions
  const validateAllFields = () => {
    const validation = validatePatientInfo(bookingData.patientInfo);
    
    // Map validation errors to state
    const errorMap: {[key: string]: string} = {};
    validation.errors.forEach(error => {
      if (error.includes('Name')) errorMap.name = error;
      else if (error.includes('Email') || error.includes('email')) errorMap.email = error;
      else if (error.includes('Phone') || error.includes('phone')) errorMap.phone = error;
      else if (error.includes('Age') || error.includes('age')) errorMap.age = error;
      else if (error.includes('Gender') || error.includes('gender')) errorMap.gender = error;
      else if (error.includes('Medical') || error.includes('medical')) errorMap.medicalHistory = error;
    });

    setValidationErrors(errorMap);
    return validation.isValid;
  };

  // Pure validation check without state updates - memoized for performance
  const checkFieldsValid = useMemo(() => {
    const validation = validatePatientInfo(bookingData.patientInfo);
    return validation.isValid;
  }, [bookingData.patientInfo]);

  // Enhanced input change handler with validation
  const handleInputChange = useCallback((field: string, value: string) => {
    // Update booking data
    setBookingData(prev => ({
      ...prev,
      patientInfo: {
        ...prev.patientInfo,
        [field]: value
      }
    }));

    // Clear previous validation error immediately for better UX
    setValidationErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  // Enhanced step validation (pure function - no state updates)
  const isStepValid = () => {
    switch (step) {
      case 1:
        return bookingData.consultationType !== '';
      case 2:
        return bookingData.date !== '' && bookingData.time !== '';
      case 3:
        // Use basic field checks to avoid triggering validation during render
        return bookingData.patientInfo.name.trim() !== '' &&
               bookingData.patientInfo.email.trim() !== '' &&
               bookingData.patientInfo.phone.trim() !== '' &&
               bookingData.patientInfo.age.trim() !== '' &&
               bookingData.patientInfo.gender.trim() !== '' &&
               bookingData.patientInfo.medicalHistory.trim().length >= 10;
      case 4:
        return true; // Payment step
      default:
        return false;
    }
  };

  // Early return if not authenticated (now safe after all hooks are declared)
  if (!user && !loading) {
    return null;
  }

  const consultationTypes = useMemo(() => [
    { 
      id: 'initial', 
      name: 'Initial Consultation', 
      price: getConsultationPrice('initial', bookingData.country || userCountry, pricing.currency),
      formattedPrice: getFormattedPrice(getConsultationPrice('initial', bookingData.country || userCountry, pricing.currency), pricing.currency),
      duration: '45 min',
      description: 'Comprehensive kidney health assessment with detailed medical history review',
      icon: User,
      features: ['Complete kidney function evaluation', 'Personalized treatment plan', 'Lab report analysis', 'Lifestyle recommendations']
    },
    { 
      id: 'followup', 
      name: 'Follow-up Consultation', 
      price: getConsultationPrice('followup', bookingData.country || userCountry, pricing.currency),
      formattedPrice: getFormattedPrice(getConsultationPrice('followup', bookingData.country || userCountry, pricing.currency), pricing.currency),
      duration: '30 min',
      description: 'Progress review and treatment adjustment for existing patients',
      icon: FileText,
      features: ['Treatment progress review', 'Medication adjustments', 'Lab results discussion', 'Next steps planning']
    },
    { 
      id: 'urgent', 
      name: 'Urgent Consultation', 
      price: getConsultationPrice('urgent', bookingData.country || userCountry, pricing.currency),
      formattedPrice: getFormattedPrice(getConsultationPrice('urgent', bookingData.country || userCountry, pricing.currency), pricing.currency),
      duration: '45 min',
      description: 'Priority consultation for urgent kidney health concerns (10 AM - 10 PM IST)',
      icon: Clock,
      features: ['Same-day availability', 'Priority scheduling (10 AM - 10 PM IST)', 'Urgent symptom evaluation', 'Immediate treatment plan']
    }
  ], [bookingData.country, userCountry, pricing.currency]);

  const handleNext = useCallback(() => {
    if (step < 4) {
      setStep(step + 1);
      // Auto-select Cashfree when reaching payment step
      if (step + 1 === 4 && !bookingData.paymentMethod) {
        setBookingData(prev => ({ ...prev, paymentMethod: 'cashfree' }));
      }
    }
  }, [step, bookingData.paymentMethod]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleSlotSelection = (slot: { time: string, istTime: string, available: boolean, isBooked?: boolean }) => {
    if (!slot.available) {
      if (slot.isBooked) {
        toast.error(`This time slot (${slot.time}) is already booked. Please select another time.`);
      } else {
        toast.error(`This time slot is not available. Please select another time.`);
      }
      return;
    }

    setBookingData(prev => ({ 
      ...prev, 
      time: slot.time,
      istTime: slot.istTime 
    }));
    toast.success(`Time slot ${slot.time} selected successfully!`);
  };

  const handleBooking = async () => {
    if (!bookingData.paymentMethod || bookingData.paymentMethod !== 'cashfree') {
      toast.error('Please select Cashfree as payment method');
      return;
    }

    await processCashfreePayment();
  };

  const processCashfreePayment = async () => {
    try {
      setIsProcessingPayment(true);

      // Calculate amount based on consultation type
      const amount = getConsultationPrice(bookingData.consultationType, bookingData.country || userCountry, pricing.currency);

      // Prepare booking details for Cashfree
      const bookingDetails: BookingDetails = {
        consultationType: bookingData.consultationType,
        date: bookingData.date,
        time: bookingData.time,
        patientInfo: bookingData.patientInfo,
        amount: amount,
        currency: pricing.currency
      };

      // Store booking details with uploaded files for payment verification
      const extendedBookingDetails = {
        ...bookingDetails,
        uploadedFiles: bookingData.uploadedFiles,
        country: bookingData.country || userCountry
      };
      
      console.log('📋 Storing booking details for payment verification:', extendedBookingDetails);
      localStorage.setItem('cashfree_booking_details', JSON.stringify(extendedBookingDetails));
      sessionStorage.setItem('cashfree_payment_details', JSON.stringify({
        bookingDetails: extendedBookingDetails
      }));

      // Validate required fields
      if (!bookingDetails.patientInfo.name || !bookingDetails.patientInfo.email || !bookingDetails.patientInfo.phone || !bookingDetails.patientInfo.age || !bookingDetails.patientInfo.gender || !bookingDetails.patientInfo.medicalHistory) {
        toast.error('Please fill in all required patient information');
        setIsProcessingPayment(false);
        return;
      }

      // Initiate Cashfree payment
      await initiateCashfreePayment(
        bookingDetails,
        handlePaymentSuccess,
        handlePaymentError
      );
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to process payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (response: CashfreeResponse) => {
    try {
      toast.loading('Verifying payment...', { id: 'payment-verification' });

      // Verify payment with backend
      const bookingDetails: BookingDetails = {
        consultationType: bookingData.consultationType,
        date: bookingData.date,
        time: bookingData.time,
        patientInfo: bookingData.patientInfo,
        amount: getConsultationPrice(bookingData.consultationType, bookingData.country || userCountry, pricing.currency),
        currency: pricing.currency
      };

      const isVerified = await verifyCashfreePayment(response, bookingDetails);

      if (isVerified) {
        setPaymentCompleted(true);
        toast.success('Payment successful! Appointment booked successfully.', { id: 'payment-verification' });
        
        // Create actual booking in database
        try {
          // Convert files to base64 first
          const processedDocuments = await Promise.all(
            bookingData.uploadedFiles.map(async (file: File) => {
              console.log('📄 Processing document:', file.name, 'Size:', file.size);
              
              return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result as string;
                  resolve(`${file.name}|${base64}`); // Format: filename|base64data
                };
                reader.readAsDataURL(file);
              });
            })
          );

          // Use environment variable for API URL or fallback to relative path for localhost
          const apiBaseUrl = import.meta.env.VITE_API_URL || '';
          const appointmentEndpoint = apiBaseUrl ? `${apiBaseUrl}/api/appointments` : '/api/appointments';
          
          const appointmentResponse = await fetch(appointmentEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              date: bookingDetails.date,
              timeSlot: bookingDetails.time,
              typeId: bookingDetails.consultationType,
              paymentMethod: 'card',
              patientPhone: bookingDetails.patientInfo.phone,
              patientCountry: bookingDetails.currency === 'INR' ? 'IN' : 
                             bookingDetails.currency === 'USD' ? 'US' : 
                             bookingDetails.currency === 'EUR' ? 'EU' : 
                             bookingDetails.currency === 'GBP' ? 'GB' : 'default',
              intake: {
                description: bookingDetails.patientInfo.medicalHistory,
                documents: processedDocuments
              }
            })
          });

          if (!appointmentResponse.ok) {
            console.error('Failed to create appointment:', appointmentResponse.status, appointmentResponse.statusText);
            
            // Handle specific error cases
            if (appointmentResponse.status === 409) {
              const errorData = await appointmentResponse.json().catch(() => ({}));
              toast.error('This time slot has already been booked. Please select a different time slot.', { id: 'appointment-creation' });
              throw new Error('Time slot already booked');
            }
            
            if (appointmentResponse.status === 401) {
              toast.error('Please log in again to complete your booking.', { id: 'appointment-creation' });
              throw new Error('Authentication required');
            }
            
            if (appointmentResponse.status === 422) {
              const errorData = await appointmentResponse.json().catch(() => ({}));
              const errors = errorData.errors || {};
              const errorMessages = Object.values(errors).map((error: any) => error.message).join(', ');
              toast.error(`Failed to create appointment: ${errorMessages}`, { id: 'appointment-creation' });
              throw new Error('Failed to create appointment');
            }
            
            toast.error('Failed to create appointment. Please try again.', { id: 'appointment-creation' });
            throw new Error('Failed to create appointment');
          }

          const appointmentData = await appointmentResponse.json();
          console.log('✅ Appointment created successfully in database:', appointmentData);
          
          // Show success message and redirect to profile
          toast.success('🎉 Appointment successfully created! Redirecting to your dashboard...', {
            duration: 4000,
            id: 'appointment-success'
          });
          
          // Redirect to profile page after 2 seconds
          setTimeout(() => {
            window.location.href = '/profile';
          }, 2000);
        } catch (bookingError) {
          console.error('❌ Booking creation error:', bookingError);
          
          if (bookingError instanceof Error && bookingError.message === 'Time slot already booked') {
            toast.error('⚠️ Payment successful but this time slot was just taken by another user. Please contact support to reschedule or get a refund.', {
              duration: 8000,
              id: 'appointment-creation'
            });
          } else if (bookingError instanceof Error && bookingError.message === 'Authentication required') {
            toast.error('⚠️ Payment successful but session expired. Please log in and contact support with your payment details.', {
              duration: 8000,
              id: 'appointment-creation'
            });
          } else {
            toast.error('⚠️ Payment successful but booking creation failed. Please contact support with your payment reference.', {
              duration: 8000,
              id: 'appointment-creation'
            });
          }
        }
      
      // Add the new booking to the booked appointments list
      const newBooking = {
        date: bookingDetails.date,
        time: bookingDetails.time,
        patientName: bookingDetails.patientInfo.name
      };
      setBookedAppointments(prev => [...prev, newBooking]);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support.', { id: 'payment-verification' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error(error.message || 'Payment failed. Please try again.');
    setIsProcessingPayment(false);
  };

  // Payment handler function  
  const handlePayment = async () => {
    if (!isStepValid()) {
      toast.error('Please complete all required fields');
      return;
    }

    if (isProcessingPayment) {
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Prepare booking details for payment
      const bookingDetails: BookingDetails = {
        consultationType: bookingData.consultationType,
        date: bookingData.date,
        time: bookingData.time,
        patientInfo: {
          name: bookingData.patientInfo.name,
          email: bookingData.patientInfo.email,
          phone: bookingData.patientInfo.phone,
          age: bookingData.patientInfo.age,
          gender: bookingData.patientInfo.gender,
          medicalHistory: bookingData.patientInfo.medicalHistory,
          currentMedications: bookingData.patientInfo.currentMedications,
        },
        amount: getConsultationPrice(bookingData.consultationType, bookingData.country || userCountry, pricing.currency),
        currency: pricing.currency,
      };

      console.log('Initiating payment with details:', bookingDetails);

      // Initiate Cashfree payment
      await initiateCashfreePayment(
        bookingDetails,
        handlePaymentSuccess,
        handlePaymentError
      );
    } catch (error) {
      console.error('Payment processing error:', error);
      
      if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED') {
        toast.error('Session expired. Please log in again.');
        // Redirect to login
        navigate('/', { state: { showLogin: true } });
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
      
      setIsProcessingPayment(false);
    }
  };

  const stepVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Consultation Type</h2>
              <p className="text-gray-600">Select the type of consultation that best fits your needs</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">
                    Your Location: {userCountry} • Doctor Location: India (IST) • Regular: 6-10 PM IST • Urgent: 10 AM-10 PM IST
                  </p>
                </div>
              </div>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6"
            >
              {consultationTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <motion.div key={type.id} variants={itemVariants}>
                    <Card
                      className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-lg ${
                        bookingData.consultationType === type.id
                          ? 'border-[#006f6f] bg-[#006f6f]/5 shadow-lg'
                          : 'border-gray-200 hover:border-[#006f6f]/50'
                      }`}
                      onClick={() => setBookingData(prev => ({ 
                        ...prev, 
                        consultationType: type.id,
                        time: '', // Clear time when consultation type changes
                        istTime: '' // Clear IST time as well
                      }))}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${
                              bookingData.consultationType === type.id 
                                ? 'bg-[#006f6f] text-white' 
                                : 'bg-[#006f6f]/10 text-[#006f6f]'
                            }`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{type.name}</h3>
                                <Badge variant="outline">{type.duration}</Badge>
                              </div>
                              <p className="text-gray-600 mb-4">{type.description}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {type.features.map((feature, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-600">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#006f6f]">
                              {pricing.symbol}{type.price}
                            </div>
                            <p className="text-sm text-gray-500">{pricing.currency}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Date & Time</h2>
              <p className="text-gray-600">Choose your preferred consultation date and time</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <Globe className="h-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-700">
                    {bookingData.consultationType === 'urgent' 
                      ? 'Urgent consultations: 10 AM - 10 PM IST' 
                      : 'Regular consultations: 6-10 PM IST'} • 
                    {userCountry === 'India' 
                      ? 'Times shown in IST' 
                      : `Times converted to your timezone (${userTimezone})`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <motion.div variants={itemVariants} className="space-y-4">
                <Label className="text-lg font-semibold">Select Date</Label>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Calendar Component */}
                  <CalendarComponent 
                    selectedDate={bookingData.date}
                    onDateSelect={(date) => setBookingData(prev => ({ 
                      ...prev, 
                      date, 
                      time: '', 
                      istTime: '' 
                    }))}
                  />
                  
                  {bookingData.date && (
                    <div className="p-4 bg-green-50 border-t border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-800 font-medium">
                          Selected: {new Date(bookingData.date).toLocaleDateString('en-US', dateFormatOptions)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Time Slots Section */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Available Time Slots</Label>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-[#006f6f] rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 border border-gray-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded opacity-60"></div>
                      <span>Booked</span>
                    </div>
                  </div>
                </div>
                {bookingData.date ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={bookingData.time === slot.time ? "default" : "outline"}
                            size="sm"
                            className={`h-16 text-xs relative transition-all ${
                              bookingData.time === slot.time 
                                ? 'bg-[#006f6f] hover:bg-[#005555] text-white' 
                                : slot.isBooked
                                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
                                : slot.available
                                ? 'hover:border-[#006f6f] hover:bg-[#006f6f]/5 border-gray-300'
                                : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                            disabled={!slot.available}
                            onClick={() => handleSlotSelection(slot)}
                          >
                            <div className="text-center">
                              <div className="font-medium">{slot.time}</div>
                              {userCountry !== 'India' && (
                                <div className="opacity-75 text-xs">{slot.istTime} IST</div>
                              )}
                              {slot.isBooked && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl">
                                  BOOKED
                                </div>
                              )}
                              {!slot.available && !slot.isBooked && (
                                <div className="absolute top-0 right-0 bg-gray-400 text-white text-xs px-1 rounded-bl">
                                  PAST
                                </div>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                          No available slots for this date.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Please select another date.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">
                      Please select a date first
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Choose a date to see available time slots
                    </p>
                  </div>
                )}
                
                {/* Selected Time Confirmation */}
                {bookingData.time && bookingData.istTime && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div className="text-sm">
                        <span className="font-medium text-green-800">Selected: </span>
                        <span className="text-green-700">{bookingData.time} ({bookingData.istTime} IST)</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Patient Information</h2>
              <p className="text-gray-600">Please provide your medical details for the consultation</p>
              <p className="text-sm text-red-600 mt-2">* All fields are required except Current Medications and Document Upload</p>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={bookingData.patientInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="p-4"
                    required
                    placeholder="Enter your full name"
                  />
                  {validationErrors.name && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.name}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={bookingData.patientInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="p-4"
                    required
                    placeholder="Enter your email address"
                  />
                  {validationErrors.email && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.email}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={bookingData.patientInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="p-4"
                    required
                    placeholder="Enter your phone number (7-15 digits)"
                  />
                  {validationErrors.phone && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.phone}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Examples: +91 98765 43210, (555) 123-4567, 9876543210
                  </div>
                </div>
                <div>
                  <Label>Age *</Label>
                  <Input
                    type="number"
                    value={bookingData.patientInfo.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="p-4"
                    required
                    placeholder="Enter your age"
                    min="1"
                    max="150"
                  />
                  {validationErrors.age && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.age}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Gender *</Label>
                  <Select
                    value={bookingData.patientInfo.gender}
                    onValueChange={(value) => {
                      setBookingData(prev => ({
                        ...prev,
                        patientInfo: { ...prev.patientInfo, gender: value }
                      }));
                      // Clear gender validation error when selected
                      setValidationErrors(prev => ({ ...prev, gender: '' }));
                    }}
                    required
                  >
                    <SelectTrigger className={`p-4 ${validationErrors.gender ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.gender && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.gender}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Label>Medical History & Current Symptoms *</Label>
                <Textarea
                  value={bookingData.patientInfo.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  placeholder="Please describe your current symptoms, relevant medical history, and any concerns you'd like to discuss (minimum 10 characters)..."
                  className="min-h-32 p-4"
                  required
                />
                {validationErrors.medicalHistory && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.medicalHistory}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Characters: {bookingData.patientInfo.medicalHistory.length}/2000
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Label>Current Medications (Optional)</Label>
                <Textarea
                  value={bookingData.patientInfo.currentMedications}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, currentMedications: e.target.value }
                  }))}
                  placeholder="List any medications you're currently taking..."
                  className="p-4"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Label>Upload Medical Documents (Optional) - Max 5 files</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#006f6f] transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Drag & drop your files or click to browse</p>
                  <p className="text-sm text-gray-500">Support: PDF, JPG, PNG files up to 10MB each (Maximum 5 files)</p>
                  {bookingData.uploadedFiles.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                      {bookingData.uploadedFiles.length} file(s) selected
                    </div>
                  )}
                  <Input 
                    type="file" 
                    multiple 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    className="mt-4 cursor-pointer" 
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length + bookingData.uploadedFiles.length > 5) {
                        toast.error('Maximum 5 files allowed');
                        e.target.value = '';
                        return;
                      }
                      setBookingData(prev => ({
                        ...prev,
                        uploadedFiles: [...prev.uploadedFiles, ...files]
                      }));
                    }}
                    disabled={bookingData.uploadedFiles.length >= 5}
                  />
                  {bookingData.uploadedFiles.length >= 5 && (
                    <p className="text-sm text-red-600 mt-2">Maximum file limit reached</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      case 4:
        const selectedType = consultationTypes.find(t => t.id === bookingData.consultationType);
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Review & Payment</h2>
              <p className="text-gray-600">Please review your booking details and complete payment</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultation Type:</span>
                      <span className="font-medium">{selectedType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(bookingData.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {bookingData.time}
                        {bookingData.istTime && ` (${bookingData.istTime} IST)`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedType?.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium text-[#006f6f]">Dr. Ilango S. Prakasam <span className="text-[#006f6f]">(Sr. Nephrologist)</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-medium">{bookingData.patientInfo.name}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold text-[#006f6f]">
                          {getFormattedPrice(getConsultationPrice(bookingData.consultationType, bookingData.country || userCountry, pricing.currency), pricing.currency)}
                        </span>
                      </div>
                      {bookingData.paymentMethod === 'cashfree' && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>✓ Secure payment via Cashfree</p>
                          <p>✓ Multiple payment options available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant={bookingData.paymentMethod === 'cashfree' ? "default" : "outline"}
                      className={`w-full justify-start p-4 h-auto ${
                        bookingData.paymentMethod === 'cashfree' 
                          ? 'bg-[#006f6f] hover:bg-[#005555]' 
                          : ''
                      }`}
                      onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'cashfree' }))}
                    >
                      <CreditCard className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Cashfree</div>
                        <div className="text-sm opacity-70">UPI, Cards, NetBanking & Wallets</div>
                      </div>
                    </Button>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Secure Payment</p>
                          <p className="text-sm text-green-600">
                            Your payment is protected by bank-level security. We never store your payment information.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8 md:mb-12 overflow-x-auto"
        >
          <div className="flex items-center space-x-2 md:space-x-8 min-w-max px-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <motion.div
                  className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-semibold ${
                    s <= step ? 'bg-[#006f6f] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {s < step ? <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6" /> : s}
                </motion.div>
                {s < 4 && (
                  <div
                    className={`w-8 md:w-16 h-1 mx-2 md:mx-4 ${
                      s < step ? 'bg-[#006f6f]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto px-2">
          {renderStep()}

          {/* Navigation Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Validation Summary for Step 3 */}
            {step === 3 && Object.keys(validationErrors).some(key => validationErrors[key]) && (
              <Alert className="border-red-200 bg-red-50 mb-6">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium mb-2">Please fix the following errors:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {Object.entries(validationErrors).map(([field, error]) => 
                      error && (
                        <li key={field}>
                          <span className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>: {error}
                        </li>
                      )
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center space-x-2"
                disabled={step === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <Button
                onClick={step === 4 ? handlePayment : () => {
                  if (step === 3) {
                    // Force validation check before proceeding
                    const isValid = validateAllFields();
                    if (isValid) {
                      handleNext();
                    } else {
                      toast.error('Please fix all validation errors before proceeding');
                    }
                  } else {
                    handleNext();
                  }
                }}
                className="bg-[#006f6f] hover:bg-[#005555] text-white flex items-center space-x-2"
                disabled={!isStepValid() || (step === 4 && isProcessingPayment)}
              >
                <span>{step === 4 ? (isProcessingPayment ? 'Processing...' : 'Pay Now') : 'Next'}</span>
                {step === 4 ? <CreditCard className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}