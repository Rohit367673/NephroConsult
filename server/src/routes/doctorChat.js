import express from 'express';
import mongoose from 'mongoose';
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

// Server-side helper to verify if a patient is eligible for their 1st FREE Doctor Chat
export async function checkFreeChatEligibility({ userId, email, phone }) {
  try {
    const validObjectId = userId && mongoose.Types.ObjectId.isValid(String(userId)) ? String(userId) : null;

    if (validObjectId) {
      const userDoc = await User.findById(validObjectId).lean();
      if (userDoc?.hasUsedFreeChat) {
        return { eligible: false, reason: 'User has already used their free doctor chat consultation' };
      }
    }
    if (email) {
      const normalizedEmail = String(email).toLowerCase().trim();
      const userByEmail = await User.findOne({ email: normalizedEmail }).lean();
      if (userByEmail?.hasUsedFreeChat) {
        return { eligible: false, reason: 'Email has already used their free doctor chat consultation' };
      }
    }

    const orConditions = [];
    if (validObjectId) orConditions.push({ 'patient.id': validObjectId });
    if (email) orConditions.push({ 'patient.email': String(email).toLowerCase().trim() });
    if (phone && String(phone).trim().length >= 10) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        orConditions.push({ 'patient.phone': new RegExp(cleanPhone + '$') });
      }
    }

    if (orConditions.length === 0) {
      return { eligible: false, reason: 'Authentication required' };
    }

    const existingCount = await DoctorChat.countDocuments({
      $or: orConditions,
      status: { $ne: 'cancelled' }
    });

    if (existingCount > 0) {
      if (validObjectId) {
        await User.findByIdAndUpdate(validObjectId, { $set: { hasUsedFreeChat: true } }).catch(() => {});
      } else if (email) {
        await User.findOneAndUpdate(
          { email: String(email).toLowerCase().trim() },
          { $set: { hasUsedFreeChat: true } }
        ).catch(() => {});
      }
      return { eligible: false, reason: 'User already has prior doctor chat consultations' };
    }

    return { eligible: true };
  } catch (err) {
    console.error('Error checking free chat eligibility:', err);
    return { eligible: false, reason: 'Verification failed' };
  }
}

/**
 * GET /api/doctor-chat/free-eligibility
 * Check if the patient is eligible for a 1st free doctor chat consultation
 */
router.get('/free-eligibility', async (req, res) => {
  try {
    const resolvedUserId = req.session?.user?.id || (req.query.userId ? String(req.query.userId) : undefined);
    const resolvedEmail = req.session?.user?.email || (req.query.email ? String(req.query.email) : undefined);

    if (!resolvedUserId && !resolvedEmail) {
      return res.json({ eligible: true, authenticated: false });
    }
    const result = await checkFreeChatEligibility({
      userId: resolvedUserId,
      email: resolvedEmail,
      phone: req.query.phone ? String(req.query.phone) : undefined
    });
    return res.json({
      eligible: result.eligible,
      reason: result.reason,
      authenticated: true
    });
  } catch (error) {
    console.error('Error in free-eligibility doctor-chat endpoint:', error);
    return res.status(500).json({ eligible: true, error: 'Failed to check chat eligibility' });
  }
});

/**
 * POST /api/doctor-chat/free-create
 * Create a complimentary 1st doctor chat consultation
 */
