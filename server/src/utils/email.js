import { env, flags } from '../config.js';

// Resend HTTP API configuration - no SMTP needed
if (flags.emailEnabled) {
  console.log(`📧 Resend API configured for: ${env.SMTP_USER}`);
  console.log(`🔑 API Key: ${env.SMTP_PASS?.substring(0, 8)}...`);
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
  
  console.log(`🚀 [${category}] Sending email to ${to} via Resend API`);
  
  try {
    // Use Resend HTTP API (bypasses SMTP blocking)
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
      
      // Handle domain verification issues gracefully
      if (errorText.includes('domain is not verified') || errorText.includes('testing emails')) {
        console.log(`⚠️ [${category}] Domain verification required - using fallback`);
        return { 
          ok: false, 
          fallback: true, 
          error: 'Domain verification required for production emails', 
          category 
        };
      }
      
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
    
    if (critical) {
      throw error;
    }
    
    // Graceful fallback for any errors
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
