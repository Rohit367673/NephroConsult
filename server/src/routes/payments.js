import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { sendPaymentEmail, sendBookingEmail } from '../utils/email.js';
import { cashfreeService } from '../services/cashfreeService.js';
import { z } from 'zod';
import crypto from 'crypto';
import { env, flags } from '../config.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { priceFor, mapConsultationTypeId } from '../utils/pricing.js';
import { generateMeetLink } from '../utils/meet.js';
import { scheduleAppointmentReminder } from '../jobs.js';
import { telegramService } from '../services/telegramService.js';

const router = express.Router();

// Create Cashfree order
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    console.log('💳 Payment order request received');
    console.log('💳 Session exists:', !!req.session);
    console.log('💳 Session user:', req.session?.user?.email);
    console.log('💳 Session ID:', req.sessionID);
    console.log('💳 Request headers:', req.headers);
    console.log('💳 Request body:', req.body);
    
    // Check if service is available
    const status = cashfreeService.getStatus();
    console.log('💳 Cashfree service status:', status);
    
    if (!status.initialized) {
      console.error('❌ Cashfree service not initialized');
      return res.status(503).json({
        error: 'Payment service unavailable',
        message: 'Cashfree service not properly initialized',
        debug: status
      });
    }

    // Snapshot booking data into session for use after redirect (fallback)
    try {
      req.session.pendingBookingDetails = {
        consultationType: req.body?.consultationType,
        patientName: req.body?.patientName,
        patientEmail: req.body?.patientEmail,
        patientPhone: req.body?.patientPhone,
        date: req.body?.date,
        time: req.body?.time,
        amount: req.body?.amount,
        currency: req.body?.currency,
        persistedAt: new Date().toISOString(),
      };
      await new Promise((r) => req.session.save(r));
      console.log('🗂️ Saved pending booking details in session for verification fallback');
    } catch (sessErr) {
      console.warn('⚠️ Could not persist pendingBookingDetails in session:', sessErr?.message);
    }

    console.log('💳 Creating order with service...');
    
    // Create order using the service
    const result = await cashfreeService.createOrder(req.body, req.session.user.id);
    
    console.log('✅ Order created successfully:', result);
    return res.json(result);

  } catch (error) {
    console.error('❌ Payment order creation failed:', error);
    console.error('❌ Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Failed to create payment order',
      message: error.message,
      details: error.stack
    });
  }
});

