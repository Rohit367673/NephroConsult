# Gmail SMTP Configuration Guide

## 🔧 Environment Variables for Render

Set these **exact environment variables** in your Render dashboard:

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=NephroConsult <your-gmail-address@gmail.com>
```

## 📧 How to Generate Gmail App Password

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow steps to enable (if not already enabled)

### Step 2: Generate App Password
1. In **2-Step Verification** settings
2. Scroll to **"App passwords"**
3. Click **"Generate"**
4. Select **"Mail"** as app
5. Select **"Other"** as device → enter "NephroConsult"
6. Copy the **16-character password** (like: `abcd efgh ijkl mnop`)

### Step 3: Remove Spaces
- App password: `abcd efgh ijkl mnop`
- Use in SMTP_PASS: `abcdefghijklmnop` (no spaces)

## 🚀 Complete Configuration Example

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587  
SMTP_USER=rohit367673@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=NephroConsult <rohit367673@gmail.com>
```

## ✅ Testing

After setting environment variables:
1. **Trigger Render redeploy**
2. **Test signup** on your website
3. **Check email inbox** (and spam folder initially)

## 🔍 Expected Log Output

**Success:**
```
✅ Gmail SMTP connection verified successfully
📧 [otp] Sending email to user@example.com via Gmail SMTP
✅ [otp] Email sent successfully to user@example.com
```

**Failure (shows OTP in browser):**
```
❌ Gmail SMTP connection failed: Invalid login
⚠️ Email service unavailable for user@example.com, showing OTP: 123456
```

## 📊 Benefits of This Setup

- ✅ **Free** (Gmail's SMTP is free)
- ✅ **Reliable** (Google's infrastructure)  
- ✅ **Simple** (just Gmail app password)
- ✅ **Graceful fallback** (OTP shows if email fails)
- ✅ **Professional** (emails from your Gmail)
