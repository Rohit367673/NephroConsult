import nodemailer from 'nodemailer';
import { env, flags } from '../config.js';

let transporter = null;
if (flags.emailEnabled) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
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
