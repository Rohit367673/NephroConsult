import React, { useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Video, Phone, FileText, Upload, CreditCard, CheckCircle2, ArrowRight, User, Star, Heart, Menu, X, LogOut, MapPin, Globe, ChevronLeft, ChevronRight, AlertCircle, Shield } from 'lucide-react';
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
import { Navigation } from '../components/Navigation';
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
  documents?: string[];
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
    'Initial Consultation': 499,
    'Follow-up Consultation': 399,
    'Urgent Consultation': 999
  };
};

const getConsultationPrice = (type: string, country: string, currency: string) => {
  if (type === 'doctor_chat') {
    return currency === 'INR' ? 100 : 1;
  }

  // Updated pricing per client decision
  // Cheap countries (IN and similar): INR 499
  // High-income countries: USD $29
  const inrPrices = { initial: 499, doctor_chat: 100, followup: 399, urgent: 999 } as const;
  const usdPrices = { initial: 29, doctor_chat: 1, followup: 19, urgent: 49 } as const;

  const key = (type === 'followup' || type === 'urgent') ? type : 'initial';

  if (currency === 'INR') return inrPrices[key];
  return usdPrices[key];
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
  consultationType?: string;
}

function CalendarComponent({ selectedDate, onDateSelect, consultationType }: CalendarComponentProps) {
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

    // Disable past dates
    if (date < todayStart) return true;

    // Same-day booking restriction: only urgent consultations can book for today
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    if (isToday && consultationType !== 'urgent') {
      return true;
    }

    return false;
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



export default function BookingPage() {
  // Get user context and enforce authentication
  const authContext = useContext(AuthContext);
  const { user, logout, loading, updateUser } = authContext || {};
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronously determine initial free-consultation state so there is 0ms price-to-FREE flicker
  const getInitialFreeEligibility = (u: any): boolean => {
    if (!u) return true;
    if (u.hasUsedFreeConsultation === true) return false;
    if (u.email) {
      try {
        const cached = localStorage.getItem(`nephro_free_used_${String(u.email).toLowerCase().trim()}`);
        if (cached === 'true') return false;
        if (cached === 'false') return true;
      } catch {}
    }
    return true;
  };
  
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
  const [isFreeEligible, setIsFreeEligible] = useState<boolean>(() => getInitialFreeEligibility(user));
  const countrySetRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookingData, setBookingData] = useState({
    consultationType: 'initial',
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

  // Enhanced persistent storage using IndexedDB for payment data
  const storeBookingDataPersistent = async (bookingDetails: any) => {
    try {
      // Store in IndexedDB (most persistent)
      if ('indexedDB' in window) {
        const request = indexedDB.open('NephroConsultDB', 1);

        request.onerror = () => console.error('❌ IndexedDB error');

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['bookingData'], 'readwrite');
          const store = transaction.objectStore('bookingData');

          const dataToStore = {
            ...bookingDetails,
            timestamp: Date.now(),
            id: 'current_booking'
          };

          store.put(dataToStore);
          console.log('✅ Stored in IndexedDB');
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('bookingData')) {
            db.createObjectStore('bookingData', { keyPath: 'id' });
          }
        };
      }

      // Store in localStorage (backup)
      localStorage.setItem('cashfree_booking_details', JSON.stringify(bookingDetails));
      console.log('✅ Stored in localStorage');

      // Store in sessionStorage (backup)
      sessionStorage.setItem('cashfree_payment_details', JSON.stringify({
        bookingDetails: bookingDetails
      }));
      console.log('✅ Stored in sessionStorage');

      // Store in window object (backup)
      (window as any).cashfreeBookingData = bookingDetails;
      console.log('✅ Stored in window object');

      // Store in cookies (most persistent across redirects)
      document.cookie = `booking_data=${encodeURIComponent(JSON.stringify(bookingDetails))}; path=/; max-age=3600; SameSite=Strict`;
      console.log('✅ Stored in cookies');

      return true;
    } catch (error) {
      console.error('❌ Failed to store booking data persistently:', error);
      return false;
    }
  };

  // Enhanced retrieval from multiple sources
  const retrieveBookingDataPersistent = async (): Promise<BookingDetails | null> => {
    try {
      // Try IndexedDB first (most persistent)
      if ('indexedDB' in window) {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('NephroConsultDB', 1);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });

        const data = await new Promise<any>((resolve, reject) => {
          const transaction = db.transaction(['bookingData'], 'readonly');
          const store = transaction.objectStore('bookingData');
          const request = store.get('current_booking');

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });

        if (data) {
          console.log('✅ Retrieved from IndexedDB');
          return data;
        }
      }
    } catch (error) {
      console.warn('❌ Failed to retrieve from IndexedDB:', error);
    }

    // Try cookies (persistent across redirects)
    try {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('booking_data='))
        ?.split('=')[1];

      if (cookieValue) {
        const decoded = decodeURIComponent(cookieValue);
        console.log('✅ Retrieved from cookies');
        return JSON.parse(decoded);
      }
    } catch (error) {
      console.warn('❌ Failed to retrieve from cookies:', error);
    }

    // Try localStorage (backup)
    try {
      const localData = localStorage.getItem('cashfree_booking_details');
      if (localData) {
        console.log('✅ Retrieved from localStorage');
        return JSON.parse(localData);
      }
    } catch (error) {
      console.warn('❌ Failed to retrieve from localStorage:', error);
    }

    // Try sessionStorage (backup)
    try {
      const sessionData = sessionStorage.getItem('cashfree_payment_details');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed?.bookingDetails) {
          console.log('✅ Retrieved from sessionStorage');
          return parsed.bookingDetails;
        }
      }
    } catch (error) {
      console.warn('❌ Failed to retrieve from sessionStorage:', error);
    }

    // Try window object (backup)
    try {
      if ((window as any).cashfreeBookingData) {
        console.log('✅ Retrieved from window object');
        return (window as any).cashfreeBookingData;
      }
    } catch (error) {
      console.warn('❌ Failed to retrieve from window object:', error);
    }

    console.error('❌ No booking data found in any storage location');
    return null;
  };

  // Redirect to home with login prompt if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please login to book an appointment');
      navigate('/', loginRedirectState);
    }
  }, [user, loading, navigate]);

  // Store booking data when user reaches step 4 (review & payment) - BEFORE clicking payment button
  useEffect(() => {
    if (step === 4 && bookingData.consultationType && bookingData.date && bookingData.time && bookingData.patientInfo) {
      console.log('📋 Step 4 reached - storing booking data for payment (BEFORE button click)...');

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

      // Pre-convert uploaded files to base64 strings for storage (filename|base64)
      let preProcessedDocuments: string[] = [];

      // Process documents asynchronously
      const processDocuments = async () => {
        try {
          if (Array.isArray((bookingData as any).uploadedFiles) && (bookingData as any).uploadedFiles.length > 0) {
            console.log('📄 Processing uploaded files for storage:', (bookingData as any).uploadedFiles.length);
            preProcessedDocuments = await Promise.all(
              (bookingData as any).uploadedFiles.map((file: File) => new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result as string;
                  console.log(`📄 Processed file: ${file.name}, size: ${base64.length} chars`);
                  resolve(`${file.name}|${base64}`);
                };
                reader.onerror = () => {
                  console.error(`❌ Failed to process file: ${file.name}`);
                  // Bug 9 fix: Reject on error so the Promise.all catches it rather than storing corrupt data
                  reject(new Error(`Failed to read file: ${file.name}`));
                };
                reader.readAsDataURL(file);
              }))
            );
            console.log('✅ Processed documents:', preProcessedDocuments.length);
          } else {
            console.log('ℹ️ No uploaded files to process');
          }
        } catch (e) {
          console.warn('⚠️ Failed to pre-process uploaded files for storage:', (e as any)?.message || e);
        }

        // Continue with storage after documents are processed
        const extendedBookingDetails = {
          ...bookingDetails,
          documents: preProcessedDocuments,
          country: bookingData.country || userCountry,
          uploadedFiles: (bookingData as any).uploadedFiles
        };

        console.log('💾 Storing booking details for payment verification (Step 4 reached):', {
          consultationType: extendedBookingDetails.consultationType,
          hasPatientInfo: !!extendedBookingDetails.patientInfo,
          patientPhone: extendedBookingDetails.patientInfo?.phone,
          medicalHistoryLength: extendedBookingDetails.patientInfo?.medicalHistory?.length || 0,
          hasDocuments: !!(extendedBookingDetails as any)?.documents,
          documentsCount: (extendedBookingDetails as any)?.documents?.length || 0,
          country: extendedBookingDetails.country
        });

        // Use persistent storage for step 4
        storeBookingDataPersistent(extendedBookingDetails).then(() => {
          console.log('✅ Persistent storage completed for step 4');
        }).catch((error) => {
          console.error('❌ Failed to store persistently for step 4:', error);
        });
      };

      processDocuments();
    }
  }, [step, bookingData.consultationType, bookingData.date, bookingData.time, bookingData.patientInfo, bookingData.country, userCountry, pricing.currency]);

  useEffect(() => {
    // Get user's timezone and pricing (only run once on mount)
    const tz = getUserTimezone();
    setUserTimezone(tz);
    const country = getCountryFromTimezone(tz);
    setUserCountry(country);
    setPricing(getPricingForTimezone(tz));
    
    // Bug 8 fix: Don't use hardcoded 2025 mock data — start with empty, real slots fetched on date change
    setBookedAppointments([]);
  }, []);

  // Pre-select plan if passed via URL query params (?plan=doctor_chat or ?plan=initial)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan') || params.get('type');
    if (plan === 'doctor_chat') {
      setBookingData(prev => ({ ...prev, consultationType: 'doctor_chat' }));
    } else if (plan === 'initial') {
      setBookingData(prev => ({ ...prev, consultationType: 'initial' }));
    }
  }, [location.search]);

  // Check if user is eligible for 1st free initial consultation
  useEffect(() => {
    if (!user) {
      return;
    }
    // Immediately apply cached/user state without waiting for network
    setIsFreeEligible(getInitialFreeEligibility(user));

    const checkEligibility = async () => {
      try {
        const params = new URLSearchParams();
        if (user.email) params.set('email', user.email);
        if (user.id) params.set('userId', user.id);

        const res = await fetch(`/api/appointments/free-eligibility?${params.toString()}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            const eligible = !!data.eligible;
            setIsFreeEligible(eligible);
            if (user.email) {
              try {
                localStorage.setItem(
                  `nephro_free_used_${user.email.toLowerCase().trim()}`,
                  eligible ? 'false' : 'true'
                );
              } catch {}
            }
          }
        }
      } catch (e) {
        console.warn('Failed to check free consultation eligibility:', e);
      }
    };
    checkEligibility();
  }, [user]);

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
    console.log('🔍 validateAllFields called, validating patientInfo:', bookingData.patientInfo);
    const validation = validatePatientInfo(bookingData.patientInfo);
    console.log('🔍 Validation result:', validation);
    
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

    console.log('🔍 Error map:', errorMap);
    console.log('🔍 Validation isValid:', validation.isValid);
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

  // Validate single field on blur
  const handleFieldBlur = useCallback((field: string) => {
    const fieldValidations: {[key: string]: () => {isValid: boolean, error?: string}} = {
      name: () => {
        const validation = validateName(bookingData.patientInfo.name);
        return { isValid: validation.isValid, error: validation.isValid ? '' : validation.errors[0] };
      },
      email: () => {
        const validation = validateEmail(bookingData.patientInfo.email);
        return { isValid: validation.isValid, error: validation.isValid ? '' : validation.errors[0] };
      },
      phone: () => {
        const validation = validatePhoneNumber(bookingData.patientInfo.phone);
        return { isValid: validation.isValid, error: validation.isValid ? '' : validation.errors[0] };
      },
      age: () => {
        const validation = validateAge(bookingData.patientInfo.age);
        return { isValid: validation.isValid, error: validation.isValid ? '' : validation.errors[0] };
      },
      gender: () => {
        const isValid = bookingData.patientInfo.gender.trim() !== '';
        return { isValid, error: isValid ? '' : 'Please select your gender' };
      },
      medicalHistory: () => {
        const validation = validateMedicalHistory(bookingData.patientInfo.medicalHistory);
        return { isValid: validation.isValid, error: validation.isValid ? '' : validation.errors[0] };
      }
    };

    const validator = fieldValidations[field];
    if (validator) {
      const result = validator();
      if (!result.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: result.error || 'Invalid value'
        }));
      }
    }
  }, [bookingData.patientInfo]);

  // Enhanced step validation (pure function - no state updates)
  const isStepValid = () => {
    if (bookingData.consultationType === 'doctor_chat') {
      if (step === 1) return bookingData.consultationType !== '';
      if (step === 2) {
        const validation = validatePatientInfo(bookingData.patientInfo);
        return validation.isValid;
      }
      if (step === 3) return true;
      return false;
    }

    switch (step) {
      case 1:
        return bookingData.consultationType !== '';
      case 2:
        return bookingData.date !== '' && bookingData.time !== '';
      case 3: {
        // Actually validate patient info fields before allowing navigation
        const validation = validatePatientInfo(bookingData.patientInfo);
        return validation.isValid;
      }
      case 4:
        return true; // Payment step
      default:
        return false;
    }
  };

  // Bug 1 fix: useMemo and useCallback must be declared BEFORE any early return
  const consultationTypes = useMemo(() => {
    const initialRegularPrice = getConsultationPrice('initial', bookingData.country || userCountry, pricing.currency);
    const doctorChatPrice = getConsultationPrice('doctor_chat', bookingData.country || userCountry, pricing.currency);

    return [
      { 
        id: 'initial', 
        name: 'Initial Consultation', 
        price: isFreeEligible ? 0 : initialRegularPrice,
        originalPrice: initialRegularPrice,
        isFree: isFreeEligible,
        formattedPrice: isFreeEligible ? 'FREE' : getFormattedPrice(initialRegularPrice, pricing.currency),
        duration: '45 min',
        description: 'Comprehensive 1-on-1 video consultation with Dr. Ilango via secure video call',
        icon: Video,
        features: [
          '45-minute live 1-on-1 video call',
          'Complete kidney function evaluation',
          'Detailed medical history review',
          'Official digital prescription provided'
        ]
      },
      { 
        id: 'doctor_chat', 
        name: 'Upload Files & Chat with Doctor', 
        price: doctorChatPrice,
        originalPrice: doctorChatPrice,
        isFree: false,
        formattedPrice: getFormattedPrice(doctorChatPrice, pricing.currency),
        duration: 'Response within 12–24 hrs',
        badgeText: 'Report Review & Chat',
        description: 'Upload your lab reports and medical history. Dr. Ilango personally reviews your files, provides clinical advice, digital prescription, and direct follow-up chat.',
        icon: FileText,
        features: [
          'Lab reports & medical history review',
          'Direct asynchronous chat with Dr. Ilango',
          'Official digital prescription & clinical advice',
          'Email notifications when Dr. Ilango replies'
        ]
      }
    ];
  }, [bookingData.country, userCountry, pricing.currency, isFreeEligible]);

  const handleNext = useCallback(() => {
    const currentMax = bookingData.consultationType === 'doctor_chat' ? 3 : 4;
    console.log('🔄 handleNext called, current step:', step, 'max:', currentMax);
    if (step < currentMax) {
      const nextStep = step + 1;
      console.log('🔄 Moving to step:', nextStep);
      setStep(nextStep);
      // Auto-select Cashfree when reaching payment step
      if (nextStep === currentMax && !bookingData.paymentMethod) {
        console.log('💳 Auto-selecting Cashfree payment method');
        setBookingData(prev => ({ ...prev, paymentMethod: 'cashfree' }));
      }
    }
  }, [step, bookingData.consultationType, bookingData.paymentMethod]);

  const handleBack = useCallback(() => {
    console.log('⬅️ handleBack called, current step:', step);
    if (step > 1) {
      const prevStep = step - 1;
      console.log('⬅️ Moving to step:', prevStep);
      setStep(prevStep);
    }
  }, [step]);

  // Early return if not authenticated — placed AFTER all hooks
  if (!user && !loading) {
    return null;
  }

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

  const processFreeInitialBooking = async () => {
    const { patientInfo } = bookingData;
    if (!patientInfo.name || !patientInfo.email || !patientInfo.phone || !patientInfo.age || !patientInfo.gender || !patientInfo.medicalHistory) {
      toast.error('Please fill in all required patient information');
      return;
    }

    try {
      setIsProcessingPayment(true);

      let preProcessedDocuments: string[] = [];
      try {
        if (Array.isArray((bookingData as any).uploadedFiles) && (bookingData as any).uploadedFiles.length > 0) {
          preProcessedDocuments = await Promise.all(
            (bookingData as any).uploadedFiles.map((file: File) => new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(`${file.name}|${reader.result as string}`);
              reader.onerror = () => resolve(`${file.name}|error`);
              reader.readAsDataURL(file);
            }))
          );
        }
      } catch (e) {
        console.warn('⚠️ Failed to process uploaded files:', e);
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: bookingData.date,
          time: bookingData.time,
          istTime: bookingData.istTime,
          type: 'initial',
          patientInfo: bookingData.patientInfo,
          documents: preProcessedDocuments,
          country: bookingData.country || userCountry
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 402) {
          setIsFreeEligible(false);
          if (user?.email) {
            try { localStorage.setItem(`nephro_free_used_${user.email.toLowerCase().trim()}`, 'true'); } catch {}
          }
          updateUser?.({ hasUsedFreeConsultation: true });
          toast.error(data.error || 'Your 1st free consultation has already been used. Please proceed with regular payment.');
          return;
        }
        throw new Error(data.error || 'Failed to confirm booking');
      }

      setIsFreeEligible(false);
      setPaymentCompleted(true);
      if (user?.email) {
        try { localStorage.setItem(`nephro_free_used_${user.email.toLowerCase().trim()}`, 'true'); } catch {}
      }
      updateUser?.({ hasUsedFreeConsultation: true });
      try {
        localStorage.removeItem('cashfree_booking_details');
        sessionStorage.removeItem('cashfree_payment_details');
      } catch {}

      toast.success('🎉 Free 1st Initial Consultation confirmed! Check your email for the meeting link.');
      navigate('/profile');
    } catch (error: any) {
      console.error('❌ Error in processFreeInitialBooking:', error);
      toast.error(error?.message || 'Failed to confirm free booking. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBooking = async () => {
    console.log('🚀 handleBooking called with payment method:', bookingData.paymentMethod);
    console.log('🚀 Full bookingData:', bookingData);

    // If eligible for 1st free Initial Consultation, bypass payment gateway and confirm directly on server
    if (isFreeEligible && bookingData.consultationType === 'initial') {
      await processFreeInitialBooking();
      return;
    }
    
    if (!bookingData.paymentMethod || bookingData.paymentMethod !== 'cashfree') {
      console.log('❌ Payment method check failed:', {
        hasPaymentMethod: !!bookingData.paymentMethod,
        paymentMethod: bookingData.paymentMethod,
        expected: 'cashfree'
      });
      toast.error('Please select Cashfree as payment method');
      return;
    }

    console.log('✅ Payment method is cashfree, calling processCashfreePayment...');
    try {
      await processCashfreePayment();
    } catch (error) {
      console.error('❌ Error in processCashfreePayment:', error);
      throw error;
    }
  };

  const processCashfreePayment = async () => {
    console.log('🎯 processCashfreePayment function called!');
    console.log('🎯 Current bookingData:', {
      consultationType: bookingData.consultationType,
      date: bookingData.date,
      time: bookingData.time,
      hasPatientInfo: !!bookingData.patientInfo,
      patientPhone: bookingData.patientInfo?.phone,
      medicalHistoryLength: bookingData.patientInfo?.medicalHistory?.length || 0,
      uploadedFilesCount: (bookingData as any).uploadedFiles?.length || 0
    });
    
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

      // Pre-convert uploaded files to base64 strings for storage (filename|base64)
      let preProcessedDocuments: string[] = [];
      try {
        if (Array.isArray((bookingData as any).uploadedFiles) && (bookingData as any).uploadedFiles.length > 0) {
          console.log('📄 Processing uploaded files for storage:', (bookingData as any).uploadedFiles.length);
          preProcessedDocuments = await Promise.all(
            (bookingData as any).uploadedFiles.map((file: File) => new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result as string;
                console.log(`📄 Processed file: ${file.name}, size: ${base64.length} chars`);
                resolve(`${file.name}|${base64}`);
              };
              reader.onerror = () => {
                console.error(`❌ Failed to process file: ${file.name}`);
                resolve(`${file.name}|error`);
              };
              reader.readAsDataURL(file);
            }))
          );
          console.log('✅ Processed documents:', preProcessedDocuments.length);
        } else {
          console.log('ℹ️ No uploaded files to process');
        }
      } catch (e) {
        console.warn('⚠️ Failed to pre-process uploaded files for storage:', (e as any)?.message || e);
      }

      // Store booking details with documents for payment verification
      const extendedBookingDetails = {
        ...bookingDetails,
        documents: preProcessedDocuments,
        country: bookingData.country || userCountry
      };
      
      // Bug 10 fix: Validate BEFORE writing to localStorage to avoid storing incomplete/corrupt data
      if (!bookingDetails.patientInfo.name || !bookingDetails.patientInfo.email || !bookingDetails.patientInfo.phone || !bookingDetails.patientInfo.age || !bookingDetails.patientInfo.gender || !bookingDetails.patientInfo.medicalHistory) {
        toast.error('Please fill in all required patient information');
        setIsProcessingPayment(false);
        return;
      }

      console.log('💾 About to store extendedBookingDetails:', extendedBookingDetails);
      console.log('📋 Storing booking details for payment verification:', {
        consultationType: extendedBookingDetails.consultationType,
        hasPatientInfo: !!extendedBookingDetails.patientInfo,
        patientPhone: extendedBookingDetails.patientInfo?.phone,
        medicalHistoryLength: extendedBookingDetails.patientInfo?.medicalHistory?.length || 0,
        hasDocuments: !!(extendedBookingDetails as any)?.documents,
        documentsCount: (extendedBookingDetails as any)?.documents?.length || 0,
        country: extendedBookingDetails.country
      });
      
      // Store in localStorage
      localStorage.setItem('cashfree_booking_details', JSON.stringify(extendedBookingDetails));
      console.log('✅ Stored in localStorage:', localStorage.getItem('cashfree_booking_details') ? 'Success' : 'Failed');
      
      // Store in sessionStorage
      sessionStorage.setItem('cashfree_payment_details', JSON.stringify({
        bookingDetails: extendedBookingDetails
      }));
      console.log('✅ Stored in sessionStorage:', sessionStorage.getItem('cashfree_payment_details') ? 'Success' : 'Failed');

      // Initiate Cashfree payment with extended booking details
      await initiateCashfreePayment(
        extendedBookingDetails,
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

      // Use persistent retrieval for payment verification
      const bookingDetails = await retrieveBookingDataPersistent();
      if (!bookingDetails) {
        console.error('❌ No stored booking details found for payment verification');
        toast.error('Payment verification failed - no booking data found');
        return;
      }
      console.log('✅ Retrieved stored booking details for verification:', {
        consultationType: bookingDetails.consultationType,
        hasDocuments: !!(bookingDetails as any)?.documents,
        documentsCount: (bookingDetails as any)?.documents?.length || 0,
        patientPhone: bookingDetails.patientInfo?.phone,
      });

      const isVerified = await verifyCashfreePayment(response, bookingDetails);

      if (isVerified) {
        setPaymentCompleted(true);
        toast.success('Payment successful! Appointment booked successfully.', { id: 'payment-verification' });
        
        // Clear all persistent storage after successful verification
        localStorage.removeItem('cashfree_booking_details');
        sessionStorage.removeItem('cashfree_payment_details');
        document.cookie = 'booking_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        if ('indexedDB' in window) {
          const request = indexedDB.open('NephroConsultDB', 1);
          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(['bookingData'], 'readwrite');
            const store = transaction.objectStore('bookingData');
            store.delete('current_booking');
          };
        }
        console.log('🗑️ Cleared all persistent storage after successful payment');
        
        const lastResult = (window as any).lastPaymentResult || (typeof isVerified === 'object' ? isVerified : null);
        const ticketId = lastResult?.ticketId;
        const isDoctorChat = bookingDetails.consultationType === 'doctor_chat' || !!ticketId;

        if (isDoctorChat) {
          toast.success('🎉 Consultation request submitted! Opening your doctor chat...', {
            duration: 4000,
            id: 'appointment-success'
          });
          setTimeout(() => {
            navigate(`/doctor-chat${ticketId ? `?ticketId=${ticketId}` : ''}`);
          }, 1500);
        } else {
          // Show success message and redirect to profile (appointment already created by server)
          toast.success('🎉 Appointment successfully created! Redirecting to your dashboard...', {
            duration: 4000,
            id: 'appointment-success'
          });
          
          // Redirect to profile page after 2 seconds
          setTimeout(() => {
            window.location.href = '/profile';
          }, 2000);
        }
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

      // Pre-convert uploaded files to base64 strings for storage (filename|base64)
      let preProcessedDocuments: string[] = [];
      try {
        if (Array.isArray((bookingData as any).uploadedFiles) && (bookingData as any).uploadedFiles.length > 0) {
          console.log('📄 Processing uploaded files for storage:', (bookingData as any).uploadedFiles.length);
          preProcessedDocuments = await Promise.all(
            (bookingData as any).uploadedFiles.map((file: File) => new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result as string;
                console.log(`📄 Processed file: ${file.name}, size: ${base64.length} chars`);
                resolve(`${file.name}|${base64}`);
              };
              reader.onerror = () => {
                console.error(`❌ Failed to process file: ${file.name}`);
                resolve(`${file.name}|error`);
              };
              reader.readAsDataURL(file);
            }))
          );
          console.log('✅ Processed documents:', preProcessedDocuments.length);
        } else {
          console.log('ℹ️ No uploaded files to process');
        }
      } catch (e) {
        console.warn('⚠️ Failed to pre-process uploaded files for storage:', (e as any)?.message || e);
      }

      // Store booking details with documents for payment verification
      const extendedBookingDetails = {
        ...bookingDetails,
        documents: preProcessedDocuments,
        country: bookingData.country || userCountry
      };
      
      console.log('💾 About to store extendedBookingDetails:', extendedBookingDetails);
      console.log('📋 Storing booking details for payment verification:', {
        consultationType: extendedBookingDetails.consultationType,
        hasPatientInfo: !!extendedBookingDetails.patientInfo,
        patientPhone: extendedBookingDetails.patientInfo?.phone,
        medicalHistoryLength: extendedBookingDetails.patientInfo?.medicalHistory?.length || 0,
        hasDocuments: !!(extendedBookingDetails as any)?.documents,
        documentsCount: (extendedBookingDetails as any)?.documents?.length || 0,
        country: extendedBookingDetails.country
      });
      
      // Store in localStorage
      localStorage.setItem('cashfree_booking_details', JSON.stringify(extendedBookingDetails));
      console.log('✅ Stored in localStorage:', localStorage.getItem('cashfree_booking_details') ? 'Success' : 'Failed');
      
      // Store in sessionStorage
      sessionStorage.setItem('cashfree_payment_details', JSON.stringify({
        bookingDetails: extendedBookingDetails
      }));
      console.log('✅ Stored in sessionStorage:', sessionStorage.getItem('cashfree_payment_details') ? 'Success' : 'Failed');

      // Validate required fields
      if (!bookingDetails.patientInfo.name || !bookingDetails.patientInfo.email || !bookingDetails.patientInfo.phone || !bookingDetails.patientInfo.age || !bookingDetails.patientInfo.gender || !bookingDetails.patientInfo.medicalHistory) {
        toast.error('Please fill in all required patient information');
        setIsProcessingPayment(false);
        return;
      }

      // Initiate Cashfree payment with extended booking details
      await initiateCashfreePayment(
        extendedBookingDetails,
        handlePaymentSuccess,
        handlePaymentError
      );
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to process payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const stepVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const isDoctorChat = bookingData.consultationType === 'doctor_chat';
  const effectiveStep = isDoctorChat 
    ? (step === 2 ? 3 : step === 3 ? 4 : step) 
    : step;
  const isLastStep = step === (isDoctorChat ? 3 : 4);
  const isInfoStep = isDoctorChat ? step === 2 : step === 3;

  const renderStep = () => {
    switch (effectiveStep) {
      case 1:
        return (
          <motion.div 
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6 sm:space-y-8"
          >
            <div className="text-center max-w-2xl mx-auto mb-2 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#006f6f]/10 text-[#006f6f] mb-3">
                <Video className="w-3.5 h-3.5" />
                Step 1 of {isDoctorChat ? 3 : 4}: Select Consultation Model
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                Choose Your Consultation Type
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Select whether you need a 1-on-1 scheduled video appointment or fast doctor review of your medical reports.
              </p>

              <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-3 sm:p-3.5 mt-4 text-xs text-teal-900 inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#006f6f] shrink-0" />
                <span>
                  Consulting with <strong>Dr. Ilango S. Prakasam (Sr. Nephrologist)</strong> • Region: <strong>{userCountry}</strong> ({pricing.currency})
                </span>
              </div>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {consultationTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = bookingData.consultationType === type.id;
                const isChat = type.id === 'doctor_chat';

                return (
                  <motion.div 
                    key={type.id} 
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="w-full min-w-0"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className={`relative h-full flex flex-col justify-between rounded-3xl border-2 transition-all duration-300 p-6 sm:p-7 cursor-pointer select-none ${
                        isSelected
                          ? isChat
                            ? 'border-emerald-600 bg-emerald-50/20 ring-4 ring-emerald-600/15 shadow-xl'
                            : 'border-[#006f6f] bg-teal-50/20 ring-4 ring-[#006f6f]/15 shadow-xl'
                          : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow-md'
                      }`}
                      onClick={() => setBookingData(prev => ({ 
                        ...prev, 
                        consultationType: type.id,
                        time: '', 
                        istTime: '' 
                      }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setBookingData(prev => ({ ...prev, consultationType: type.id, time: '', istTime: '' }));
                        }
                      }}
                    >
                      {/* Top Badges & Radio Indicator */}
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isChat 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : (type as any).isFree 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-[#006f6f]/10 text-[#006f6f]'
                          }`}>
                            <IconComponent className="w-3.5 h-3.5" />
                            {isChat ? '⚡ Lab Reports & Chat' : '★ 1-on-1 Video Session'}
                          </span>

                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? isChat
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-[#006f6f] bg-[#006f6f] text-white'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                        </div>

                        {/* Title & Duration */}
                        <div className="mb-4">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight mb-1">
                            {type.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{type.duration}</span>
                            {(type as any).isFree && (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                🎁 1st Visit Free
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
                          {type.description}
                        </p>

                        {/* Price Card Box */}
                        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 mb-5 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                              Consultation Fee
                            </span>
                            {(type as any).isFree ? (
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                                  {getFormattedPrice((type as any).originalPrice, pricing.currency)}
                                </span>
                                <span className="text-2xl font-black text-emerald-600">
                                  FREE
                                </span>
                              </div>
                            ) : (
                              <div className="text-2xl font-black text-gray-900">
                                {type.formattedPrice}
                                <span className="text-xs font-normal text-gray-500 ml-1.5">{pricing.currency}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            {(type as any).isFree ? (
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                                100% Waived
                              </span>
                            ) : isChat ? (
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                                Flat Fee
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-gray-500">
                                Per Session
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-2.5 mb-6 pt-3 border-t border-gray-100">
                          {type.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                              <CheckCircle2
                                className={`w-4 h-4 shrink-0 mt-0.5 ${isChat ? 'text-emerald-600' : 'text-[#006f6f]'}`}
                              />
                              <span className="leading-snug">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Select Action Pill */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingData(prev => ({ 
                            ...prev, 
                            consultationType: type.id,
                            time: '', 
                            istTime: '' 
                          }));
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-center text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? isChat
                              ? 'bg-emerald-700 text-white shadow-md'
                              : 'bg-[#006f6f] text-white shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Selected Plan ✓</span>
                          </>
                        ) : (
                          <span>Click to Select</span>
                        )}
                      </button>
                    </div>
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
                    Video Consultations: 6-10 PM IST • {userCountry === 'India' 
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
                    consultationType={bookingData.consultationType}
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
            className="max-w-4xl mx-auto"
          >
            <Card className="border border-gray-200/90 shadow-xl rounded-3xl bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-teal-50/80 via-white to-white p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#006f6f]/10 text-[#006f6f] mb-2">
                    <User className="w-3.5 h-3.5" />
                    {isDoctorChat ? 'Step 2: Medical Profile & Reports' : 'Step 3: Patient Intake Profile'}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {isDoctorChat ? 'Patient Info & Medical Reports' : 'Patient Information'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {isDoctorChat 
                      ? 'Provide your symptoms and upload diagnostic lab reports for Dr. Ilango S. Prakasam (Sr. Nephrologist)' 
                      : 'Please provide accurate medical details for your scheduled 1-on-1 video consultation'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Confidential & HIPAA Compliant</span>
                </div>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                  <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={bookingData.patientInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleFieldBlur('name')}
                        className={validationErrors.name ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
                        required
                        placeholder="Enter your full name"
                      />
                      {validationErrors.name && (
                        <div className="flex items-center mt-1.5 text-xs text-red-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
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
                        onBlur={() => handleFieldBlur('email')}
                        className={validationErrors.email ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
                        required
                        placeholder="Enter your email address"
                      />
                      {validationErrors.email && (
                        <div className="flex items-center mt-1.5 text-xs text-red-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-5 sm:gap-6">
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        type="tel"
                        value={bookingData.patientInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleFieldBlur('phone')}
                        className={validationErrors.phone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
                        required
                        placeholder="e.g. +91 98765 43210"
                      />
                      {validationErrors.phone && (
                        <div className="flex items-center mt-1.5 text-xs text-red-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                          {validationErrors.phone}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-500 mt-1">
                        Include country code if outside India
                      </div>
                    </div>
                    <div>
                      <Label>Age *</Label>
                      <Input
                        type="number"
                        value={bookingData.patientInfo.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        onBlur={() => handleFieldBlur('age')}
                        className={validationErrors.age ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
                        required
                        placeholder="e.g. 45"
                        min="1"
                        max="150"
                      />
                      {validationErrors.age && (
                        <div className="flex items-center mt-1.5 text-xs text-red-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
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
                          setValidationErrors(prev => ({ ...prev, gender: '' }));
                        }}
                        onOpenChange={(open) => {
                          if (!open && bookingData.patientInfo.gender) {
                            handleFieldBlur('gender');
                          }
                        }}
                        required
                      >
                        <SelectTrigger className={validationErrors.gender ? 'border-red-500 focus:border-red-500' : ''}>
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
                        <div className="flex items-center mt-1.5 text-xs text-red-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                          {validationErrors.gender}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Label>Medical History & Current Symptoms *</Label>
                    <Textarea
                      value={bookingData.patientInfo.medicalHistory || ''}
                      onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                      onBlur={() => handleFieldBlur('medicalHistory')}
                      placeholder="Please describe your current symptoms, relevant medical history, known kidney parameters, and any concerns you'd like Dr. Ilango to evaluate..."
                      className={`min-h-[120px] ${validationErrors.medicalHistory ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
                      required
                    />
                    <div className="flex justify-between items-center mt-1.5">
                      {validationErrors.medicalHistory ? (
                        <div className="flex items-center text-xs text-red-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                          {validationErrors.medicalHistory}
                        </div>
                      ) : <span />}
                      <div className="text-[11px] text-gray-500">
                        Characters: {(bookingData.patientInfo?.medicalHistory || '').length}/2000
                      </div>
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
                      placeholder="List any blood pressure, diabetes, or kidney medications you are currently taking (dosage & frequency)..."
                      className="min-h-[80px]"
                    />
                  </motion.div>

                  {/* Document Upload Area */}
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-semibold text-gray-900">
                        {isDoctorChat 
                          ? 'Upload Lab Reports & Medical Documents (PDF / Images) - Recommended' 
                          : 'Upload Medical Documents (Optional) - Max 5 files'}
                      </Label>
                      {bookingData.uploadedFiles.length > 0 && (
                        <span className="text-xs text-[#006f6f] font-semibold">
                          {bookingData.uploadedFiles.length} of 5 files selected
                        </span>
                      )}
                    </div>

                    {isDoctorChat && (
                      <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3.5 mb-3 text-xs text-teal-900 leading-relaxed">
                        💡 <strong>Tip for Chat Consultation:</strong> Upload your recent KFT (Kidney Function Test), serum creatinine, urine routine, blood tests, or ultrasound reports. Dr. Ilango personally reviews your files, explains the values, and issues your digital prescription.
                      </div>
                    )}

                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-[#006f6f] rounded-2xl p-6 sm:p-8 text-center bg-gray-50/50 hover:bg-[#006f6f]/[0.02] transition-all cursor-pointer group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file" 
                        multiple 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        className="hidden" 
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
                          e.target.value = '';
                        }}
                        disabled={bookingData.uploadedFiles.length >= 5}
                      />
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-200/80 flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-[#006f6f] group-hover:border-[#006f6f]/40 transition-all">
                        <Upload className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
                      </div>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base mb-1">
                        Click to browse files or drag & drop here
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, or PNG up to 10MB each (Maximum 5 reports)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3.5 border-gray-300 text-gray-700 group-hover:border-[#006f6f] group-hover:text-[#006f6f] text-xs font-semibold rounded-xl"
                      >
                        Select Documents
                      </Button>
                      {bookingData.uploadedFiles.length >= 5 && (
                        <p className="text-xs text-amber-600 font-medium mt-2">Maximum file limit (5 files) reached</p>
                      )}
                    </div>

                    {/* Uploaded File List with Delete buttons */}
                    {bookingData.uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">Selected Reports ({bookingData.uploadedFiles.length}):</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {bookingData.uploadedFiles.map((file: File, fileIdx: number) => (
                            <div 
                              key={fileIdx} 
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl text-xs shadow-sm"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0 mr-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#006f6f] flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate" title={file.name}>{file.name}</p>
                                  <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBookingData(prev => ({
                                    ...prev,
                                    uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== fileIdx)
                                  }));
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Remove file"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 4: {
        const selectedType = consultationTypes.find(t => t.id === bookingData.consultationType);
        const isCurrentBookingFree = isFreeEligible && bookingData.consultationType === 'initial';
        const regularAmount = getConsultationPrice(bookingData.consultationType, bookingData.country || userCountry, pricing.currency);
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isCurrentBookingFree ? 'Review & Confirm Free Booking' : 'Review & Payment'}
              </h2>
              <p className="text-gray-600">
                {isCurrentBookingFree
                  ? 'Your 1st Initial Consultation is completely free — review your details and confirm below'
                  : 'Please review your booking details and complete payment'}
              </p>
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
                    {isDoctorChat ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Turnaround Time:</span>
                          <span className="font-medium text-emerald-700">Within 12–24 Hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Attached Reports:</span>
                          <span className="font-medium">
                            {bookingData.uploadedFiles && bookingData.uploadedFiles.length > 0 ? `${bookingData.uploadedFiles.length} file(s) attached` : 'None'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="font-medium">Direct Medical Chat & Prescription</span>
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
                        {isCurrentBookingFree ? (
                          <div className="text-right">
                            <span className="text-sm text-gray-400 line-through mr-2">
                              {getFormattedPrice(regularAmount, pricing.currency)}
                            </span>
                            <span className="text-2xl font-bold text-green-600">FREE</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-[#006f6f]">
                            {getFormattedPrice(regularAmount, pricing.currency)}
                          </span>
                        )}
                      </div>
                      {isCurrentBookingFree ? (
                        <div className="mt-2 text-sm text-green-700 font-medium">
                          <p>✓ 1st Initial Consultation Free Offer Applied</p>
                          <p className="text-xs text-gray-500 font-normal mt-1">
                            Valid once per patient for your first Initial Consultation only.
                          </p>
                        </div>
                      ) : (
                        bookingData.paymentMethod === 'cashfree' && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>✓ Secure payment via Cashfree</p>
                            <p>✓ Multiple payment options available</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>{isCurrentBookingFree ? 'Free Consultation Offer' : 'Payment Method'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isCurrentBookingFree ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-3">
                        <div className="flex items-start space-x-3">
                          <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-900 text-base">
                              1st Initial Consultation — 100% Free
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              No payment is required today. Click <strong>Confirm Free Booking</strong> below to schedule your appointment and receive your Google Meet link via email.
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 border-t border-green-200 pt-3">
                          Note: This complimentary offer applies strictly to your very first Initial Consultation. Subsequent Initial Consultations are billed at standard rates.
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-x-hidden">
      <Navigation />
      <div className="pt-24 sm:pt-28 pb-16 px-3 sm:px-6 max-w-5xl mx-auto">
        {/* Progress Steps Glassmorphic Card */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 max-w-3xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-sm p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              {(isDoctorChat ? [
                { num: 1, label: 'Choose Plan' },
                { num: 2, label: 'Details & Reports' },
                { num: 3, label: 'Review & Pay' }
              ] : [
                { num: 1, label: 'Choose Plan' },
                { num: 2, label: 'Date & Time' },
                { num: 3, label: 'Patient Info' },
                { num: 4, label: 'Payment' }
              ]).map((item, idx, arr) => (
                <React.Fragment key={item.num}>
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                        item.num === step
                          ? isDoctorChat
                            ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-600/20'
                            : 'bg-[#006f6f] text-white shadow-md ring-4 ring-[#006f6f]/20'
                          : item.num < step
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {item.num < step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : item.num}
                    </motion.div>
                    <span className={`text-[10px] sm:text-xs mt-1.5 text-center font-semibold transition-colors ${
                      item.num === step
                        ? isDoctorChat ? 'text-emerald-700' : 'text-[#006f6f]'
                        : item.num < step ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 sm:h-1 -mt-4 mx-1 sm:mx-2 rounded-full transition-colors ${
                        item.num < step ? (isDoctorChat ? 'bg-emerald-500' : 'bg-[#006f6f]') : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto px-1 sm:px-2">
          {renderStep()}

          {/* Navigation Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Validation Summary for Patient Info Step */}
            {isInfoStep && Object.keys(validationErrors).some(key => validationErrors[key]) && (
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

            <div className="flex justify-between items-center pt-8 mt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-11 px-5 rounded-xl font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer transition-all"
                disabled={step === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <Button
                onClick={isLastStep ? () => {
                  console.log('🔘 Button clicked for last step - calling handleBooking');
                  handleBooking();
                } : () => {
                  console.log('🔘 Button clicked for step:', step);
                  if (isInfoStep) {
                    console.log('🔘 Info step button clicked - validating fields');
                    const isValid = validateAllFields();
                    console.log('🔘 Validation result:', isValid);
                    if (isValid) {
                      console.log('🔘 Validation passed, calling handleNext');
                      handleNext();
                    } else {
                      console.log('🔘 Validation failed');
                      toast.error('Please fix all validation errors before proceeding');
                    }
                  } else {
                    handleNext();
                  }
                }}
                className={`h-11 px-6 sm:px-8 rounded-xl font-bold flex items-center space-x-2 transition-all ${
                  !isStepValid() || (isLastStep && isProcessingPayment)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : isDoctorChat
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg cursor-pointer'
                    : 'bg-[#006f6f] hover:bg-[#005555] text-white shadow-md hover:shadow-lg cursor-pointer'
                }`}
                disabled={!isStepValid() || (isLastStep && isProcessingPayment)}
              >
                <span>
                  {isLastStep
                    ? (isProcessingPayment
                        ? 'Processing...'
                        : (isCurrentBookingFree 
                            ? 'Confirm Free Booking' 
                            : (isDoctorChat 
                                ? `Pay ${getFormattedPrice(regularAmount, pricing.currency)} & Start Chat` 
                                : 'Pay Now')))
                    : 'Continue'}
                </span>
                {isLastStep ? (
                  isCurrentBookingFree
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <CreditCard className="h-4 w-4" />
                ) : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}