import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env, flags } from '../config.js';
import { z } from 'zod';

class RazorpayService {
  constructor() {
    this.razorpay = null;
    this.isInitialized = false;
    this.environment = 'unknown';
    this.initialize();
  }

  initialize() {
    try {
      // Check if credentials exist
      const paymentsEnabled = !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
      
      if (!paymentsEnabled) {
        console.warn('⚠️ Razorpay not initialized - credentials missing');
        console.warn('   RAZORPAY_KEY_ID:', env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING');
        console.warn('   RAZORPAY_KEY_SECRET:', env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING');
        return;
      }

      // Validate credentials format
      if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new Error('Missing Razorpay credentials');
      }

      if (!env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
        throw new Error('Invalid Razorpay Key ID format');
      }

      // Determine environment based on key format
      this.environment = env.RAZORPAY_KEY_ID.includes('test') ? 'test' : 'live';

      // Initialize Razorpay
      this.razorpay = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });

      this.isInitialized = true;
      
      // Enhanced logging based on environment
      if (this.environment === 'test') {
        console.log(`✅ Razorpay initialized in TEST mode`);
        console.log(`   🔧 Using test credentials for safe development`);
        console.log(`   💳 Test cards will work, no real money charged`);
      } else {
        console.log(`✅ Razorpay initialized in LIVE mode`);
        console.log(`   💰 Using live credentials - REAL MONEY WILL BE CHARGED`);
        console.log(`   🚀 Production environment detected`);
      }
      
      // Environment mismatch warnings
      if (this.environment === 'live' && env.NODE_ENV === 'development') {
        console.warn('⚠️ WARNING: Using LIVE Razorpay keys in development environment!');
        console.warn('   This will charge real money. Consider using test keys for development.');
      }
      
      if (this.environment === 'test' && env.NODE_ENV === 'production') {
        console.warn('⚠️ WARNING: Using TEST Razorpay keys in production environment!');
        console.warn('   No real payments will be processed. Use live keys for production.');
      }

    } catch (error) {
      console.error('❌ Razorpay initialization failed:', error.message);
      this.isInitialized = false;
    }
  }

  // Validation schemas
  getOrderSchema() {
    return z.object({
      amount: z.number().positive().max(500000), // Max ₹5000 for safety
      currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
      consultationType: z.string().min(1).max(100),
      patientName: z.string().min(1).max(100),
      patientEmail: z.string().email(),
      patientPhone: z.string().min(1).max(20).transform(val => {
        // Clean and standardize phone number
        const cleaned = val.replace(/[^\d+]/g, ''); // Remove non-digit characters except +
        return cleaned || val; // Return original if cleaning results in empty string
      }),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().min(1).max(20),
    });
  }

  getVerificationSchema() {
    return z.object({
      razorpay_order_id: z.string().startsWith('order_'),
      razorpay_payment_id: z.string().startsWith('pay_'),
      razorpay_signature: z.string().min(1),
      booking_details: z.object({
        consultationType: z.string(),
        patientName: z.string(),
        patientEmail: z.string().email(),
        date: z.string(),
        time: z.string(),
        amount: z.number().positive(),
        currency: z.string(),
      }),
    });
  }

  // Create Razorpay order with full validation
  async createOrder(orderData, userId) {
    try {
      if (!this.isInitialized) {
        throw new Error('Razorpay not properly initialized');
      }

      // Validate input with detailed error logging
      console.log('💳 Validating order data:', orderData);
      const validatedData = this.getOrderSchema().parse(orderData);
      console.log('✅ Validation passed:', validatedData);
      
      // Generate secure receipt
      const timestamp = Date.now().toString();
      const environment = this.environment === 'test' ? 'T' : 'L';
      const userHash = crypto.createHash('md5').update(userId).digest('hex').slice(0, 6);
      const receipt = `${environment}_${timestamp.slice(-8)}_${userHash}`;

      // Prepare order options
      const orderOptions = {
        amount: validatedData.amount * 100, // Convert to paise
        currency: validatedData.currency,
        receipt: receipt,
        notes: {
          consultation_type: validatedData.consultationType,
          patient_name: validatedData.patientName,
          patient_email: validatedData.patientEmail,
          patient_phone: validatedData.patientPhone,
          appointment_date: validatedData.date,
          appointment_time: validatedData.time,
          user_id: userId,
          environment: this.environment,
          created_at: new Date().toISOString(),
        },
        payment_capture: 1, // Auto capture
      };

      console.log(`💳 Creating Razorpay order:`, {
        amount: orderOptions.amount / 100,
        currency: orderOptions.currency,
        receipt: orderOptions.receipt,
        environment: this.environment
      });

      // Create order via Razorpay API
      const order = await this.razorpay.orders.create(orderOptions);

      console.log(`✅ Razorpay order created: ${order.id}`);

      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
        },
        razorpay_key: env.RAZORPAY_KEY_ID,
        environment: this.environment,
      };

    } catch (error) {
      console.error('❌ Razorpay order creation failed:', error);
      
      if (error instanceof z.ZodError) {
        console.error('❌ Validation details:', {
          errors: error.errors,
          inputData: orderData
        });
        const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }
      
      throw new Error(`Order creation failed: ${error.message}`);
    }
  }

  // Verify payment signature
  async verifyPayment(paymentData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Razorpay not properly initialized');
      }

      // Validate input
      const validatedData = this.getVerificationSchema().parse(paymentData);
      
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validatedData;

      // Verify signature
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      const isSignatureValid = expectedSign === razorpay_signature;

      if (!isSignatureValid) {
        console.error('❌ Payment signature verification failed');
        return {
          success: false,
          error: 'Invalid payment signature'
        };
      }

      // Fetch payment details from Razorpay
      let paymentDetails = null;
      try {
        paymentDetails = await this.razorpay.payments.fetch(razorpay_payment_id);
      } catch (fetchError) {
        console.error('❌ Failed to fetch payment details:', fetchError);
        return {
          success: false,
          error: 'Failed to verify payment with Razorpay'
        };
      }

      // Additional validations
      if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
        return {
          success: false,
          error: `Payment not successful. Status: ${paymentDetails.status}`
        };
      }

      if (paymentDetails.order_id !== razorpay_order_id) {
        return {
          success: false,
          error: 'Payment order ID mismatch'
        };
      }

      console.log('✅ Payment verified successfully:', {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: paymentDetails.amount / 100,
        status: paymentDetails.status,
        method: paymentDetails.method
      });

      return {
        success: true,
        payment: {
          id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: paymentDetails.amount / 100,
          currency: paymentDetails.currency,
          status: paymentDetails.status,
          method: paymentDetails.method,
          created_at: new Date(paymentDetails.created_at * 1000).toISOString(),
          fee: paymentDetails.fee ? paymentDetails.fee / 100 : 0,
          tax: paymentDetails.tax ? paymentDetails.tax / 100 : 0,
        }
      };

    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
        };
      }
      
      return {
        success: false,
        error: `Verification failed: ${error.message}`
      };
    }
  }

  // Get service status
  getStatus() {
    const paymentsEnabled = !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
    return {
      initialized: this.isInitialized,
      environment: this.environment,
      paymentsEnabled: paymentsEnabled,
      keyId: env.RAZORPAY_KEY_ID ? `${env.RAZORPAY_KEY_ID.substring(0, 12)}...` : 'Not set',
      nodeEnv: env.NODE_ENV,
      isLive: this.environment === 'live',
      isTest: this.environment === 'test',
      environmentMatch: this.getEnvironmentMatch(),
      warnings: this.getWarnings()
    };
  }

  // Check if environment and keys match appropriately
  getEnvironmentMatch() {
    if (!this.isInitialized) return 'unknown';
    
    const isProduction = env.NODE_ENV === 'production';
    const hasLiveKeys = this.environment === 'live';
    
    if (isProduction && hasLiveKeys) return 'optimal'; // Production with live keys
    if (!isProduction && !hasLiveKeys) return 'optimal'; // Development with test keys
    if (isProduction && !hasLiveKeys) return 'warning'; // Production with test keys
    if (!isProduction && hasLiveKeys) return 'warning'; // Development with live keys
    
    return 'unknown';
  }

  // Get configuration warnings
  getWarnings() {
    const warnings = [];
    
    if (!this.isInitialized) {
      warnings.push('Service not initialized - check credentials');
      return warnings;
    }
    
    if (this.environment === 'live' && env.NODE_ENV === 'development') {
      warnings.push('Using LIVE keys in development - real money will be charged!');
    }
    
    if (this.environment === 'test' && env.NODE_ENV === 'production') {
      warnings.push('Using TEST keys in production - no real payments will work!');
    }
    
    return warnings;
  }

  // Health check - verify Razorpay API connectivity
  async healthCheck() {
    try {
      if (!this.isInitialized) {
        return { healthy: false, error: 'Service not initialized' };
      }

      // Try to fetch a dummy order (this will fail but confirms API connectivity)
      try {
        await this.razorpay.orders.fetch('order_dummy_test_12345');
      } catch (apiError) {
        // Expected error - means API is reachable
        if (apiError.statusCode === 400 && apiError.error.code === 'BAD_REQUEST_ERROR') {
          return { healthy: true, environment: this.environment };
        }
        throw apiError;
      }

      return { healthy: true, environment: this.environment };
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message,
        statusCode: error.statusCode 
      };
    }
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();
export default razorpayService;
