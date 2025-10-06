import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema(
  {
    notes: String,
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        link: String,
      },
    ],
    nextConsultationDate: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      email: String,
      phone: String,
      country: String,
    },
    doctor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'Dr. Ilango Krishnamurthy' },
      title: { type: String, default: 'Sr. Nephrologist' },
      qualifications: { type: String, default: 'MD, DNB (Nephrology), MRCP (UK)' },
      experience: { type: String, default: '15+ Years Experience' },
      email: { type: String, default: 'suyambu54321@gmail.com' },
    },
    date: { type: String, required: true }, // YYYY-MM-DD for quick queries
    timeSlot: { type: String, required: true }, // e.g., "10:00 AM"
    type: { type: String, enum: ['Initial Consultation', 'Follow-up', 'Urgent Consultation', 'Video Consultation', 'Chat Consultation', 'Phone Consultation'], required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'confirmed', index: true },
    price: {
      amount: Number,
      currency: String,
      symbol: String,
      region: String,
      discountApplied: { type: Boolean, default: false },
    },
    meetLink: String,
    files: [String],
    prescription: PrescriptionSchema,
    // Patient-provided intake during booking (step 2)
    intake: {
      address: String,
      description: String, // disease description / medical history
      documents: [String], // uploaded docs (base64/data URLs or URLs)
    },
  },
  { timestamps: true }
);

AppointmentSchema.index({ date: 1, timeSlot: 1, status: 1 });

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
