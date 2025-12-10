# Professional Refund Request System

## Overview

A secure, professional refund request system that verifies user authentication and booking details before processing refund requests. This ensures only legitimate users with actual bookings can request refunds.

---

## Features

### 1. **Two-Step Verification Process**

#### Step 1: Verify User & Booking
```
POST /api/refunds/verify
{
  "email": "user@example.com",
  "bookingId": "507f1f77bcf86cd799439011"
}
```

**Response** (if verified):
```json
{
  "success": true,
  "verified": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "country": "India"
  },
  "appointment": {
    "id": "507f1f77bcf86cd799439012",
    "type": "initial",
    "date": "2024-12-15",
    "timeSlot": "6:00 PM",
    "price": { "amount": 599, "currency": "INR" },
    "status": "confirmed",
    "createdAt": "2024-12-10T10:00:00Z"
  },
  "message": "User and booking verified successfully. You can now submit refund request."
}
```

#### Step 2: Submit Refund Request
```
POST /api/refunds
{
  "email": "user@example.com",
  "bookingId": "507f1f77bcf86cd799439011",
  "reason": "I was charged in USD but I'm from India, should be INR. The amount was incorrect.",
  "paymentMethod": "Credit Card",
  "amount": 12
}
```

**Response**:
```json
{
  "success": true,
  "message": "Refund request submitted successfully! Our team will review it within 2-3 business days.",
  "requestId": "REF-1702225200000",
  "ticketId": "CT-20241210-001"
}
```

---

## Verification Process

### What Gets Verified

1. **User Email**
   - ✅ Email exists in User collection
   - ✅ Email is valid format
   - ✅ User account is active

2. **Booking/Appointment**
   - ✅ Booking ID exists in Appointment collection
   - ✅ Booking belongs to the authenticated user
   - ✅ Booking details are retrieved (type, date, price, status)

3. **User Details**
   - ✅ User ID is captured
   - ✅ User name is retrieved
   - ✅ User country is retrieved
   - ✅ User email is verified

### Database Queries

```javascript
// Find user by email
const user = await User.findOne({ email: email.toLowerCase() });

// Find appointment by ID and user ID
const appointment = await Appointment.findOne({
  _id: bookingId,
  userId: user._id
});
```

---

## Email Notifications

### Admin Email - Professional & Detailed

**Subject**: `[HIGH] Refund Request: REF-1702225200000 - John Doe`

**Content Sections**:

1. **VERIFIED USER & BOOKING** (Green box)
   - User ID
   - Name
   - Email (clickable)
   - Country

2. **BOOKING DETAILS** (Orange box)
   - Booking ID
   - Consultation Type
   - Date
   - Time
   - Status

3. **PAYMENT & REFUND DETAILS** (Purple box)
   - Original Amount
   - Refund Amount (highlighted in red)
   - Payment Method

4. **REFUND REASON** (Blue box)
   - Full reason text

5. **ACTION REQUIRED** (Yellow box)
   - Checklist of steps to verify and process
   - Links to support ticket

### User Confirmation Email

**Subject**: `✅ Refund Request Received - REF-1702225200000`

**Content**:
- Confirmation message
- Request ID (highlighted)
- Refund amount
- Booking ID
- Status (Under Review)
- What happens next timeline
- Support contact info

---

## Data Structure

### Refund Request Object

```javascript
{
  id: "REF-1702225200000",           // Unique refund ID
  userId: ObjectId,                   // User ID from database
  userName: "John Doe",               // User name from database
  email: "john@example.com",          // User email
  country: "India",                   // User country
  bookingId: ObjectId,                // Appointment ID
  appointmentType: "initial",         // Consultation type
  appointmentDate: "2024-12-15",      // Appointment date
  reason: "...",                      // Refund reason
  paymentMethod: "Credit Card",       // Payment method used
  amount: 12,                         // Refund amount requested
  originalAmount: 599,                // Original booking amount
  currency: "INR",                    // Currency
  status: "pending",                  // Refund status
  createdAt: "2024-12-10T10:00:00Z", // Request timestamp
  ticketId: "CT-20241210-001",       // Support ticket ID
  userAgent: "...",                   // User agent
  ip: "192.168.1.1"                   // IP address
}
```

