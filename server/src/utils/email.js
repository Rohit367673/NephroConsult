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
    return { ok: true };
  }
  const info = await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  });
  return { ok: true, id: info.messageId };
}
