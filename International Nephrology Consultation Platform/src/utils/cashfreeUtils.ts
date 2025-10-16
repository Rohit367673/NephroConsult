// Cashfree Payment Integration Utilities

declare global {
  interface Window {
    Cashfree: any;
  }
}

export interface CashfreeOptions {
  appId: string;
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  orderNote: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId: string;
  returnUrl: string;
  notifyUrl: string;
  paymentSessionId: string;
}

export interface CashfreeResponse {
  payment_id: string;
  order_id: string;
  payment_status: string;
}

export interface BookingDetails {
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

// Load Cashfree script dynamically
export const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Cashfree) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create Cashfree order (calls backend API)
export const createCashfreeOrder = async (bookingDetails: BookingDetails): Promise<{ orderId: string; paymentSessionId: string; cashfreeAppId: string; environment: string }> => {
  try {
    console.log('Creating Cashfree order for:', bookingDetails);
    
    // Use environment variable for API URL or fallback to relative path for localhost
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/payments/create-order` : '/api/payments/create-order';
    
    console.log('Using payment endpoint:', endpoint);
    console.log('Request payload:', {
      amount: bookingDetails.amount,
      currency: bookingDetails.currency,
      consultationType: bookingDetails.consultationType,
      patientName: bookingDetails.patientInfo.name,
      patientEmail: bookingDetails.patientInfo.email,
      patientPhone: bookingDetails.patientInfo.phone,
      date: bookingDetails.date,
      time: bookingDetails.time,
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        amount: bookingDetails.amount,
        currency: bookingDetails.currency,
        consultationType: bookingDetails.consultationType,
        patientName: bookingDetails.patientInfo.name,
        patientEmail: bookingDetails.patientInfo.email,
        patientPhone: bookingDetails.patientInfo.phone,
        date: bookingDetails.date,
        time: bookingDetails.time,
      }),
    });

    console.log('Payment API Response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error(`Payment API Error: ${response.status} ${response.statusText}`);
      
      if (response.status === 405) {
        console.error('❌ 405 Method Not Allowed - Backend server not properly configured');
        throw new Error('Payment service temporarily unavailable. Please contact support or try again later.');
      }
      
      if (response.status === 403) {
        console.error('❌ 403 Forbidden - Authentication/Authorization failed');
        console.error('This usually means session cookies are not being sent properly or user is not authenticated');
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }
      
      if (response.status === 404) {
        console.error('❌ 404 Not Found - Payment endpoint not found');
        throw new Error('Payment service not available. Please contact support.');
      }
      
      const errorData = await response.json().catch(() => null);
      console.error('Payment API Error Data:', errorData);
      
      throw new Error(errorData?.error || `Payment order creation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Payment API Success Response:', data);
    
    if (!data.success) {
      console.error('Payment order creation failed:', data.error);
      throw new Error(data.error || 'Failed to create order');
    }

    console.log('Order created successfully:', data.order.id);
    return {
      orderId: data.order.id,
      paymentSessionId: data.order.paymentSessionId,
      cashfreeAppId: data.cashfree_app_id,
      environment: data.environment,
    };
  } catch (error) {
    console.error('Error creating Cashfree order:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create payment order');
  }
};

// Initialize Cashfree payment
export const initiateCashfreePayment = async (
  bookingDetails: BookingDetails,
  onSuccess: (response: CashfreeResponse) => void,
  onError: (error: any) => void
): Promise<void> => {
  try {
    const { orderId, paymentSessionId, cashfreeAppId, environment } = await createCashfreeOrder(bookingDetails);

    console.log('Payment order created:', { orderId, paymentSessionId, cashfreeAppId, environment });

    // Persist payment details for use on return URL page
    try {
      // Check if extended booking details already exist from BookingPage
      const existingSessionStr = sessionStorage.getItem('cashfree_payment_details');
      const existingLocalStr = localStorage.getItem('cashfree_booking_details');
      
      let finalBookingDetails = bookingDetails;
      if (existingSessionStr) {
        try {
          const existing = JSON.parse(existingSessionStr);
          if (existing.bookingDetails) {
            finalBookingDetails = existing.bookingDetails;
            console.log('📋 Using existing extended booking details from session');
          }
        } catch {}
      } else if (existingLocalStr) {
        try {
          const existing = JSON.parse(existingLocalStr);
          if (existing.uploadedFiles || existing.country) {
            finalBookingDetails = existing;
            console.log('📋 Using existing extended booking details from local storage');
          }
        } catch {}
      }

      const persisted = {
        orderId,
        paymentSessionId,
        cashfreeAppId,
        bookingDetails: finalBookingDetails,
      };
      sessionStorage.setItem('cashfree_payment_details', JSON.stringify(persisted));
      localStorage.setItem('cashfree_booking_details', JSON.stringify(finalBookingDetails));
      localStorage.setItem('cashfree_last_order_id', orderId);
      
      console.log('📋 Stored booking details for verification:', {
        hasUploadedFiles: !!(finalBookingDetails as any)?.uploadedFiles,
        hasCountry: !!(finalBookingDetails as any)?.country,
        consultationType: finalBookingDetails.consultationType
      });
    } catch {}

    const loaded = await loadCashfreeScript();
    if (!loaded || !window.Cashfree) {
      throw new Error('Failed to load Cashfree SDK');
    }

    const mode = environment === 'production' ? 'production' : 'sandbox';
    const cashfree = new window.Cashfree({ mode });

    await cashfree.checkout({ paymentSessionId });

  } catch (error) {
    console.error('Error initiating Cashfree payment:', error);
    onError(error);
  }
};

