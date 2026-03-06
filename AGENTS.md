# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

NephroConsult is a telemedicine platform for nephrology consultations. It's a monorepo containing:
- **Frontend**: `International Nephrology Consultation Platform/` - React + TypeScript + Vite
- **Backend**: `server/` - Node.js + Express + MongoDB

## Development Commands

### Frontend (from `International Nephrology Consultation Platform/`)
```bash
npm install           # Install dependencies
npm run dev           # Start dev server on localhost:3000
npm run build         # Production build to dist/
npm run preview       # Preview production build
```

### Backend (from `server/`)
```bash
npm install           # Install dependencies
npm run dev           # Start with nodemon on localhost:4000
npm run start:prod    # Production mode with NODE_ENV=production
npm run test:cashfree # Test Cashfree payment integration
npm run validate:env  # Verify environment variables are loaded
```

### Running Both Services Together
Start backend first (port 4000), then frontend (port 3000). Frontend proxies `/api` requests to backend via vite.config.ts.

## Architecture

### Frontend Structure (`International Nephrology Consultation Platform/src/`)
- `App.tsx` - Main application with routing (single large file with all routes)
- `components/` - React components (feature components + `ui/` for Radix-based primitives)
- `services/` - API communication layer
  - `apiService.ts` - Centralized fetch wrapper with credentials
  - `authService.ts` - Firebase and session auth
- `utils/` - Utilities (cashfreeUtils, timezoneUtils, seoConfigs)
- `config/` - Firebase and app configuration

### Backend Structure (`server/src/`)
- `server.js` - Express entry point with middleware setup
- `config.js` - Environment variable exports with feature flags
- `routes/` - API route handlers
  - `auth.js` - Authentication (email/password + Firebase)
  - `bookings.js` - Appointment creation and management
  - `payments.js` - Cashfree payment processing
  - `chat.js` - AI chatbot with OpenAI integration
  - `refunds.js` - Refund processing
- `models/` - Mongoose schemas (User, Appointment, Prescription, ChatTicket)
- `utils/` - Email templates, pricing logic, payment validation
- `services/` - Telegram notifications, external integrations
- `jobs.js` - Scheduled tasks with Agenda

### Key Integrations
- **Auth**: Firebase Authentication (Google Sign-in) + session-based fallback
- **Payments**: Cashfree payment gateway with regional pricing (INR, USD, EUR, GBP, AUD)
- **Email**: Nodemailer with SMTP (uses Resend API)
- **Database**: MongoDB Atlas with Mongoose
- **Notifications**: Telegram bot for doctor alerts

### Session & CORS
Backend uses express-session with MongoDB store. CORS is configured for:
- Production: `nephroconsultation.com`, `www.nephroconsultation.com`
- Development: `localhost:3000`, `localhost:5173`

All API requests require `credentials: 'include'` for session cookies.

## Environment Setup

Copy `.env.example` to `.env` in both directories. Required variables:

**Backend** (`server/.env`):
- `MONGO_URI` - MongoDB connection string
- `SESSION_SECRET` - Session encryption key
- `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY` - Payment gateway
- `SMTP_PASS`, `SMTP_FROM` - Email (Resend API key)
- Firebase Admin SDK credentials for auth verification

**Frontend** (`International Nephrology Consultation Platform/.env`):
- `VITE_API_URL` - Backend URL (defaults to proxy in dev)
- `VITE_CASHFREE_APP_ID` - Payment gateway client ID
- Firebase client config (`VITE_FIREBASE_*`)

## Deployment

- **Frontend**: Vercel (configured via root `vercel.json`)
- **Backend**: Render or similar Node.js hosting
- Production domain: `nephroconsultation.com`

## Code Patterns

### API Calls (Frontend)
Use `apiService` from `services/apiService.ts`:
```typescript
import { apiService } from '@/services/apiService';
const response = await apiService.getCurrentUser();
```

### Route Handlers (Backend)
Routes export Express routers, mounted in `server.js`:
```javascript
import authRoutes from './routes/auth.js';
app.use('/api/auth', authLimiter, authRoutes);
```

### Feature Flags
Check `flags` export from `server/src/config.js` for optional feature availability:
```javascript
import { flags } from './config.js';
if (flags.paymentsEnabled) { /* ... */ }
```
