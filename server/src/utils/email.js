import nodemailer from 'nodemailer';
import { env, flags } from '../config.js';

let transporter = null;
if (flags.emailEnabled) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: { 
      user: env.SMTP_USER, 
      pass: env.SMTP_PASS 
    },
    // Add timeout and connection options for better reliability
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
  });
  
  console.log(`📧 Email service configured: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
}

export async function sendEmail(to, subject, html, options = {}) {
  const { 
    critical = false, // If true, will throw error even in production
    category = 'general' // Category for logging: 'otp', 'prescription', 'reminder', 'contact', etc.
  } = options;

  if (!flags.emailEnabled) {
    console.log(`[email:dev:${category}]`, { to, subject });
    return { ok: true, mock: true, category };
  }
  
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ [${category}] Email sent successfully to ${to} (${info.messageId})`);
    return { ok: true, id: info.messageId, category };
  } catch (error) {
    console.error(`❌ [${category}] Email failed to ${to}:`, error.message);
    
    // Log the failure with category for better debugging
    console.log(`📝 [${category}] FAILED EMAIL DETAILS:`, {
      to,
      subject,
      error: error.message,
      timestamp: new Date().toISOString(),
      htmlPreview: html.substring(0, 200) + '...'
    });
    
    // In production, handle non-critical emails gracefully
    if (env.NODE_ENV === 'production' && !critical) {
      console.log(`📝 [${category}] FALLBACK: Email service unavailable for ${to}`);
      
      // Store failed email details for potential manual handling
      console.log(`📧 [${category}] Email would have been sent:`, {
        to,
        subject,
        category,
        failureReason: error.message
      });
      
      // Return success so the main process continues
      return { ok: true, fallback: true, error: error.message, category };
    }
    
    // For critical emails or development, throw the error
    throw error;
  }
}

// Specialized email functions for different categories
export async function sendOTPEmail(to, subject, html) {
  return sendEmail(to, subject, html, { 
    category: 'otp', 
    critical: false // OTP can use fallback display
  });
}

export async function sendPrescriptionEmail(to, subject, html) {
  return sendEmail(to, subject, html, { 
    category: 'prescription', 
    critical: false // Prescription saved anyway
  });
}

export async function sendReminderEmail(to, subject, html) {
  return sendEmail(to, subject, html, { 
    category: 'reminder', 
    critical: false // Reminders are helpful but not critical
  });
}

export async function sendContactEmail(to, subject, html) {
  return sendEmail(to, subject, html, { 
    category: 'contact', 
    critical: false // Contact forms can be handled manually
  });
}

export async function sendPaymentEmail(to, subject, html) {
  return sendEmail(to, subject, html, { 
    category: 'payment', 
    critical: false // Payment info is stored in DB
  });
}

export async function sendBookingEmail(to, subject, html) {
  return sendEmail(to, subject, html, { 
    category: 'booking', 
    critical: false // Booking confirmed in DB
  });
}
