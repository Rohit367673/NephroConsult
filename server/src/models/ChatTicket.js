import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ['user', 'bot', 'admin', 'doctor'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatTicketSchema = new mongoose.Schema(
  {
    // User information
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      email: { type: String, required: true, lowercase: true },
      country: String,
      timezone: String,
    },
    
    // Ticket metadata
    ticketId: { type: String, unique: true, index: true }, // Auto-generated ID like CT-20240101-001
    category: { 
      type: String, 
      enum: ['general', 'booking', 'payment', 'refund', 'technical', 'medical', 'complaint'],
      default: 'general',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    subject: { type: String, required: true },
    
    // Chat history
    messages: [ChatMessageSchema],
    
    // Currency and pricing info (for refund/payment issues)
    currency: String,
    amount: Number,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    
    // Resolution details
    resolution: {
      resolvedBy: { type: String, enum: ['admin', 'doctor', 'system'] },
      resolvedAt: Date,
      notes: String,
    },
    
    // Email tracking
    emailsSent: {
      userNotification: { type: Boolean, default: false },
      adminNotification: { type: Boolean, default: false },
      doctorNotification: { type: Boolean, default: false },
    },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for common queries
ChatTicketSchema.index({ 'user.email': 1, createdAt: -1 });
ChatTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
ChatTicketSchema.index({ category: 1, status: 1 });

// Auto-generate ticketId before saving
ChatTicketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    
    // Count tickets created today
    const count = await mongoose.model('ChatTicket').countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.ticketId = `CT-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.models.ChatTicket || mongoose.model('ChatTicket', ChatTicketSchema);
