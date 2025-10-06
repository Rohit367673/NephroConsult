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
    // Enhanced connection options for Gmail SMTP issues
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds  
    socketTimeout: 60000, // 60 seconds
    // Try to bypass some blocking
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    // Force IPv4 (sometimes helps with cloud providers)
    family: 4,
    // Add debug for troubleshooting
    debug: env.NODE_ENV !== 'production'
  });
  
  console.log(`📧 Email service configured: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
}

export async function sendEmail(to, subject, html, options = {}) {
  const { 
    critical = true, // Always fail if email doesn't work - no fallbacks
    category = 'general'
  } = options;

  if (!flags.emailEnabled) {
    throw new Error('Email service disabled in configuration');
  }
  
  console.log(`🔍 [${category}] Attempting to send email to ${to}`);
  console.log(`🔍 [${category}] SMTP Config: ${env.SMTP_HOST}:${env.SMTP_PORT}, user: ${env.SMTP_USER}`);
  console.log(`🔍 [${category}] SMTP_PASS starts with: ${env.SMTP_PASS?.substring(0, 5)}...`);
  
  // Force Resend HTTP API if we detect Resend configuration
  if (env.SMTP_HOST === 'smtp.resend.com' && env.SMTP_PASS?.startsWith('re_')) {
    console.log(`🚀 [${category}] Using Resend HTTP API (bypassing SMTP)`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SMTP_PASS}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.SMTP_FROM,
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ [${category}] Email sent via Resend API to ${to} (${result.id})`);
      return { ok: true, id: result.id, category, method: 'resend-api' };
    } else {
      const errorText = await response.text();
      console.error(`❌ [${category}] Resend API failed: ${response.status} - ${errorText}`);
      throw new Error(`Resend API failed: ${response.status} - ${errorText}`);
    }
  }
  
  // Use SMTP for other providers
  console.log(`📧 [${category}] Using SMTP transport`);
  const info = await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  });
  
  console.log(`✅ [${category}] Email sent via SMTP to ${to} (${info.messageId})`);
  return { ok: true, id: info.messageId, category, method: 'smtp' };
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
