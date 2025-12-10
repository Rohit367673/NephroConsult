# Chat Support System - Quick Reference Guide

## What Was Built

A complete advanced chat support system with:
- ✅ **Currency Correction** - Detects and corrects pricing issues
- ✅ **Ticket Tracking** - Auto-generated ticket IDs with full history
- ✅ **Email Notifications** - Admin, doctor, and user notifications
- ✅ **Complaint Detection** - Automatic complaint categorization
- ✅ **Chat Persistence** - All messages stored in database

---

## Key Features at a Glance

| Feature | What It Does | Who Gets Notified |
|---------|-------------|-------------------|
| **Complaint Detection** | Detects complaint keywords, marks as high priority | Admin + Doctor |
| **Currency Correction** | Detects price issues, calculates correct pricing | Admin + Doctor |
| **Ticket Creation** | Auto-creates ticket for every conversation | User (confirmation) |
| **Email Notifications** | Sends emails with ticket details | Admin, Doctor, User |
| **Chat History** | Stores all messages in database | Accessible via ticket ID |

---

## Files Created

```
/server/src/models/ChatTicket.js
├─ ChatTicket MongoDB model
├─ Auto-generates ticket IDs (CT-YYYYMMDD-###)
├─ Stores messages, user info, category, priority
└─ Includes email tracking and resolution details
```

---

## Files Modified

```
/server/src/routes/chat.js
├─ Added complaint detection
├─ Added currency issue detection
├─ Added email notifications
├─ Added ticket creation/update logic
├─ Added GET endpoints for ticket retrieval
└─ Enhanced response with ticket info

/server/src/config.js
├─ Added ADMIN_EMAIL config
└─ Added DOCTOR_EMAIL config

/src/components/SimpleChatbot.tsx
├─ Updated to send user info to backend
├─ Displays currency corrections
├─ Shows ticket IDs
└─ Handles backend responses
```

---

## How It Works

### User Sends Message
```
User: "I was charged in USD but I'm from India, should be INR"
```

### Backend Processing
```
1. Detect currency keywords ✓
2. Detect user's country (India) ✓
3. Calculate correct pricing (₹599 instead of $12) ✓
4. Create ticket with "payment" category ✓
5. Assign "high" priority ✓
6. Send emails to admin and doctor ✓
7. Return correction message ✓
```

### User Sees
```
Bot: "Based on your location (India), the correct pricing should be INR 599. We apologize for any confusion."
Bot: "📋 Your support ticket has been created: CT-20240101-001
Our team will review your complaint and respond shortly."
```

### Admin/Doctor Receives Email
```
Subject: [HIGH] New Support Ticket: Currency issue

Ticket ID: CT-20240101-001
Category: payment
Priority: HIGH
From: User (user@example.com)
Country: India
Message: I was charged in USD but I'm from India, should be INR
```

---

## Complaint Detection Examples

### Triggers High Priority + Complaint Category
- "I have a complaint about..."
- "This is wrong, I was overcharged"
- "The website has a bug with pricing"
- "I need a refund, this is incorrect"
- "The currency shown is wrong"

### Triggers Payment Category + High Priority
- "The price seems wrong for my country"
- "I was charged in USD but should be INR"
- "The dollar amount doesn't match"

### Triggers Urgent Priority
- "This is urgent!"
- "I need immediate help"
- "Emergency support needed"

---

## Database Queries

### Find all complaints
```javascript
db.chattickets.find({ category: "complaint" })
```

### Find high-priority tickets
```javascript
db.chattickets.find({ priority: "high" })
```

### Find tickets by user
```javascript
db.chattickets.find({ "user.email": "user@example.com" })
```

### Find unresolved tickets
```javascript
db.chattickets.find({ status: { $in: ["open", "in_progress"] } })
```

### Count tickets by category
```javascript
db.chattickets.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } }
])
```

---

## API Quick Test

### Send a complaint message
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a complaint about the wrong pricing",
    "userCountry": "IN",
    "userEmail": "test@example.com",
    "userName": "Test User",
    "userTimezone": "Asia/Kolkata"
  }'
