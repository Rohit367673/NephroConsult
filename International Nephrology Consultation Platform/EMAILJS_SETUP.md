# EmailJS Configuration for Refund Requests
# To enable email functionality for the chatbot refund system:

## 1. Set up EmailJS Account
1. Go to https://www.emailjs.com/
2. Create a free account
3. Create a new email service (Gmail, Outlook, etc.)
4. Create an email template for refund requests

## 2. Update Configuration
In src/components/SimpleChatbot.tsx, update these values:

```typescript
const serviceId = 'your_service_id';        // From EmailJS dashboard
const templateId = 'your_template_id';      // Your refund request template
const publicKey = 'your_public_key';        // Your EmailJS public key
```

## 3. Email Template Variables
Your email template should include these variables:
- {{to_email}} - Admin email (admin@nephroconsultation.com)
- {{from_email}} - Customer email
- {{booking_id}} - Booking/Appointment ID
- {{reason}} - Reason for refund
- {{payment_method}} - Payment method used
- {{amount}} - Amount to refund
- {{timestamp}} - Request timestamp
- {{user_message}} - Additional message

## 4. Uncomment EmailJS Code
Remove the comment markers around lines 177-191 in SimpleChatbot.tsx
to enable actual email sending instead of simulation.

## 5. Test the Integration
- Try the refund request flow in the chatbot
- Check that emails are received at the admin address
- Verify all refund details are included

## Alternative: Formspree
If you prefer not to use EmailJS, you can also use Formspree:
1. Sign up at https://formspree.io/
2. Create a form endpoint
3. Replace the EmailJS code with Formspree API calls
