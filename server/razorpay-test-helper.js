import 'dotenv/config';
import Razorpay from 'razorpay';
import { env, flags } from './src/config.js';

console.log('🔧 Razorpay Test Helper');
console.log('='.repeat(50));

// Check configuration
console.log('\n📋 Configuration Check:');
console.log('Node Environment:', env.NODE_ENV);
console.log('Payments Enabled:', flags.paymentsEnabled);
console.log('Razorpay Key ID:', env.RAZORPAY_KEY_ID ? `${env.RAZORPAY_KEY_ID.substring(0, 12)}...` : 'NOT SET');
console.log('Razorpay Key Secret:', env.RAZORPAY_KEY_SECRET ? 'SET (hidden)' : 'NOT SET');

// Check if test mode
const isTestMode = env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID.includes('test');
console.log('Test Mode:', isTestMode ? '✅ YES' : '❌ NO (Live mode)');

if (!flags.paymentsEnabled) {
  console.log('\n❌ RAZORPAY NOT CONFIGURED');
  console.log('Please add these to your .env file:');
  console.log('RAZORPAY_KEY_ID=rzp_test_your_key_here');
  console.log('RAZORPAY_KEY_SECRET=your_secret_here');
  process.exit(1);
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

console.log('\n✅ Razorpay initialized successfully');

// Test creating an order
async function testCreateOrder() {
  try {
    console.log('\n🧪 Testing order creation...');
    
    const orderOptions = {
      amount: 200000, // ₹2000 in paise
      currency: 'INR',
      receipt: `TEST_${Date.now()}`,
      notes: {
        test: 'true',
        consultation_type: 'Initial Consultation',
        patient_name: 'Test Patient',
        environment: isTestMode ? 'test' : 'live'
      }
    };

    const order = await razorpay.orders.create(orderOptions);
    
    console.log('✅ Order created successfully:');
    console.log('  Order ID:', order.id);
    console.log('  Amount:', order.amount / 100, order.currency);
    console.log('  Status:', order.status);
    console.log('  Receipt:', order.receipt);
    
    return order;
  } catch (error) {
    console.log('❌ Order creation failed:');
    console.log('  Error:', error.message);
    console.log('  Description:', error.description);
    return null;
  }
}

// Test fetching order
async function testFetchOrder(orderId) {
  try {
    console.log('\n🔍 Testing order fetch...');
    const order = await razorpay.orders.fetch(orderId);
    
    console.log('✅ Order fetched successfully:');
    console.log('  ID:', order.id);
    console.log('  Status:', order.status);
    console.log('  Amount:', order.amount / 100, order.currency);
    
    return order;
  } catch (error) {
    console.log('❌ Order fetch failed:');
    console.log('  Error:', error.message);
    return null;
  }
}

// Test payments endpoint
async function testPaymentEndpoint() {
  try {
    console.log('\n🌐 Testing payment API endpoint...');
    
    const response = await fetch('http://localhost:4000/api/payments/config');
    
    if (response.ok) {
      const config = await response.json();
      console.log('✅ Payment config endpoint working:');
      console.log('  Payments Enabled:', config.paymentsEnabled);
      console.log('  Environment:', config.environment);
      console.log('  Is Test:', config.isTest);
      console.log('  Razorpay Key:', config.razorpayKeyId ? `${config.razorpayKeyId.substring(0, 12)}...` : 'Not provided');
    } else {
      console.log('❌ Payment config endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot reach payment endpoint:', error.message);
    console.log('  Make sure server is running on http://localhost:4000');
  }
}

// Run all tests
async function runTests() {
  // Test 1: Create order
  const order = await testCreateOrder();
  
  if (order) {
    // Test 2: Fetch order
    await testFetchOrder(order.id);
  }
  
  // Test 3: API endpoint
  await testPaymentEndpoint();
  
  console.log('\n✅ Razorpay test completed!');
  
  if (isTestMode) {
    console.log('\n💡 Test Mode Tips:');
    console.log('• Use test card: 4111 1111 1111 1111');
    console.log('• Any CVV: 123');
    console.log('• Any future expiry date');
    console.log('• Test payments won\'t charge real money');
  } else {
    console.log('\n⚠️  LIVE MODE WARNING:');
    console.log('• Real payments will be processed');
    console.log('• Use test keys for development');
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled error:', error.message);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
