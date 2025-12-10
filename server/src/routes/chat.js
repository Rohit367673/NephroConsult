import express from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { env } from '../config.js';
import ChatTicket from '../models/ChatTicket.js';
import { sendEmail } from '../utils/email.js';
import { getDisplayedPrice } from '../utils/pricing.js';

const router = express.Router();

// Initialize OpenAI client
const openai = env.OPENAI_API_KEY ? new OpenAI({
  apiKey: env.OPENAI_API_KEY,
}) : null;

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        sender: z.enum(['user', 'support', 'bot', 'admin', 'doctor']),
        text: z.string().min(1).max(1000)
      })
    )
    .max(50)
    .optional(),
  ticketId: z.string().optional(),
  category: z.enum(['general', 'booking', 'payment', 'refund', 'technical', 'medical', 'complaint']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
  userCountry: z.string().optional(),
  userTimezone: z.string().optional(),
  subject: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  bookingId: z.string().optional()
});

const knowledgeBase = [
  {
    keywords: ['doctor', 'krishnamurthy', 'ilango', 'who', 'about'],
    reply:
      'Dr. Ilango S. Prakasam is our Sr. Nephrologist with MD, DNB (Nephrology), MRCP (UK) qualifications and 15+ years of experience. He provides expert kidney care through our international consultation platform, offering world-class nephrology consultations via secure video calls with comprehensive care from initial consultations to ongoing kidney health management.',
    suggestions: [
      'How do I book with Dr. Ilango S. Prakasam?',
      'What are his qualifications?',
      'What services does he offer?'
    ]
  },
  {
    keywords: ['book', 'appointment', 'schedule', 'consult'],
    reply:
      'To book an appointment: 1) Visit our "Book Appointment" page, 2) Choose consultation type (Initial $150 or Follow-up $105), 3) Select your preferred date and time, 4) Upload lab reports if available, 5) Choose payment method, 6) Confirm and receive your meeting link.',
    suggestions: [
      'What consultation types are available?',
      'How do I prepare for consultation?',
      'Can I upload lab reports?'
    ]
  },
  {
    keywords: ['fee', 'cost', 'price', 'charge', 'pricing'],
    reply:
      'Our consultation fees are: Initial Consultation $150 USD (comprehensive kidney health assessment), Follow-up Consultation $105 USD (ongoing care), Emergency consultations available 24/7. Regional pricing may vary by location.',
    suggestions: [
      'Do you accept insurance?',
      'What payment methods do you accept?',
      'How do I book an appointment?'
    ]
  },
  {
    keywords: ['services', 'what', 'offer', 'provide'],
    reply:
      'We offer three main services: 1) HD Video Consultations with nephrology experts, 2) Digital Prescriptions with secure management and delivery, 3) Lab Report Analysis for kidney function tests. All services are HIPAA compliant with global access.',
    suggestions: [
      'How do video consultations work?',
      'Can you analyze my lab reports?',
      'How do I get digital prescriptions?'
    ]
  },
  {
    keywords: ['contact', 'phone', 'support', 'help'],
    reply:
      'You can contact us through: Phone Support at +1 (555) 123-4567 (available 24/7 for emergencies), email through our contact form, or use this chat. We have a direct line to our medical support team.',
    suggestions: [
      'What are your support hours?',
      'How do I reach emergency support?',
      'Where is the contact form?'
    ]
  },
  {
    keywords: ['lab', 'report', 'test', 'upload'],
    reply:
      'Lab reports can be uploaded during booking or later through your profile. Dr. Ilango S. Prakasam reviews them before or during consultation. We provide professional analysis of kidney function tests and lab reports as part of our services.',
    suggestions: [
      'What lab reports should I upload?',
      'When will my reports be reviewed?',
      'How do I access my profile?'
    ]
  },
  {
    keywords: ['reschedule', 'cancel', 'change', 'modify'],
    reply:
      'You can reschedule or cancel appointments up to 12 hours before your scheduled time. Access your profile dashboard, select the appointment, and modify as needed. Our cancellation policy details are available on request.',
    suggestions: [
      'How do I access my profile?',
      'What is your cancellation policy?',
      'Can I get a refund?'
    ]
  },
  {
    keywords: ['payment', 'card', 'paypal', 'bank', 'insurance'],
    reply:
      'We accept major credit/debit cards, PayPal, and secure bank transfers. Insurance is accepted (varies by region). All payments are processed through encrypted gateways with instant email receipts.',
    suggestions: [
      'Do you accept my insurance?',
      'Is payment secure?',
      'Can I pay after consultation?'
    ]
  },
  {
    keywords: ['website', 'pages', 'navigate', 'where'],
    reply:
      'Our website includes: Home (Dr. Ilango S. Prakasam introduction), About (detailed platform info), Book Appointment (online booking), Contact (support options), Profile (appointment management), and Login/Signup (user authentication).',
    suggestions: [
      'How do I create an account?',
      'Where do I book appointments?',
      'How do I access my profile?'
    ]
  }
];

