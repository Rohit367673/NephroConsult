import express from 'express';
import Appointment from '../models/Appointment.js';
import { z } from 'zod';

const router = express.Router();

// Default working hours in 30-min slots
const DEFAULT_SLOTS = [
  '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM'
];

router.get('/', async (req, res) => {
  const schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
  const { date } = parsed.data;

  try {
    const dayAppointments = await Appointment.find({ date, status: { $ne: 'cancelled' } })
      .select('timeSlot')
      .lean();
    const reserved = new Set(dayAppointments.map(a => a.timeSlot));
    const slots = DEFAULT_SLOTS.map(slot => ({
      time: slot,
      available: !reserved.has(slot)
    }));
    return res.json({ date, slots });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
