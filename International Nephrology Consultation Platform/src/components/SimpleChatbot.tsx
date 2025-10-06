import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getUserTimezone, getPricingForTimezone, getCountryFromTimezone } from '../utils/timezoneUtils';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const getDynamicPricing = () => {
  const tz = getUserTimezone();
  const pricing = getPricingForTimezone(tz);
  const country = getCountryFromTimezone(tz);
  return { pricing, country, timezone: tz };
};

const knowledgeBase = [
  {
    keywords: ['doctor', 'ilango', 'who', 'about', 'qualification', 'krishnamurthy'],
    response: "Dr. Ilango S. Prakasam is our Sr. Nephrologist with MD, DNB (Nephrology), MRCP (UK) qualifications and 15+ years of experience. He provides expert kidney care through NephroConsult, offering world-class nephrology consultations via secure HD video calls with comprehensive care from initial consultations to ongoing kidney health management. Available globally with region-specific pricing and 24/7 support."
  },
  {
    keywords: ['book', 'appointment', 'schedule', 'consult', 'booking', 'how to book'],
    response: () => {
      const { pricing, country } = getDynamicPricing();
      return `TO BOOK A CONSULTATION:\n\n1️⃣ Visit our 'Book Appointment' page\n2️⃣ Choose consultation type:\n   • Initial: ${pricing.symbol}${pricing.initial} ${pricing.currency} (comprehensive assessment)\n   • Follow-up: ${pricing.symbol}${pricing.followup} ${pricing.currency} (ongoing care)\n3️⃣ Select your preferred date and time\n4️⃣ Upload lab reports (recommended)\n5️⃣ Choose payment method\n6️⃣ Confirm booking and receive secure meeting link\n\n🌍 Regional pricing for ${country}\n📞 Available globally with flexible scheduling!`;
    }
  },
  {
    keywords: ['fee', 'cost', 'price', 'charge', 'pricing', 'money', 'how much'],
    response: () => {
      const { pricing, country } = getDynamicPricing();
      return `CONSULTATION PRICING FOR ${country.toUpperCase()}:\n\n💰 Initial Consultation: ${pricing.symbol}${pricing.initial} ${pricing.currency}\n   • Comprehensive kidney health assessment\n   • Medical history review\n   • Treatment plan development\n\n💰 Follow-up Consultation: ${pricing.symbol}${pricing.followup} ${pricing.currency}\n   • Ongoing care and monitoring\n   • Progress evaluation\n   • Treatment adjustments\n\n🌍 Regional pricing tailored for ${country}\n⏰ All consultations: 6-10 PM IST (India Time)\n💳 Multiple payment options accepted`;
    }
  },
  {
    keywords: ['services', 'what', 'offer', 'provide', 'do'],
    response: "NEPHROCONSULT SERVICES:\n\n🎥 HD Video Consultations\n   • Secure, HIPAA-compliant video calls\n   • High-definition consultations with Dr. Ilango\n\n💊 Digital Prescriptions\n   • Secure prescription management\n   • Electronic delivery system\n\n🔬 Lab Report Analysis\n   • Professional kidney function analysis\n   • Comprehensive lab report reviews\n\n🌍 Global Access - Available worldwide\n⭐ 4.9/5 Patient Rating - 500+ satisfied patients"
  },
  {
    keywords: ['video', 'consultation', 'call', 'online', 'telemedicine', 'how does it work'],
    response: "VIDEO CONSULTATION PROCESS:\n\n📋 BEFORE:\n• Upload lab reports and medical history\n• Receive secure meeting link via email\n• Test your camera/microphone\n\n🎥 DURING:\n• Join from any device (computer, tablet, phone)\n• Dr. Ilango reviews your case live\n• Discuss symptoms, concerns, treatment options\n• Receive personalized treatment plan\n\n📄 AFTER:\n• Digital prescriptions sent securely\n• Follow-up recommendations\n• All sessions recorded for your records\n\n🔒 100% HIPAA compliant & secure"
  },
  {
    keywords: ['lab', 'report', 'test', 'upload', 'document', 'preparation'],
    response: "LAB REPORTS & PREPARATION:\n\n📄 RECOMMENDED TESTS:\n• Kidney function tests (Creatinine, BUN)\n• Blood work (Complete metabolic panel)\n• Urine analysis (Proteinuria, microscopy)\n• Previous consultation notes\n\n📤 HOW TO UPLOAD:\n• During booking process\n• Later through your profile dashboard\n• Email to our secure system\n\n👨‍⚕️ PROFESSIONAL ANALYSIS:\n• Dr. Ilango reviews before consultation\n• Detailed analysis included in all sessions\n• Secure, HIPAA-compliant storage\n• Access anytime through your profile"
  },
  {
    keywords: ['payment', 'pay', 'insurance', 'card', 'billing', 'methods'],
    response: "PAYMENT OPTIONS:\n\n💳 ACCEPTED METHODS:\n• Credit/Debit cards (Visa, MasterCard, Amex)\n• PayPal and digital wallets\n• Bank transfers (international patients)\n• Online secure payment gateway\n\n🏥 INSURANCE:\n• Contact us for coverage verification\n• Receipts provided for reimbursement\n• HSA/FSA eligible\n• Payment plans available\n\n🔒 SECURE BILLING:\n• PCI-compliant payment processing\n• Automatic receipts via email\n• Transparent pricing, no hidden fees"
  },
  {
    keywords: ['time', 'hours', 'available', 'schedule', 'when', 'availability'],
    response: () => {
      const { country, timezone } = getDynamicPricing();
      return `AVAILABILITY & SCHEDULING:\n\n🕐 DR. ILANGO'S HOURS:\n• Regular consultations: 6:00 PM - 10:00 PM IST\n• Urgent consultations: 10:00 AM - 10:00 PM IST\n• Your timezone: ${timezone}\n• Times are automatically converted to ${country} time\n\n⏰ CONSULTATION TIMES:\n• Regular appointments during evening hours (6-10 PM IST)\n• Urgent appointments available throughout the day (10 AM-10 PM IST)\n• Your local time will be displayed when booking\n\n🚨 URGENT CONSULTATIONS:\n• Same-day availability for urgent cases\n• Extended hours: 10 AM to 10 PM IST\n• Priority scheduling available\n\n📅 BOOKING:\n• Schedule up to 2 weeks in advance\n• Reschedule up to 12 hours before\n• Confirmation via email with both local & IST times`;
    }
  },
  {
    keywords: ['contact', 'phone', 'email', 'support', 'help', 'reach'],
    response: "CONTACT NEPHROCONSULT:\n\n📧 EMAIL & ONLINE:\n• Visit our 'Contact' page for secure contact form\n• This live chat support (available now!)\n• Response within 2 hours during business days\n\n🌐 WEBSITE CONTACT:\n• Use our secure contact form on the Contact page\n• Available 24/7 for emergencies\n• Direct line to medical support team\n\n🏢 PROFESSIONAL SUPPORT:\n• Multilingual assistance available\n• Technical support for video calls\n• Billing and insurance inquiries\n\n💬 For detailed queries, please use our Contact page for the best assistance!"
  },
  {
    keywords: ['website', 'pages', 'navigation', 'site', 'platform'],
    response: "NEPHROCONSULT WEBSITE NAVIGATION:\n\n🏠 HOME: Main landing page with Dr. Ilango introduction\n📋 ABOUT: Detailed doctor information and qualifications\n📅 BOOK APPOINTMENT: Online booking system with calendar\n📞 CONTACT: Multiple contact methods and support\n👤 PROFILE: Patient dashboard for managing appointments\n🔐 LOGIN/SIGNUP: Secure user authentication system\n\n✨ FEATURES:\n• Mobile-friendly responsive design\n• Secure patient portal\n• Real-time appointment booking\n• 24/7 chat support (this chat!)"
  },
  {
    keywords: ['security', 'privacy', 'hipaa', 'safe', 'secure'],
    response: "SECURITY & PRIVACY:\n\n🔒 HIPAA COMPLIANT:\n• All consultations fully encrypted\n• Secure video calling platform\n• Protected health information safeguards\n\n🛡️ DATA PROTECTION:\n• Bank-level security encryption\n• Secure file upload and storage\n• No data sharing with third parties\n• Regular security audits\n\n🌍 GLOBAL COMPLIANCE:\n• International privacy standards\n• Secure payment processing\n• GDPR compliant for EU patients"
  },
  {
    keywords: ['kidney', 'nephrology', 'disease', 'treatment', 'conditions'],
    response: "NEPHROLOGY EXPERTISE:\n\n🩺 CONDITIONS TREATED:\n• Chronic kidney disease (CKD)\n• Acute kidney injury\n• Hypertension management\n• Proteinuria and hematuria\n• Electrolyte disorders\n• Dialysis consultation\n\n👨‍⚕️ DR. ILANGO'S EXPERTISE:\n• Comprehensive kidney care\n• Preventive nephrology\n• Treatment plan optimization\n• Medication management\n• Lifestyle counseling\n\n📊 OUTCOMES:\n• 4.9/5 patient satisfaction\n• 500+ successful consultations\n• Global patient base"
  }
];

