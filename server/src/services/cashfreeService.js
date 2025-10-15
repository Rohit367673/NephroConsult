import { OrdersApi, PaymentsApi, CFEnvironment, CFConfig, ApiKeyAuth } from 'cashfree-pg-sdk-nodejs';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { env, flags } from '../config.js';
import { z } from 'zod';

class CashfreeService {
  constructor() {
    this.ordersApi = null;
    this.paymentsApi = null;
    this.isInitialized = false;
    this.environment = 'unknown';
    this.initialize();
  }

  initialize() {
    try {
      // Check if credentials exist
      const paymentsEnabled = !!(env.CASHFREE_APP_ID && env.CASHFREE_SECRET_KEY);
      
      if (!paymentsEnabled) {
        console.warn('⚠️ Cashfree not initialized - credentials missing');
        console.warn('   CASHFREE_APP_ID:', env.CASHFREE_APP_ID ? 'SET' : 'MISSING');
        console.warn('   CASHFREE_SECRET_KEY:', env.CASHFREE_SECRET_KEY ? 'SET' : 'MISSING');
        return;
      }

      // Validate credentials format
      if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) {
        throw new Error('Missing Cashfree credentials');
      }

      // Determine environment
      this.environment = env.CASHFREE_ENVIRONMENT || 'sandbox';

      // Initialize Cashfree APIs
      this.ordersApi = new OrdersApi();
      this.paymentsApi = new PaymentsApi();

      // Set the correct base path based on environment
      const baseUrl = this.environment === 'production' 
        ? 'https://api.cashfree.com/pg' 
        : 'https://sandbox.cashfree.com/pg';
      
      this.ordersApi.basePath = baseUrl;
      this.paymentsApi.basePath = baseUrl;

      this.isInitialized = true;
      
      // Enhanced logging based on environment
      if (this.environment === 'sandbox') {
        console.log(`✅ Cashfree initialized in SANDBOX mode`);
        console.log(`   🔧 Using sandbox credentials for safe development`);
        console.log(`   💳 Test payments will work, no real money charged`);
      } else {
        console.log(`✅ Cashfree initialized in PRODUCTION mode`);
        console.log(`   💰 Using production credentials - REAL MONEY WILL BE CHARGED`);
        console.log(`   🚀 Production environment detected`);
      }
      
      // Environment mismatch warnings
      if (this.environment === 'production' && env.NODE_ENV === 'development') {
        console.warn('⚠️ WARNING: Using PRODUCTION Cashfree keys in development environment!');
        console.warn('   This will charge real money. Consider using sandbox keys for development.');
      }
      
      if (this.environment === 'sandbox' && env.NODE_ENV === 'production') {
        console.warn('⚠️ WARNING: Using SANDBOX Cashfree keys in production environment!');
        console.warn('   No real payments will be processed. Use production keys for production.');
      }

    } catch (error) {
      console.error('❌ Cashfree initialization failed:', error.message);
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
      order_id: z.string().min(1),
      payment_id: z.string().optional(),
      booking_details: z.object({
        consultationType: z.string(),
        patientName: z.string(),
        patientEmail: z.string().email(),
        date: z.string(),
        time: z.string(),
        amount: z.number().positive(),
        currency: z.string(),
      }).optional(),
    });
  }

  // Create Cashfree order with full validation
  async createOrder(orderData, userId) {
    try {
      if (!this.isInitialized) {
        throw new Error('Cashfree not properly initialized');
      }

      // Validate input with detailed error logging
      console.log('💳 Validating order data:', orderData);
      const validatedData = this.getOrderSchema().parse(orderData);
      console.log('✅ Validation passed:', validatedData);
      
      // Generate secure order ID
      const timestamp = Date.now().toString();
      const environment = this.environment === 'sandbox' ? 'T' : 'L';
      const userHash = crypto.createHash('md5').update(userId).digest('hex').slice(0, 6);
      const orderId = `order_${environment}_${timestamp.slice(-8)}_${userHash}`;

      // Prepare order options
      const orderOptions = {
        orderId: orderId,
        orderAmount: validatedData.amount,
        orderCurrency: validatedData.currency,
        orderNote: `${validatedData.consultationType} consultation - ${validatedData.date} at ${validatedData.time}`,
        customerDetails: {
          customerId: userId,
          customerName: validatedData.patientName,
          customerEmail: validatedData.patientEmail,
          customerPhone: validatedData.patientPhone,
        },
        orderMeta: {
          returnUrl: this.getReturnUrl(),
          notifyUrl: this.getNotifyUrl(),
        },
        orderTags: {
          consultation_type: validatedData.consultationType,
          patient_name: validatedData.patientName,
          patient_email: validatedData.patientEmail,
          patient_phone: validatedData.patientPhone,
          appointment_date: validatedData.date,
          appointment_time: validatedData.time,
          user_id: userId,
          environment: this.environment,
          created_at: new Date().toISOString(),
        }
      };

      console.log(`💳 Creating Cashfree order:`, {
        orderId: orderOptions.orderId,
        amount: orderOptions.orderAmount,
        currency: orderOptions.orderCurrency,
        environment: this.environment
      });

      // Create order via Cashfree API with correct parameter order
      const order = await this.ordersApi.createOrder(
        env.CASHFREE_APP_ID,           // xClientId
        env.CASHFREE_SECRET_KEY,       // xClientSecret
        '2023-08-01',                  // xApiVersion
        false,                         // xIdempotencyReplayed
        undefined,                     // xIdempotencyKey
        undefined,                     // xRequestId
        orderOptions                   // cFOrderRequest
      );

      console.log(`✅ Cashfree order created: ${order.cfOrder.orderId}`);
      console.log('Full Cashfree order response:', JSON.stringify(order, null, 2));

      return {
        success: true,
        order: {
          id: order.cfOrder.orderId,
          amount: order.cfOrder.orderAmount,
          currency: order.cfOrder.orderCurrency,
          status: order.cfOrder.orderStatus,
          paymentSessionId: order.cfOrder.paymentSessionId || order.cfOrder.sessionToken || order.cfOrder.payment_session_id,
        },
        cashfree_app_id: env.CASHFREE_APP_ID,
        environment: this.environment,
      };

    } catch (error) {
      console.error('❌ Cashfree order creation failed:', error);
      
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

  // Verify payment
  async verifyPayment(paymentData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Cashfree not properly initialized');
      }

      // Validate input
      const validatedData = this.getVerificationSchema().parse(paymentData);
      const { order_id, payment_id } = validatedData;

      // Strategy: if payment_id present, fetch by payment_id; else fetch payments for order
      let paymentDetails = null;
      if (payment_id) {
        try {
          paymentDetails = await this.paymentsApi.getPaymentbyId(
            env.CASHFREE_APP_ID,
            env.CASHFREE_SECRET_KEY,
            '2023-08-01',
            false,
            undefined,
            undefined,
            payment_id
          );
        } catch (fetchError) {
          console.error('❌ Failed to fetch payment by ID:', fetchError);
        }
      }
      // Normalize SDK response (ensure we always have { cfPayment: {...} })
      if (paymentDetails) {
        const raw = paymentDetails.cfPayment || paymentDetails.payment || paymentDetails;
        paymentDetails = { cfPayment: raw };
      }

      if (!paymentDetails) {
        // Fallback with polling: fetch payments for the order and pick a successful one
        const baseUrl = this.environment === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
        const url = `${baseUrl}/orders/${order_id}/payments`;
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const MAX_RETRIES = 10;
        const DELAY_MS = 1500;

        let successful = null;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          const resp = await fetch(url, {
            method: 'GET',
            headers: {
              'x-client-id': env.CASHFREE_APP_ID,
              'x-client-secret': env.CASHFREE_SECRET_KEY,
              'x-api-version': '2023-08-01',
            },
          });
        }
        if (!successful) {
          // Final fallback: check order status directly
          const MAX_ORDER_RETRIES = 5;
          let paid = null;
          for (let attempt = 1; attempt <= MAX_ORDER_RETRIES; attempt++) {
            try {
              const orderResp = await this.ordersApi.getOrder(
                env.CASHFREE_APP_ID,
                env.CASHFREE_SECRET_KEY,
                order_id,
                '2023-08-01',
                false,
                undefined,
                undefined
              );
              const status = orderResp?.cfOrder?.orderStatus || orderResp?.orderStatus;
              if (['PAID', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'CAPTURED'].includes(String(status).toUpperCase())) {
                paid = orderResp;
                break;
              }
            } catch (e) {
              // swallow and retry
            }
            if (attempt < MAX_ORDER_RETRIES) await sleep(DELAY_MS);
          }
          if (!paid) {
            return { success: false, error: 'No successful payment found for order after retries' };
          }
          // Map order PAID to a pseudo payment object
          paymentDetails = {
            cfPayment: {
              orderAmount: paid.cfOrder?.orderAmount,
              orderCurrency: paid.cfOrder?.orderCurrency,
              paymentStatus: 'SUCCESS',
              paymentMethod: paid.cfOrder?.paymentMethod || 'UNKNOWN',
              paymentTime: paid.cfOrder?.createdAt || new Date().toISOString(),
            }
          };
        } else {
          paymentDetails = { cfPayment: successful.cfPayment || successful };
        }
      }

      // Additional validations (with order-status fallback)
      let statusNorm = String(
        paymentDetails.cfPayment.paymentStatus ||
        paymentDetails.cfPayment.status ||
        paymentDetails.cfPayment.payment_status ||
        ''
      ).toUpperCase();
      if (!['SUCCESS', 'SUCCESSFUL', 'PAID', 'COMPLETED', 'CAPTURED'].includes(statusNorm)) {
        try {
          const orderResp = await this.ordersApi.getOrder(
            env.CASHFREE_APP_ID,
            env.CASHFREE_SECRET_KEY,
            order_id,
            '2023-08-01',
            false,
            undefined,
            undefined
          );
          const orderStatus = String(orderResp?.cfOrder?.orderStatus || orderResp?.orderStatus || '').toUpperCase();
          if (['PAID', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'CAPTURED'].includes(orderStatus)) {
            // Build normalized payment from order
            const normalizedPaymentFromOrder = {
              id: payment_id || paymentDetails.cfPayment.cfPaymentId || paymentDetails.cfPayment.payment_id || paymentDetails.cfPayment.id || orderResp?.cfOrder?.orderId,
              order_id: order_id,
              amount: orderResp?.cfOrder?.orderAmount,
              currency: orderResp?.cfOrder?.orderCurrency,
              status: orderStatus,
              method: paymentDetails.cfPayment.paymentMethod || paymentDetails.cfPayment.method || 'UNKNOWN',
              created_at: paymentDetails.cfPayment.paymentTime || paymentDetails.cfPayment.created_at || orderResp?.cfOrder?.createdAt || new Date().toISOString(),
            };
            console.log('✅ Payment verified via order status fallback:', normalizedPaymentFromOrder);
            return { success: true, payment: normalizedPaymentFromOrder };
          }
        } catch (e) {
          console.warn('⚠️ Order status fallback check failed:', e?.message);
        }
        return {
          success: false,
          error: `Payment not successful. Status: ${paymentDetails.cfPayment.paymentStatus || paymentDetails.cfPayment.status || paymentDetails.cfPayment.payment_status}`
        };
      }

      const normalizedPayment = {
        id: payment_id || paymentDetails.cfPayment.cfPaymentId || paymentDetails.cfPayment.payment_id || paymentDetails.cfPayment.id,
        order_id: order_id,
        amount: paymentDetails.cfPayment.orderAmount || paymentDetails.cfPayment.amount,
        currency: paymentDetails.cfPayment.orderCurrency || paymentDetails.cfPayment.currency,
        status: statusNorm,
        method: paymentDetails.cfPayment.paymentMethod || paymentDetails.cfPayment.method,
        created_at: paymentDetails.cfPayment.paymentTime || paymentDetails.cfPayment.created_at,
      };

      console.log('✅ Payment verified successfully:', normalizedPayment);

      return {
        success: true,
        payment: normalizedPayment,
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

  // Get return URL - use HTTPS for production, handle localhost for development
  getReturnUrl() {
    const baseUrl = env.CLIENT_URL;
    
    // Prefer returning to the actual client URL when in SANDBOX (dev/local allowed)
    if (this.environment === 'sandbox' && baseUrl) {
      return `${baseUrl}/payment/success?order_id={order_id}`;
    }

    // In PRODUCTION require HTTPS; if CLIENT_URL is already HTTPS use it
    if (baseUrl && baseUrl.startsWith('https://')) {
      return `${baseUrl}/payment/success?order_id={order_id}`;
    }

    // Fallback to public domain (ensure correct spelling)
    return `https://nephroconsultation.com/payment/success?order_id={order_id}`;
  }

  // Get notify URL for webhooks
  getNotifyUrl() {
    const baseUrl = env.CLIENT_URL;
    
    // For production or if already HTTPS, use as-is
    if (baseUrl.startsWith('https://')) {
      return `${baseUrl}/api/payments/webhook`;
    }
    
    // For development, use production webhook URL
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      return `https://nephroconsultation.com/api/payments/webhook`;
    }
    
    // Default fallback
    return `https://nephroconsultation.com/api/payments/webhook`;
  }

  // Get service status
  getStatus() {
    const paymentsEnabled = !!(env.CASHFREE_APP_ID && env.CASHFREE_SECRET_KEY);
    return {
      initialized: this.isInitialized,
      environment: this.environment,
      paymentsEnabled: paymentsEnabled,
      appId: env.CASHFREE_APP_ID ? `${env.CASHFREE_APP_ID.substring(0, 12)}...` : 'Not set',
      nodeEnv: env.NODE_ENV,
      isLive: this.environment === 'production',
      isTest: this.environment === 'sandbox',
      environmentMatch: this.getEnvironmentMatch(),
      warnings: this.getWarnings()
    };
  }

  // Check if environment and keys match appropriately
  getEnvironmentMatch() {
    if (!this.isInitialized) return 'unknown';
    
    const isProduction = env.NODE_ENV === 'production';
    const hasLiveKeys = this.environment === 'production';
    
    if (isProduction && hasLiveKeys) return 'optimal'; // Production with live keys
    if (!isProduction && !hasLiveKeys) return 'optimal'; // Development with sandbox keys
    if (isProduction && !hasLiveKeys) return 'warning'; // Production with sandbox keys
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
    
    if (this.environment === 'production' && env.NODE_ENV === 'development') {
      warnings.push('Using PRODUCTION keys in development - real money will be charged!');
    }
    
    if (this.environment === 'sandbox' && env.NODE_ENV === 'production') {
      warnings.push('Using SANDBOX keys in production - no real payments will work!');
    }
    
    return warnings;
  }

  // Health check - verify Cashfree API connectivity
  async healthCheck() {
    try {
      if (!this.isInitialized) {
        return { healthy: false, error: 'Service not initialized' };
      }

      // Try to fetch order details (this will fail but confirms API connectivity)
      try {
        await this.ordersApi.getOrder(
          env.CASHFREE_APP_ID,        // xClientId
          env.CASHFREE_SECRET_KEY,    // xClientSecret
          'dummy_test_order_12345',   // orderId
          '2023-08-01',               // xApiVersion
          false,                      // xIdempotencyReplayed
          undefined,                  // xIdempotencyKey
          undefined                   // xRequestId
        );
      } catch (apiError) {
        // Expected error - means API is reachable
        if (apiError.message && apiError.message.includes('Order not found')) {
          return { healthy: true, environment: this.environment };
        }
        throw apiError;
      }

      return { healthy: true, environment: this.environment };
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const cashfreeService = new CashfreeService();
export default cashfreeService;
