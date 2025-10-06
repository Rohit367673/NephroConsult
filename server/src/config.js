export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGO_URI: process.env.MONGO_URI || '',
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  OWNER_EMAIL: process.env.OWNER_EMAIL || '',
  // Razorpay Configuration
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'NephroConsult <no-reply@nephroconsult.com>',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || '',
  GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID || '',
  // Firebase Admin (Service Account)
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
};

export const flags = {
  paymentsEnabled: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  emailEnabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  calendarEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CALENDAR_ID),
  firebaseEnabled: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
};