// Verify Cashfree payment
router.post('/verify-payment', requireAuth, async (req, res) => {
  try {
    console.log('💳 Payment verification request from user:', req.session?.user?.email);
    
    // Check if service is available
    const status = cashfreeService.getStatus();
    if (!status.initialized) {
      return res.status(503).json({
        error: 'Payment service unavailable',
        message: 'Cashfree service not properly initialized'
      });
    }

    // Verify payment using the service
    const result = await cashfreeService.verifyPayment(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const { payment } = result;

    // Fetch order details to derive metadata/tags when client booking_details are missing
    const orderIdFromReq = req.body?.order_id;
    let orderInfo = null;
    try {
      if (orderIdFromReq && cashfreeService?.ordersApi) {
        orderInfo = await cashfreeService.ordersApi.getOrder(
          env.CASHFREE_APP_ID,
          env.CASHFREE_SECRET_KEY,
          orderIdFromReq,
          '2023-08-01',
          false,
          undefined,
          undefined
        );
        console.log('🧾 Cashfree order fetched for verification:', {
          orderId: orderIdFromReq,
          status: orderInfo?.cfOrder?.orderStatus || orderInfo?.orderStatus,
          hasTags: !!(orderInfo?.cfOrder?.orderTags || orderInfo?.orderTags),
        });
      }
    } catch (orderErr) {
      console.warn('⚠️ Failed to fetch order details for appointment derivation:', orderErr?.message);
    }

    // Send payment confirmation email
    try {
      const details = req.body.booking_details;
      if (details && details.patientEmail) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #006f6f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; }
              .details { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Payment Successful!</h1>
                <p>NephroConsult - International Kidney Care</p>
              </div>
              <div class="content">
                <div class="success">
                  <h3>✅ Payment Confirmed</h3>
                  <p>Your payment has been successfully processed. Your consultation is confirmed!</p>
                </div>
                <div class="details">
                  <h4>Payment Details:</h4>
                  <p><strong>Payment ID:</strong> ${payment.id}</p>
                  <p><strong>Order ID:</strong> ${payment.order_id}</p>
                  <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
                  <p><strong>Status:</strong> ${payment.status}</p>
                </div>
                <div class="details">
                  <h4>Consultation Details:</h4>
                  <p><strong>Type:</strong> ${details.consultationType}</p>
                  <p><strong>Patient:</strong> ${details.patientName}</p>
                  <p><strong>Date:</strong> ${details.date}</p>
                  <p><strong>Time:</strong> ${details.time}</p>
                  <p><strong>Doctor:</strong> Dr. Ilango Krishnamurthy (Sr. Nephrologist)</p>
                </div>
                <p>You will receive your consultation link closer to the appointment time.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendPaymentEmail(
          details.patientEmail,
          'Payment Successful - NephroConsult',
          emailHtml
        );
      }
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      // Don't fail the payment verification if email fails
    }

    // Best-effort: create appointment automatically (use booking_details or fallback to session snapshot or order tags)
    let createdAppointment = null;
    try {
      const tags = orderInfo?.cfOrder?.orderTags || orderInfo?.orderTags || {};
      const sessionSnapshot = req.session?.pendingBookingDetails;
      const details = req.body.booking_details || sessionSnapshot || (
        orderInfo ? {
          consultationType: tags.consultation_type || tags.consultationType || 'initial',
          patientName: tags.patient_name || tags.patientName,
          patientEmail: tags.patient_email || tags.patientEmail,
          patientPhone: tags.patient_phone || tags.patientPhone,
          date: tags.appointment_date || tags.appointmentDate,
          time: tags.appointment_time || tags.appointmentTime,
          amount: orderInfo?.cfOrder?.orderAmount || orderInfo?.orderAmount,
          currency: orderInfo?.cfOrder?.orderCurrency || orderInfo?.orderCurrency,
        } : undefined
      );

      console.log('🔍 Payment verification - received data:', {
        hasBookingDetails: !!req.body.booking_details,
        hasSessionSnapshot: !!sessionSnapshot,
        hasOrderTags: !!orderInfo,
        detailsType: typeof details,
        detailsKeys: details ? Object.keys(details) : [],
        hasIntake: details?.intake ? true : false,
        intakeKeys: details?.intake ? Object.keys(details.intake) : [],
        intakeDocuments: details?.intake?.documents?.length || 0,
        patientInfoKeys: details?.patientInfo ? Object.keys(details.patientInfo) : [],
        medicalHistory: details?.patientInfo?.medicalHistory?.substring(0, 50) + '...' || 'No medical history',
      });

      if (!details) {
        console.warn('⚠️ Payment verification: No booking details from client or order tags; skipping auto appointment creation');
      } else {
        const sessionUser = req.session.user || {};
        const userDoc = await User.findById(sessionUser.id).lean().catch(() => null);

        const resolvedCountry = userDoc?.country
          || details.patientCountry
          || (details.currency === 'INR' ? 'IN' : details.currency === 'USD' ? 'US' : 'default');
        const pricing = priceFor(resolvedCountry);
        const typeId = String(details.consultationType || 'initial');
        const typeName = mapConsultationTypeId(typeId);

        // Use paid amount/currency if provided, else fallback to pricing
        const amount = Number(details.amount) || pricing.consultation;
        const currency = String(details.currency || pricing.currency);

        const patientName = userDoc?.name || sessionUser.name || details.patientName;
        const patientEmail = userDoc?.email || sessionUser.email || details.patientEmail;
        const patientPhone = userDoc?.phone || details.patientPhone || details.patientInfo?.phone || sessionUser.phone;

        const patientId = userDoc?._id || sessionUser.id;

        if (!patientId) {
          console.warn('⚠️ Payment verification: Unable to resolve patient ID for appointment creation');
        }

        console.log('🗓️ Creating appointment after payment verification with:', {
          patientId,
          patientName,
          patientEmail,
          patientPhone,
          resolvedCountry,
          typeName,
          amount,
          currency,
          date: details.date,
          time: details.time,
          derivedFrom: req.body.booking_details ? 'client_payload' : (sessionSnapshot ? 'session_snapshot' : 'cashfree_order_tags'),
          hasIntake: !!details.intake,
          intakeDocuments: details.intake?.documents?.length || 0,
          intakeDescription: details.intake?.description || 'No description',
          medicalHistory: details.patientInfo?.medicalHistory || 'No medical history provided',
          currentMedications: details.patientInfo?.currentMedications || 'No medications provided',
          directDocuments: details.documents?.length || 0,
        });

        // Construct intake object from available data
        let intakeData = null;
        if (details.patientInfo?.medicalHistory || details.intake?.documents || details.documents || details.patientInfo?.currentMedications) {
          intakeData = {
            address: details.patientInfo?.currentMedications || details.intake?.address || '', // Use currentMedications as address field for now
            description: details.patientInfo?.medicalHistory || details.intake?.description || 'No medical history provided',
            documents: Array.isArray(details.intake?.documents) ? details.intake.documents :
                      Array.isArray(details.documents) ? details.documents : undefined,
          };
        }

        createdAppointment = await Appointment.create({
          patient: {
            id: patientId,
            name: patientName,
            email: patientEmail,
            phone: patientPhone,
            country: resolvedCountry,
          },
          doctor: {
            name: 'Dr. Ilango S. Prakasam',
            title: 'Sr. Nephrologist',
            qualifications: 'MD, DNB (Nephrology), MRCP (UK)',
            experience: '15+ Years Experience',
            email: env.OWNER_EMAIL || 'suyambu54321@gmail.com'
          },
          date: details.date,
          timeSlot: details.time,
          type: typeName,
          status: 'confirmed',
          price: {
            amount,
            currency,
            symbol: pricing.symbol,
            region: resolvedCountry,
            discountApplied: false,
          },
          meetLink: generateMeetLink(details.date, details.time),
          intake: intakeData,
        });

        console.log('💾 Appointment saved with intake data:', {
          appointmentId: createdAppointment._id,
          intakeData: createdAppointment.intake,
          intakeDescription: createdAppointment.intake?.description?.substring(0, 100) + '...',
          intakeDocumentsCount: createdAppointment.intake?.documents?.length || 0,
          patientPhone: createdAppointment.patient?.phone,
        });

        // Verify the appointment was saved correctly
        const savedAppointment = await Appointment.findById(createdAppointment._id).lean();
        if (savedAppointment) {
          console.log('✅ Appointment verified in database:', {
            id: savedAppointment._id,
            hasIntake: !!savedAppointment.intake,
            intakeDocuments: savedAppointment.intake?.documents?.length || 0,
            intakeDescription: savedAppointment.intake?.description?.substring(0, 50) + '...',
            patientPhone: savedAppointment.patient?.phone,
          });
        } else {
          console.error('❌ Appointment not found in database after creation!');
        }

        // Schedule reminder and send Telegram notification (non-blocking)
        try { await scheduleAppointmentReminder(createdAppointment); } catch (jobErr) {
          console.warn('⚠️ Reminder scheduling failed:', jobErr.message);
        }
        try {
          await telegramService.notifyNewAppointment({
            patientName,
            patientEmail,
            phone: patientPhone,
            date: createdAppointment.date,
            timeSlot: createdAppointment.timeSlot,
            amount: createdAppointment.price.amount,
            consultationType: createdAppointment.type,
            symptoms: intakeData?.description || 'No symptoms provided',
            medicalHistory: intakeData?.address || 'No current medications',
          });
        } catch (telegramErr) {
          console.warn('⚠️ Telegram notification failed:', telegramErr.message);
        }

        // Send booking confirmation email (best-effort)
        try {
          const recipient = patientEmail || userDoc?.email;
          if (recipient) {
            const html = `
              <p>Dear ${patientName || 'Patient'},</p>
              <p>Your consultation has been confirmed.</p>
              <p><strong>Date:</strong> ${createdAppointment.date}<br/>
              <strong>Time:</strong> ${createdAppointment.timeSlot}<br/>
              <strong>Type:</strong> ${createdAppointment.type}<br/>
              <strong>Amount:</strong> ${createdAppointment.price.symbol}${createdAppointment.price.amount} ${createdAppointment.price.currency}</p>
              <p><a href="${createdAppointment.meetLink}">Join Video Consultation</a></p>
            `;
            await sendBookingEmail(recipient, 'Booking Confirmed - NephroConsult', html);
          }
        } catch (emailErr) {
          console.warn('⚠️ Booking confirmation email failed:', emailErr.message);
        }
      }
      // Clear the snapshot after use (success path)
      try { if (req.session?.pendingBookingDetails) { req.session.pendingBookingDetails = null; await new Promise((r)=>req.session.save(r)); } } catch {}
    } catch (createErr) {
      console.error('⚠️ Appointment creation after payment failed (non-blocking):', createErr.message);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: payment,
      appointment: createdAppointment ? { id: createdAppointment._id } : undefined,
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment verification failed',
      message: error.message
    });
  }
});

