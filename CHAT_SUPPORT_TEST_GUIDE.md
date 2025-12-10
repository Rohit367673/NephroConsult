# Chat Support System - Testing Guide

## Overview
This guide covers testing the improved chat support system with currency correction, ticket tracking, and email notifications.

## Features Implemented

### 1. **Currency Correction**
- Detects when users mention currency/price issues
- Automatically computes correct pricing based on user's country
- Returns correction message with proper currency and amount
- Creates high-priority ticket for currency issues

### 2. **Ticket Tracking & Persistence**
- All chat messages are stored in ChatTicket collection
- Auto-generated ticket IDs (CT-YYYYMMDD-###)
- Tracks category: general, booking, payment, refund, technical, medical, complaint
- Tracks priority: low, medium, high, urgent
- Stores user info: name, email, country, timezone
- Maintains full chat history

### 3. **Email Notifications**
- **Admin**: Receives all new tickets and updates
- **Doctor**: Receives medical/complaint/urgent tickets
- **User**: Receives ticket creation confirmation
- Includes ticket ID, category, priority, and message content

### 4. **Complaint Detection**
- Automatically detects complaint keywords: complaint, issue, problem, error, bug, wrong, incorrect, not working, broken, fail, crash, refund, money back, charged, overcharge, currency, wrong price
- Auto-categorizes as "complaint"
- Auto-assigns high priority
- Sends to both admin and doctor

---

## Testing Scenarios

### Test 1: Basic Chat Message
**Objective**: Verify basic chat functionality works

**Steps**:
1. Open the website and click the chat button (bottom-right)
2. Send a message: "How do I book an appointment?"
3. Verify bot responds with booking information

**Expected Results**:
- ✅ Bot responds with helpful information
- ✅ Message appears in chat history
- ✅ Ticket is created in database

**Verification**:
```bash
# Check MongoDB for ticket
db.chattickets.findOne({ "messages.text": "How do I book an appointment?" })
```

---

### Test 2: Currency Issue Detection
**Objective**: Test currency correction feature

**Steps**:
1. Open chat
2. Send message: "I was charged in USD but I'm from India, should be INR"
3. Observe bot response

**Expected Results**:
- ✅ Bot detects currency issue
- ✅ Returns currency correction message with proper INR pricing
- ✅ Ticket is created with "payment" category
- ✅ Ticket has "high" priority
- ✅ Admin receives email notification
- ✅ User receives ticket confirmation email

**Verification**:
```bash
# Check ticket details
db.chattickets.findOne({ category: "payment" })

# Check email logs (if available)
# Should see emails sent to admin@nephroconsultation.com and user email
```

---

### Test 3: Complaint Detection
**Objective**: Test automatic complaint detection

**Steps**:
1. Open chat
2. Send message: "I have a complaint about the wrong pricing shown on the website"
3. Observe bot response

**Expected Results**:
- ✅ Bot detects complaint keywords
- ✅ Ticket is created with "complaint" category
- ✅ Ticket has "high" priority
- ✅ Email sent to admin
- ✅ Email sent to doctor (complaints go to both)
- ✅ User receives confirmation email
- ✅ Ticket ID displayed in chat

**Verification**:
```bash
# Check complaint ticket
db.chattickets.findOne({ category: "complaint" })

# Verify emails were sent
# Check email service logs (Resend API)
```

---

### Test 4: Urgent Issue
**Objective**: Test urgent priority detection

**Steps**:
1. Open chat
2. Send message: "This is urgent! I need immediate help with my payment"
3. Observe response

**Expected Results**:
- ✅ Ticket created with "urgent" priority
- ✅ Email sent to admin
- ✅ Email sent to doctor (urgent goes to doctor)
- ✅ Ticket ID shown in chat

---

### Test 5: Medical/Technical Issue
**Objective**: Test medical category detection

**Steps**:
1. Open chat
2. Send message: "I have a medical question about kidney function"
3. Observe response

**Expected Results**:
- ✅ Ticket created with "medical" category
- ✅ Email sent to admin
- ✅ Email sent to doctor (medical issues go to doctor)

---

### Test 6: Ticket History Retrieval
**Objective**: Test retrieving user's ticket history

**Steps**:
1. Send multiple messages in chat
2. Check that all messages are stored in same ticket
3. Verify ticket ID remains consistent

**Expected Results**:
- ✅ All messages in conversation stored in single ticket
- ✅ Ticket ID remains same for entire conversation
- ✅ Message history shows all exchanges

**Verification**:
```bash
# Get all tickets for a user
db.chattickets.find({ "user.email": "user@example.com" }).sort({ createdAt: -1 })

# Check message count in ticket
db.chattickets.findOne({ ticketId: "CT-20240101-001" }).messages.length
```

---

### Test 7: Currency Correction with Country Detection
**Objective**: Test pricing correction based on user's country

**Steps**:
1. Open chat from different country (use VPN or check timezone)
2. Send message: "The price seems wrong for my country"
3. Observe correction message

**Expected Results**:
- ✅ System detects user's country from timezone
- ✅ Returns correct pricing for that country
- ✅ Shows proper currency symbol and amount
- ✅ Example: "Based on your location (US), the correct pricing should be USD 49"

---

## Manual Testing Checklist

### Chat Component
- [ ] Chat button appears in bottom-right corner
- [ ] Chat window opens/closes properly
- [ ] Messages display correctly
- [ ] User messages appear on right (blue)
- [ ] Bot messages appear on left (white)
- [ ] Loading indicator shows while waiting for response
- [ ] Timestamp shows for each message
- [ ] Scroll to bottom when new message arrives

### Backend Processing
- [ ] Chat messages are saved to database
- [ ] Tickets are created automatically
- [ ] Ticket IDs are unique and properly formatted
- [ ] Category is detected correctly
- [ ] Priority is assigned correctly
- [ ] User info is captured (country, timezone)

### Email Notifications
- [ ] Admin receives email for all new tickets
- [ ] Doctor receives email for medical/complaint/urgent
- [ ] User receives confirmation email
- [ ] Email contains ticket ID
- [ ] Email contains message content
- [ ] Email contains category and priority

### Currency Correction
- [ ] Currency issues are detected
- [ ] Correct pricing is calculated
- [ ] Correction message is displayed
- [ ] Ticket is marked as payment category
- [ ] High priority is assigned

---

## API Endpoints for Testing

### Create/Update Chat Message
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "I have a complaint about pricing",
  "userCountry": "IN",
  "userTimezone": "Asia/Kolkata",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "history": [
    { "sender": "user", "text": "Hello" },
    { "sender": "bot", "text": "Hi, how can I help?" }
  ]
}
```

**Response**:
```json
{
  "ok": true,
  "ticketId": "CT-20240101-001",
  "reply": "Bot response here",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "isComplaint": true,
  "hasCurrencyIssue": false,
  "category": "complaint",
  "priority": "high",
  "status": "open"
}
```

### Get Ticket Details
```bash
GET /api/chat/CT-20240101-001
```

### Get User's Tickets
```bash
GET /api/chat/user/john@example.com
```

---

## Database Queries for Verification

### Find all complaints
```javascript
db.chattickets.find({ category: "complaint" })
```

### Find high-priority tickets
```javascript
db.chattickets.find({ priority: "high" })
```

### Find tickets with currency issues
```javascript
db.chattickets.find({ category: "payment", hasCurrencyIssue: true })
```

### Find tickets by user
```javascript
db.chattickets.find({ "user.email": "user@example.com" })
```

### Find tickets created today
```javascript
db.chattickets.find({ 
  createdAt: { 
    $gte: new Date(new Date().setHours(0,0,0,0)),
    $lt: new Date(new Date().setHours(23,59,59,999))
  }
})
```

### Check email notification status
```javascript
db.chattickets.find({ "emailsSent.adminNotification": true })
```

---

## Troubleshooting

### Issue: Tickets not being created
- [ ] Check MongoDB connection
- [ ] Verify ChatTicket model is imported in chat.js
- [ ] Check server logs for errors
- [ ] Verify MONGO_URI is set in environment

### Issue: Emails not being sent
- [ ] Check SMTP_PASS (Resend API key) is set
- [ ] Verify ADMIN_EMAIL and DOCTOR_EMAIL are configured
- [ ] Check email service logs
- [ ] Verify email addresses are valid

### Issue: Currency correction not working
- [ ] Verify getDisplayedPrice() function is working
- [ ] Check user's country is being sent from frontend
- [ ] Verify pricing.js has correct exchange rates
- [ ] Check for errors in currency detection logic

### Issue: Chat not connecting to backend
- [ ] Verify /api/chat endpoint is mounted
- [ ] Check CORS configuration
- [ ] Verify API URL in frontend is correct
- [ ] Check network tab in browser DevTools

---

## Performance Considerations

- Chat messages are stored in database (persistent)
- Tickets are indexed by email, status, priority for fast queries
- Email notifications are sent asynchronously
- Currency calculations use cached exchange rates (1-hour cache)

---

## Security Notes

- All user input is validated with Zod schema
- Email addresses are validated
- Messages are limited to 1000 characters
- Rate limiting applied to chat endpoint
- No sensitive data stored in plain text

---

## Next Steps

1. Deploy to staging environment
2. Run all test scenarios
3. Monitor email delivery
4. Verify database storage
5. Check performance metrics
6. Deploy to production
7. Monitor for issues in production

