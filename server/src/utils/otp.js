import crypto from 'crypto';

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// OTP configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export function storeOTP(email, otp) {
  const expiresAt = Date.now() + OTP_EXPIRY;
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt,
    attempts: 0
  });
}

export function verifyOTP(email, providedOTP) {
  const normalizedEmail = email.toLowerCase();
  const stored = otpStore.get(normalizedEmail);
  
  if (!stored) {
    return { valid: false, error: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: 'OTP has expired' };
  }
  
  if (stored.attempts >= 3) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: 'Too many attempts. Please request a new OTP' };
  }
  
  stored.attempts++;
  
  if (stored.otp !== providedOTP) {
    return { valid: false, error: 'Invalid OTP' };
  }
  
  // OTP is valid, remove it from store
  otpStore.delete(normalizedEmail);
  return { valid: true };
}

export function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}

// Cleanup expired OTPs every 10 minutes
setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);