// Cashfree webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookBody = req.body;
    const webhookSignature = req.headers['x-cashfree-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', env.CASHFREE_SECRET_KEY)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(webhookBody);
    console.log('Cashfree webhook received:', event.type);

    // Handle different webhook events
    switch (event.type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        console.log('Payment successful:', event.data);
        // Handle successful payment
        break;
      
      case 'PAYMENT_FAILED_WEBHOOK':
        console.log('Payment failed:', event.data);
        // Handle failed payment
        break;
      
      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        console.log('Payment user dropped:', event.data);
        // Handle user dropped payment
        break;
      
      default:
        console.log('Unhandled webhook event:', event.type);
    }

    res.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get payment configuration
router.get('/config', (req, res) => {
  const status = cashfreeService.getStatus();
  
  res.json({
    paymentsEnabled: status.initialized,
    cashfreeAppId: status.initialized ? status.appId : null,
    environment: status.environment,
    isLive: status.environment === 'production',
    isTest: status.environment === 'sandbox',
    nodeEnv: process.env.NODE_ENV,
  });
});

// Test endpoint for development/testing (bypasses authentication)
// NOTE: This endpoint is automatically disabled in production
router.post('/test-create-order', async (req, res) => {
  try {
    if (env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    if (!flags.paymentsEnabled) {
      return res.status(503).json({ 
        error: 'Payment service not configured',
        message: 'Cashfree credentials not provided'
      });
    }

    const orderSchema = z.object({
      amount: z.number().positive(),
      currency: z.string().min(3).max(3),
      consultationType: z.string(),
      patientName: z.string(),
      patientEmail: z.string().email(),
      patientPhone: z.string(),
      date: z.string(),
      time: z.string(),
    });

    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: parsed.error.flatten()
      });
    }

    const { amount, currency, consultationType, patientName, patientEmail, patientPhone, date, time } = parsed.data;

    // Create Cashfree order  
    const isLive = env.CASHFREE_ENVIRONMENT === 'production';
    const orderId = `order_${isLive ? 'L' : 'T'}_${Date.now().toString().slice(-10)}`;
    
    // Format data for the createOrder method
    const orderData = {
      amount: amount,
      currency: currency.toUpperCase(),
      consultationType: consultationType,
      patientName: patientName,
      patientEmail: patientEmail,
      patientPhone: patientPhone,
      date: date,
      time: time,
    };

    const order = await cashfreeService.createOrder(orderData, 'test_user_123');

    console.log('Test Cashfree order created:', order);

    res.json({
      success: order.success,
      order: order.order,
      cashfree_app_id: order.cashfree_app_id,
      environment: order.environment,
    });

  } catch (error) {
    console.error('Error creating test Cashfree order:', error);
    res.status(500).json({ 
      error: 'Failed to create test payment order',
      message: error.message
    });
  }
});

