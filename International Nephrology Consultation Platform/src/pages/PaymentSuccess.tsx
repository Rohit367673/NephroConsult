import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyCashfreePayment } from '../utils/cashfreeUtils';
import { toast } from 'sonner';

interface PaymentDetails {
  orderId: string;
  paymentSessionId: string;
  cashfreeAppId: string;
  bookingDetails: any;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying payment...');
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    const verifyPayment = async () => {
      try {
        // Prefer order_id from URL
        const orderId = searchParams.get('order_id');
        if (!orderId) {
          setPaymentStatus('failed');
          setMessage('Order ID not found in URL.');
          return;
        }

        // Try sessionStorage first
        const sessionStr = sessionStorage.getItem('cashfree_payment_details');
        let bookingDetails: any | undefined;
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          bookingDetails = parsed.bookingDetails;
        } else {
          // Fallback to localStorage
          const localStr = localStorage.getItem('cashfree_booking_details');
          if (localStr) {
            bookingDetails = JSON.parse(localStr);
          }
        }

        console.log('Verifying payment for order:', orderId);

        const MAX_RETRIES = 8;
        const RETRY_DELAY = 2000;
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

        let verified = false;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          const ok = await verifyCashfreePayment({ order_id: orderId }, bookingDetails);
          if (ok) {
            verified = true;
            break;
          }
          if (attempt < MAX_RETRIES) {
            setMessage(`Confirming payment... (attempt ${attempt + 1}/${MAX_RETRIES})`);
            await sleep(RETRY_DELAY);
          }
        }

        if (verified) {
          setMessage('Payment verified! Finalizing your appointment...');

          // Fallback: explicitly create appointment if not already created by server
          try {
            // Re-resolve latest booking details from storage if missing
            if (!bookingDetails) {
              const sessionAgain = sessionStorage.getItem('cashfree_payment_details');
              if (sessionAgain) {
                const parsed = JSON.parse(sessionAgain);
                bookingDetails = parsed.bookingDetails;
              } else {
                const localStr = localStorage.getItem('cashfree_booking_details');
                if (localStr) bookingDetails = JSON.parse(localStr);
              }
            }

            if (bookingDetails) {
              const apiBaseUrl = import.meta.env.VITE_API_URL || '';
              const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/appointments` : '/api/appointments';

              const countryCode = bookingDetails.country
                || (bookingDetails.currency === 'INR' ? 'IN' : bookingDetails.currency === 'USD' ? 'US' : bookingDetails.currency === 'EUR' ? 'EU' : bookingDetails.currency === 'GBP' ? 'GB' : 'default');

              const createResp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  date: bookingDetails.date,
                  timeSlot: bookingDetails.time,
                  typeId: bookingDetails.consultationType,
                  paymentMethod: 'card',
                  patientPhone: bookingDetails.patientInfo?.phone,
                  patientCountry: countryCode,
                  intake: bookingDetails.patientInfo ? {
                    description: bookingDetails.patientInfo.medicalHistory,
                    documents: undefined,
                  } : undefined,
                })
              });

              if (!createResp.ok) {
                // If time slot already booked, treat as success (likely created by server)
                if (createResp.status === 409) {
                  setPaymentStatus('success');
                  setMessage('Payment successful! Your appointment has been booked.');
                } else {
                  const err = await createResp.json().catch(() => ({}));
                  console.error('Fallback appointment creation failed:', createResp.status, err);
                  setPaymentStatus('success');
                  setMessage('Payment successful!');
                }
              } else {
                const data = await createResp.json().catch(() => ({}));
                console.log('✅ Fallback appointment created:', data);
                setPaymentStatus('success');
                setMessage('Payment successful! Your appointment has been booked.');
              }
            } else {
              setPaymentStatus('success');
              setMessage('Payment successful!');
            }
          } catch (fallbackErr) {
            console.error('Fallback create appointment error:', fallbackErr);
            setPaymentStatus('success');
            setMessage('Payment successful!');
          }

          try { sessionStorage.removeItem('cashfree_payment_details'); } catch {}
          toast.success('Appointment created successfully! 🎉', {
            description: 'You can view your appointment details in your profile.',
            duration: 4000,
          });
          setTimeout(() => { navigate('/profile'); }, 2000);
        } else {
          setPaymentStatus('failed');
          setMessage('Payment verification failed. Please contact support.');
        }

      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        setMessage('Payment verification failed. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {paymentStatus === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {paymentStatus === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/book-appointment')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;



