import express from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { env } from '../config.js';

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
        sender: z.enum(['user', 'support', 'bot']),
        text: z.string().min(1).max(1000)
      })
    )
    .max(10)
    .optional()
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

export async function handleChatRequest(req, res) {
  try {
    const parsed = chatRequestSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid chat payload.' });
    }

    const { message } = parsed.data;
    const online = determineBusinessHoursStatus();
    const answer = await buildReply(message, parsed.data.history || []);

    return res.json({
      ok: true,
      online,
      reply: answer.reply,
      suggestions: answer.suggestions
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process chat message.' });
  }
}

router.post('/', handleChatRequest);

export default router;
