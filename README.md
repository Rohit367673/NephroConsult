
# 🏥 NephroConsult - International Nephrology Consultation Platform

A comprehensive telemedicine platform connecting patients worldwide with **Dr. Ilango S. Prakasam** (Sr. Nephrologist) for expert kidney care consultations.

## 🌟 Features

- **🎥 HD Video Consultations** - Secure video calls with nephrology expert
- **💰 Multi-Currency Payments** - Cashfree integration with regional pricing
- **📧 Professional Email System** - Automated confirmations and reminders
- **🌍 Global Access** - Multi-timezone support with automatic conversion
- **🔐 Secure Authentication** - Firebase authentication with session management
- **📱 Responsive Design** - Works seamlessly on all devices
- **🤖 AI Chatbot** - 24/7 patient support and guidance

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- Modern React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Firebase Authentication
- Cashfree Payment Integration

### Backend (Node.js + Express)
- Express.js REST API
- MongoDB with Mongoose
- Nodemailer for emails
- Cashfree payment processing
- JWT session management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Firebase project
- Cashfree account
- Gmail account (for SMTP)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd N-Consultaion
```

### 2. Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 3. Client Setup
```bash
cd "International Nephrology Consultation Platform"
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## 🔧 Environment Configuration

### Server Environment Variables (.env)
```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nephroconsult

# Security
SESSION_SECRET=your-super-secure-session-secret
OWNER_EMAIL=admin@yourdomain.com

# Payments
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENVIRONMENT=sandbox

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Client Environment Variables (.env)
```bash
# Payments
VITE_CASHFREE_APP_ID=your-cashfree-app-id

# API
VITE_API_URL=https://your-api-domain.com

# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 🌐 Production Deployment

### 1. Frontend Deployment (Vercel/Netlify)
```bash
cd "International Nephrology Consultation Platform"
npm run build
# Deploy dist/ folder to your hosting provider
```

### 2. Backend Deployment (Railway/Heroku/DigitalOcean)
```bash
cd server
npm run start:prod
```

### 3. Database Setup (MongoDB Atlas)
- Create MongoDB Atlas cluster
- Set up database user and network access
- Copy connection string to MONGO_URI

### 4. Payment Setup (Cashfree)
- Complete KYC verification
- Get live API keys (App ID and Secret Key)
- Set up webhook: `https://your-domain.com/api/payments/webhook`
- Configure CASHFREE_ENVIRONMENT (sandbox or production)

## 💰 Regional Pricing

| Region | Initial | Follow-up | Urgent |
|--------|---------|-----------|--------|
| 🇮🇳 India | ₹2,500 | ₹1,800 | ₹3,750 |
| 🇺🇸 USA | $30 | $22 | $45 |
| 🇪🇺 Europe | €28 | €20 | €42 |
| 🇬🇧 UK | £25 | £18 | £38 |
| 🇦🇺 Australia | A$45 | A$32 | A$68 |

## 🔐 Security Features

- **HTTPS Enforced** - SSL/TLS encryption
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Zod schema validation
- **Payment Security** - HMAC signature verification
- **Session Management** - Secure JWT sessions

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Email verification
- `GET /api/auth/me` - Get current user

### Appointments
- `GET /api/appointments/mine` - User's appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment details

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify-payment` - Verify payment
- `GET /api/payments/config` - Payment configuration

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id` - Get prescription details

## 🧪 Testing

### Server Tests
```bash
cd server
npm run test:cashfree        # Test payment integration
npm run check:production     # Validate production readiness
npm run validate:env         # Check environment variables
```

### Payment Testing
- Use Cashfree sandbox mode for testing
- Test with Cashfree test cards and payment methods
- Verify webhook notifications
- Test multi-currency payments (INR, USD, EUR, GBP)

## 📱 Doctor Information

**Dr. Ilango S. Prakasam**
- Sr. Nephrologist
- MBBS, MD, DM (Nephrology)
- 15+ Years Experience
- 5,000+ Patients Treated Worldwide

## 🌟 Key Features

### For Patients
- **Global Access** - Consultations from anywhere
- **Regional Pricing** - Currency-specific pricing
- **Professional Care** - Expert nephrology consultations
- **Digital Prescriptions** - Secure prescription delivery
- **24/7 Support** - AI chatbot assistance

### For Healthcare Providers
- **Telemedicine Platform** - Complete consultation management
- **Payment Processing** - Automated billing and receipts
- **Patient Records** - Comprehensive medical history
- **Email Notifications** - Automated communication

## 🔍 Monitoring & Analytics

### Health Checks
- Server health: `GET /api/health`
- Payment status: `GET /api/payments/config`
- Database connectivity monitoring

### Logging
- Payment transactions
- User authentication events
- System errors and warnings
- Performance metrics

## 🆘 Support & Troubleshooting

### Common Issues
1. **Payment Failures** - Check Cashfree credentials (App ID, Secret Key) and webhook setup
2. **Email Issues** - Verify SMTP configuration and app passwords
3. **Authentication Problems** - Check Firebase configuration
4. **Database Errors** - Verify MongoDB Atlas connection string

### Contact Information
- **Technical Support**: Check deployment documentation
- **Payment Issues**: Cashfree dashboard and logs
- **General Questions**: Review API documentation

## 📄 License

This project is proprietary software for NephroConsult International Platform.

## 🔄 Version History

- **v1.0.0** - Initial production release
  - Complete telemedicine platform
  - Multi-currency payment system
  - Global consultation booking
  - Professional email system

---

**🏥 NephroConsult - Expert Kidney Care, Globally Accessible**

*Last Updated: October 6, 2024*