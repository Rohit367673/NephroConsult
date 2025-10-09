// Admin service for managing consultations, prescriptions, and notifications

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
  async getConsultations(): Promise<Consultation[]> {
    try {
      // Use the real doctor endpoint
      const response = await fetch('/api/appointments/doctor', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status, response.statusText);
        if (response.status === 401) {
          console.error('❌ Unauthorized - user not logged in or session expired');
        } else if (response.status === 403) {
          console.error('❌ Forbidden - insufficient permissions (need doctor/admin role)');
        }
        throw new Error(`Failed to fetch consultations: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 Raw appointments from API:', data.appointments);
      console.log('📋 Number of appointments:', data.appointments?.length || 0);
      
      // Transform appointment data to consultation format  
      const consultations: Consultation[] = (data.appointments || []).map((apt: any) => {
        console.log('🔍 Raw appointment data for transformation:', apt);
        console.log('📄 Document fields check:');
        console.log('📄   apt.files:', apt.files);
        console.log('📄   apt.intake?.documents:', apt.intake?.documents);
        console.log('📄   apt.documents:', apt.documents);
        console.log('📄   apt.intake:', apt.intake);
        
        // Process documents with better debugging - check for non-empty arrays
        const documents = (apt.files && apt.files.length > 0) ? apt.files : 
                         (apt.intake?.documents && apt.intake.documents.length > 0) ? apt.intake.documents :
                         (apt.documents && apt.documents.length > 0) ? apt.documents : [];
        console.log('📄 Final documents array:', documents);
        console.log('📄 Documents array length:', documents.length);
        
        return {
          id: apt._id,
          patientName: apt.patient?.name || 'Unknown Patient',
          patientEmail: apt.patient?.email || 'N/A',
          // Try to get phone from multiple sources
          patientPhone: apt.patient?.phone || apt.patientPhone || 'N/A',
          date: apt.date,
          time: apt.timeSlot,
          istTime: apt.timeSlot,
          type: apt.type as 'Initial Consultation' | 'Follow-up',
          status: apt.status === 'confirmed' ? 'upcoming' : 
                  apt.status === 'completed' ? 'completed' : 
                  apt.status === 'pending' ? 'upcoming' : 'upcoming',
          // Better document handling
          documents: documents,
          query: apt.intake?.description || apt.intake?.reason || apt.query || 'No query provided',
          meetingLink: apt.meetLink,
          // Better country handling
          country: (apt.patient?.country && apt.patient.country !== 'default') 
                   ? apt.patient.country 
                   : apt.country || 'Unknown',
          prescription: apt.prescription ? {
            medicines: apt.prescription.medicines || [],
            instructions: apt.prescription.notes || '',
            nextVisit: apt.prescription.nextConsultationDate || '',
            createdAt: apt.prescription.createdAt,
            doctorName: apt.doctor?.name || 'Dr. Ilango S. Prakasam'
          } : undefined
        };
      });
      
      console.log('📋 Transformed consultations:', consultations);
      console.log('📋 Consultations count:', consultations.length);
      if (consultations.length > 0) {
        console.log('📋 First consultation example:', consultations[0]);
      }
      
      return consultations;
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return [];
    }
  }

  // Placeholder methods for other functionality
  async getConsultationById(id: string): Promise<Consultation | null> {
    const consultations = await this.getConsultations();
    return consultations.find(c => c.id === id) || null;
  }

  async updateConsultation(id: string, updates: Partial<Consultation>): Promise<Consultation> {
    // In a real app, this would make an API call to update the consultation
    const consultation = await this.getConsultationById(id);
    if (!consultation) throw new Error('Consultation not found');
    return { ...consultation, ...updates };
  }

  async createPrescription(consultationId: string, prescription: Prescription, doctorName: string): Promise<void> {
    try {
      const response = await fetch(`/api/appointments/${consultationId}/prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prescription: {
            notes: prescription.instructions,
            medicines: prescription.medicines.map(med => ({
              name: med.name,
              dosage: med.dosage,
              frequency: 'As prescribed', // You can enhance this
              link: med.url || ''
            })),
            nextConsultationDate: prescription.nextVisit ? new Date(prescription.nextVisit) : null
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create prescription');
      }

      console.log('✅ Prescription created successfully for consultation:', consultationId);
      
      // Also mark consultation as completed
      console.log('🔄 Marking consultation as completed...');
      await this.updateConsultationStatus(consultationId, 'completed');
      console.log('✅ Consultation marked as completed');
      
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  async updateConsultationStatus(consultationId: string, status: 'completed' | 'cancelled'): Promise<void> {
    try {
      const response = await fetch(`/api/appointments/${consultationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update consultation status');
      }

      console.log('✅ Consultation status updated:', consultationId, status);
    } catch (error) {
      console.error('Error updating consultation status:', error);
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService;
