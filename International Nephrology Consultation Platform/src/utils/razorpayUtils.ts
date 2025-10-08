// Razorpay Payment Integration Utilities

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    consultation_type: string;
    date: string;
    time: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create Razorpay order (calls backend API)
export const createRazorpayOrder = async (bookingDetails: BookingDetails): Promise<{ orderId: string; razorpayKey: string }> => {
  try {
    console.log('Creating Razorpay order for:', bookingDetails);
    
    // Use environment variable for API URL or fallback to relative path for localhost
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    // Temporarily use debug endpoint to bypass auth issues
    const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/payments/create-order-debug` : '/api/payments/create-order-debug';
    
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
      razorpayKey: data.razorpay_key,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create payment order');
  }
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (
  bookingDetails: BookingDetails,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void
): Promise<void> => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    // Create order
    const { orderId, razorpayKey } = await createRazorpayOrder(bookingDetails);

    // Razorpay configuration
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: bookingDetails.amount * 100, // Amount in paise (multiply by 100)
      currency: bookingDetails.currency,
      name: 'NephroConsult',
      description: `${bookingDetails.consultationType} - ${bookingDetails.date} at ${bookingDetails.time}`,
      order_id: orderId,
      handler: (response: RazorpayResponse) => {
        console.log('Payment successful:', response);
        onSuccess(response);
      },
      prefill: {
        name: bookingDetails.patientInfo.name,
        email: bookingDetails.patientInfo.email,
        contact: bookingDetails.patientInfo.phone,
      },
      notes: {
        consultation_type: bookingDetails.consultationType,
        date: bookingDetails.date,
        time: bookingDetails.time,
      },
      theme: {
        color: '#006f6f',
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          onError(new Error('Payment cancelled by user'));
        },
      },
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    onError(error);
  }
};

// Verify payment (calls backend API)
export const verifyRazorpayPayment = async (
  paymentResponse: RazorpayResponse,
  bookingDetails: BookingDetails
): Promise<boolean> => {
  try {
    console.log('Verifying payment:', paymentResponse);
    
    // Use environment variable for API URL or fallback to relative path for localhost
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/payments/verify-payment` : '/api/payments/verify-payment';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        booking_details: {
          consultationType: bookingDetails.consultationType,
          patientName: bookingDetails.patientInfo.name,
          patientEmail: bookingDetails.patientInfo.email,
          date: bookingDetails.date,
          time: bookingDetails.time,
          amount: bookingDetails.amount,
          currency: bookingDetails.currency,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment verification failed:', errorData);
      return false;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('Payment verified successfully:', data.payment);
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

  return pricing[consultationType]?.[currency] || pricing['initial'][currency] || 2500;
};
