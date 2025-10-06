import express from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { priceFor, mapConsultationTypeId } from '../utils/pricing.js';
import { env } from '../config.js';
import { sendEmail } from '../utils/email.js';
import { generateMeetLink } from '../utils/meet.js';
import { scheduleAppointmentReminder } from '../jobs.js';
import { getConsultationReminderTemplate } from '../utils/emailTemplates.js';
import { z } from 'zod';

const router = express.Router();

// List current user's appointments
router.get('/appointments/mine', requireAuth, async (req, res) => {
  try {
    const sessionUser = req.session.user;
    let q = {};
    if (sessionUser.role === 'doctor' || sessionUser.role === 'admin') {
      // doctor view: recent and upcoming
      q = {};
    } else {
      q = { 'patient.id': sessionUser.id };
    }
    const list = await Appointment.find(q).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ appointments: list });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create appointment
router.post('/appointments', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      timeSlot: z.string().min(3),
      typeId: z.string().min(2),
      paymentMethod: z.enum(['card', 'paypal', 'bank']).optional(),
      intake: z
        .object({
          address: z.string().max(500).optional(),
          description: z.string().max(5000).optional(),
          documents: z.array(z.string()).max(10).optional(),
        })
        .optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    const { date, timeSlot, typeId, paymentMethod = 'card', intake } = parsed.data;

    // Collision prevention
    const existing = await Appointment.findOne({ date, timeSlot, status: { $ne: 'cancelled' } });
    if (existing) return res.status(409).json({ error: 'Time slot already booked' });

    const userDoc = await User.findById(req.session.user.id);
    const country = userDoc?.country || 'default';
    const pricing = priceFor(country);

    const previousCount = await Appointment.countDocuments({ 'patient.id': userDoc?._id });
    const isFirst = previousCount === 0;

    const typeName = mapConsultationTypeId(typeId);

    const appointment = await Appointment.create({
      patient: {
        id: userDoc?._id,
        name: userDoc?.name,
        email: userDoc?.email,
        phone: userDoc?.phone,
        country,
      },
      doctor: { 
        name: 'Dr. Ilango S. Prakasam',
        title: 'Sr. Nephrologist',
        qualifications: 'MD, DNB (Nephrology), MRCP (UK)',
        experience: '15+ Years Experience',
        email: env.OWNER_EMAIL || 'suyambu54321@gmail.com'
      },
      date,
      timeSlot,
      type: typeName,
      status: 'confirmed', // mark confirmed (payments mocked)
      price: {
        amount: isFirst ? Math.round(pricing.consultation * 0.8) : pricing.consultation,
        currency: pricing.currency,
        symbol: pricing.symbol,
        region: country,
        discountApplied: isFirst,
      },
      meetLink: generateMeetLink(date, timeSlot),
      intake: intake || undefined,
    });

    // Schedule 10-min reminder email
    try { await scheduleAppointmentReminder(appointment); } catch {}

    // Send confirmation email (best-effort)
    try {
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed - NephroConsult</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #006f6f, #004f4f);
              border-radius: 12px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .success-box {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .info-box {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background: #006f6f;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">N</div>
              <h1 style="color: #006f6f; margin: 0;">Booking Confirmed!</h1>
              <p style="color: #666;">NephroConsult - International Kidney Care</p>
            </div>
            
            <div class="success-box">
              <h3 style="color: #155724; margin-top: 0;">Your consultation has been successfully booked!</h3>
              <p><strong>Patient:</strong> ${userDoc?.name}</p>
              <p><strong>Doctor:</strong> Dr. Ilango S. Prakasam (Sr. Nephrologist)</p>
              <p><strong>Qualifications:</strong> MD, DNB (Nephrology), MRCP (UK)</p>
              <p><strong>Experience:</strong> 15+ Years Experience</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${timeSlot}</p>
              <p><strong>Type:</strong> ${typeName}</p>
              <p><strong>Amount:</strong> ${appointment.price.symbol}${appointment.price.amount} ${appointment.price.currency}${isFirst ? ' (First consultation discount applied!)' : ''}</p>
            </div>
            
            <div class="info-box">
              <h4 style="margin-top: 0; color: #006f6f;">What to Prepare:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>List of current medications</li>
                <li>Recent test reports and medical documents</li>
                <li>List of symptoms or concerns</li>
                <li>Ensure stable internet connection</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${appointment.meetLink}" class="cta-button">
                Join Video Consultation
              </a>
            </div>
            
            <p style="margin-top: 30px;">You will receive a reminder email 1 hour before your consultation.</p>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
              <p>Need help? Contact us at support@nephroconsult.com</p>
              <p>© 2024 NephroConsult. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      await sendEmail(
        userDoc?.email,
        'Booking Confirmed - NephroConsult',
        confirmationHtml
      );
    } catch (e) {
      // ignore
    }

    return res.json({ appointment });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Get appointment by id
router.get('/appointments/:id', requireAuth, async (req, res) => {
  try {
    const idSchema = z.object({ id: z.string().regex(/^[a-fA-F0-9]{24}$/) });
    const idParsed = idSchema.safeParse(req.params);
    if (!idParsed.success) return res.status(400).json({ error: 'Invalid id' });
    const appt = await Appointment.findById(idParsed.data.id).lean();
    if (!appt) return res.status(404).json({ error: 'Not found' });
    // authorization: patient can view own; doctor/admin can view all
    const me = req.session.user;
    if (me.role === 'doctor' || me.role === 'admin' || String(appt.patient.id) === String(me.id)) {
      return res.json({ appointment: appt });
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

export default router;
