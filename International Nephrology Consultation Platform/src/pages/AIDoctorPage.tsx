import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import Footer from '../components/Footer';

// Cashfree SDK types
declare global {
  interface Window {
    Cashfree?: any;
  }
}

// Backend API base (same as NephroConsult's existing API config)
const API_BASE = import.meta.env.VITE_API_URL || '';

export default function AIDoctorPage() {
  const navigate = useNavigate();
  const [cashfreeStatus, setCashfreeStatus] = useState<'idle' | 'loading' | 'processing'>('idle');
  const cashfreeScriptLoaded = useRef(false);

  // Load Cashfree JS SDK on mount (parent window, not iframe)
  useEffect(() => {
    if (cashfreeScriptLoaded.current || window.Cashfree) return;
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => { cashfreeScriptLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  // Fix 1: postMessage bridge — listen for INITIATE_CASHFREE_PAYMENT from the AI chat iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Only process from our trusted AI assistant iframe origin
      // Bug 16 fix: Restrict localhost origins to DEV builds only
      const trustedOrigins = [
        'https://ai-assistant-frontend-lilac.vercel.app',
        ...(import.meta.env.DEV ? ['http://localhost:3000', 'http://localhost:5173'] : [])
      ];
      if (!trustedOrigins.includes(event.origin) && event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== 'INITIATE_CASHFREE_PAYMENT') return;

      const { bookingDetails } = event.data;
      if (!bookingDetails) return;

      setCashfreeStatus('loading');

      try {
        // Compute safe fallbacks for required NephroConsult backend fields
        const today = new Date();
        const safeConsultationType = bookingDetails.consultationType || 'Initial Consultation';
        const safeDate = (bookingDetails.date && /^\d{4}-\d{2}-\d{2}$/.test(bookingDetails.date))
          ? bookingDetails.date 
          : today.toISOString().split('T')[0];
        const safeTime = bookingDetails.time || '18:00';
        const safeName = bookingDetails.patientInfo?.name || 'NephroConsult Patient';
        const safeEmail = (bookingDetails.patientInfo?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingDetails.patientInfo.email))
          ? bookingDetails.patientInfo.email 
          : 'patient@nephroconsult.com';
        const safePhone = bookingDetails.patientInfo?.phone || '9999999999';

        // Bug 17 fix: Require explicit payment amount; do not silently undercharge with 499 fallback
        if (!bookingDetails.amount || typeof bookingDetails.amount !== 'number' || bookingDetails.amount <= 0) {
          throw new Error('Invalid or missing consultation fee amount.');
        }

        // Persist booking details so PaymentSuccess.tsx can retrieve them after redirect
        const persistPayload = {
          consultationType: safeConsultationType,
          date: safeDate,
          time: safeTime,
          patientInfo: {
            name: safeName,
            email: safeEmail,
            phone: safePhone,
            age: bookingDetails.patientInfo?.age || '30',
            gender: bookingDetails.patientInfo?.gender || 'Male',
            medicalHistory: bookingDetails.patientInfo?.medicalHistory || 'Consultation via AI Doctor',
            currentMedications: bookingDetails.patientInfo?.currentMedications || ''
          },
          amount: bookingDetails.amount,
          currency: bookingDetails.currency || 'INR',
          documents: bookingDetails.documents || []
        };
        localStorage.setItem('cashfree_booking_details', JSON.stringify(persistPayload));
        sessionStorage.setItem('cashfree_payment_details', JSON.stringify({ bookingDetails: persistPayload }));

        // Create Cashfree order via NephroConsult backend
        const response = await fetch(`${API_BASE}/api/payments/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: persistPayload.amount,
            currency: persistPayload.currency,
            consultationType: safeConsultationType,
            patientName: safeName,
            patientEmail: safeEmail,
            patientPhone: safePhone,
            date: safeDate,
            time: safeTime,
            documents: persistPayload.documents || [],
            patientInfo: persistPayload.patientInfo
          })
        });

        const orderData = await response.json();

        if (!orderData.success || !orderData.order?.paymentSessionId) {
          throw new Error(orderData.message || 'Failed to create payment order.');
        }

        // Persist order details for 4-tier verification fallback in PaymentSuccess.tsx
        const sessionPayload = {
          orderId: orderData.order.id,
          paymentSessionId: orderData.order.paymentSessionId,
          cashfreeAppId: orderData.cashfree_app_id,
          bookingDetails: persistPayload
        };
        sessionStorage.setItem('cashfree_payment_details', JSON.stringify(sessionPayload));
        localStorage.setItem('cashfree_last_order_id', orderData.order.id);

        // Wait for Cashfree SDK to be available
        let retries = 10;
        while (!window.Cashfree && retries-- > 0) {
          await new Promise(r => setTimeout(r, 300));
        }

        if (!window.Cashfree) {
          throw new Error('Cashfree SDK failed to load on parent window.');
        }

        const mode = orderData.environment === 'production' ? 'production' : 'sandbox';
        const cashfree = new window.Cashfree({ mode });

        setCashfreeStatus('processing');

        // Open official Cashfree checkout modal on the top-level parent window (not iframe)
        await cashfree.checkout({
          paymentSessionId: orderData.order.paymentSessionId,
          redirectTarget: '_modal'
        });

      } catch (err: any) {
        console.error('AIDoctorPage Cashfree bridge error:', err);
        alert(`Payment initiation failed: ${err?.message || 'Please try again.'}`);
      } finally {
        setCashfreeStatus('idle');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col">
      <Navigation 
        onLoginOpen={() => navigate('/?action=login')}
        onSignupOpen={() => navigate('/?action=signup')}
      />
      
      {/* Spacer for fixed navigation header (80px) */}
      <div className="h-20 shrink-0"></div>

      {/* Cashfree loading overlay (shown when processing payment from iframe postMessage) */}
      {cashfreeStatus !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-black text-sm">CF</span>
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg">
              {cashfreeStatus === 'loading' ? 'Preparing Payment...' : 'Opening Cashfree Gateway...'}
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              {cashfreeStatus === 'loading' 
                ? 'Creating your secure payment session.' 
                : 'Complete your payment in the Cashfree window.'}
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 w-full bg-[#0b0f19]">
        <iframe
          src="https://ai-assistant-frontend-lilac.vercel.app/assistant-embed?clinicId=nephroconsult-test"
          width="100%"
          style={{
            height: '750px',
            border: 'none',
            background: 'transparent',
            display: 'block'
          }}
          allow="microphone; speech-synthesis"
          title="AI Doctor Assistant"
        />
      </div>

      <Footer />
    </div>
  );
}
