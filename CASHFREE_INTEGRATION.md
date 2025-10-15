# 💳 Cashfree Payment Gateway Integration Guide

## ✅ Integration Complete

Your NephroConsult platform is now fully integrated with **Cashfree Payment Gateway**. All Razorpay references have been removed and replaced with Cashfree.

---

## 🏗️ Architecture Overview

### Backend Integration
- **Service Layer**: `server/src/services/cashfreeService.js`
- **Routes**: `server/src/routes/payments.js`
- **SDK**: `cashfree-pg-sdk-nodejs@2.0.2`

### Frontend Integration
- **Utils**: `International Nephrology Consultation Platform/src/utils/cashfreeUtils.ts`
- **Booking Flow**: `International Nephrology Consultation Platform/src/pages/BookingPage.tsx`
- **Payment Success**: `International Nephrology Consultation Platform/src/pages/PaymentSuccess.tsx`

---

## 🔧 Configuration Required

### 1. Server Environment Variables (.env)

```bash
# Cashfree Payment Gateway Configuration
CASHFREE_APP_ID=your_cashfree_app_id_here
CASHFREE_SECRET_KEY=your_cashfree_secret_key_here
CASHFREE_ENVIRONMENT=sandbox  # sandbox or production

# For Production, change to:
# CASHFREE_ENVIRONMENT=production
```

### 2. Client Environment Variables (.env)

```bash
# Cashfree Payment Gateway
VITE_CASHFREE_APP_ID=your_cashfree_app_id_here

# API URL
VITE_API_URL=http://localhost:4000  # For development
# VITE_API_URL=https://your-production-api.com  # For production
```

---

## 🚀 Getting Cashfree Credentials

### Development (Sandbox)
1. Sign up at [Cashfree Merchants](https://merchant.cashfree.com/)
2. Complete basic verification
3. Navigate to **Developers → API Keys**
4. Get your **Sandbox** credentials:
   - App ID (starts with `TEST...`)
   - Secret Key
5. Set `CASHFREE_ENVIRONMENT=sandbox`

### Production (Live)
1. Complete full KYC verification on Cashfree
2. Navigate to **Developers → API Keys**
3. Get your **Production** credentials:
   - App ID (starts with production prefix)
   - Secret Key
4. Set `CASHFREE_ENVIRONMENT=production`

---

## 💰 Payment Flow

### Step 1: User Initiates Booking
```typescript
// BookingPage.tsx
const handlePayment = async () => {
  await initiateCashfreePayment(
    bookingDetails,
    onPaymentSuccess,
    onPaymentError
  );
};
```

### Step 2: Create Order (Backend)
```javascript
// POST /api/payments/create-order
const order = await cashfreeService.createOrder(orderData, userId);
// Returns: { orderId, paymentSessionId, cashfreeAppId }
```

### Step 3: Open Cashfree Checkout
```typescript
// Opens Cashfree hosted checkout page
const paymentUrl = `https://checkout.cashfree.com/${appId}/${sessionId}`;
window.open(paymentUrl, 'CashfreePayment');
```

### Step 4: Verify Payment (Backend)
```javascript
// POST /api/payments/verify-payment
const result = await cashfreeService.verifyPayment(paymentData);
// Returns: { success: true, payment: {...} }
```

### Step 5: Success Handling
- Email confirmation sent to patient
- Appointment created in database
- Redirect to success page

---

## 🌍 Multi-Currency Support

Cashfree supports the following currencies:

| Currency | Code | Supported Countries |
|----------|------|---------------------|
| Indian Rupee | INR | India |
| US Dollar | USD | USA, Global |
| Euro | EUR | Eurozone countries |
| British Pound | GBP | United Kingdom |

### Pricing Structure
Configured in `cashfreeUtils.ts`:
```typescript
const pricing = {
  'initial': { INR: 2500, USD: 30, EUR: 28, GBP: 25 },
  'followup': { INR: 1800, USD: 22, EUR: 20, GBP: 18 },
  'urgent': { INR: 3750, USD: 45, EUR: 42, GBP: 38 }
};
```

---

## 🔐 Security Features

### 1. HMAC Signature Verification
```javascript
// Webhook signature verification
const expectedSignature = crypto
  .createHmac('sha256', env.CASHFREE_SECRET_KEY)
  .update(webhookBody)
  .digest('hex');
```

### 2. Payment Session Tokens
- Session tokens are single-use and expire after 30 minutes
- Cannot be reused for multiple payments

### 3. Server-Side Verification
- All payments verified on backend before confirming booking
- Direct API calls to Cashfree for payment status

### 4. Environment Isolation
- Sandbox credentials cannot process live payments
- Production credentials isolated from development

---

## 📡 API Endpoints

### Create Payment Order
```http
POST /api/payments/create-order
Content-Type: application/json
Credentials: include

{
  "amount": 2500,
  "currency": "INR",
  "consultationType": "Initial Consultation",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+919876543210",
  "date": "2024-01-15",
  "time": "10:00 AM"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_T_12345678_abc123",
    "amount": 2500,
    "currency": "INR",
    "status": "ACTIVE",
    "paymentSessionId": "session_xxx..."
  },
  "cashfree_app_id": "TEST123...",
  "environment": "sandbox"
}
```

### Verify Payment
```http
POST /api/payments/verify-payment
Content-Type: application/json
Credentials: include

