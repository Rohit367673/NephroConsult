import 'dotenv/config';
import { cashfreeService } from './src/services/cashfreeService.js';
import { env } from './src/config.js';

async function testCashfreeIntegration() {
  console.log('🔍 Testing Cashfree Integration');
  console.log('==============================');
  
  // Check if Cashfree is properly initialized
  if (!cashfreeService.isInitialized) {
    console.error('❌ Cashfree service is not properly initialized');
    console.log('\nPlease check your environment variables in .env file:');
    console.log(`CASHFREE_APP_ID: ${env.CASHFREE_APP_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`CASHFREE_SECRET_KEY: ${env.CASHFREE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`Environment: ${env.CASHFREE_ENVIRONMENT || 'sandbox (default)'}`);
    process.exit(1);
  }

  console.log('✅ Cashfree service is properly initialized');
  console.log(`   Environment: ${cashfreeService.environment}`);

  try {
    // Test creating a test order
    console.log('\n🔄 Testing order creation...');
    const orderRequest = {
      amount: 1.0, // Small amount for testing
      currency: 'INR',
      consultationType: 'Test Consultation',
      patientName: 'Test User',
      patientEmail: 'test@example.com',
      patientPhone: '9876543210',
      date: new Date().toISOString().slice(0, 10),
      time: '10:30'
    };

    console.log('   Creating test order...');
    const orderResponse = await cashfreeService.createOrder(orderRequest, 'test_user_123');
    
    if (orderResponse && orderResponse.success && orderResponse.order) {
      console.log('✅ Test order created successfully!');
      console.log('   Order ID:', orderResponse.order.id);
      console.log('   Status:', orderResponse.order.status);
      console.log('   Payment Session ID:', orderResponse.order.paymentSessionId || '(none)');
      console.log('   Environment:', orderResponse.environment);
      
      console.log('\n🎉 Cashfree integration test completed!');
      console.log('   Use the Payment Session ID above with the web app checkout to proceed.');
    } else {
      console.error('❌ Failed to create test order:', orderResponse);
    }
  } catch (error) {
    console.error('❌ Error during Cashfree test:', error.message);
    console.error('   Stack:', error.stack);
    
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testCashfreeIntegration().catch(console.error);
