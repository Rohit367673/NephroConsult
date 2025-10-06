import nodemailer from 'nodemailer';
import { env, flags } from '../config.js';

let transporter = null;

if (flags.emailEnabled) {
  // Gmail SMTP Configuration with App Password
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: env.SMTP_USER,  // Your Gmail address
      pass: env.SMTP_PASS   // Gmail App Password (16 characters)
    },
    // Additional options for better reliability
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 20000,
    rateLimit: 5
  });

  console.log(`📧 Gmail SMTP configured for: ${env.SMTP_USER}`);
  
  // Test connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Gmail SMTP connection failed:', error.message);
    } else {
      console.log('✅ Gmail SMTP connection verified successfully');
    }
  });
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
  
  console.log(`📧 [${category}] Sending email to ${to} via Gmail SMTP`);
  
  try {
    const mailOptions = {
      from: env.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      // Additional options for better deliverability
      replyTo: env.SMTP_FROM,
      headers: {
        'X-Mailer': 'NephroConsult Platform',
        'X-Priority': '1' // High priority for OTP and important emails
      }
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ [${category}] Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    
    return { 
      ok: true, 
      id: info.messageId, 
      category, 
      method: 'gmail-smtp',
      response: info.response
    };
  } catch (error) {
    console.error(`❌ [${category}] Gmail SMTP error:`, error.message);
    console.error(`❌ Full error details:`, error);
    
    if (critical) {
      throw error;
    }
    
    // Graceful fallback for non-critical emails
    return { 
      ok: false, 
      fallback: true, 
      error: error.message, 
      category 
    };
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