{
  "order_id": "order_T_12345678_abc123",
  "payment_id": "cf_payment_xxx",
  "booking_details": {
    "consultationType": "Initial Consultation",
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "date": "2024-01-15",
    "time": "10:00 AM",
    "amount": 2500,
    "currency": "INR"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "id": "cf_payment_xxx",
    "order_id": "order_T_12345678_abc123",
    "amount": 2500,
    "currency": "INR",
    "status": "SUCCESS",
    "method": "UPI",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Payment Configuration
```http
GET /api/payments/config

Response:
{
  "paymentsEnabled": true,
  "cashfreeAppId": "TEST123...",
  "environment": "sandbox",
  "isLive": false,
  "isTest": true,
  "nodeEnv": "development"
}
```

### Health Check
```http
GET /api/payments/health

Response:
{
  "status": "healthy",
  "environment": "sandbox",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🧪 Testing

### Test in Sandbox Mode

1. **Set Environment to Sandbox**
```bash
CASHFREE_ENVIRONMENT=sandbox
```

2. **Use Test Cards**
Cashfree provides test payment methods in sandbox:
- **UPI**: Use test UPI IDs
- **Cards**: Use Cashfree test cards
- **Netbanking**: Select test bank options
- **Wallets**: Use test wallet credentials

3. **Run Test Script**
```bash
cd server
npm run test:cashfree
```

### Test Payment Flow
1. Navigate to booking page
2. Select consultation type
3. Fill in patient details
4. Click "Proceed to Payment"
5. Complete payment in sandbox
6. Verify success redirect
7. Check email confirmation

---

## 🚨 Troubleshooting

### Issue: "Payment service unavailable"
**Solution:** Check that Cashfree credentials are set in `.env` file

```bash
# Verify credentials are loaded
cd server
npm run validate:env
```

### Issue: "Failed to create payment order"
**Possible causes:**
- Invalid credentials
- Wrong environment setting
- Network issues
- API quota exceeded

**Debug:**
```bash
# Check service status
curl http://localhost:4000/api/payments/config

# Check health
curl http://localhost:4000/api/payments/health
```

### Issue: "Payment verification failed"
**Solution:** Ensure payment was actually completed in Cashfree checkout

**Debug logs:**
- Check browser console for error messages
- Check server logs for API responses
- Verify order ID matches in both systems

### Issue: Environment Mismatch Warning
```
⚠️ WARNING: Using PRODUCTION keys in development environment!
```

**Solution:** Use sandbox keys for development:
```bash
CASHFREE_ENVIRONMENT=sandbox
CASHFREE_APP_ID=TEST...
CASHFREE_SECRET_KEY=your_test_secret
```

---

## 🔄 Migration from Razorpay

### What Changed
✅ Removed all Razorpay dependencies  
✅ Updated environment variable names  
✅ Replaced payment service implementation  
✅ Updated API endpoints  
✅ Updated frontend utilities  
✅ Updated documentation  

### Old Environment Variables (Removed)
```bash
# ❌ REMOVED
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
REACT_APP_RAZORPAY_KEY_ID=...
```

### New Environment Variables (Added)
```bash
# ✅ NEW
CASHFREE_APP_ID=...
CASHFREE_SECRET_KEY=...
CASHFREE_ENVIRONMENT=sandbox
VITE_CASHFREE_APP_ID=...
```

---

## 📊 Monitoring

### Service Status
```javascript
// Check if payments are enabled
const status = cashfreeService.getStatus();
console.log(status);
// {
//   initialized: true,
//   environment: 'sandbox',
//   paymentsEnabled: true,
//   isLive: false,
//   isTest: true
// }
```

### Payment Logs
All payment transactions are logged:
- Order creation
- Payment completion
- Verification results
- Webhook events

### Email Notifications
Payment confirmation emails are sent automatically:
- To patient email
- Contains payment details
- Includes consultation information
- Professional HTML template

---

## 🌐 Webhook Setup

### Configure Webhook URL
In Cashfree Dashboard:
1. Go to **Developers → Webhooks**
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events:
   - `PAYMENT_SUCCESS_WEBHOOK`
   - `PAYMENT_FAILED_WEBHOOK`
   - `PAYMENT_USER_DROPPED_WEBHOOK`

### Webhook Security
- HMAC signature verification enabled
- Only processes verified webhooks
- Logs all webhook events

---

## ✅ Verification Checklist

Before going live, ensure:

- [ ] KYC completed on Cashfree
- [ ] Production credentials obtained
- [ ] Environment set to `production`
- [ ] Webhook URL configured
- [ ] SSL certificate active (HTTPS)
- [ ] Email notifications working
- [ ] Test payment flow in sandbox
- [ ] Verify payment amounts are correct
- [ ] Check multi-currency support
- [ ] Confirm email confirmations send
- [ ] Monitor server logs for errors

---

## 📞 Support

### Cashfree Support
- **Dashboard**: https://merchant.cashfree.com/
- **Documentation**: https://docs.cashfree.com/
- **Support Email**: support@cashfree.com

### Technical Issues
1. Check server logs: `cd server && npm run dev`
2. Check browser console for frontend errors
3. Verify API endpoint connectivity
4. Review Cashfree dashboard for transaction details

---

## 🎉 Success!

Your NephroConsult platform is now fully equipped with Cashfree payment processing. The integration supports:

✅ Multi-currency payments (INR, USD, EUR, GBP)  
✅ Secure checkout experience  
✅ Automated email confirmations  
✅ Payment verification  
✅ Sandbox and production modes  
✅ Global patient access  

**Happy consulting! 🏥💙**
