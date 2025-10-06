# Resend API Configuration Guide

## 🚀 Switch to Resend HTTP API

**Resend HTTP API bypasses SMTP blocking on Render and works perfectly!**

## 🔧 Environment Variables for Render

Update these **exact environment variables** in your Render dashboard:

```bash
# Resend HTTP API Configuration  
SMTP_HOST=api.resend.com
SMTP_PORT=443
SMTP_USER=resend
SMTP_PASS=re_your-resend-api-key-here
SMTP_FROM=NephroConsult <onboarding@resend.dev>
```

## 📧 Your Current Resend Setup

You already have:
- ✅ **Resend account**: Created
- ✅ **API Key**: `re_evKol...` (from earlier setup)
- ✅ **Domain added**: `nephroconsult.com` (verification pending)

## 🎯 Two Options:

### **Option 1: Use Default Domain (Works Immediately)**
```bash
SMTP_HOST=api.resend.com
SMTP_PORT=443  
SMTP_USER=resend
SMTP_PASS=re_evKolJZT_AoglBhGTyuH20gTdDpMDXra6
SMTP_FROM=NephroConsult <onboarding@resend.dev>
```

### **Option 2: Verify Your Domain (Advanced)**
1. Complete DNS setup in Resend dashboard
2. Wait for verification
3. Use: `SMTP_FROM=NephroConsult <noreply@nephroconsult.com>`

## 🔄 Deployment Steps

1. **Update Render Environment Variables** (Option 1 above)
2. **Save & Deploy** (1-2 minutes)
3. **Test signup** - should work instantly!

## ✅ Expected Results

**Success:**
```
🚀 [otp] Sending email to user@example.com via Resend API  
✅ [otp] Email sent via Resend API to user@example.com
📧 Message ID: abc-123-def
```

**Domain Limitation (fallback works):**
```  
❌ [otp] Domain verification required - using fallback
⚠️ Your verification code is displayed below.
```

## 🎉 Benefits

- ✅ **No SMTP blocking** (uses HTTP API)
- ✅ **Faster delivery** (direct API calls)  
- ✅ **Better reliability** (no connection timeouts)
- ✅ **Same fallback** (if domain issues occur)
- ✅ **Free tier** (3,000 emails/month)