```

### Get ticket details
```bash
curl http://localhost:4000/api/chat/CT-20240101-001
```

### Get user's tickets
```bash
curl http://localhost:4000/api/chat/user/test@example.com
```

---

## Environment Variables Needed

```bash
# Email notifications
ADMIN_EMAIL=admin@nephroconsultation.com
DOCTOR_EMAIL=suyambu54321@gmail.com
SMTP_PASS=<Resend API key>
SMTP_FROM=NephroConsult <no-reply@nephroconsultation.com>

# Database
MONGO_URI=mongodb+srv://...

# Client
CLIENT_URL=https://www.nephroconsultation.com
```

---

## Testing Checklist

- [ ] Send a regular chat message → Ticket created
- [ ] Send a complaint message → High priority, both emails sent
- [ ] Send currency issue message → Correction shown, payment category
- [ ] Send urgent message → Urgent priority assigned
- [ ] Check database for tickets → All messages stored
- [ ] Check email inbox → Notifications received
- [ ] Get ticket via API → Full history returned
- [ ] Get user tickets → All user's tickets returned

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tickets not created | Check MongoDB connection, verify ChatTicket model imported |
| Emails not sent | Verify SMTP_PASS (Resend API key), check email config |
| Currency correction not working | Verify user country sent from frontend, check pricing.js |
| Chat not connecting | Check /api/chat endpoint mounted, verify CORS config |

---

## Response Format

### Successful Response
```json
{
  "ok": true,
  "ticketId": "CT-20240101-001",
  "reply": "Bot response here",
  "suggestions": ["How do I book?", "What's the pricing?"],
  "isComplaint": true,
  "hasCurrencyIssue": false,
  "category": "complaint",
  "priority": "high",
  "status": "open"
}
```

### With Currency Correction
```json
{
  "ok": true,
  "ticketId": "CT-20240101-002",
  "reply": "Bot response",
  "currencyCorrection": {
    "country": "IN",
    "currency": "INR",
    "correctPrice": 599,
    "message": "Based on your location (India), the correct pricing should be INR 599..."
  }
}
```

---

## Ticket Statuses

- **open** - New ticket, awaiting response
- **in_progress** - Being handled by admin/doctor
- **waiting_user** - Waiting for user's response
- **resolved** - Issue resolved
- **closed** - Ticket closed

---

## Ticket Categories

- **general** - General questions
- **booking** - Appointment booking issues
- **payment** - Payment and pricing issues
- **refund** - Refund requests
- **technical** - Technical/website issues
- **medical** - Medical questions
- **complaint** - Complaints and issues

---

## Ticket Priorities

- **low** - Can be handled later
- **medium** - Normal priority
- **high** - Urgent, needs quick response
- **urgent** - Critical, immediate response needed

---

## Email Recipients

| Ticket Type | Admin | Doctor | User |
|------------|-------|--------|------|
| General question | ✓ | ✗ | ✓ |
| Booking issue | ✓ | ✗ | ✓ |
| Payment issue | ✓ | ✗ | ✓ |
| Complaint | ✓ | ✓ | ✓ |
| Medical question | ✓ | ✓ | ✓ |
| Urgent issue | ✓ | ✓ | ✓ |

---

## Performance Notes

- Messages indexed by email, status, priority for fast queries
- Email notifications sent asynchronously (non-blocking)
- Exchange rates cached for 1 hour
- Rate limiting applied to chat endpoint
- Messages limited to 1000 characters

---

## Security Features

- ✓ Input validation with Zod schema
- ✓ Email validation
- ✓ Rate limiting
- ✓ CORS protection
- ✓ No sensitive data in plain text
- ✓ Async email processing

---

## Next Steps

1. **Deploy** to staging/production
2. **Monitor** email delivery and ticket creation
3. **Test** all scenarios from test guide
4. **Gather feedback** from users
5. **Iterate** based on usage patterns
6. **Add admin dashboard** for ticket management (future)

---

## Documentation Files

- `CHAT_SUPPORT_IMPROVEMENTS_SUMMARY.md` - Detailed implementation guide
- `CHAT_SUPPORT_TEST_GUIDE.md` - Comprehensive testing instructions
- `CHAT_SUPPORT_QUICK_REFERENCE.md` - This file

---

## Support

For detailed information, see:
- Implementation details → `CHAT_SUPPORT_IMPROVEMENTS_SUMMARY.md`
- Testing instructions → `CHAT_SUPPORT_TEST_GUIDE.md`
- Code files → `/server/src/routes/chat.js`, `/server/src/models/ChatTicket.js`

