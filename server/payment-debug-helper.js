import 'dotenv/config';
import { razorpayService } from './src/services/razorpayService.js';

console.log('🔧 Payment Debug Helper\n');

// Check service status
console.log('1. Razorpay Service Status:');
const status = razorpayService.getStatus();
console.log(status);

if (!status.initialized) {
  console.log('\n❌ Service not initialized!');
  console.log('Check your .env file has:');
  console.log('RAZORPAY_KEY_ID=rzp_test_...');
  console.log('RAZORPAY_KEY_SECRET=...');
  process.exit(1);
}

console.log('\n✅ Service initialized');

// Test order creation
console.log('\n2. Testing Order Creation:');
const testOrderData = {
  amount: 1800,
  currency: 'INR',
  consultationType: 'Follow-up Consultation',
  patientName: 'Test Patient',
  patientEmail: 'test@example.com',
  patientPhone: '+919876543210',
  date: '2025-10-08',
  time: '6:00 PM IST'
};

try {
  console.log('Test data:', testOrderData);
  const result = await razorpayService.createOrder(testOrderData, 'test_user_123');
  console.log('✅ Order creation successful:', result);
} catch (error) {
  console.log('❌ Order creation failed:', error.message);
  console.log('Error details:', error);
}
