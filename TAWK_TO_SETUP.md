# Tawk.to Chatbot Setup Guide

## Overview
Your website now uses Tawk.to - a professional, free chatbot service used by over 4 million websites. It provides excellent AI responses, real-time chat support, and won't interfere with your layout.

## Features You Get
✅ **AI-Powered Responses** - Smart bot that can answer complex questions
✅ **Real-Time Chat** - Live chat with human agents when needed
✅ **Mobile Optimized** - Perfect on all devices
✅ **Professional Design** - Matches industry standards
✅ **Free Forever** - No monthly fees
✅ **Analytics** - Chat history and visitor insights
✅ **No Layout Issues** - Properly positioned widget

## Quick Setup (5 minutes)

### Step 1: Create Tawk.to Account
1. Go to [https://www.tawk.to/](https://www.tawk.to/)
2. Click "Sign Up Free"
3. Enter your email and create password
4. Choose "NephroConsult" as your business name

### Step 2: Get Your Widget ID
1. After signup, go to Administration → Chat Widget
2. Copy your **Property ID** (looks like: `67039f1537379df10df28a27/1i9gfli65`)
3. Replace the ID in `/src/components/TawkToChat.tsx` line 15

### Step 3: Customize for Nephrology
1. In Tawk.to dashboard → Chat Widget → Appearance
2. Set colors to match your brand:
   - Primary Color: `#006f6f`
   - Secondary Color: `#008080`
3. Upload your logo or Dr. Ilango's photo as agent avatar

### Step 4: Configure AI Bot
1. Go to Automation → Chatbots
2. Enable "Smart Bot"
3. Add knowledge base entries:

```
Q: How do I book a consultation?
A: You can book a consultation by visiting our "Book Appointment" page. Initial consultations are $150 USD and follow-up consultations are $105 USD. Choose your preferred date and time, upload lab reports if available, and complete payment.

Q: What are the consultation fees?
A: Our consultation fees are: Initial Consultation: $150 USD (comprehensive kidney health assessment), Follow-up Consultation: $105 USD (ongoing care). Regional pricing may vary by location.

Q: Who is Dr. Ilango?
A: Dr. Ilango Krishnamurthy is our Sr. Nephrologist with MD, DNB (Nephrology), MRCP (UK) qualifications and 15+ years of experience. He provides expert kidney care through our international consultation platform, offering world-class nephrology consultations via secure video calls.

Q: How does video consultation work?
A: After booking, you'll receive a secure meeting link. During the consultation, Dr. Ilango will review your medical history, discuss symptoms, analyze lab reports if provided, and create a treatment plan.

Q: What documents do I need?
A: Please prepare: Recent lab reports (kidney function tests), list of current medications, medical history summary, and any previous consultation notes. Lab reports can be uploaded during booking.
```

## Advanced Configuration

### Business Hours
Set your availability in Dashboard → Settings → Business Hours:
- **Timezone**: Your local timezone
- **Available**: 24/7 for international patients
- **Auto-away message**: "Thanks for your message. Dr. Ilango's team will respond shortly."

### Canned Responses
Pre-written responses for common questions:
1. "Thank you for contacting NephroConsult! How can I help you today?"
2. "I can help you book a consultation with Dr. Ilango. Would you like to schedule an appointment?"
3. "Our consultation fees are $150 for initial and $105 for follow-up. Shall I guide you through booking?"

### Email Notifications
Enable notifications when you receive messages:
- Dashboard → Settings → Email Notifications
- Add your team email addresses

## Benefits Over Custom Chatbot

✅ **Professional AI** - Much smarter responses than custom implementation
✅ **Zero Maintenance** - No code updates needed
✅ **Human Handoff** - Seamlessly transfer to real agents
✅ **Analytics** - Detailed chat metrics and visitor data
✅ **Multi-language** - Supports 45+ languages
✅ **Mobile Apps** - Respond from iPhone/Android apps
✅ **Integrations** - Works with CRM, email marketing tools

## Testing Your Setup

1. Visit your website
2. Look for the chat widget in bottom-right corner
3. Click to open and test responses
4. Try questions like:
   - "How do I book a consultation?"
   - "What are your fees?"
   - "Who is Dr. Ilango?"

## Mobile App (Optional)
Download Tawk.to mobile app to respond to chats on-the-go:
- iOS: Search "Tawk.to" in App Store
- Android: Search "Tawk.to" in Google Play Store

## Support
- Tawk.to Documentation: https://help.tawk.to/
- Their own chat support available 24/7

Your professional chatbot is now ready! 🚀
