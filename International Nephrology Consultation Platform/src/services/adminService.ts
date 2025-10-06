// Admin service for managing consultations, prescriptions, and notifications
import meetingService from './meetingService';

export interface Consultation {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  istTime: string;
  type: 'Initial Consultation' | 'Follow-up';
  status: 'upcoming' | 'completed' | 'cancelled';
  documents: string[];
  query: string;
  meetingLink?: string;
  country: string;
  prescription?: Prescription;
}

export interface Prescription {
  medicines: Medicine[];
  instructions: string;
  nextVisit?: string;
  createdAt?: string;
  doctorName?: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  url?: string;
}

class AdminService {
  private consultations: Consultation[] = [
    {
      id: '1',
      patientName: 'John Smith',
      patientEmail: 'john@example.com',
      patientPhone: '+1234567890',
      date: '2024-01-15',
      time: '10:00 AM',
      istTime: '10:30 PM IST',
      type: 'Initial Consultation',
      status: 'upcoming',
      documents: ['kidney_report.pdf', 'blood_test.pdf'],
      query: 'Experiencing kidney pain and frequent urination for the past 2 weeks.',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      country: 'US'
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      patientEmail: 'sarah@example.com',
      patientPhone: '+1987654321',
      date: '2024-01-16',
      time: '2:00 PM',
      istTime: '12:30 AM IST',
      type: 'Follow-up',
      status: 'completed',
      documents: ['followup_labs.pdf'],
      query: 'Follow-up consultation for kidney stone treatment.',
      prescription: {
        medicines: [
          { name: 'Potassium Citrate', dosage: '10mg twice daily', url: 'https://1mg.com/potassium-citrate' },
          { name: 'Tamsulosin', dosage: '0.4mg once daily', url: 'https://1mg.com/tamsulosin' }
        ],
        instructions: 'Take medications as prescribed. Increase water intake to 3-4 liters daily.',
        nextVisit: '2024-02-16',
        createdAt: '2024-01-16',
        doctorName: 'Dr. Ilango S. Prakasam'
      },
      country: 'US'
    },
    {
      id: '3',
      patientName: 'Raj Patel',
      patientEmail: 'raj@example.com',
      patientPhone: '+919876543210',
      date: '2024-01-17',
      time: '4:00 PM',
      istTime: '4:00 PM IST',
      type: 'Initial Consultation',
      status: 'upcoming',
      documents: ['ultrasound.pdf', 'creatinine_report.pdf'],
      query: 'High creatinine levels and swelling in legs.',
      meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
      country: 'IN'
    }
  ];

  // Get all consultations
  async getConsultations(): Promise<Consultation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Initialize meeting service with existing consultations
    meetingService.initializeMeetingsFromConsultations(this.consultations);
    
    // Ensure all consultations have meeting links
    const consultationsWithMeetings = this.consultations.map(consultation => {
      if (!consultation.meetingLink) {
        consultation.meetingLink = meetingService.generateMeetingURL(consultation.id, consultation.patientEmail);
      }
      return consultation;
    });
    
    return [...consultationsWithMeetings];
  }

  // Get consultation by ID
  async getConsultationById(id: string): Promise<Consultation | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.consultations.find(c => c.id === id) || null;
  }

  // Update consultation
  async updateConsultation(id: string, updates: Partial<Consultation>): Promise<Consultation> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.consultations.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Consultation not found');
    }
    
    this.consultations[index] = { ...this.consultations[index], ...updates };
    return this.consultations[index];
  }

  // Create prescription and mark consultation as completed
  async createPrescription(
    consultationId: string, 
    prescription: Prescription,
    doctorName: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const consultation = this.consultations.find(c => c.id === consultationId);
    if (!consultation) {
      throw new Error('Consultation not found');
    }

    // Add prescription with metadata
    const prescriptionWithMeta = {
      ...prescription,
      createdAt: new Date().toISOString(),
      doctorName
    };
    
    // Update consultation
    await this.updateConsultation(consultationId, {
      prescription: prescriptionWithMeta,
      status: 'completed'
    });

    // Send email notification to patient
    await this.sendPrescriptionEmail(consultation.patientEmail, consultation.patientName, prescriptionWithMeta);
    
    console.log(`Prescription created for consultation ${consultationId}`);
  }

  // Send prescription email to patient
  private async sendPrescriptionEmail(
    patientEmail: string, 
    patientName: string, 
    prescription: Prescription
  ): Promise<void> {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`📧 Prescription email sent to ${patientEmail}`);
    console.log('Email content:', {
      to: patientEmail,
      subject: '🏥 Your Prescription from NephroConsult',
      content: {
        patientName,
        doctorName: prescription.doctorName,
        medicines: prescription.medicines,
        instructions: prescription.instructions,
        nextVisit: prescription.nextVisit
      }
    });
    
    // In a real application, this would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer
    // - etc.
  }

  // Send meeting reminder
  async sendMeetingReminder(consultationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const consultation = this.consultations.find(c => c.id === consultationId);
    if (!consultation) {
      throw new Error('Consultation not found');
    }
    
    console.log(`📧 Meeting reminder sent to ${consultation.patientEmail}`);
    console.log('Reminder content:', {
      to: consultation.patientEmail,
      subject: '⏰ Upcoming Consultation Reminder - NephroConsult',
      content: {
        patientName: consultation.patientName,
        date: consultation.date,
        time: consultation.time,
        istTime: consultation.istTime,
        meetingLink: consultation.meetingLink
      }
    });
  }

  // Get consultation statistics
  async getStatistics(): Promise<{
    upcoming: number;
    completed: number;
    total: number;
    completedToday: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const today = new Date().toISOString().split('T')[0];
    
    return {
      upcoming: this.consultations.filter(c => c.status === 'upcoming').length,
      completed: this.consultations.filter(c => c.status === 'completed').length,
      total: this.consultations.length,
      completedToday: this.consultations.filter(c => 
        c.status === 'completed' && c.date === today
      ).length
    };
  }

  // Generate Google Meet link using meeting service
  generateMeetingLink(consultationId: string, patientEmail: string): string {
    return meetingService.generateMeetingURL(consultationId, patientEmail);
  }

  // Get meeting URL for a consultation (ensures consistency)
  getMeetingURL(consultationId: string, patientEmail: string): string {
    return meetingService.getMeetingURL(consultationId, patientEmail);
  }

  // Download patient document (placeholder)
  async downloadDocument(documentName: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`📄 Downloading document: ${documentName}`);
    // In a real application, this would download from cloud storage
  }

  // Mark consultation as completed
  async markConsultationCompleted(consultationId: string): Promise<void> {
    await this.updateConsultation(consultationId, { status: 'completed' });
  }

  // Cancel consultation
  async cancelConsultation(consultationId: string, reason?: string): Promise<void> {
    await this.updateConsultation(consultationId, { status: 'cancelled' });
    
    const consultation = this.consultations.find(c => c.id === consultationId);
    if (consultation) {
      console.log(`📧 Cancellation email sent to ${consultation.patientEmail}`);
      // Send cancellation email to patient
    }
  }
}

export const adminService = new AdminService();
export default adminService;
