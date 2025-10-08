# Razorpay Setup & Test Mode Guide

## Overview
This guide will help you set up Razorpay payments in **test mode** for development and testing.

## Step 1: Get Razorpay Test Credentials

### Create Razorpay Account
1. Go to https://razorpay.com/
2. Sign up for a free account
3. Complete email verification

### Get Test API Keys
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. In the **Test Mode** section, click **Generate Test Key**
4. Copy both:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (starts with letters/numbers)

## Step 2: Configure Server Environment

### Add to server/.env file:
```env
# Razorpay Test Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### Example:
```env
RAZORPAY_KEY_ID=rzp_test_1234567890abcd
RAZORPAY_KEY_SECRET=abcdef123456789
```

## Step 3: Test Configuration

### Run the test helper:
```bash
cd server
node razorpay-test-helper.js
```

This will:
- ✅ Check if Razorpay is properly configured
- ✅ Test creating a payment order
- ✅ Verify API endpoints are working
- ✅ Show test mode status

## Step 4: Test Payments

### Test Card Details (For Test Mode Only)
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

### Other Test Cards:
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **Rupay**: 6076 6200 0000 0008

### Test UPI ID:
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Step 5: Test Payment Flow

### 1. Create Order (Backend)
```bash
curl -X POST http://localhost:4000/api/payments/test-create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "INR",
    "consultationType": "Initial Consultation",
    "patientName": "Test Patient",
    "patientEmail": "test@example.com",
    "patientPhone": "+919876543210",
    "date": "2024-12-01",
    "time": "10:00 AM"
  }'
```

### 2. Test Frontend Integration
1. Start your frontend development server
2. Navigate to booking page
3. Fill out appointment details
4. Proceed to payment
5. Use test card details above
6. Payment should complete successfully

## Step 6: Verify Integration

### Check Payment Endpoints:
```bash
# Check configuration
curl http://localhost:4000/api/payments/config

# Should show:
{
  "paymentsEnabled": true,
  "environment": "test",
  "isTest": true,
  "razorpayKeyId": "rzp_test_..."
}
```

## Troubleshooting

### ❌ "Payment service not configured"
**Problem**: Missing Razorpay credentials
**Solution**: Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`

### ❌ "Invalid key id"
**Problem**: Wrong key format or live key in test mode
**Solution**: Use test key starting with `rzp_test_`

### ❌ "Authentication failed" 
**Problem**: Wrong secret key
**Solution**: Regenerate API keys from Razorpay dashboard

### ❌ "Orders endpoint not found"
**Problem**: Server not running or wrong port
**Solution**: Start server with `npm run dev`

## Test Mode vs Live Mode

### Test Mode (Development)
- ✅ No real money transactions
- ✅ Use test card numbers
- ✅ Key starts with `rzp_test_`
- ✅ Safe for development/testing

### Live Mode (Production)
- ⚠️ Real money transactions
- ⚠️ Real bank cards only
- ⚠️ Key starts with `rzp_live_`
- ⚠️ Business verification required

## Common Test Scenarios

### 1. Successful Payment
```javascript
// Use any test card number above
// All test payments will succeed by default
```

### 2. Failed Payment
```javascript
// Use card: 4000 0000 0000 0002
// This card will always fail
```

### 3. Network Error
```javascript
// Use card: 4000 0000 0000 0119
// Simulates network/timeout errors
```

## Frontend Integration

### Add Razorpay script to your HTML:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Example payment code:
```javascript
const options = {
  key: 'rzp_test_your_key_id',
  amount: order.amount,
  currency: order.currency,
  order_id: order.id,
  name: 'NephroConsult',
  description: 'Consultation Payment',
  handler: function(response) {
    // Payment successful
    console.log(response.razorpay_payment_id);
    // Verify payment on backend
  },
  theme: {
    color: '#006f6f'
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

## Security Best Practices

1. **Never expose Key Secret** - Keep it server-side only
2. **Always verify payments** - Check signature on backend
3. **Use HTTPS** - Required for live mode
4. **Validate amounts** - Check order amount matches expected
5. **Handle webhooks** - For payment status updates

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **Integration Guide**: https://razorpay.com/docs/payments/payment-gateway/web-integration/

## Quick Commands

```bash
# Test Razorpay configuration
node razorpay-test-helper.js

# Check server configuration
curl http://localhost:4000/api/payments/config

# Test order creation (no auth required in development)
curl -X POST http://localhost:4000/api/payments/test-create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"INR","consultationType":"Test","patientName":"Test","patientEmail":"test@test.com","patientPhone":"1234567890","date":"2024-01-01","time":"10:00"}'
```

Your Razorpay test mode should now be fully functional! 🎉
