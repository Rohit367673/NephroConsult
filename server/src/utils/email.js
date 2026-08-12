import nodemailer from 'nodemailer';
import { env, flags } from '../config.js';

// Transporter for Nodemailer fallback (Gmail SMTP)
let smtpTransporter = null;
if (flags.emailEnabled && env.SMTP_PASS && !env.SMTP_PASS.startsWith('re_')) {
  smtpTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(env.SMTP_PORT) || 465,
    secure: Number(env.SMTP_PORT) === 465 || !env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

if (flags.emailEnabled) {
  const method = env.SMTP_PASS?.startsWith('re_') ? 'Resend API' : 'Nodemailer SMTP (Gmail)';
  console.log(`📧 Email service configured via ${method} for: ${env.SMTP_USER}`);
}

export async function sendEmail(to, subject, html, options = {}) {
  const { 
    critical = false, // Allow graceful fallback for better UX
    category = 'general'
  } = options;

  if (!flags.emailEnabled) {
    console.log(`⚠️ [${category}] Email service disabled - would send to ${to}`);
    if (critical) {
      throw new Error('Email service disabled in configuration');
    }
    return { ok: true, mock: true, category };
  }
  
  // If SMTP_PASS is a Gmail App Password, send via Nodemailer SMTP
  if (smtpTransporter) {
    try {
      console.log(`🚀 [${category}] Sending email to ${to} via Gmail SMTP`);
      const info = await smtpTransporter.sendMail({
        from: env.SMTP_FROM || `"NephroConsult" <${env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ [${category}] Email sent via Gmail SMTP to ${to} (Message ID: ${info.messageId})`);
      return { ok: true, id: info.messageId, category, method: 'gmail-smtp' };
    } catch (smtpErr) {
      console.error(`❌ [${category}] Gmail SMTP error:`, smtpErr.message);
      if (critical) throw smtpErr;
      return { ok: false, fallback: true, error: smtpErr.message, category };
    }
  }

  console.log(`🚀 [${category}] Sending email to ${to} via Resend API`);
  
  try {
    // Use Resend HTTP API (for re_... keys)
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
        html: html,
        headers: {
          'X-Mailer': 'NephroConsult Platform'
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ [${category}] Email sent via Resend API to ${to}`);
      console.log(`📧 Message ID: ${result.id}`);
      
      return { 
        ok: true, 
        id: result.id, 
        category, 
        method: 'resend-api'
      };
    } else {
      const errorText = await response.text();
      console.error(`❌ [${category}] Resend API failed: ${response.status} - ${errorText}`);
      
      if (critical) {
        throw new Error(`Resend API failed: ${response.status} - ${errorText}`);
      }
      
      return { 
        ok: false, 
        fallback: true, 
        error: `Resend API error: ${response.status}`, 
        category 
      };
    }
  } catch (error) {
    console.error(`❌ [${category}] Resend API error:`, error.message);
    if (critical) throw error;
    return { ok: false, fallback: true, error: error.message, category };
  }
}

// Specialized email functions for different categories
export async function sendOTPEmail(to, subject, html) {
  return sendEmail(to, subject, html, { 
    category: 'otp', 
    critical: false // Allow fallback for OTP display in UI
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