// Verify payment (calls backend API)
const resolveStoredBookingDetails = (): BookingDetails | undefined => {
  console.log('🔍 Resolving stored booking details...');
  
  try {
    const sessionStr = sessionStorage.getItem('cashfree_payment_details');
    console.log('🔍 Session storage content:', sessionStr ? 'Found' : 'Empty');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      if (parsed?.bookingDetails) {
        console.log('✅ Found booking details in session storage:', {
          consultationType: parsed.bookingDetails.consultationType,
          hasUploadedFiles: !!(parsed.bookingDetails as any)?.uploadedFiles,
          hasCountry: !!(parsed.bookingDetails as any)?.country
        });
        return parsed.bookingDetails as BookingDetails;
      }
    }
  } catch (e) {
    console.warn('⚠️ Error parsing session storage:', e);
  }

  try {
    const localStr = localStorage.getItem('cashfree_booking_details');
    console.log('🔍 Local storage content:', localStr ? 'Found' : 'Empty');
    if (localStr) {
      const parsed = JSON.parse(localStr) as BookingDetails;
      console.log('✅ Found booking details in local storage:', {
        consultationType: parsed.consultationType,
        hasUploadedFiles: !!(parsed as any)?.uploadedFiles,
        hasCountry: !!(parsed as any)?.country
      });
      return parsed;
    }
  } catch (e) {
    console.warn('⚠️ Error parsing local storage:', e);
  }

  console.warn('❌ No booking details found in storage');
  return undefined;
};

const derivePatientCountry = (details: BookingDetails | undefined): string | undefined => {
  if (!details) return undefined;
  const countryFromInfo = (details as any)?.country || (details.patientInfo as any)?.country;
  if (countryFromInfo) return countryFromInfo;

  switch (details.currency) {
    case 'INR':
      return 'IN';
    case 'USD':
      return 'US';
    case 'EUR':
      return 'EU';
    case 'GBP':
      return 'GB';
    default:
      return undefined;
  }
};

export const verifyCashfreePayment = async (
  paymentResponse: Partial<CashfreeResponse> & { order_id: string },
  bookingDetails?: BookingDetails
): Promise<boolean> => {
  try {
    console.log('Verifying payment:', paymentResponse);

    // Use environment variable for API URL or fallback to relative path for localhost
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/payments/verify-payment` : '/api/payments/verify-payment';

    const resolvedBooking = bookingDetails || resolveStoredBookingDetails();
    if (!resolvedBooking) {
      console.warn('⚠️ verifyCashfreePayment: booking details missing, proceeding without additional context');
    }

    const bookingPayload = resolvedBooking
      ? {
          consultationType: resolvedBooking.consultationType,
          patientName: resolvedBooking.patientInfo?.name,
          patientEmail: resolvedBooking.patientInfo?.email,
          patientPhone: resolvedBooking.patientInfo?.phone,
          patientCountry: derivePatientCountry(resolvedBooking),
          date: resolvedBooking.date,
          time: resolvedBooking.time,
          amount: resolvedBooking.amount,
          currency: resolvedBooking.currency,
          patientInfo: resolvedBooking.patientInfo,
          intake: resolvedBooking.patientInfo
            ? {
                description: resolvedBooking.patientInfo.medicalHistory,
                documents: (resolvedBooking as any)?.uploadedFiles || (resolvedBooking as any)?.documents,
                address: resolvedBooking.patientInfo.currentMedications,
              }
            : undefined,
        }
      : undefined;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        order_id: paymentResponse.order_id,
        payment_id: paymentResponse.payment_id,
        booking_details: bookingPayload,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment verification failed:', errorData);
      return false;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('Payment verified successfully:', data.payment, data.appointment);
      return true;
    } else {
      console.error('Payment verification failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

// Get consultation pricing based on type and currency
export const getConsultationPrice = (consultationType: string, currency: string): number => {
  const pricing: { [key: string]: { [key: string]: number } } = {
    'initial': {
      'INR': 2500,
      'USD': 30,
      'EUR': 28,
      'GBP': 25,
      'AUD': 45,
    },
    'followup': {
      'INR': 1800,
      'USD': 22,
      'EUR': 20,
      'GBP': 18,
      'AUD': 32,
    },
    'urgent': {
      'INR': 3750,
      'USD': 45,
      'EUR': 42,
      'GBP': 38,
      'AUD': 68,
    },
  };

  if (consultationType === 'followup' && currency === 'INR') {
    return 5;
  }
  return pricing[consultationType]?.[currency] || pricing['initial'][currency] || 2500;
};
