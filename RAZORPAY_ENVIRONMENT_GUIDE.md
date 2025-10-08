# Razorpay Multi-Environment Setup Guide

## 🎯 **Overview**

The Razorpay integration automatically detects test vs live mode based on your credentials and provides appropriate handling for both environments.

## 🔧 **Environment Configuration**

### **Development Environment (.env)**
```bash
# For Development - Use TEST credentials
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_your_test_key_here
RAZORPAY_KEY_SECRET=your_test_secret_here

# Other required variables
MONGO_URI=your_mongo_connection_string
SESSION_SECRET=your_session_secret
```

### **Production Environment (.env.production)**
```bash
# For Production - Use LIVE credentials
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_your_live_key_here
RAZORPAY_KEY_SECRET=your_live_secret_here

# Other required variables
MONGO_URI=your_production_mongo_string
SESSION_SECRET=your_production_session_secret
```

## 🚀 **Automatic Environment Detection**

The system automatically detects:

### **✅ Test Mode** (`rzp_test_...`)
- **Safe Development**: No real money charged
- **Test Cards Work**: Use Razorpay test cards
- **Mock Payments**: All transactions are simulated
- **Debug Friendly**: Detailed logging enabled

### **💰 Live Mode** (`rzp_live_...`) 
- **Real Payments**: Actual money will be charged
- **Production Ready**: Real card transactions
- **Bank Integration**: Connected to actual banking
- **Secure Processing**: Production-level security

## 📊 **Environment Status Check**

### **API Endpoint**
```bash
# Check current configuration
curl http://localhost:4000/api/payments/config

# Response example:
{
  "paymentsEnabled": true,
  "environment": "test",
  "isLive": false,
  "isTest": true,
  "environmentMatch": "optimal",
  "warnings": [],
  "nodeEnv": "development"
}
```

### **Environment Match Status**
- **✅ optimal**: Environment and keys match (test keys in dev, live keys in prod)
- **⚠️ warning**: Mismatch detected (live keys in dev, or test keys in prod)
- **❌ unknown**: Service not properly initialized

## 🧪 **Testing in Both Modes**

### **Test Mode Testing**
```bash
# Test cards that work in test mode
Success Card: 4111 1111 1111 1111
Failed Card:  4000 0000 0000 0002
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
```

### **Live Mode Testing**
```bash
# Use real cards with small amounts first
# Test with ₹1 or ₹10 for initial verification
# Verify with your bank account/dashboard
```

## 🔄 **Switching Between Environments**

### **Method 1: Environment Variables**
```bash
# Switch to test mode
export RAZORPAY_KEY_ID=rzp_test_your_test_key
export RAZORPAY_KEY_SECRET=your_test_secret

# Switch to live mode  
export RAZORPAY_KEY_ID=rzp_live_your_live_key
export RAZORPAY_KEY_SECRET=your_live_secret

# Restart server
npm run dev
```

### **Method 2: Update .env file**
```bash
# Edit .env file directly
nano server/.env

# Update credentials and restart
npm run dev
```

## 🛡️ **Safety Features**

### **Automatic Warnings**
The system warns you when:
- Using live keys in development
- Using test keys in production  
- Keys don't match environment expectations
- Service initialization fails

### **Environment Mismatch Protection**
```javascript
// Example warning output
⚠️ WARNING: Using LIVE Razorpay keys in development environment!
   This will charge real money. Consider using test keys for development.
```

## 🎛️ **Configuration Management**

### **Check Current Status**
```bash
# Quick status check
node server/payment-debug-helper.js

# Expected output:
✅ Razorpay initialized in TEST mode
   🔧 Using test credentials for safe development  
   💳 Test cards will work, no real money charged
```

### **Verify Health**
```bash
# Health check
curl http://localhost:4000/api/payments/health

# Response:
{
  "status": "healthy",
  "environment": "test",
  "timestamp": "2025-10-08T07:30:00.000Z"
}
```

## 🔒 **Security Best Practices**

### **✅ Development**
- Always use test keys (`rzp_test_...`)
- Never commit credentials to git
- Use environment variables
- Test with small amounts

### **✅ Production**
- Use live keys (`rzp_live_...`) 
- Secure credential storage
- Monitor transactions
- Set up webhooks for reliability

## 📝 **Common Scenarios**

### **Scenario 1: Pure Development**
```bash
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_...
# Result: ✅ Optimal - Safe testing
```

### **Scenario 2: Production Deployment**
```bash
NODE_ENV=production  
RAZORPAY_KEY_ID=rzp_live_...
# Result: ✅ Optimal - Real payments
```

### **Scenario 3: Testing Live Keys in Dev**
```bash
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_live_...
# Result: ⚠️ Warning - Will charge real money!
```

### **Scenario 4: Production with Test Keys**
```bash
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_test_...  
# Result: ⚠️ Warning - No real payments will work!
```

## 🚨 **Troubleshooting**

### **Problem: Payments not working**
1. Check environment status: `curl /api/payments/config`
2. Verify credentials in .env file
3. Restart server after env changes
4. Check console for warnings

### **Problem: Environment mismatch warnings**
1. Review your NODE_ENV setting
2. Ensure correct key type (test/live)
3. Match environment to intended use

### **Problem: Service not initialized**
1. Check .env file exists
2. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set
3. Ensure keys start with `rzp_test_` or `rzp_live_`
4. Restart server

## 🎉 **Quick Setup Commands**

### **For Development**
```bash
# Set test credentials
echo "RAZORPAY_KEY_ID=rzp_test_your_key" >> server/.env
echo "RAZORPAY_KEY_SECRET=your_secret" >> server/.env
npm run dev
```

### **For Production**
```bash
# Set live credentials (on production server)
export RAZORPAY_KEY_ID=rzp_live_your_key
export RAZORPAY_KEY_SECRET=your_secret
npm start
```

---

**🎯 Your Razorpay integration now seamlessly handles both test and live environments with automatic detection and safety warnings!**
