import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { sendPrescriptionEmail } from '../utils/email.js';
import { getPrescriptionEmailTemplate } from '../utils/emailTemplates.js';

const router = express.Router();

// Create prescription schema
const prescriptionSchema = z.object({
  patientName: z.string().min(1),
  patientEmail: z.string().email(),
  date: z.string(),
  diagnosis: z.string().min(1),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpInstructions: z.string().optional(),
  medicines: z.array(z.object({
    name: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    duration: z.string().min(1),
    timing: z.string(),
    instructions: z.string().optional(),
    link: z.string().url().optional()
  })),
  appointmentId: z.string().optional(),
  sendEmail: z.boolean().optional()
});

// Get all prescriptions for a doctor
router.get('/', requireAuth(['doctor', 'admin']), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.session.user.id })
      .sort({ createdAt: -1 })
      .populate('patientId', 'name email phone')
      .populate('appointmentId');
    
    res.json({ prescriptions });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get prescriptions for a patient
router.get('/patient/:patientId', requireAuth(['doctor', 'admin', 'patient']), async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Patients can only view their own prescriptions
    if (req.session.user.role === 'patient' && req.session.user.id !== patientId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId');
    
    res.json({ prescriptions });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get single prescription
router.get('/:id', requireAuth(['doctor', 'admin', 'patient']), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId');
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Check authorization
    const isDoctor = req.session.user.id === prescription.doctorId.toString();
    const isPatient = req.session.user.id === prescription.patientId.toString();
    const isAdmin = req.session.user.role === 'admin';
    
    if (!isDoctor && !isPatient && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({ prescription });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Create new prescription
router.post('/', requireAuth(['doctor', 'admin']), async (req, res) => {
  try {
    const parsed = prescriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    
    const data = parsed.data;
    
    // Find patient by email
    let patient = await User.findOne({ email: data.patientEmail.toLowerCase() });
    if (!patient) {
      // Create a basic patient record if doesn't exist
      patient = await User.create({
        name: data.patientName,
        email: data.patientEmail.toLowerCase(),
        role: 'patient',
        passwordHash: 'pending', // Patient will set password on first login
      });
    }
    
    // Create prescription
    const prescription = await Prescription.create({
      doctorId: req.session.user.id,
      patientId: patient._id,
      appointmentId: data.appointmentId,
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      clinicalNotes: data.notes,
      medicines: data.medicines,
      followUpDate: data.followUpDate,
      followUpInstructions: data.followUpInstructions,
      prescriptionDate: new Date(data.date)
    });
    
    // Update appointment if linked
    if (data.appointmentId) {
      await Appointment.findByIdAndUpdate(data.appointmentId, {
        prescriptionId: prescription._id,
        status: 'completed'
      });
    }
    
    // Send email to patient if requested
    if (data.sendEmail && patient.email) {
      const prescriptionTemplate = getPrescriptionEmailTemplate(
        data.patientName,
        'Dr. Ilango S. Prakasam',
        {
          medicines: data.medicines,
          instructions: data.followUpInstructions,
          nextVisit: data.followUpDate ? new Date(data.followUpDate).toLocaleDateString() : null
        },
        new Date(data.date).toLocaleDateString()
      );
      
      await sendPrescriptionEmail(
        patient.email,
        prescriptionTemplate.subject,
        prescriptionTemplate.html
      );
    }
    
    res.json({ 
      success: true, 
      prescription,
      message: data.sendEmail ? 'Prescription sent to patient' : 'Prescription saved'
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// Update prescription
router.put('/:id', requireAuth(['doctor', 'admin']), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Only the doctor who created it or admin can update
    if (prescription.doctorId.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const parsed = prescriptionSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    
    Object.assign(prescription, parsed.data);
    await prescription.save();
    
    res.json({ prescription });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

// Delete prescription
router.delete('/:id', requireAuth(['doctor', 'admin']), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Only the doctor who created it or admin can delete
    if (prescription.doctorId.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await prescription.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

// Helper function to generate prescription email HTML
function generatePrescriptionEmail(prescription, data, doctorName) {
  const medicinesHtml = data.medicines.map(med => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${med.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${med.dosage}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${med.frequency}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${med.duration}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${med.timing}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${med.instructions || '-'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #006f6f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .prescription-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #006f6f; color: white; padding: 10px; text-align: left; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .medicine-link { color: #006f6f; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NephroConsult</h1>
          <p>Your Digital Prescription</p>
        </div>
        
        <div class="content">
          <div class="prescription-details">
            <h2>Prescription Details</h2>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
            <p><strong>Patient:</strong> ${data.patientName}</p>
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p><strong>Diagnosis:</strong> ${data.diagnosis}</p>
            ${data.symptoms ? `<p><strong>Symptoms:</strong> ${data.symptoms}</p>` : ''}
            ${data.notes ? `<p><strong>Clinical Notes:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div class="prescription-details">
            <h3>Prescribed Medicines</h3>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Timing</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${medicinesHtml}
              </tbody>
            </table>
          </div>
          
          ${data.followUpDate || data.followUpInstructions ? `
            <div class="prescription-details">
              <h3>Follow-up</h3>
              ${data.followUpDate ? `<p><strong>Next Visit:</strong> ${new Date(data.followUpDate).toLocaleDateString()}</p>` : ''}
              ${data.followUpInstructions ? `<p><strong>Instructions:</strong> ${data.followUpInstructions}</p>` : ''}
            </div>
          ` : ''}
          
          <div class="prescription-details">
            <p><strong>Important:</strong> Please follow the prescription as directed. If you experience any adverse effects or have concerns, contact your healthcare provider immediately.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an electronically generated prescription from NephroConsult.</p>
          <p>For any queries, please contact us at support@nephroconsultation.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default router;
