import express from 'express';
import { env } from '../config.js';
import { sendContactEmail } from '../utils/email.js';
import { z } from 'zod';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().max(200),
      phone: z.string().max(30).optional(),
      subject: z.string().min(1).max(150),
      message: z.string().min(1).max(5000),
      urgency: z.enum(['low', 'normal', 'high']).optional(),
    });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    const { name, email, phone, subject, message, urgency } = parsed.data;

    const to = env.OWNER_EMAIL || 'owner@example.com';
    const html = `
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      ${phone ? `<p><b>Phone:</b> ${phone}</p>` : ''}
      ${urgency ? `<p><b>Urgency:</b> ${urgency}</p>` : ''}
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Message:</b></p>
      <p>${String(message).replace(/\n/g, '<br/>')}</p>
    `;

    await sendContactEmail(to, `[NephroConsult Contact] ${subject}`, html);

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
