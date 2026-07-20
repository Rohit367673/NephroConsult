# NephroConsult Website - Complete Working Flow Documentation

## Overview

NephroConsult is a telemedicine platform for nephrology consultations, providing expert kidney care through secure HD video consultations. The platform connects patients with Dr. Ilango S. Prakasam, a Senior Nephrologist with 15+ years of experience.

**Website URL:** https://nephroconsultation.com

---

## Architecture

### Frontend
- **Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 6.3.5
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **State Management:** React Context API
- **Routing:** React Router
- **Authentication:** Firebase Authentication + Session-based fallback

### Backend
- **Runtime:** Node.js + Express
- **Database:** MongoDB Atlas with Mongoose ODM
- **Session Management:** Express Session with MongoDB store
- **Payment Gateway:** Cashfree
- **Email Service:** Resend API (SMTP)
- **Notifications:** Telegram Bot for doctor alerts

---

## Project Structure

```
NephroConsult/
├── International Nephrology Consultation Platform/  # Frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── utils/               # Utility functions
│   │   ├── contexts/            # React contexts
│   │   └── config/              # Configuration files
│   ├── public/                  # Static assets
│   └── vite.config.ts           # Vite configuration
│
└── server/                      # Backend
    ├── src/
    │   ├── routes/              # API route handlers
    │   ├── models/              # Mongoose schemas
    │   ├── utils/               # Utility functions
    │   ├── services/            # External service integrations
    │   ├── jobs.js              # Scheduled tasks with Agenda
    │   ├── config.js            # Environment configuration
    │   └── server.js            # Express entry point
    └── .env                     # Environment variables
```

---

## User Journey & Booking Flow

### 1. Landing & Navigation

**Home Page (`/`)**
- Hero section with doctor introduction
- Service highlights (HD Video, Digital Prescriptions, Lab Analysis)
- Patient testimonials
- Quick stats (5,000+ patients served)
- Call-to-action buttons

**Navigation Routes:**
- `/` - Home page
- `/about` - Doctor information and qualifications
- `/book` - Booking page with full consultation flow
- `/contact` - Contact form and support options
- `/profile` - Patient dashboard (authenticated)
- `/login` - Login page
- `/signup` - Registration page

### 2. Authentication Flow

**Login Options:**
1. **Google Sign-in** (Firebase Authentication)
   - One-click authentication
   - Automatic profile creation
   - Session management

2. **Email/Password** (Session-based)
   - Traditional login
   - Session cookies for persistence
   - Fallback for Firebase issues

**Session Management:**
- Sessions stored in MongoDB
- Cookie configuration for cross-domain support
- Secure cookies in production
- Session timeout: 24 hours

### 3. Consultation Booking Flow (5-Step Process)

#### Step 1: Consultation Type Selection

**Available Consultation Types:**

| Type | Duration | India Price | International Price | Features |
|------|----------|-------------|---------------------|----------|
| Initial Consultation | 45 min | ₹499 | $29 | Comprehensive assessment, treatment plan |
| Follow-up Consultation | 30 min | ₹399 | $19 | Progress review, treatment adjustments |
| Urgent Consultation | 45 min | ₹999 | $49 | Same-day availability, connect within 1 hour |

**Dynamic Pricing:**
- Prices automatically adjust based on user's country/timezone
- Discount badges show savings (40-50% OFF)
- Currency symbol and formatting per region

#### Step 2: Date & Time Selection

**Calendar Features:**
- Interactive calendar with month navigation
- Past dates disabled
- **Same-day booking restriction:** Only Urgent Consultations can book for current day
- Alert message shown for non-urgent consultations

**Time Slot Selection:**
- Time slots based on consultation type:
  - Regular: 6:00 PM - 10:00 PM IST
  - Urgent: 10:00 AM - 10:00 PM IST
- Automatic timezone conversion for international users
- Slots disabled if within 1 hour of current time (for same-day bookings)
- Real-time availability checking

