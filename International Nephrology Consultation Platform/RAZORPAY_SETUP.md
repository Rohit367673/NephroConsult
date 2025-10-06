# Razorpay Payment Gateway Setup

This guide will help you set up Razorpay payment integration for the NephroConsult booking system.

## Prerequisites

1. **Razorpay Account**: Sign up at [https://razorpay.com](https://razorpay.com)
2. **API Keys**: Get your Test/Live API keys from Razorpay Dashboard

## Setup Instructions

### 1. Get Razorpay API Keys

1. Login to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate API Keys for Test Mode
4. Copy the **Key ID** and **Key Secret**

### 2. Environment Configuration

Create a `.env` file in the project root and add:

```env
# Razorpay Configuration
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
REACT_APP_RAZORPAY_KEY_SECRET=your_key_secret_here
```

### 3. Test Mode vs Live Mode

#### Test Mode (Development)
- Use test API keys (starts with `rzp_test_`)
- No real money transactions
- Use test card numbers for testing

#### Live Mode (Production)
- Use live API keys (starts with `rzp_live_`)
- Real money transactions
- Requires KYC completion

### 4. Test Card Details

For testing payments in test mode, use these card details:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3-digit number

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3-digit number

### 5. Webhook Configuration (Optional)

For production, set up webhooks to handle payment confirmations:

1. Go to **Settings** → **Webhooks** in Razorpay Dashboard
2. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret

## Features Implemented

### ✅ Payment Integration
- **Multiple Payment Methods**: UPI, Cards, Net Banking, Wallets
- **Regional Pricing**: Automatic currency detection based on user location
- **Secure Processing**: Payment verification and order management
- **Error Handling**: Comprehensive error handling for failed payments

### ✅ Booking Flow
1. **Consultation Selection**: Choose consultation type (Initial/Follow-up/Urgent)
2. **Date & Time**: Select available slots in user's timezone
3. **Patient Information**: Capture required details
4. **Payment**: Secure Razorpay checkout
5. **Confirmation**: Booking confirmation and redirect to profile

### ✅ Pricing Structure
- **India (INR)**:
  - Initial Consultation: ₹2,500
  - Follow-up: ₹1,800
  - Urgent: ₹3,750

- **International (USD)**:
  - Initial Consultation: $30
  - Follow-up: $22
  - Urgent: $45

- **Other Currencies**: EUR, GBP, AUD supported

## Security Considerations

### 🔒 Best Practices
1. **Never expose Key Secret** in frontend code
2. **Verify payments** on backend using webhooks
3. **Use HTTPS** in production
4. **Validate payment signatures** server-side
5. **Store sensitive data** securely

### 🛡️ Implementation Notes
- Payment verification happens on backend (simulated in demo)
- Order creation should be done server-side
- Payment signatures must be verified for security
- Use environment variables for API keys

## Backend Integration (Required for Production)

For production deployment, implement these backend endpoints:

### 1. Create Order Endpoint
```javascript
POST /api/razorpay/create-order
{
  "amount": 2500,
  "currency": "INR",
  "consultation_type": "initial",
  "patient_info": {...}
}
```

### 2. Verify Payment Endpoint
```javascript
POST /api/razorpay/verify-payment
{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "razorpay_signature": "signature_xxx"
}
```

### 3. Webhook Handler
```javascript
POST /api/razorpay/webhook
// Handle payment status updates
```

## Troubleshooting

### Common Issues

1. **Payment Modal Not Opening**
   - Check if Razorpay script is loaded
   - Verify API key is correct
   - Check browser console for errors

2. **Payment Verification Failed**
   - Ensure backend verification is implemented
   - Check payment signature validation
   - Verify webhook configuration

3. **Currency Issues**
   - Ensure currency is supported by Razorpay
   - Check regional pricing configuration
   - Verify amount is in correct format (paise for INR)

### Debug Mode

Enable debug logging by adding to console:
```javascript
localStorage.setItem('razorpay_debug', 'true');
```

## Support

- **Razorpay Documentation**: [https://razorpay.com/docs](https://razorpay.com/docs)
- **Integration Guide**: [https://razorpay.com/docs/payments/payment-gateway/web-integration/](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- **Test Mode**: [https://razorpay.com/docs/payments/payments/test-mode/](https://razorpay.com/docs/payments/payments/test-mode/)

## Next Steps

1. **Set up backend API** for order creation and verification
2. **Configure webhooks** for payment status updates
3. **Implement email notifications** for booking confirmations
4. **Add payment history** in user profile
5. **Set up refund handling** for cancellations

---

**Note**: The current implementation includes frontend integration with simulated backend responses. For production use, implement proper backend API endpoints for security and compliance.