export function SimpleChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: '👋 Hello! I\'m here to help with Dr. Ilango\'s nephrology services. Ask me about consultations, pricing, or booking appointments!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getBotResponse = (userMessage: string): string => {
    const normalizedMessage = userMessage.toLowerCase();
    
    // Find matching knowledge base entry
    const matchedEntry = knowledgeBase.find(entry =>
      entry.keywords.some(keyword => normalizedMessage.includes(keyword))
    );

    if (matchedEntry) {
      // Check if response is a function (for dynamic content)
      return typeof matchedEntry.response === 'function' 
        ? matchedEntry.response() 
        : matchedEntry.response;
    }

    // Default response
    return "Thank you for your question! I'd be happy to help you with information about Dr. Ilango's nephrology services, booking appointments, pricing, or any other questions you have. Could you please be more specific about what you'd like to know?";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate thinking time
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#006f6f] hover:bg-[#005555] text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-20 right-4 sm:right-6 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
            style={{ height: '450px' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-[#006f6f] text-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">NephroConsult Assistant</h3>
                  <p className="text-xs opacity-90 flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-red-500 bg-red-400/80 rounded-full transition-colors ml-2 flex-shrink-0"
                title="Close chat"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-gray-50 min-h-0" style={{ maxHeight: 'calc(450px - 140px)' }}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {message.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#006f6f] to-[#008080] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`px-3 py-2 rounded-lg shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-[#006f6f] text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#006f6f] to-[#008080] flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg rounded-bl-sm border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#006f6f] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#006f6f] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#006f6f] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2 mb-3">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about consultations, pricing..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border-gray-300 bg-gray-50 px-4 py-2 focus:border-[#006f6f] focus:ring-[#006f6f] text-sm"
                />
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-[#006f6f] hover:bg-[#005555] rounded-full w-10 h-10 p-0 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              {/* Quick Suggestions */}
              <div className="grid grid-cols-2 gap-1">
                {[
                  'Book consultation',
                  'Consultation fees',
                  'Video process',
                  'Lab reports'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-[#006f6f] hover:text-white rounded text-gray-700 transition-all duration-200 border border-gray-200 hover:border-[#006f6f]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
