import express from 'express';
import { requireRole } from '../middlewares/auth.js';
import Appointment from '../models/Appointment.js';
import { sendEmail } from '../utils/email.js';
import { z } from 'zod';

const router = express.Router();

router.get('/stats', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const [total, completed, pending] = await Promise.all([
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
    ]);

    return res.json({
      totalConsultations: total,
      completedConsultations: completed,
      activeConsultations: pending,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/appointments', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const list = await Appointment.find({}).sort({ createdAt: -1 }).limit(200).lean();
    return res.json({ appointments: list });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/appointments/:id/prescription', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const medSchema = z.object({
      name: z.string().min(1).max(200),
      dosage: z.string().max(100).optional().default(''),
      frequency: z.string().max(100).optional().default(''),
      link: z.string().url().max(500).optional().default(''),
    });
    const schema = z.object({
      notes: z.string().max(5000).optional().default(''),
      medicines: z.array(medSchema).optional().default([]),
      nextConsultationDate: z.union([z.string().datetime().optional(), z.null()]).optional(),
    });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    const { notes, medicines, nextConsultationDate } = parsed.data;
    const nextDate = nextConsultationDate ? new Date(nextConsultationDate) : undefined;
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { prescription: { notes, medicines, nextConsultationDate: nextDate } } },
      { new: true }
    );
    if (!appt) return res.status(404).json({ error: 'Not found' });

    // Notify patient
    try {
      const meds = (medicines || []).map(m => {
        const parts = [m.name];
        if (m.dosage) parts.push(m.dosage);
        if (m.frequency) parts.push(m.frequency);
        const text = parts.join(' — ');
        return m.link ? `<li><a href="${m.link}">${text}</a></li>` : `<li>${text}</li>`;
      }).join('');

      await sendEmail(
        appt.patient.email,
        'Your prescription is available',
        `<p>Dear ${appt.patient.name},</p>
         <p>Your prescription from the recent consultation is now available.</p>
         ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}
         ${meds ? `<p><b>Medicines:</b></p><ul>${meds}</ul>` : ''}
         ${nextConsultationDate ? `<p>Next consultation date: ${new Date(nextConsultationDate).toLocaleDateString()}</p>` : ''}
         <p>You can also view it anytime on your profile page.</p>
         <p>— NephroConsult</p>`
      );
    } catch {}

    return res.json({ appointment: appt });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update prescription' });
  }
});

router.post('/appointments/:id/complete', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'completed' } },
      { new: true }
    );
    if (!appt) return res.status(404).json({ error: 'Not found' });

    try {
      await sendEmail(
        appt.patient.email,
        'Consultation completed',
        `<p>Dear ${appt.patient.name},</p>
         <p>Your consultation on ${appt.date} at ${appt.timeSlot} has been marked as completed.</p>
         <p>${appt.prescription ? 'A prescription has been added to your profile.' : ''}</p>
         <p>— NephroConsult</p>`
      );
    } catch {}

    return res.json({ appointment: appt });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to complete appointment' });
  }
});

export default router;
