import fetch from 'node-fetch';

async function quickTest() {
  console.log('🔧 Quick Authentication & Payment Test\n');

  const API_BASE = 'http://localhost:4000/api';
  
  try {
    // Step 1: Create a test user and get session
    console.log('1. Creating test user...');
    const userResponse = await fetch(`${API_BASE}/auth/create-test-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'test123',
        name: 'Test Patient'
      })
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.log('❌ User creation failed:', errorData);
      return;
    }

    const userData = await userResponse.json();
    console.log('✅ User created:', userData.user.email);
    
    // Get session cookies
    const cookies = userResponse.headers.get('set-cookie');
    if (!cookies) {
      console.log('❌ No session cookies received');
      return;
    }
    
    console.log('✅ Session cookies received');

    // Step 2: Verify authentication with /me endpoint
    console.log('\n2. Verifying session...');
    const meResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Cookie': cookies }
    });
    
    const meData = await meResponse.json();
    if (meData.user) {
      console.log('✅ Session verified:', meData.user.email);
    } else {
      console.log('❌ Session verification failed');
      return;
    }

    // Step 3: Try to create payment order
    console.log('\n3. Testing payment order creation...');
    const orderResponse = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        amount: 2000,
        currency: 'INR',
        consultationType: 'Initial Consultation',
        patientName: 'Test Patient',
        patientEmail: 'testuser@example.com',
        patientPhone: '9876543210',
        date: '2024-12-01',
        time: '10:00 AM'
      })
    });

    const orderData = await orderResponse.json();
    
    if (orderResponse.ok) {
      console.log('✅ Payment order created successfully!');
      console.log('   Order ID:', orderData.order?.id);
      console.log('   Razorpay Key:', orderData.razorpay_key?.substring(0, 15) + '...');
    } else {
      console.log('❌ Payment order failed:', orderResponse.status);
      console.log('   Error:', orderData);
    }

    console.log('\n🎉 Authentication and payment flow test completed!');
    console.log('\n📋 Summary:');
    console.log('• User registration: Working ✅');
    console.log('• Session management: Working ✅');
    console.log('• Authentication middleware: Working ✅');
    console.log('• Payment order creation: ' + (orderResponse.ok ? 'Working ✅' : 'Failed ❌'));
    
    if (orderResponse.ok) {
      console.log('\n💡 To test in browser:');
      console.log('1. Go to http://localhost:3000/booking');
      console.log('2. Login with: testuser@example.com / test123');
      console.log('3. Complete booking flow and test payment');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

quickTest();
