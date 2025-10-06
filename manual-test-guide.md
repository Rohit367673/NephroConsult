# Manual Email Testing Guide

## 🧪 How to Test Your Email System

### Step 1: Verify Backend is Running
```bash
curl https://nephroconsult.onrender.com/api/health
```
**Expected Response:** `{"ok":true,"time":"2025-..."}`

### Step 2: Test Email Functionality
Go to your signup page: https://nephro-consult-cea9.vercel.app/signup

1. **Fill out the signup form** with any test email
2. **Click "Send Verification Code"**
3. **Check the result**:

#### ✅ If Email Works:
- You'll see: "📧 Verification code sent to your email!"
- Check your email inbox for the OTP

#### ✅ If Email Fails (Fallback Working):
- You'll see: "⚠️ Email service unavailable. Your verification code is: 123456"
- Use the displayed OTP to complete signup
- **This proves your fallback system is working!**

#### ❌ If System is Broken:
- You'll see: "Network error. Please try again."
- Check backend logs in Render dashboard

### Step 3: Verify Other Email Functions

After signup works, test other email features:

1. **Book an appointment** → Should get booking confirmation
2. **Complete a consultation** → Should get completion notice  
3. **Send a prescription** → Should get prescription email

If emails fail, they'll be logged in your backend but won't break the user experience.

## 🔍 Backend Logs to Check

In Render dashboard, look for these log messages:

### ✅ Success Logs:
```
✅ [otp] Email sent successfully to user@example.com (message-id)
✅ [prescription] Email sent successfully to patient@example.com
```

### ⚠️ Fallback Logs:
```
❌ [otp] Email failed to user@example.com: Connection timeout
📝 [otp] FALLBACK: Email service unavailable for user@example.com
```

### 📧 Email Configuration:
```
📧 Email service configured: smtp.gmail.com:587
```

## 🎯 Success Criteria

Your email system is working correctly if:

1. **✅ Signup completes** (even if email fails)
2. **✅ OTP is displayed** when email service is down
3. **✅ Other features work** regardless of email status
4. **✅ Detailed logs** show what happened

## 🚀 Next Steps

1. **Wake up your Render service**
2. **Test the signup flow**
3. **Check if you see fallback OTP display**
4. **Verify all critical functions work**

Your fallback system ensures everything works even with email issues!
