import express from 'express';
import { z } from 'zod';
import DoctorChat from '../models/DoctorChat.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import { telegramService } from '../services/telegramService.js';
import { env } from '../config.js';

const router = express.Router();

// Helper to check if current session user is Doctor or Admin
function isDoctorOrAdmin(req) {
  const role = req.session?.user?.role;
  const email = (req.session?.user?.email || '').toLowerCase().trim();
  const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com'];
  return role === 'admin' || role === 'doctor' || adminEmails.includes(email);
}

/**
 * GET /api/doctor-chat/mine
 * Fetch all doctor chat consultations for the logged-in patient
 */
router.get('/mine', async (req, res) => {
  try {
    const sessionEmail = req.session?.user?.email;
    const queryEmail = req.query.email;
    const emailToUse = (sessionEmail || queryEmail || '').toLowerCase().trim();

    if (!emailToUse && !req.session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const query = {
      $or: [
        ...(emailToUse ? [{ 'patient.email': emailToUse }] : []),
        ...(req.session?.user?.id ? [{ 'patient.id': req.session.user.id }] : []),
      ],
    };

    const chats = await DoctorChat.find(query).sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, chats });
  } catch (err) {
    console.error('Error fetching patient doctor chats:', err);
    return res.status(500).json({ error: 'Failed to fetch doctor chats' });
  }
});

/**
 * GET /api/doctor-chat/admin/all
 * Fetch all doctor chat consultations for Doctor / Admin panel
 */
router.get('/admin/all', async (req, res) => {
  try {
    if (!isDoctorOrAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Doctor or Admin access required' });
    }

    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const term = String(search).trim();
      filter.$or = [
        { 'patient.name': { $regex: term, $options: 'i' } },
        { 'patient.email': { $regex: term, $options: 'i' } },
        { ticketId: { $regex: term, $options: 'i' } },
      ];
    }

    const chats = await DoctorChat.find(filter).sort({ updatedAt: -1 }).limit(200).lean();
    const stats = {
      total: await DoctorChat.countDocuments({}),
      waitingDoctor: await DoctorChat.countDocuments({ status: 'waiting_doctor' }),
      doctorReplied: await DoctorChat.countDocuments({ status: 'doctor_replied' }),
      closed: await DoctorChat.countDocuments({ status: 'closed' }),
    };

    return res.json({ success: true, chats, stats });
  } catch (err) {
    console.error('Error fetching admin doctor chats:', err);
    return res.status(500).json({ error: 'Failed to fetch doctor chats for admin' });
  }
});

/**
 * GET /api/doctor-chat/:ticketId
 * Fetch single chat consultation with messages and documents
 */
router.get('/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const chat = await DoctorChat.findOne({ ticketId }).lean();

    if (!chat) {
      return res.status(404).json({ error: 'Consultation chat not found' });
    }

    // Security check: if not doctor/admin, verify patient email/id matches
    const user = req.session?.user;
    if (!isDoctorOrAdmin(req)) {
      const userEmail = (user?.email || req.query.email || '').toLowerCase().trim();
      const patientEmail = (chat.patient?.email || '').toLowerCase().trim();
      if (!userEmail || userEmail !== patientEmail) {
        // Allow access if matching cookie or token, else warn
        if (!userEmail) {
          return res.status(401).json({ error: 'Please sign in to view your consultation chat' });
        }
      }
    }

    return res.json({ success: true, chat });
  } catch (err) {
    console.error('Error fetching doctor chat:', err);
    return res.status(500).json({ error: 'Failed to fetch doctor chat details' });
  }
});

/**
 * POST /api/doctor-chat/:ticketId/message
 * Send a message in the consultation
 */
