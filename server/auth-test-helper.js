import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow\n');

  // Test 1: Check /me endpoint without authentication
  console.log('1. Testing /auth/me without authentication...');
  try {
    const response = await fetch(`${API_BASE}/auth/me`);
    const data = await response.json();
    console.log('   Response:', data);
    console.log('   ✅ Unauthenticated /me works\n');
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Test 2: Try to create order without authentication
  console.log('2. Testing payment order without authentication...');
  try {
    const response = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2000,
        currency: 'INR',
        consultationType: 'Initial Consultation',
        patientName: 'Test Patient',
        patientEmail: 'test@example.com',
        patientPhone: '9876543210',
        date: '2024-12-01',
        time: '10:00 AM'
      })
    });
    
    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', data);
    
    if (response.status === 401) {
      console.log('   ✅ Correctly returns 401 Unauthorized\n');
    } else {
      console.log('   ❌ Expected 401 but got:', response.status, '\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Test 3: Try to login with test credentials (if they exist)
  console.log('3. Testing login with test credentials...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doctor@example.com',
        password: '123321'
      })
    });
    
    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', data);
    
    // Extract cookies if login successful
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      console.log('   Cookies set:', cookies.substring(0, 100) + '...');
      
      // Test 4: Try to make authenticated request
      console.log('\n4. Testing authenticated request...');
      const authResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Cookie': cookies
        }
      });
      
      const authData = await authResponse.json();
      console.log('   Authenticated /me response:', authData);
      
      if (authData.user) {
        console.log('   ✅ Authentication working correctly\n');
        
        // Test 5: Try payment order with authentication
        console.log('5. Testing payment order with authentication...');
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
            patientEmail: 'test@example.com',
            patientPhone: '9876543210',
            date: '2024-12-01',
            time: '10:00 AM'
          })
        });
        
        const orderData = await orderResponse.json();
        console.log('   Status:', orderResponse.status);
        console.log('   Response:', orderData);
        
        if (orderResponse.status === 200) {
          console.log('   ✅ Payment order created successfully!');
        } else {
          console.log('   ❌ Payment order failed:', orderResponse.status);
        }
      } else {
        console.log('   ❌ Authentication failed - no user in response\n');
      }
    } else {
      console.log('   ❌ No cookies set during login\n');
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message, '\n');
  }
}

// Run the test
testAuthFlow().catch(console.error);
