import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import { env } from './config.js';
import rateLimit from 'express-rate-limit';
import { requireJson, verifyOrigin } from './middlewares/security.js';

// Routes
import authRoutes from './routes/auth.js';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import chatRoutes from './routes/chat.js';
import prescriptionRoutes from './routes/prescriptions.js';
import paymentRoutes from './routes/payments.js';
import { startJobs } from './jobs.js';
import './services/telegramService.js'; // Initialize Telegram service

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = env.NODE_ENV === 'production';

// Database
await connectDB();
await startJobs();

// Security & middleware
// Production-grade security headers
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: isProd ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      connectSrc: ["'self'", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com"],
    },
  } : false,
  hsts: isProd ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
}));
app.use(hpp());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS with credentials for client
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = String(env.CLIENT_URL || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
        
      // Add common Vercel/Netlify domains if not explicitly set
      const defaultAllowed = [
        'https://nephro-consult.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];
      
      const allAllowed = [...new Set([...allowed, ...defaultAllowed])];
      
      console.log('🌐 CORS Check - Origin:', origin);
      console.log('🌐 CORS Check - Allowed origins:', allAllowed);
      
      // Allow requests with no origin (e.g. mobile apps or curl)
      if (!origin) {
        console.log('✅ CORS Allow - No origin (mobile/curl)');
        return callback(null, true);
      }
      
      try {
        const o = new URL(origin);
        const originHost = o.hostname; // ignore port for matching
        const ok = allAllowed.some((u) => {
          try {
            const au = new URL(u);
            const allowedHost = au.hostname;
            const loopback = (h) => h === '127.0.0.1' || h === 'localhost';
            return (
              allowedHost === originHost ||
              (loopback(allowedHost) && loopback(originHost)) ||
              origin === u // Exact match
            );
          } catch {
            return false;
          }
        });
        
        if (ok) {
          console.log('✅ CORS Allow - Origin matched:', origin);
          return callback(null, true);
        } else {
          console.log('❌ CORS Deny - Origin not allowed:', origin);
          return callback(new Error('Not allowed by CORS'));
        }
      } catch (err) {
        console.log('❌ CORS Error - Invalid origin format:', origin, err.message);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Enforce JSON for mutating requests and verify Origin for CSRF mitigation
app.use(requireJson);
if (isProd) {
  app.use(verifyOrigin);
}

// Trust proxy for dev preview proxies and production reverse proxies
app.set('trust proxy', 1);

// Sessions
const sessionConfig = {
  name: 'nephro.sid',
  secret: env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd, // set true behind HTTPS/proxy in production
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    domain: isProd ? undefined : undefined, // Let browser set domain in dev
  },
};

if (env.MONGO_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: env.MONGO_URI,
    ttl: 60 * 60 * 24 * 14, // 14 days
  });
}

app.use(session(sessionConfig));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'NephroConsult API Server',
    status: 'running',
    time: new Date().toISOString(),
    version: '1.0.1' // Updated version to trigger deployment
  });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Mount routes
app.use('/api/chat', chatRoutes);
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Server error';
  if (process.env.NODE_ENV !== 'test') {
    // brief log
    console.error('[ERR]', status, message);
  }
  res.status(status).json({ error: message });
});

const port = env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
