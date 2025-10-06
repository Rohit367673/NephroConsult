import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  timing: { type: String, required: true },
  instructions: { type: String },
  link: { type: String }
});

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true
  },
  symptoms: {
    type: String
  },
  clinicalNotes: {
    type: String
  },
  medicines: [medicineSchema],
  followUpDate: {
    type: Date
  },
  followUpInstructions: {
    type: String
  },
  prescriptionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ appointmentId: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