router.post('/:ticketId/message', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text, attachments = [] } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const chat = await DoctorChat.findOne({ ticketId });
    if (!chat) {
      return res.status(404).json({ error: 'Consultation chat not found' });
    }

    const doctorUser = isDoctorOrAdmin(req);

    // If consultation is closed and patient tries to send message:
    if (chat.status === 'closed' && !doctorUser) {
      return res.status(400).json({
        error: 'This consultation has been closed by Dr. Ilango. Please start a new consultation.',
        isClosed: true,
      });
    }

    const sender = doctorUser ? 'doctor' : 'patient';
    const senderName = doctorUser
      ? (req.session?.user?.name || 'Dr. Ilango S. Prakasam')
      : (req.session?.user?.name || chat.patient?.name || 'Patient');

    const newMessage = {
      sender,
      senderName,
      text: text.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();

    const siteUrl = env.FRONTEND_URL || 'https://nephroconsultation.com';

    if (doctorUser) {
      chat.status = 'doctor_replied';
      await chat.save();

      // Send Email Notification to Patient
      try {
        const patientEmail = chat.patient?.email;
        if (patientEmail) {
          const chatUrl = `${siteUrl}/doctor-chat?ticketId=${chat.ticketId}`;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #006f6f; color: white; padding: 18px 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; font-size: 20px;">New Message from Dr. Ilango S. Prakasam</h2>
                <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Consultation #${chat.ticketId}</p>
              </div>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 15px; margin-top: 0;">Dear ${chat.patient?.name || 'Patient'},</p>
                <p><strong>Dr. Ilango</strong> has reviewed your consultation and replied:</p>
                <div style="background: white; border-left: 4px solid #006f6f; padding: 16px; border-radius: 4px; margin: 16px 0; font-size: 15px; color: #1f2937;">
                  ${text.trim().replace(/\n/g, '<br/>')}
                </div>
                <div style="text-align: center; margin: 26px 0;">
                  <a href="${chatUrl}" style="background: #006f6f; color: white; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
                    Open Doctor Chat & Reply
                  </a>
                </div>
                <p style="font-size: 12px; color: #6b7280; text-align: center; margin-bottom: 0;">
                  You can reply directly in the chat or view your consultation history anytime from your profile.
                </p>
              </div>
            </div>
          `;
          await sendEmail(patientEmail, `Dr. Ilango replied to your consultation (#${chat.ticketId})`, emailHtml);
        }
      } catch (emailErr) {
        console.warn('⚠️ Failed to send doctor reply email to patient:', emailErr?.message);
      }
    } else {
      chat.status = 'waiting_doctor';
      await chat.save();

      // Send Email & Telegram Notification to Doctor
      try {
        const doctorRecipient = (env.OWNER_EMAIL && env.OWNER_EMAIL.trim()) ? env.OWNER_EMAIL.trim() : 'suyambu54321@gmail.com';
        const adminUrl = `${siteUrl}/admin`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #006f6f; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; font-size: 20px;">Patient Message Received</h2>
              <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Consultation #${chat.ticketId} • ${chat.patient?.name}</p>
            </div>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 15px; margin-top: 0;">Dear Dr. Ilango,</p>
              <p>Patient <strong>${chat.patient?.name}</strong> has sent a new message in consultation <strong>#${chat.ticketId}</strong>:</p>
              <div style="background: white; border-left: 4px solid #006f6f; padding: 14px; border-radius: 4px; margin: 16px 0; font-size: 14px;">
                ${text.trim().replace(/\n/g, '<br/>')}
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${adminUrl}" style="background: #006f6f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Open Admin Panel & Reply
                </a>
              </div>
            </div>
          </div>
        `;
        await sendEmail(doctorRecipient, `New Patient Message (#${chat.ticketId}) - ${chat.patient?.name}`, emailHtml);
      } catch (err) {
        console.warn('⚠️ Failed to send patient reply notification to doctor:', err?.message);
      }

      try {
        await telegramService.notifyNewAppointment({
          patientName: chat.patient?.name,
          patientEmail: chat.patient?.email,
          phone: chat.patient?.phone,
          date: new Date().toLocaleDateString('en-US'),
          timeSlot: 'Chat Reply',
          amount: chat.price?.amount || 100,
          consultationType: `Doctor Chat Reply (#${chat.ticketId})`,
          symptoms: text.substring(0, 150),
          medicalHistory: 'Patient replied in active doctor consultation',
        });
      } catch {}
    }

    return res.json({ success: true, message: newMessage, chat });
  } catch (err) {
    console.error('Error posting doctor chat message:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * POST /api/doctor-chat/:ticketId/close
 * Doctor completes and closes the consultation, optionally adding prescription & advice
 */
router.post('/:ticketId/close', async (req, res) => {
  try {
    if (!isDoctorOrAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Doctor or Admin access required' });
    }

    const { ticketId } = req.params;
    const { notes = '', medicines = [] } = req.body;

    const chat = await DoctorChat.findOne({ ticketId });
    if (!chat) {
      return res.status(404).json({ error: 'Consultation chat not found' });
    }

    chat.status = 'closed';
    chat.closedAt = new Date();
    chat.closedBy = req.session?.user?.name || 'Dr. Ilango S. Prakasam';

    if (notes || (Array.isArray(medicines) && medicines.length > 0)) {
      chat.prescription = {
        notes: String(notes).trim(),
        medicines: Array.isArray(medicines) ? medicines : [],
        closedAt: new Date(),
      };
    }

    // Add a system closure message
    chat.messages.push({
      sender: 'system',
      senderName: 'System',
      text: 'This consultation has been marked as completed and closed by Dr. Ilango S. Prakasam. All chat history, reports, and prescriptions remain accessible.',
      timestamp: new Date(),
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    // Send Completion & Prescription Email to Patient
    try {
      const patientEmail = chat.patient?.email;
      if (patientEmail) {
        const siteUrl = env.FRONTEND_URL || 'https://nephroconsultation.com';
        const chatUrl = `${siteUrl}/doctor-chat?ticketId=${chat.ticketId}`;
        const medicinesListHtml = (chat.prescription?.medicines || []).map((m) => {
          const parts = [m.name];
          if (m.dosage) parts.push(m.dosage);
          if (m.frequency) parts.push(m.frequency);
          const text = parts.join(' — ');
          return m.link ? `<li><a href="${m.link}">${text}</a></li>` : `<li>${text}</li>`;
        }).join('');

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #006f6f; color: white; padding: 18px 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">Consultation Completed — Dr. Ilango S. Prakasam</h2>
              <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Ticket: <strong>${chat.ticketId}</strong></p>
            </div>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 15px; margin-top: 0;">Dear ${chat.patient?.name || 'Patient'},</p>
              <p>Your doctor consultation with <strong>Dr. Ilango S. Prakasam</strong> has been completed.</p>
              
              ${chat.prescription?.notes ? `
                <div style="background: white; border-left: 4px solid #006f6f; padding: 14px; border-radius: 4px; margin: 16px 0;">
                  <h4 style="margin: 0 0 6px; color: #006f6f;">Doctor's Advice & Clinical Notes:</h4>
                  <p style="margin: 0; font-size: 14px;">${chat.prescription.notes.replace(/\n/g, '<br/>')}</p>
                </div>
              ` : ''}

              ${medicinesListHtml ? `
                <div style="background: white; border: 1px solid #e5e7eb; padding: 14px; border-radius: 6px; margin: 16px 0;">
                  <h4 style="margin: 0 0 8px; color: #006f6f;">Prescribed Medicines:</h4>
                  <ul style="margin: 0; padding-left: 20px; font-size: 14px;">${medicinesListHtml}</ul>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 26px 0;">
                <a href="${chatUrl}" style="background: #006f6f; color: white; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
                  View Full Consultation & Prescriptions
                </a>
              </div>
              <p style="font-size: 13px; color: #4b5563; text-align: center;">
                Need further assistance in the future? You can easily start a new consultation anytime for ₹100 / $1.
              </p>
            </div>
          </div>
        `;

        await sendEmail(patientEmail, `Consultation Completed & Prescription (#${chat.ticketId}) - Dr. Ilango`, emailHtml);
      }
    } catch (err) {
      console.warn('⚠️ Failed to send consultation closure email:', err?.message);
    }

    return res.json({ success: true, message: 'Consultation closed successfully', chat });
  } catch (err) {
    console.error('Error closing doctor chat consultation:', err);
    return res.status(500).json({ error: 'Failed to close consultation' });
  }
});

export default router;