#### Step 3: Patient Information

**Auto-filled Fields:**
- Name (from user profile)
- Email (from user profile)
- Phone (optional, can be updated)
- Country (detected from timezone)

**Additional Fields:**
- Medical history summary
- Current medications
- Symptoms description

#### Step 4: Medical Information & Document Upload

**Document Upload:**
- Supports multiple file formats (PDF, images, etc.)
- Files converted to base64 for secure transmission
- Maximum 10 documents per booking
- File size limit: 5MB per file

**Medical Information:**
- Detailed symptoms description
- Medical history
- Current medications list
- Lab reports (optional but recommended)

#### Step 5: Payment & Confirmation

**Payment Methods:**
- Cashfree payment gateway
- Credit/Debit cards
- Net banking
- UPI (for India)

**Payment Flow:**
1. User selects payment method
2. Redirects to Cashfree secure payment page
3. Payment processing
4. Success/failure callback
5. Appointment confirmation

**Confirmation:**
- Secure Google Meet link generated
- Email confirmation sent
- SMS notification (if phone provided)
- Calendar invite (optional)

---

## Business Rules & Restrictions

### 1. Daily Appointment Limit
- **Rule:** Maximum 2 appointments per day per user
- **Implementation:** Backend validation in `server/src/routes/bookings.js`
- **Error Message:** "Maximum 2 appointments allowed per day per user. Please choose a different date."

### 2. Same-Day Booking Restriction
- **Rule:** Only Urgent Consultations can be booked for the current day
- **Implementation:** Frontend calendar validation in `src/pages/BookingPage.tsx`
- **User Experience:** Today's date disabled for non-urgent consultations with alert message

### 3. Time Slot Availability
- **Rule:** Time slots must be at least 1 hour in the future for same-day bookings
- **Implementation:** Time slot validation in `src/utils/timezoneUtils.ts`
- **User Experience:** Past and near-future slots disabled

### 4. Collision Prevention
- **Rule:** Cannot book the same time slot twice
- **Implementation:** Database query checks existing appointments
- **Error Message:** "Time slot already booked"

---

## Pricing System

### Dynamic Pricing Logic

**Pricing Tiers:**

1. **Tier A (India & Cheap Countries):**
   - Countries: India, Sri Lanka, Bangladesh, Nepal, Pakistan
   - Currency: INR (₹)
   - Prices: ₹499 / ₹399 / ₹999

2. **Tier B (Middle-Income Countries):**
   - Countries: Brazil, South Africa, Egypt, etc.
   - Currency: Local currency
   - Multiplier: 1.8x base price

3. **Tier C (High-Income Countries):**
   - Countries: US, UK, EU, Canada, Australia, Japan, Singapore, etc.
   - Currency: USD ($)
   - Prices: $29 / $19 / $49

### Pricing Calculation Flow

```
User Timezone Detection
    ↓
Country Identification
    ↓
Pricing Tier Assignment
    ↓
Currency & Price Selection
    ↓
Discount Application (if first-time user)
    ↓
Display Price Calculation
```

### First-Time Discount
- **Discount:** 20% off first consultation
- **Applied automatically** for new users
- **Stored in appointment record** for tracking

---

## Backend API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `POST /google-signin` - Google authentication

### Bookings (`/api/bookings`)
- `POST /appointments` - Create appointment
- `GET /appointments/mine` - Get user's appointments
- `GET /appointments/:id` - Get appointment details
- `POST /appointments/:id/prescription` - Add prescription
- `POST /pricing` - Get pricing for consultation type
- `POST /appointments/create-test` - Create test appointment (debug)

### Payments (`/api/payments`)
- `POST /initiate` - Initiate Cashfree payment
- `POST /verify` - Verify payment status
- `POST /refund` - Process refund

### Chat Support (`/api/chat`)
- `POST /message` - Send chat message
- `GET /tickets/:id` - Get ticket by ID
- `GET /tickets/user/:email` - Get user's tickets

