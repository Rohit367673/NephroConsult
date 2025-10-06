import nodemailer from 'nodemailer';
import { env, flags } from '../config.js';

let transporter = null;

if (flags.emailEnabled) {
  // Gmail SMTP Configuration with App Password
  // Try multiple configurations to bypass cloud provider blocking
  const gmailConfig = {
    service: 'gmail',
    auth: {
      user: env.SMTP_USER,  // Your Gmail address
      pass: env.SMTP_PASS   // Gmail App Password (16 characters)
    },
    // Shorter timeouts for faster fallback
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 10000,     // 10 seconds
    // Additional options for better reliability
    pool: true,
    maxConnections: 3,
    maxMessages: 50
  };

  // If port is specified, use manual config to try different ports
  if (env.SMTP_PORT) {
    gmailConfig.host = 'smtp.gmail.com';
    gmailConfig.port = env.SMTP_PORT;
    gmailConfig.secure = env.SMTP_PORT == 465; // true for 465, false for 587
    delete gmailConfig.service; // Remove service when using manual config
  }

  transporter = nodemailer.createTransporter(gmailConfig);

  console.log(`📧 Gmail SMTP configured for: ${env.SMTP_USER}${env.SMTP_PORT ? ` on port ${env.SMTP_PORT}` : ''}`);
  
  // Test connection with timeout
  const connectionTest = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Connection test timeout - SMTP likely blocked by hosting provider'));
    }, 8000);

    transporter.verify((error, success) => {
      clearTimeout(timeout);
      if (error) {
        reject(error);
      } else {
        resolve(success);
      }
    });
  });

  connectionTest
    .then(() => {
      console.log('✅ Gmail SMTP connection verified successfully');
    })
    .catch((error) => {
      console.error('❌ Gmail SMTP connection failed:', error.message);
      console.log('⚠️ Email system will use fallback display for OTP');
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

    // Add timeout to email sending to prevent hanging
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout - SMTP blocked by hosting provider')), 15000);
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);
    
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
