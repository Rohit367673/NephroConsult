// Patient consultation service - manages patient's view of consultations
import meetingService from './meetingService';

export interface PatientConsultation {
  id: string;
  type: 'Initial Consultation' | 'Follow-up';
  date: string;
  time: string;
  istTime: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingLink?: string;
  doctorName: string;
  documents: string[];
  prescription?: {
    medicines: Array<{
      name: string;
      dosage: string;
      url?: string;
    }>;
    instructions: string;
    nextVisit?: string;
    createdAt?: string;
    doctorName?: string;
  };
  receiptUrl?: string;
  amount: number;
  currency: string;
  country: string;
}

class ConsultationService {
  // This would typically come from an API or database
  private patientConsultations: Map<string, PatientConsultation[]> = new Map();

  /**
   * Get consultations for a specific patient
   */
  async getPatientConsultations(patientEmail: string): Promise<PatientConsultation[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const consultations = this.patientConsultations.get(patientEmail) || [];
    
    // Ensure all consultations have consistent meeting links
    const consultationsWithMeetings = consultations.map(consultation => {
      if (!consultation.meetingLink && consultation.status === 'upcoming') {
        consultation.meetingLink = meetingService.getMeetingURL(consultation.id, patientEmail);
      }
      return consultation;
    });
    
    return consultationsWithMeetings;
  }

  /**
   * Add a new consultation for a patient
   */
  async addConsultation(patientEmail: string, consultation: Omit<PatientConsultation, 'meetingLink'>): Promise<PatientConsultation> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate meeting link using the meeting service
    const meetingLink = meetingService.generateMeetingURL(consultation.id, patientEmail);
    
    const fullConsultation: PatientConsultation = {
      ...consultation,
      meetingLink
    };
    
    const existing = this.patientConsultations.get(patientEmail) || [];
    existing.push(fullConsultation);
    this.patientConsultations.set(patientEmail, existing);
    
    console.log(`Added consultation ${consultation.id} for patient ${patientEmail} with meeting link: ${meetingLink}`);
    
    return fullConsultation;
  }

  /**
   * Update a consultation
   */
  async updateConsultation(patientEmail: string, consultationId: string, updates: Partial<PatientConsultation>): Promise<PatientConsultation | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const consultations = this.patientConsultations.get(patientEmail) || [];
    const index = consultations.findIndex(c => c.id === consultationId);
    
    if (index === -1) {
      return null;
    }
    
    consultations[index] = { ...consultations[index], ...updates };
    this.patientConsultations.set(patientEmail, consultations);
    
    return consultations[index];
  }

  /**
   * Get meeting link for a specific consultation
   */
  getMeetingLink(consultationId: string, patientEmail: string): string {
    return meetingService.getMeetingURL(consultationId, patientEmail);
  }

  /**
   * Initialize with mock data for testing
   */
  initializeWithMockData(): void {
    // Sample patient consultations
    const mockData: { [patientEmail: string]: PatientConsultation[] } = {
      'john@example.com': [
        {
          id: '1',
          type: 'Initial Consultation',
          date: '2024-01-15',
          time: '10:00 AM',
          istTime: '10:30 PM IST',
          status: 'upcoming',
          doctorName: 'Dr. Ilango Krishnamurthy',
          documents: ['kidney_report.pdf', 'blood_test.pdf'],
          amount: 30,
          currency: 'USD',
          country: 'US'
        }
      ],
      'sarah@example.com': [
        {
          id: '2',
          type: 'Follow-up',
          date: '2024-01-16',
          time: '2:00 PM',
          istTime: '12:30 AM IST',
          status: 'completed',
          doctorName: 'Dr. Ilango Krishnamurthy',
          documents: ['followup_labs.pdf'],
          prescription: {
            medicines: [
              { name: 'Potassium Citrate', dosage: '10mg twice daily', url: 'https://1mg.com/potassium-citrate' },
              { name: 'Tamsulosin', dosage: '0.4mg once daily', url: 'https://1mg.com/tamsulosin' }
            ],
            instructions: 'Take medications as prescribed. Increase water intake to 3-4 liters daily.',
            nextVisit: '2024-02-16',
            createdAt: '2024-01-16',
            doctorName: 'Dr. Ilango'
          },
          receiptUrl: '/receipts/consultation-2.pdf',
          amount: 25,
          currency: 'USD',
          country: 'US'
        }
      ],
      'raj@example.com': [
        {
          id: '3',
          type: 'Initial Consultation',
          date: '2024-01-17',
          time: '4:00 PM',
          istTime: '4:00 PM IST',
          status: 'upcoming',
          doctorName: 'Dr. Ilango Krishnamurthy',
          documents: ['ultrasound.pdf', 'creatinine_report.pdf'],
          amount: 2500,
          currency: 'INR',
          country: 'IN'
        }
      ]
    };

    // Initialize consultations and generate meeting links
    Object.entries(mockData).forEach(([patientEmail, consultations]) => {
      const consultationsWithMeetings = consultations.map(consultation => {
        if (consultation.status === 'upcoming') {
          consultation.meetingLink = meetingService.generateMeetingURL(consultation.id, patientEmail);
        }
        return consultation;
      });
      
      this.patientConsultations.set(patientEmail, consultationsWithMeetings);
    });

    console.log('Initialized consultation service with mock data');
  }

  /**
   * Get all consultations (for admin purposes)
   */
  getAllConsultations(): PatientConsultation[] {
    const allConsultations: PatientConsultation[] = [];
    this.patientConsultations.forEach(consultations => {
      allConsultations.push(...consultations);
    });
    return allConsultations;
  }
}

// Export singleton instance
export const consultationService = new ConsultationService();

// Initialize with mock data
consultationService.initializeWithMockData();

export default consultationService;