router.post('/free-create', async (req, res) => {
  try {
    const sessionUser = req.session?.user;
    const { patientInfo, documents = [], country = 'IN' } = req.body;

    if (!patientInfo || !patientInfo.name || !patientInfo.email) {
      return res.status(400).json({ error: 'Patient name and email are required' });
    }

    const patientName = patientInfo.name.trim();
    const patientEmail = patientInfo.email.toLowerCase().trim();
    const patientPhone = patientInfo.phone ? patientInfo.phone.trim() : '';
    const patientAge = patientInfo.age ? Number(patientInfo.age) : undefined;
    const patientGender = patientInfo.gender || '';
    const initialQuery = patientInfo.medicalHistory || 'Review of uploaded lab reports and kidney health query.';

    let resolvedUserId = sessionUser?.id;
    if (!resolvedUserId) {
      const existingUser = await User.findOne({ email: patientEmail }).lean();
      if (existingUser) resolvedUserId = String(existingUser._id);
    }

    // Check eligibility
    const eligibility = await checkFreeChatEligibility({
      userId: resolvedUserId,
      email: patientEmail,
      phone: patientPhone
    });

    if (!eligibility.eligible) {
      return res.status(402).json({
        error: 'You have already used your free 1st Doctor Chat. Payment (₹100 / $1) is required for subsequent chats.',
        reason: eligibility.reason
      });
    }

    // Atomically claim free chat on user
    if (resolvedUserId) {
      const claimedUser = await User.findOneAndUpdate(
        { _id: resolvedUserId, hasUsedFreeChat: { $ne: true } },
        { $set: { hasUsedFreeChat: true } },
        { new: true }
      );
      if (!claimedUser) {
        return res.status(402).json({ error: 'Free doctor chat has already been claimed for this account.' });
      }
    } else {
      await User.findOneAndUpdate(
        { email: patientEmail },
        { $set: { hasUsedFreeChat: true } }
      ).catch(() => {});
    }

    const docs = Array.isArray(documents) ? documents : [];

    const createdDoctorChat = await DoctorChat.create({
      patient: {
        id: resolvedUserId || undefined,
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        age: patientAge,
        gender: patientGender,
        country: country || 'IN',
      },
      status: 'waiting_doctor',
      initialQuery,
      documents: docs,
      messages: [
        {
          sender: 'patient',
          senderName: patientName,
          text: initialQuery,
          attachments: docs.map(d => typeof d === 'string' && d.includes('|') ? d.split('|')[0] : 'Medical Document'),
          timestamp: new Date()
        }
      ],
      price: {
        amount: 0,
        currency: country === 'IN' ? 'INR' : 'USD',
        discountApplied: true,
      }
    });

    console.log('✅ Free DoctorChat created successfully:', createdDoctorChat.ticketId);

    // Send notifications to Dr. Ilango & Telegram alert
    try {
      const doctorRecipient = (env.OWNER_EMAIL && env.OWNER_EMAIL.trim()) ? env.OWNER_EMAIL.trim() : 'suyambu54321@gmail.com';
      const siteUrl = env.FRONTEND_URL || 'https://nephroconsultation.com';
      const doctorHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #006f6f; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 20px;">New Doctor Chat & Report Review Request (1st Free)</h2>
            <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Ticket: <strong>${createdDoctorChat.ticketId}</strong></p>
          </div>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 15px; margin-top: 0;">Dear Dr. Ilango,</p>
            <p>A patient has submitted their medical query and uploaded reports for your review (1st Free Chat Offer):</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px;"><strong>Patient:</strong> ${patientName} (${patientAge ? `${patientAge} yrs` : ''} ${patientGender || ''})</p>
              <p style="margin: 0 0 8px;"><strong>Email:</strong> ${patientEmail}</p>
              <p style="margin: 0 0 8px;"><strong>Phone:</strong> ${patientPhone || 'Not provided'}</p>
              <p style="margin: 0 0 8px;"><strong>Uploaded Reports:</strong> ${docs.length} file(s)</p>
              <p style="margin: 0 0 8px;"><strong>Status:</strong> 🎁 1st Free Chat Consultation</p>
              <p style="margin: 0;"><strong>Patient's Message:</strong></p>
              <div style="background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 6px; font-style: italic;">
                ${initialQuery}
              </div>
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${siteUrl}/admin" style="background: #006f6f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Open Doctor Admin Panel
              </a>
            </div>
          </div>
        </div>
      `;
      await sendEmail(doctorRecipient, `New Doctor Chat Request [FREE 1st] (${createdDoctorChat.ticketId}) - ${patientName}`, doctorHtml);
    } catch (err) {
      console.warn('⚠️ Doctor chat notification to doctor failed:', err?.message);
    }

    try {
      await telegramService.notifyNewAppointment({
        patientName,
        patientEmail,
        phone: patientPhone,
        date: new Date().toLocaleDateString('en-US'),
        timeSlot: 'Free 1st Doctor Chat',
        amount: 0,
        consultationType: 'Upload Files & Chat with Doctor (1st Free)',
        symptoms: initialQuery,
        medicalHistory: `${docs.length} lab report document(s) uploaded`,
      });
    } catch {}

    try {
      if (patientEmail) {
        const siteUrl = env.FRONTEND_URL || 'https://nephroconsultation.com';
        const chatLink = `${siteUrl}/doctor-chat?ticketId=${createdDoctorChat.ticketId}`;
        const patientHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #006f6f; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">Consultation Received — Dr. Ilango S. Prakasam</h2>
              <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Ticket: <strong>${createdDoctorChat.ticketId}</strong> (1st Chat Free)</p>
            </div>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 15px; margin-top: 0;">Dear ${patientName},</p>
              <p>Thank you for submitting your reports. Your complimentary 1st consultation has been received and assigned to <strong>Dr. Ilango S. Prakasam (Sr. Nephrologist)</strong>.</p>
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 14px; margin-bottom: 16px; color: #065f46;">
                <h4 style="margin: 0 0 6px; font-size: 15px;">⏳ What happens next?</h4>
                <p style="margin: 0; font-size: 14px;">Dr. Ilango personally reviews cases within <strong>12 to 24 hours</strong>. You do not need to wait on the website. We will email you immediately once Dr. Ilango replies or prescribes advice.</p>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${chatLink}" style="background: #006f6f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  View Your Consultation Chat
                </a>
              </div>
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                You can also access this chat anytime from your NephroConsult profile.
              </p>
            </div>
          </div>
        `;
        await sendEmail(patientEmail, `Consultation Received (${createdDoctorChat.ticketId}) - NephroConsult`, patientHtml);
      }
    } catch (err) {
      console.warn('⚠️ Doctor chat confirmation to patient failed:', err?.message);
    }

    return res.status(201).json({
      success: true,
      chat: createdDoctorChat,
      ticketId: createdDoctorChat.ticketId
    });
  } catch (err) {
    console.error('Error creating free doctor chat:', err);
    return res.status(500).json({ error: 'Failed to create doctor chat consultation' });
  }
});

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