function determineBusinessHoursStatus() {
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();

  const isWeekend = day === 0 || day === 6;
  if (isWeekend) {
    return false;
  }

  // Assume support is online 08:00-20:00 UTC Monday-Friday
  return hour >= 8 && hour < 20;
}

async function buildReply(message, history = []) {
  // Try OpenAI first if available
  if (openai) {
    try {
      const systemPrompt = `You are a helpful medical assistant for NephroConsult, an international nephrology consultation platform led by Dr. Ilango S. Prakasam. You have comprehensive knowledge about the website and services.

ABOUT THE PLATFORM:
- Expert kidney care with Dr. Ilango S. Prakasam (Sr. Nephrologist)
- Qualifications: MD, DNB (Nephrology), MRCP (UK)
- Experience: 15+ years in comprehensive kidney care
- World-class nephrology consultations through secure video calls
- Available globally with region-specific pricing
- HIPAA Compliant, Global Access, 4.9/5 Rating
- Comprehensive nephrology care from initial consultations to ongoing kidney health management

SERVICES OFFERED:
1. HD Video Consultations - High-definition video consultations with nephrology experts
2. Digital Prescriptions - Secure digital prescription management and delivery
3. Lab Report Analysis - Professional analysis of kidney function tests and lab reports

CONSULTATION TYPES & PRICING:
- Initial Consultation: $150 USD (comprehensive kidney health assessment)
- Follow-up Consultation: $105 USD (ongoing care and monitoring)
- Emergency Consultation: Available 24/7
- Regional pricing varies by location

BOOKING PROCESS:
1. Visit "Book Appointment" page
2. Choose consultation type (Initial/Follow-up/Emergency)
3. Select preferred date and time slot
4. Upload lab reports (optional but recommended)
5. Choose payment method (cards, PayPal, bank transfers)
6. Confirm booking and receive meeting link

WEBSITE PAGES:
- Home: Main landing page with Dr. Ilango S. Prakasam introduction
- About: Detailed information about the doctor and platform
- Book Appointment: Online booking system with calendar
- Contact: Multiple contact methods and support options
- Profile: Patient dashboard for managing appointments
- Login/Signup: User authentication system

CONTACT INFORMATION:
- Phone Support: +1 (555) 123-4567
- Available 24/7 for emergencies
- Direct line to medical support team
- Email support available through contact form

TECHNICAL FEATURES:
- Secure video calling platform
- Lab report upload and analysis
- Digital prescription delivery
- Appointment reminders and notifications
- Multi-language support
- Mobile-friendly interface

POLICIES:
- Appointments can be rescheduled up to 12 hours before
- Cancellation policy available
- Insurance accepted (varies by region)
- Secure, encrypted communications
- HIPAA compliant data handling

Always provide specific, accurate information about the website and services. Direct users to appropriate pages when needed. For medical advice, remind them to book a consultation with Dr. Ilango S. Prakasam.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content?.trim();
      if (reply) {
        return {
          reply,
          suggestions: generateSuggestions(message)
        };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fall back to rule-based system
    }
  }

  // Fallback to rule-based system
  const normalized = message.toLowerCase();
  for (const entry of knowledgeBase) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry;
    }
  }

  return {
    reply: 'Thanks for reaching out. Our team will review your question and respond shortly. In the meantime, you can book or manage appointments from your dashboard.',
    suggestions: [
      'How do I book an appointment?',
      'Can I reschedule my appointment?',
      'What are your consultation fees?'
    ]
  };
}

function generateSuggestions(message) {
  const normalized = message.toLowerCase();
  
  if (normalized.includes('book') || normalized.includes('appointment')) {
    return [
      'What are your consultation fees?',
      'How do I prepare for consultation?',
      'Can I upload lab reports?'
    ];
  }
  
  if (normalized.includes('fee') || normalized.includes('cost') || normalized.includes('price')) {
    return [
      'Do you accept insurance?',
      'What payment methods are supported?',
      'How do I book an appointment?'
    ];
  }
  
  if (normalized.includes('reschedule') || normalized.includes('cancel')) {
    return [
      'How do I access my profile?',
      'What if I miss my consultation?',
      'Is there a cancellation fee?'
    ];
  }
  
  return [
    'How do I book an appointment?',
    'What are your consultation fees?',
    'Can I reschedule my appointment?'
  ];
}

// Helper function to send email notifications
async function sendChatNotifications(ticket, isNewTicket = false) {
  const adminEmail = env.ADMIN_EMAIL || 'admin@nephroconsultation.com';
  const doctorEmail = env.DOCTOR_EMAIL || 'suyambu54321@gmail.com';
  
  try {
    // Email to admin
    const adminSubject = isNewTicket 
      ? `[${ticket.priority.toUpperCase()}] New Support Ticket: ${ticket.subject}`
      : `[${ticket.priority.toUpperCase()}] Update on Ticket ${ticket.ticketId}: ${ticket.subject}`;
    
    const adminHtml = `
      <h2>Support Ticket Notification</h2>
      <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
      <p><strong>Category:</strong> ${ticket.category}</p>
      <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
      <p><strong>Status:</strong> ${ticket.status}</p>
      <p><strong>From:</strong> ${ticket.user.name} (${ticket.user.email})</p>
      <p><strong>Country:</strong> ${ticket.user.country || 'Not specified'}</p>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      ${ticket.amount ? `<p><strong>Amount:</strong> ${ticket.currency} ${ticket.amount}</p>` : ''}
      <hr>
      <h3>Latest Message:</h3>
      <p>${ticket.messages[ticket.messages.length - 1]?.text || 'No messages'}</p>
      <hr>
      <p><a href="${env.CLIENT_URL || 'https://www.nephroconsultation.com'}/admin/tickets/${ticket.ticketId}">View Ticket</a></p>
    `;
    
    await sendEmail(adminEmail, adminSubject, adminHtml, { category: 'support_ticket' });
    ticket.emailsSent.adminNotification = true;
    
    // Email to doctor if it's a medical complaint or urgent
    if (['medical', 'complaint', 'urgent'].includes(ticket.category) || ticket.priority === 'urgent') {
      const doctorSubject = `[URGENT] Patient Support Ticket: ${ticket.subject}`;
      const doctorHtml = `
        <h2>Patient Support Alert</h2>
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
        <p><strong>Patient:</strong> ${ticket.user.name} (${ticket.user.email})</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <hr>
        <h3>Message:</h3>
        <p>${ticket.messages[ticket.messages.length - 1]?.text || 'No messages'}</p>
        <hr>
        <p><a href="${env.CLIENT_URL || 'https://www.nephroconsultation.com'}/admin/tickets/${ticket.ticketId}">View Ticket</a></p>
      `;
      
      await sendEmail(doctorEmail, doctorSubject, doctorHtml, { category: 'support_ticket' });
      ticket.emailsSent.doctorNotification = true;
    }
    
    // Email to user confirming ticket creation
    if (isNewTicket) {
      const userSubject = `Support Ticket Created: ${ticket.ticketId}`;
      const userHtml = `
        <h2>Thank you for contacting us!</h2>
        <p>Your support ticket has been created successfully.</p>
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p>Our team will review your request and respond as soon as possible.</p>
        <p>You can track your ticket status using the ID above.</p>
      `;
      
      await sendEmail(ticket.user.email, userSubject, userHtml, { category: 'support_ticket' });
      ticket.emailsSent.userNotification = true;
    }
  } catch (error) {
    console.error('Error sending chat notifications:', error);
  }
}

// Helper function to detect complaint keywords
function isComplaintMessage(message) {
  const complaintKeywords = ['complaint', 'issue', 'problem', 'error', 'bug', 'wrong', 'incorrect', 'not working', 'broken', 'fail', 'failed', 'crash', 'crashed', 'refund', 'money back', 'charged', 'overcharge', 'currency', 'wrong price', 'incorrect price'];
  const normalized = message.toLowerCase();
  return complaintKeywords.some(keyword => normalized.includes(keyword));
}

// Helper function to detect currency issues
function detectCurrencyIssue(message) {
  const currencyKeywords = ['currency', 'price', 'cost', 'dollar', 'rupee', 'usd', 'inr', 'gbp', 'eur', 'wrong currency', 'wrong price', 'should be', 'expected'];
  const normalized = message.toLowerCase();
  return currencyKeywords.some(keyword => normalized.includes(keyword));
}

export async function handleChatRequest(req, res) {
  try {
    const parsed = chatRequestSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid chat payload.' });
    }

    const { 
      message, 
      ticketId, 
      category, 
      priority,
      userEmail,
      userName,
      userCountry,
      userTimezone,
      subject,
      amount,
      currency,
      bookingId,
      history = []
    } = parsed.data;

    const online = determineBusinessHoursStatus();
    
    // Detect if this is a complaint or currency issue
    const isComplaint = isComplaintMessage(message);
    const hasCurrencyIssue = detectCurrencyIssue(message);
    
    // Determine category based on message content
    let detectedCategory = category || 'general';
    if (isComplaint) detectedCategory = 'complaint';
    if (hasCurrencyIssue) detectedCategory = 'payment';
    
    // Determine priority based on message content
    let detectedPriority = priority || 'medium';
    if (isComplaint) detectedPriority = 'high';
    if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('emergency')) {
      detectedPriority = 'urgent';
    }

    // Get or create chat ticket
    let ticket;
    if (ticketId) {
      // Update existing ticket
      ticket = await ChatTicket.findOne({ ticketId });
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found.' });
      }
    } else {
      // Create new ticket
      ticket = new ChatTicket({
        user: {
          name: userName || 'Anonymous',
          email: userEmail || 'unknown@example.com',
          country: userCountry,
          timezone: userTimezone
        },
        category: detectedCategory,
        priority: detectedPriority,
        subject: subject || message.substring(0, 100),
        currency,
        amount,
        bookingId,
        messages: []
      });
    }

    // Add user message to ticket
    ticket.messages.push({
      sender: 'user',
      text: message,
      timestamp: new Date()
    });
    
    ticket.lastMessageAt = new Date();
    ticket.status = ticket.status === 'resolved' || ticket.status === 'closed' ? 'open' : ticket.status || 'open';

    // Get bot response
    const answer = await buildReply(message, history);

    // Add bot response to ticket
    ticket.messages.push({
      sender: 'bot',
      text: answer.reply,
      timestamp: new Date()
    });

    // Save ticket
    await ticket.save();

    // Send notifications for complaints or currency issues
    if (isComplaint || hasCurrencyIssue || !ticketId) {
      await sendChatNotifications(ticket, !ticketId);
    }

    // If currency issue detected, provide correction info
    let currencyCorrection = null;
    if (hasCurrencyIssue && userCountry) {
      try {
        const pricing = await getDisplayedPrice('initial', null, userCountry);
        currencyCorrection = {
          country: pricing.country,
          currency: pricing.display.currency,
          correctPrice: pricing.display.value,
          message: `Based on your location (${userCountry}), the correct pricing should be ${pricing.display.currency} ${pricing.display.value}. We apologize for any confusion.`
        };
      } catch (error) {
        console.error('Error getting currency correction:', error);
      }
    }

    return res.json({
      ok: true,
      online,
      ticketId: ticket.ticketId,
      reply: answer.reply,
      suggestions: answer.suggestions,
      isComplaint,
      hasCurrencyIssue,
      currencyCorrection,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category
    });
  } catch (error) {
    console.error('Chat request error:', error);
    return res.status(500).json({ error: 'Failed to process chat message.' });
  }
}

// Get ticket details
router.get('/:ticketId', async (req, res) => {
  try {
    const ticket = await ChatTicket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    res.json({ ok: true, ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket.' });
  }
});

// Get user's tickets
router.get('/user/:email', async (req, res) => {
  try {
    const tickets = await ChatTicket.find({ 'user.email': req.params.email })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ ok: true, tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
});

// Create or update chat message
router.post('/', handleChatRequest);

export default router;
