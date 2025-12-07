// Cashfree payment utilities
interface CashfreeResponse {
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
  documents?: string[];
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
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

// Initialize Cashfree payment
export const initiateCashfreePayment = async (
  bookingDetails: BookingDetails,
  onSuccess: (response: CashfreeResponse) => void,
  onError: (error: any) => void
) => {
  try {
    console.log('🚀 Initiating Cashfree payment with booking details:', bookingDetails);

    // Log the booking details being processed
    console.log('📋 Processing booking details for payment:', {
      hasDocuments: !!(bookingDetails as any)?.documents,
      documentsCount: (bookingDetails as any)?.documents?.length || 0,
      hasMedicalHistory: !!bookingDetails.patientInfo?.medicalHistory,
      medicalHistoryLength: bookingDetails.patientInfo?.medicalHistory?.length || 0,
      patientPhone: bookingDetails.patientInfo?.phone
    });

    // Note: Booking details are already stored by BookingPage.tsx before this function is called

    // Store booking details for later verification
    const orderId = `order_T_${Math.random().toString(36).substr(2, 8)}_${Date.now().toString(36)}`;
    const paymentSessionId = `session_${Math.random().toString(36).substr(2, 16)}`;
    const cashfreeAppId = import.meta.env.VITE_CASHFREE_APP_ID || 'TEST108386203fd97c98761cc8cc4b1402683801';

    // Create API base URL (prefer same-origin in prod to keep cookies first-party)
    let endpoint = '/api/payments/create-order';
    try {
      const configured = import.meta.env.VITE_API_URL as string | undefined;
      const hasWindow = typeof window !== 'undefined';
      if (configured && hasWindow) {
        const cur = new URL(window.location.href);
        const cfg = new URL(configured);
        const isLoopback = (h: string) => h === 'localhost' || h === '127.0.0.1';
        const sameSite = (h1: string, h2: string) => {
          try {
            const p1 = h1.split('.').slice(-2).join('.');
            const p2 = h2.split('.').slice(-2).join('.');
            return p1 === p2;
          } catch { return false; }
        };
        if (isLoopback(cur.hostname) && isLoopback(cfg.hostname)) {
          endpoint = `${configured}/api/payments/create-order`;
        } else if (sameSite(cur.hostname, cfg.hostname)) {
          endpoint = '/api/payments/create-order';
        } else {
          // Force same-origin to avoid third-party cookies
          endpoint = '/api/payments/create-order';
        }
      } else if (configured) {
        endpoint = `${configured}/api/payments/create-order`;
      }
    } catch {}

    // Prepare order data
    const orderData = {
      amount: bookingDetails.amount,
      currency: bookingDetails.currency,
      consultationType: bookingDetails.consultationType,
      patientName: bookingDetails.patientInfo.name,
      patientEmail: bookingDetails.patientInfo.email,
      patientPhone: bookingDetails.patientInfo.phone,
      date: bookingDetails.date,
      time: bookingDetails.time
    };

    console.log('📤 Sending order creation request:', orderData);

    // Create payment order
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create payment order: ${response.status}`);
    }

    const orderResponse = await response.json();
    console.log('✅ Order created successfully:', orderResponse);

    if (!orderResponse.success || !orderResponse.order) {
      throw new Error('Invalid order response');
    }

    const { order } = orderResponse;
    const finalBookingDetails = {
      ...bookingDetails,
      orderId: order.id,
      paymentSessionId: order.paymentSessionId,
      cashfreeAppId: orderResponse.cashfree_app_id
    };

    // Update stored booking details with order information (preserving existing booking details)
    try {
      // Get existing booking details from storage
      const existingSessionStr = sessionStorage.getItem('cashfree_payment_details');
      let existingBookingDetails = bookingDetails; // fallback to current bookingDetails
      
      if (existingSessionStr) {
        try {
          const existing = JSON.parse(existingSessionStr);
          if (existing.bookingDetails) {
            existingBookingDetails = existing.bookingDetails;
          }
        } catch (e) {
          console.warn('⚠️ Error parsing existing session storage:', e);
        }
      }

      const persisted = {
        orderId: order.id,
        paymentSessionId: order.paymentSessionId,
        cashfreeAppId: orderResponse.cashfree_app_id,
        bookingDetails: existingBookingDetails, // Use existing booking details
      };
      sessionStorage.setItem('cashfree_payment_details', JSON.stringify(persisted));
      localStorage.setItem('cashfree_last_order_id', order.id);
      
      console.log('📋 Updated stored booking details with order info:', {
        hasDocuments: !!(existingBookingDetails as any)?.documents,
        hasCountry: !!(existingBookingDetails as any)?.country,
        consultationType: existingBookingDetails.consultationType,
        documentsCount: (existingBookingDetails as any)?.documents?.length || 0,
        medicalHistoryLength: existingBookingDetails.patientInfo?.medicalHistory?.length || 0,
        patientPhone: existingBookingDetails.patientInfo?.phone
      });
    } catch (error) {
      console.error('❌ Error updating stored booking details:', error);
    }

    const loaded = await loadCashfreeScript();
    if (!loaded || !window.Cashfree) {
      throw new Error('Failed to load Cashfree SDK');
    }

    const mode = orderResponse.environment === 'production' ? 'production' : 'sandbox';
    const cashfree = new window.Cashfree({ mode });

    await cashfree.checkout({ paymentSessionId: order.paymentSessionId });

  } catch (error) {
    console.error('Error initiating Cashfree payment:', error);
    onError(error);
  }
};

// Verify payment (calls backend API)
const resolveStoredBookingDetails = (): BookingDetails | undefined => {
  console.log('🔍 Resolving stored booking details...');

  try {
    // First try sessionStorage (nested structure)
    const sessionStr = sessionStorage.getItem('cashfree_payment_details');
    console.log('🔍 Session storage content:', sessionStr ? 'Found' : 'Empty');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      console.log('🔍 Parsed session storage:', parsed);
      if (parsed?.bookingDetails) {
        console.log('✅ Found booking details in session storage:', {
          consultationType: parsed.bookingDetails.consultationType,
          hasDocuments: !!(parsed.bookingDetails.documents),
          hasCountry: !!(parsed as any)?.country || !!(parsed.bookingDetails as any)?.country,
          documentsCount: parsed.bookingDetails.documents?.length || 0,
          medicalHistoryLength: parsed.bookingDetails.patientInfo?.medicalHistory?.length || 0,
          patientPhone: parsed.bookingDetails.patientInfo?.phone,
        });
        return parsed.bookingDetails as BookingDetails;
      }
    }
  } catch (e) {
    console.warn('⚠️ Error parsing session storage:', e);
  }

  try {
    // Then try localStorage (direct structure)
    const localStr = localStorage.getItem('cashfree_booking_details');
    console.log('🔍 Local storage content:', localStr ? 'Found' : 'Empty');
    if (localStr) {
      const parsed = JSON.parse(localStr);
      console.log('🔍 Parsed local storage:', parsed);
      console.log('✅ Found booking details in local storage:', {
        consultationType: parsed.consultationType,
        hasDocuments: !!(parsed.documents),
        hasCountry: !!(parsed as any)?.country,
        documentsCount: parsed.documents?.length || 0,
        medicalHistoryLength: parsed.patientInfo?.medicalHistory?.length || 0,
        patientPhone: parsed.patientInfo?.phone,
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

    // Create API base URL (prefer same-origin in prod to keep cookies first-party)
    let endpoint = '/api/payments/verify-payment';
    try {
      const configured = import.meta.env.VITE_API_URL as string | undefined;
      const hasWindow = typeof window !== 'undefined';
      if (configured && hasWindow) {
        const cur = new URL(window.location.href);
        const cfg = new URL(configured);
        const isLoopback = (h: string) => h === 'localhost' || h === '127.0.0.1';
        const sameSite = (h1: string, h2: string) => {
          try {
            const p1 = h1.split('.').slice(-2).join('.');
            const p2 = h2.split('.').slice(-2).join('.');
            return p1 === p2;
          } catch { return false; }
        };
        if (isLoopback(cur.hostname) && isLoopback(cfg.hostname)) {
          endpoint = `${configured}/api/payments/verify-payment`;
        } else if (sameSite(cur.hostname, cfg.hostname)) {
          endpoint = '/api/payments/verify-payment';
        } else {
          endpoint = '/api/payments/verify-payment';
        }
      } else if (configured) {
        endpoint = `${configured}/api/payments/verify-payment`;
      }
    } catch {}

    const resolvedBooking = bookingDetails || resolveStoredBookingDetails();
    if (!resolvedBooking) {
      console.warn('⚠️ verifyCashfreePayment: booking details missing, proceeding without additional context');
    } else {
      console.log('✅ verifyCashfreePayment: Using booking details:', {
        consultationType: resolvedBooking.consultationType,
        hasPatientInfo: !!resolvedBooking.patientInfo,
        patientPhone: resolvedBooking.patientInfo?.phone,
        medicalHistory: resolvedBooking.patientInfo?.medicalHistory?.substring(0, 100) + '...',
        hasDocuments: !!(resolvedBooking.documents),
        documentsCount: resolvedBooking.documents?.length || 0,
      });
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
                description: resolvedBooking.patientInfo.medicalHistory || '',
                address: resolvedBooking.patientInfo.currentMedications || '',
                documents: Array.isArray(resolvedBooking.documents) ? resolvedBooking.documents : [],
              }
            : undefined,
        }
      : undefined;

    console.log('📤 Sending booking payload to server:', {
      hasBookingPayload: !!bookingPayload,
      consultationType: bookingPayload?.consultationType,
      patientPhone: bookingPayload?.patientPhone,
      hasIntake: !!bookingPayload?.intake,
      intakeDocuments: bookingPayload?.intake?.documents?.length || 0,
      intakeDescription: bookingPayload?.intake?.description?.substring(0, 100) + '...',
    });

    console.log('📤 Full payload being sent:', JSON.stringify(bookingPayload, null, 2));

    // Debug: Verify phone number is in the right place
    console.log('📱 Phone number verification:', {
      patientPhone: bookingPayload?.patientPhone,
      patientInfoPhone: bookingPayload?.patientInfo?.phone,
      finalPayloadPhone: bookingPayload ? {
        ...bookingPayload,
        patientInfo: {
          ...bookingPayload.patientInfo,
          phone: bookingPayload.patientPhone
        }
      }.patientInfo.phone : 'No payload'
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        order_id: paymentResponse.order_id,
        payment_id: paymentResponse.payment_id,
        booking_details: bookingPayload ? {
          ...bookingPayload,
          // Ensure phone number is properly included in patientInfo
          patientInfo: {
            ...bookingPayload.patientInfo,
            phone: bookingPayload.patientPhone // Make sure phone is in patientInfo
          }
        } : undefined
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment verification failed:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('Payment verified successfully:', data);
    
    // Clear stored booking details after successful verification
    try {
      sessionStorage.removeItem('cashfree_payment_details');
      localStorage.removeItem('cashfree_booking_details');
      localStorage.removeItem('cashfree_last_order_id');
    } catch {}

    return data.success === true;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

// Declare global Cashfree type
declare global {
  interface Window {
    Cashfree: any;
  }
}