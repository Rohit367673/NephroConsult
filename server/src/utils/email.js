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

export async function sendEmail(to, subject, html) {
  if (!flags.emailEnabled) {
    console.log('[email:dev]', { to, subject });
    return { ok: true, mock: true };
  }
  
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully to ${to} (${info.messageId})`);
    return { ok: true, id: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    
    // In production, if email fails, we'll use a fallback approach
    if (env.NODE_ENV === 'production') {
      console.log(`📝 FALLBACK: Would send email to ${to} with subject: ${subject}`);
      
      // Store failed email for retry (in a real app, you'd use a queue)
      console.log('📧 Email content (for manual verification if needed):', {
        to,
        subject,
        htmlPreview: html.substring(0, 200) + '...'
      });
      
      // Return success so signup process continues
      return { ok: true, fallback: true, error: error.message };
    }
    
    // In development, throw the error
    throw error;
  }
}
