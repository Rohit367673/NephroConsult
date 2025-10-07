import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { env, flags } from '../config.js';
import { sendPaymentEmail } from '../utils/email.js';
import { validatePaymentEnvironment, getPaymentEnvironmentInfo, logPaymentEnvironment } from '../utils/paymentValidation.js';

const router = express.Router();

// Initialize Razorpay instance
let razorpay = null;
if (flags.paymentsEnabled) {
  // Validate and log payment environment
  const paymentInfo = logPaymentEnvironment();
  
  if (!paymentInfo.isValid) {
    console.error('❌ Payment configuration invalid:', paymentInfo.issues);
  }
  
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
  
  console.log(`✅ Razorpay initialized in ${paymentInfo.environment.toUpperCase()} mode`);
}

// Create Razorpay order
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    if (!flags.paymentsEnabled) {
      return res.status(503).json({ 
        error: 'Payment service not configured',
        message: 'Razorpay credentials not provided'
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

    // Create Razorpay order
    const isLive = !env.RAZORPAY_KEY_ID.includes('test');
    const options = {
      amount: amount * 100, // Amount in paise
      currency: currency.toUpperCase(),
      receipt: `${isLive ? 'L' : 'T'}_${Date.now().toString().slice(-8)}_${req.session.user.id.toString().slice(-6)}`,
      notes: {
        consultation_type: consultationType,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        appointment_date: date,
        appointment_time: time,
        user_id: req.session.user.id,
        environment: isLive ? 'live' : 'test',
      },
    };

    const order = await razorpay.orders.create(options);

    console.log('Razorpay order created:', order);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      razorpay_key: env.RAZORPAY_KEY_ID, // Send key to frontend
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      message: error.message
    });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', requireAuth, async (req, res) => {
  try {
    if (!flags.paymentsEnabled) {
      return res.status(503).json({ 
        error: 'Payment service not configured'
      });
    }

    const verifySchema = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_details } = parsed.data;

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isAuthentic = expectedSign === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ 
        success: false,
        error: 'Payment verification failed',
        message: 'Invalid payment signature'
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    console.log('Payment verified successfully:', {
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      amount: payment.amount / 100,
      status: payment.status
    });

    // Send payment confirmation email
    try {
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
                <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                <p><strong>Amount:</strong> ${payment.amount / 100} ${payment.currency}</p>
                <p><strong>Status:</strong> ${payment.status}</p>
              </div>
              <div class="details">
                <h4>Consultation Details:</h4>
                <p><strong>Type:</strong> ${booking_details.consultationType}</p>
                <p><strong>Patient:</strong> ${booking_details.patientName}</p>
                <p><strong>Date:</strong> ${booking_details.date}</p>
                <p><strong>Time:</strong> ${booking_details.time}</p>
                <p><strong>Doctor:</strong> Dr. Ilango Krishnamurthy (Sr. Nephrologist)</p>
              </div>
              <p>You will receive your consultation link closer to the appointment time.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendPaymentEmail(
        booking_details.patientEmail,
        'Payment Successful - NephroConsult',
        emailHtml
      );
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      // Don't fail the payment verification if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: new Date(payment.created_at * 1000).toISOString(),
      },
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

// Razorpay webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookBody = req.body;
    const webhookSignature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(webhookBody);
    console.log('Razorpay webhook received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        console.log('Payment captured:', event.payload.payment.entity);
        // Handle successful payment
        break;
      
      case 'payment.failed':
        console.log('Payment failed:', event.payload.payment.entity);
        // Handle failed payment
        break;
      
      case 'order.paid':
        console.log('Order paid:', event.payload.order.entity);
        // Handle order completion
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get payment configuration
router.get('/config', (req, res) => {
  const paymentInfo = getPaymentEnvironmentInfo();
  
  res.json({
    paymentsEnabled: flags.paymentsEnabled,
    razorpayKeyId: flags.paymentsEnabled ? env.RAZORPAY_KEY_ID : null,
    environment: paymentInfo.environment,
    isLive: paymentInfo.isLive,
    isTest: paymentInfo.isTest,
    isValid: paymentInfo.isValid,
    nodeEnv: env.NODE_ENV,
    warnings: paymentInfo.warnings
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
        message: 'Razorpay credentials not provided'
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

    // Create Razorpay order  
    const isLive = !env.RAZORPAY_KEY_ID.includes('test');
    const options = {
      amount: amount * 100, // Amount in paise
      currency: currency.toUpperCase(),
      receipt: `${isLive ? 'L' : 'T'}_${Date.now().toString().slice(-10)}`,
      notes: {
        consultation_type: consultationType,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        appointment_date: date,
        appointment_time: time,
        environment: isLive ? 'live' : 'test',
        test_endpoint: 'true', // This is specifically for test endpoint
      },
    };

    const order = await razorpay.orders.create(options);

    console.log('Test Razorpay order created:', order);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      razorpay_key: env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error creating test Razorpay order:', error);
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
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_details } = parsed.data;

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isAuthentic = expectedSign === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ 
        success: false,
        error: 'Payment verification failed',
        message: 'Invalid payment signature'
      });
    }

    // For test mode, simulate successful payment data
    const mockPayment = {
      id: razorpay_payment_id,
      amount: booking_details.amount * 100,
      currency: booking_details.currency,
      status: 'captured',
      method: 'card',
      created_at: Math.floor(Date.now() / 1000)
    };

    console.log('Test payment verified successfully:', {
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      amount: mockPayment.amount / 100,
      status: mockPayment.status
    });

    res.json({
      success: true,
      message: 'Test payment verified successfully',
      payment: {
        id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: mockPayment.amount / 100,
        currency: mockPayment.currency,
        status: mockPayment.status,
        method: mockPayment.method,
        created_at: new Date(mockPayment.created_at * 1000).toISOString(),
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

export default router;