// Test endpoint for payment verification (bypasses authentication)
// NOTE: This endpoint is automatically disabled in production
router.post('/test-verify-payment', async (req, res) => {
  try {
    if (env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    if (!flags.paymentsEnabled) {
      return res.status(503).json({ 
        error: 'Payment service not configured'
      });
    }

    const verifySchema = z.object({
      order_id: z.string(),
      payment_id: z.string().optional(),
      booking_details: z.object({
        consultationType: z.string(),
        patientName: z.string(),
        patientEmail: z.string(),
        date: z.string(),
        time: z.string(),
        amount: z.number(),
        currency: z.string(),
      }),
    });

    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid verification data',
        details: parsed.error.flatten()
      });
    }

    const { order_id, payment_id, booking_details } = parsed.data;

    // For test mode, simulate successful payment data
    const mockPayment = {
      id: payment_id,
      orderAmount: booking_details.amount,
      orderCurrency: booking_details.currency,
      paymentStatus: 'SUCCESS',
      paymentMethod: 'card',
      paymentTime: new Date().toISOString()
    };

    console.log('Test payment verified successfully:', {
      payment_id: payment_id,
      order_id: order_id,
      amount: mockPayment.orderAmount,
      status: mockPayment.paymentStatus
    });

    res.json({
      success: true,
      message: 'Test payment verified successfully',
      payment: {
        id: payment_id,
        order_id: order_id,
        amount: mockPayment.orderAmount,
        currency: mockPayment.orderCurrency,
        status: mockPayment.paymentStatus,
        method: mockPayment.paymentMethod,
        created_at: mockPayment.paymentTime,
      },
    });

  } catch (error) {
    console.error('Error verifying test payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Test payment verification failed',
      message: error.message
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const healthCheck = await cashfreeService.healthCheck();
    
    if (healthCheck.healthy) {
      res.json({
        status: 'healthy',
        environment: healthCheck.environment,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        error: healthCheck.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Temporary endpoint without auth for debugging (will remove after fixing)
router.post('/create-order-debug', async (req, res) => {
  try {
    console.log('💳 DEBUG: Payment order request without auth');
    console.log('💳 DEBUG: Request body:', req.body);
    
    // Check if service is available
    const status = cashfreeService.getStatus();
    console.log('💳 DEBUG: Cashfree service status:', status);
    
    if (!status.initialized) {
      return res.status(503).json({
        error: 'Payment service unavailable',
        message: 'Cashfree service not properly configured'
      });
    }

    // Validate request
    const schema = z.object({
      amount: z.number().positive(),
      currency: z.string().min(3).max(3),
      consultationType: z.string(),
      patientName: z.string(),
      patientEmail: z.string().email(),
      patientPhone: z.string(),
      date: z.string(),
      time: z.string(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: parsed.error.flatten()
      });
    }

    const { amount, currency, consultationType, patientName, patientEmail, patientPhone, date, time } = parsed.data;

    // Create order
    const result = await cashfreeService.createOrder({
      amount,
      currency,
      consultationType,
      patientName,
      patientEmail,
      patientPhone,
      date,
      time
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    console.log('💳 DEBUG: Order created successfully:', result.order.id);

    res.json({
      success: true,
      order: result.order,
      message: 'Debug: Order created without authentication'
    });

  } catch (error) {
    console.error('💳 DEBUG: Error creating payment order:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      message: error.message,
      debug: true
    });
  }
});

export default router;