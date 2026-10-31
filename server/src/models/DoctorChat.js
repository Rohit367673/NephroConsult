import mongoose from 'mongoose';

const DoctorChatMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ['patient', 'doctor', 'system'], required: true },
    senderName: { type: String, default: '' },
    text: { type: String, required: true },
    attachments: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const DoctorPrescriptionSchema = new mongoose.Schema(
  {
    diagnosis: { type: String, default: '' },
    instructions: { type: String, default: '' },
    notes: { type: String, default: '' },
    nextReview: { type: String, default: '' },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: '' },
        frequency: { type: String, default: '' },
        link: { type: String, default: '' },
      },
    ],
    closedAt: { type: Date },
  },
  { _id: false, strict: false }
);

const DoctorChatSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, index: true }, // e.g. DC-20261029-001
    patient: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, index: true },
      phone: { type: String, default: '' },
      age: { type: Number },
      gender: { type: String, default: '' },
      country: { type: String, default: 'IN' },
    },
    doctor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'Dr. Ilango S. Prakasam' },
      email: { type: String, default: 'suyambu54321@gmail.com' },
      title: { type: String, default: 'Sr. Nephrologist' },
    },
    status: {
      type: String,
      enum: ['waiting_doctor', 'doctor_replied', 'waiting_patient', 'closed'],
      default: 'waiting_doctor',
      index: true,
    },
    initialQuery: { type: String, default: '' }, // symptoms, questions, medical background
    documents: [{ type: String }], // uploaded lab reports: filename|data or URL
    messages: [DoctorChatMessageSchema],
    prescription: DoctorPrescriptionSchema,
    price: {
      amount: { type: Number, default: 100 },
      currency: { type: String, default: 'INR' },
      orderId: { type: String },
      paymentId: { type: String },
    },
    closedAt: { type: Date },
    closedBy: { type: String },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Indexes
DoctorChatSchema.index({ 'patient.email': 1, createdAt: -1 });
DoctorChatSchema.index({ status: 1, createdAt: -1 });

// Auto-generate ticketId before saving
DoctorChatSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await mongoose.model('DoctorChat').countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });
    this.ticketId = `DC-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.models.DoctorChat || mongoose.model('DoctorChat', DoctorChatSchema);