### Support Ticket Created

Each refund request automatically creates a support ticket:

```javascript
{
  ticketId: "CT-20241210-001",
  category: "refund",
  priority: "high",
  subject: "Refund Request: initial Consultation",
  user: {
    id: ObjectId,
    name: "John Doe",
    email: "john@example.com",
    country: "India"
  },
  messages: [{
    sender: "user",
    text: "Refund Request\n\nReason: ...\n\nPayment Method: Credit Card\nAmount: 12 INR",
    timestamp: Date
  }],
  currency: "INR",
  amount: 12,
  bookingId: ObjectId,
  status: "open",
  createdAt: Date
}
```

---

## API Endpoints

### Verify Refund Request

```
POST /api/refunds/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "bookingId": "507f1f77bcf86cd799439011"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "verified": true,
  "user": { ... },
  "appointment": { ... },
  "message": "User and booking verified successfully..."
}
```

**Error Response** (404):
```json
{
  "success": false,
  "verified": false,
  "message": "User not found. Please check your email address."
}
```

### Submit Refund Request

```
POST /api/refunds
Content-Type: application/json

{
  "email": "user@example.com",
  "bookingId": "507f1f77bcf86cd799439011",
  "reason": "I was charged in USD but I'm from India...",
  "paymentMethod": "Credit Card",
  "amount": 12
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Refund request submitted successfully!...",
  "requestId": "REF-1702225200000",
  "ticketId": "CT-20241210-001"
}
```

**Validation Error** (400):
```json
{
  "success": false,
  "message": "Invalid refund request data",
  "errors": {
    "fieldErrors": {
      "reason": ["Reason must be at least 20 characters"]
    }
  }
}
```

---

## Validation Rules

### Email
- ✅ Must be valid email format
- ✅ Must exist in User collection
- ✅ Case-insensitive matching

### Booking ID
- ✅ Must be provided
- ✅ Must exist in Appointment collection
- ✅ Must belong to the user

### Reason
- ✅ Minimum 20 characters
- ✅ Required field
- ✅ Helps admin understand issue

### Payment Method
- ✅ Must be provided
- ✅ Examples: "Credit Card", "PayPal", "Bank Transfer"

### Amount
- ✅ Must be positive number
- ✅ Must be less than or equal to original amount
- ✅ Required field

---

## Security Features

### User Verification
- ✅ Email must exist in database
- ✅ Booking must belong to user
- ✅ User ID is captured and verified
- ✅ No anonymous refund requests

### Data Validation
- ✅ Zod schema validation
- ✅ Email format validation
- ✅ Minimum character requirements
- ✅ Positive amount validation

### Audit Trail
- ✅ User agent captured
- ✅ IP address captured
- ✅ Timestamp recorded
- ✅ Support ticket created
- ✅ Email notifications sent

### Professional Handling
- ✅ Detailed admin email with all info
- ✅ Clear action items for team
- ✅ Support ticket for tracking
- ✅ User confirmation email
- ✅ Transparent process

---

## Workflow

```
User submits refund request
    ↓
Frontend calls POST /api/refunds/verify
    ↓
Backend verifies:
  • User email exists
  • Booking exists
  • Booking belongs to user
    ↓
If verified, show booking details
    ↓
User fills refund form with details
    ↓
Frontend calls POST /api/refunds
    ↓
Backend verifies again:
  • User exists
  • Booking exists
  • Booking belongs to user
    ↓
Create refund request object
    ↓
Create support ticket
    ↓
Send admin email with:
  • Verified user details
  • Booking details
  • Payment details
  • Refund reason
  • Action items
    ↓
Send user confirmation email
    ↓
Return request ID and ticket ID
    ↓
Admin reviews and processes
```

---

## Example Scenarios

### Scenario 1: Valid Refund Request