---

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  country: String,
  firebaseUid: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Model
```javascript
{
  _id: ObjectId,
  patient: {
    id: ObjectId (ref: User),
    name: String,
    email: String,
    phone: String,
    country: String
  },
  doctor: {
    name: String,
    title: String,
    qualifications: String,
    experience: String,
    email: String
  },
  date: String (YYYY-MM-DD),
  timeSlot: String,
  type: String,
  status: String (confirmed, completed, cancelled),
  price: {
    amount: Number,
    currency: String,
    symbol: String,
    region: String,
    discountApplied: Boolean,
    displayPrice: Number,
    displayCurrency: String,
    tier: String
  },
  meetLink: String,
  intake: {
    address: String,
    description: String,
    documents: [String] (base64),
    patientInfo: {
      phone: String,
      medicalHistory: String,
      currentMedications: String
    }
  },
  reminderSent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### ChatTicket Model
```javascript
{
  _id: ObjectId,
  ticketId: String (CT-YYYYMMDD-###),
  category: String,
  priority: String,
  status: String,
  messages: [{
    sender: String,
    text: String,
    timestamp: Date
  }],
  userEmail: String,
  userMetadata: {
    country: String,
    timezone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

### Authentication & Authorization
- Firebase Authentication with secure tokens
- Session-based authentication with secure cookies
- Role-based access control (patient, doctor, admin)
- Protected routes requiring authentication

### Data Protection
- All consultations encrypted (HIPAA compliant)
- Secure file upload with base64 encoding
- No data sharing with third parties
- Regular security audits

### Payment Security
- PCI-compliant payment processing via Cashfree
- Secure payment page (HTTPS)
- No card details stored on server
- Automatic receipts via email

### Session Security
- Secure cookies with HttpOnly flag
- SameSite cookie attribute
- Cookie domain configuration for cross-domain support
- Session timeout after 24 hours

---

## Notification System

### Email Notifications
**Triggered Events:**
- Appointment booking confirmation
- Payment success/failure
- Appointment reminders (24 hours before)
- Prescription updates
- Support ticket creation

**Email Service:** Resend API
**Template:** HTML email templates with branding

### Telegram Notifications
**Triggered Events:**
- New appointment booking
- Urgent consultation requests
- Payment issues
- Support tickets (complaints)

**Recipient:** Dr. Ilango (Doctor)
**Bot:** NephroConsult Telegram Bot

### SMS Notifications (Optional)
- Appointment reminders
- Payment confirmations
- Urgent alerts

---

## Development Commands

### Frontend
```bash
cd "International Nephrology Consultation Platform"

# Install dependencies
npm install

# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend
```bash
cd server

# Install dependencies
npm install

# Start development server (localhost:4000)
npm run dev

# Start production server
npm run start:prod

# Test Cashfree payment integration
npm run test:cashfree

# Validate environment variables
npm run validate:env
```

---

## Environment Variables

### Backend (`server/.env`)
```bash
# Database
MONGO_URI=mongodb+srv://...

# Session
SESSION_SECRET=your-secret-key

# Payment (Cashfree)
CASHFREE_APP_ID=your-app-id
CASHFREE_SECRET_KEY=your-secret-key
CASHFREE_API_URL=https://sandbox.cashfree.com/api

# Email (Resend)
SMTP_PASS=your-resend-api-key
SMTP_FROM=noreply@nephroconsultation.com

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
DOCTOR_TELEGRAM_CHAT_ID=your-chat-id

# Admin
ADMIN_EMAIL=admin@nephroconsultation.com
DOCTOR_EMAIL=suyambu54321@gmail.com
OWNER_EMAIL=suyambu54321@gmail.com
```

### Frontend (`International Nephrology Consultation Platform/.env`)
```bash
# API
VITE_API_URL=http://localhost:4000

# Payment
VITE_CASHFREE_APP_ID=your-app-id

# Firebase Client
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## Deployment

### Frontend (Vercel)
- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Configured in Vercel dashboard
- **Domain:** nephroconsultation.com

### Backend (Render)
- **Platform:** Render
- **Runtime:** Node.js
- **Start Command:** `npm run start:prod`
- **Environment Variables:** Configured in Render dashboard
- **Database:** MongoDB Atlas (external)

---

## Troubleshooting

### Common Issues

**1. White Screen on Load**
- **Cause:** Multiple React instances
- **Solution:** Check vite.config.ts for React aliases
- **Command:** `npm ls react react-dom`

**2. Payment 405 Error**
- **Cause:** API URL configuration
- **Solution:** Check VITE_API_URL in frontend .env
- **Reference:** PAYMENT_DEPLOYMENT_FIX.md

**3. Session Issues on Mobile**
- **Cause:** Cookie domain configuration
- **Solution:** Set cookie domain to .nephroconsultation.com
- **File:** server/src/server.js (session config)

**4. Profile Images Not Loading**
- **Cause:** CORS or loading logic
- **Solution:** Check image loading with fallback
- **File:** src/pages/ProfilePage.tsx

---

## Support & Contact

### For Patients
- **Email:** support@nephroconsultation.com
- **Live Chat:** Available on website 24/7
- **Phone:** +91 XXXXX XXXXX (urgent only)

### For Technical Issues
- **Documentation:** This file
- **GitHub Issues:** [Repository Issues]
- **Developer Contact:** dev@nephroconsultation.com

---

## Future Enhancements

### Planned Features
1. **Mobile App** (iOS & Android)
2. **Prescription Delivery Integration**
3. **Lab Test Booking Integration**
4. **Video Recording Storage**
5. **Multi-language Support**
6. **Insurance Verification**
7. **Payment Plans**
8. **AI Symptom Checker**
9. **Health Dashboard**
10. **Doctor-Patient Messaging**

---

## Version History

### v1.0.0 (Current)
- Initial release
- Core booking flow
- Payment integration
- Firebase authentication
- Email notifications
- Telegram notifications
- Dynamic pricing
- Document upload
- Admin panel

### Recent Updates
- Updated pricing (India: ₹499/₹399/₹999, International: $29/$19/$49)
- Same-day booking restriction (urgent only)
- Daily appointment limit (max 2 per user)
- Discount display with badges
- Urgent consultation priority messaging
- Chat support with ticket system
- Currency correction feature
- SEO optimizations
- Performance improvements

---

## License & Copyright

**© 2025 NephroConsult. All rights reserved.**

**Doctor:** Dr. Ilango S. Prakasam
**Qualifications:** MD, DNB (Nephrology), MRCP (UK)
**Experience:** 15+ Years

---

## Quick Reference

### Key Files
- **Booking Flow:** `src/pages/BookingPage.tsx`
- **Pricing Logic:** `server/src/utils/pricing.js`
- **Payment Integration:** `src/utils/cashfreeUtils.ts`
- **Booking Routes:** `server/src/routes/bookings.js`
- **Timezone Utils:** `src/utils/timezoneUtils.ts`

### Key Functions
- `getConsultationPrice()` - Calculate consultation price
- `getDisplayedPrice()` - Get pricing with currency conversion
- `initiateCashfreePayment()` - Start payment process
- `verifyCashfreePayment()` - Verify payment status
- `getAvailableTimeSlotsForUser()` - Get available time slots

### Important Constants
- **Doctor Hours:** 6 PM - 10 PM IST (regular), 10 AM - 10 PM IST (urgent)
- **Session Timeout:** 24 hours
- **Max Appointments/Day:** 2 per user
- **Max Documents:** 10 per booking
- **File Size Limit:** 5MB per file

---

*Last Updated: July 11, 2026*
*Document Version: 1.0.0*