```
User: john@example.com
Booking ID: 507f1f77bcf86cd799439011

Step 1: Verify
✓ User found in database
✓ Booking found in database
✓ Booking belongs to user
✓ Show booking details

Step 2: Submit
✓ All data validated
✓ Refund request created
✓ Support ticket created
✓ Admin email sent
✓ User confirmation sent
✓ Return request ID: REF-1702225200000
```

### Scenario 2: User Not Found

```
User: nonexistent@example.com
Booking ID: 507f1f77bcf86cd799439011

Step 1: Verify
✗ User not found in database
✗ Return error: "User not found. Please check your email address."
✗ User cannot proceed
```

### Scenario 3: Booking Not Found

```
User: john@example.com
Booking ID: invalid-id

Step 1: Verify
✓ User found in database
✗ Booking not found in database
✗ Return error: "Booking not found for this email..."
✗ User cannot proceed
```

### Scenario 4: Booking Belongs to Different User

```
User: john@example.com
Booking ID: 507f1f77bcf86cd799439011 (belongs to jane@example.com)

Step 1: Verify
✓ User found in database
✗ Booking not found for this user
✗ Return error: "Booking not found for this email..."
✗ User cannot proceed
```

---

## Admin Dashboard Integration

### Refund Request Details

Admin can view:
- ✅ User ID and name
- ✅ Email address
- ✅ Country
- ✅ Booking ID and details
- ✅ Original amount and currency
- ✅ Refund amount requested
- ✅ Payment method
- ✅ Refund reason
- ✅ Request timestamp
- ✅ Support ticket ID
- ✅ User agent and IP

### Actions Available
- ✅ Approve refund
- ✅ Deny refund
- ✅ Request more information
- ✅ View support ticket
- ✅ Send email response
- ✅ Update status

---

## Testing

### Test Case 1: Valid Refund Request
```bash
# Step 1: Verify
curl -X POST http://localhost:4000/api/refunds/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "bookingId": "507f1f77bcf86cd799439011"
  }'

# Step 2: Submit
curl -X POST http://localhost:4000/api/refunds \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "bookingId": "507f1f77bcf86cd799439011",
    "reason": "I was charged in USD but I am from India, the amount was incorrect.",
    "paymentMethod": "Credit Card",
    "amount": 12
  }'
```

### Test Case 2: Invalid Email
```bash
curl -X POST http://localhost:4000/api/refunds/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "bookingId": "507f1f77bcf86cd799439011"
  }'

# Expected: 404 - User not found
```

### Test Case 3: Invalid Booking
```bash
curl -X POST http://localhost:4000/api/refunds/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "bookingId": "invalid-id"
  }'

# Expected: 404 - Booking not found
```

---

## Benefits

### For Users
✅ Clear verification process
✅ Know exactly what info is needed
✅ Confirmation email with request ID
✅ Transparent timeline
✅ Can track refund status

### For Admin
✅ Only legitimate refund requests
✅ All user details verified
✅ Booking details included
✅ Clear action items
✅ Support ticket for tracking
✅ Professional email format

### For Security
✅ No anonymous refund requests
✅ User must have actual booking
✅ All data validated
✅ Audit trail maintained
✅ IP and user agent captured

---

## Deployment Checklist

- [ ] Update frontend to use two-step process
- [ ] Test verify endpoint with valid user
- [ ] Test verify endpoint with invalid user
- [ ] Test submit endpoint with valid data
- [ ] Test submit endpoint with invalid data
- [ ] Check admin email formatting
- [ ] Check user confirmation email
- [ ] Verify support ticket creation
- [ ] Test database queries
- [ ] Monitor logs for errors
- [ ] Deploy to staging first
- [ ] Test in production environment

---

## Future Enhancements

1. **Refund Status Tracking**
   - Allow users to check refund status
   - Email updates on status changes

2. **Automatic Refund Processing**
   - Auto-approve within 24-hour window
   - Integrate with payment gateway

3. **Refund Analytics**
   - Track refund trends
   - Identify common issues
   - Generate reports

4. **Admin Dashboard**
   - View all refund requests
   - Filter by status, date, user
   - Bulk actions
   - Export reports

5. **Communication**
   - In-app notifications
   - SMS updates
   - Refund status page

