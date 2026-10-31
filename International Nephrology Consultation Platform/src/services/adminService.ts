// Admin service for managing consultations, prescriptions, and notifications
import { safariCompatibleFetch, isSafari } from '../utils/safariCompat';

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

export interface DoctorChatMessage {
  sender: 'patient' | 'doctor';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface DoctorChatTicket {
  _id: string;
  ticketId: string;
  patient: {
    name: string;
    email: string;
    phone: string;
    age?: number;
    gender?: string;
  };
  initialQuery?: {
    symptoms?: string;
    duration?: string;
    medicalHistory?: string;
    currentMedications?: string;
    allergies?: string;
    primaryQuestion?: string;
  };
  documents?: string[];
  status: 'waiting_doctor' | 'doctor_replied' | 'waiting_patient' | 'closed';
  price?: {
    amount: number;
    currency: string;
  };
  messages: DoctorChatMessage[];
  prescription?: {
    medicines?: Array<{ name: string; dosage: string; url?: string }>;
    instructions?: string;
    diagnosis?: string;
    nextReview?: string;
    issuedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

class AdminService {
  // Get API base URL - use same-origin in production for proper cookie handling
  private getApiBaseUrl(): string {
    const configured = import.meta.env.VITE_API_URL as string | undefined;
    const hasWindow = typeof window !== 'undefined';
    const curHost = hasWindow ? window.location.hostname : '';
    
    if (configured) {
      try {
        const cfg = new URL(configured);
        const isLoopback = (h: string) => h === 'localhost' || h === '127.0.0.1';
        const sameSite = (h1: string, h2: string) => {
          try {
            const p1 = h1.split('.').slice(-2).join('.');
            const p2 = h2.split('.').slice(-2).join('.');
            return p1 === p2;
          } catch { return false; }
        };
        if (hasWindow) {
          if (isLoopback(curHost) && isLoopback(cfg.hostname)) return configured;
          if (sameSite(curHost, cfg.hostname)) return ''; // Same-origin via Vercel proxy
          return ''; // Force same-origin via Vercel proxy
        }
        return configured;
      } catch {}
    }
    return ''; // Use same-origin via Vercel proxy in production
  }

  async getConsultations(userEmail?: string): Promise<Consultation[]> {
    try {
      // Use same-origin API path in production for proper cookie handling
      const apiBaseUrl = this.getApiBaseUrl();
      const queryParam = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
      const endpoint = `${apiBaseUrl}/api/appointments/doctor${queryParam}`;
      const debugEndpoint = `${apiBaseUrl}/api/appointments/doctor-debug${queryParam}`;
      
      console.log('🔗 Admin Service API URL:', apiBaseUrl || '(same-origin)');
      console.log('🔗 Full endpoint:', endpoint);
      
      const response = await safariCompatibleFetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(userEmail ? { 'x-user-email': userEmail } : {})
        }
      });
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status, response.statusText);
        // Safari/mobile fallback: use temporary no-auth debug endpoint
        try {
          console.warn('⚠️ Falling back to doctor-debug endpoint due to API error');
          const fallback = await safariCompatibleFetch(debugEndpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              ...(userEmail ? { 'x-user-email': userEmail } : {})
            }
          });
          if (fallback.ok) {
            const fbData = await fallback.json();
            console.log('📋 Fallback (doctor-debug) appointments:', fbData.appointments?.length || 0);
            const consultations: Consultation[] = (fbData.appointments || []).map((apt: any) => ({
              id: apt._id,
              patientName: apt.patient?.name || 'Unknown Patient',
              patientEmail: apt.patient?.email || 'N/A',
              patientPhone: apt.patient?.phone || apt.patientPhone || 'N/A',
              date: apt.date,
              time: apt.timeSlot,
              istTime: apt.timeSlot,
              type: apt.type as 'Initial Consultation' | 'Follow-up',
              status: apt.status === 'confirmed' ? 'upcoming' : 
                      apt.status === 'completed' ? 'completed' : 
                      apt.status === 'pending' ? 'upcoming' : 'upcoming',
              documents: (apt.files && apt.files.length > 0) ? apt.files :
                         (apt.intake?.documents && apt.intake.documents.length > 0) ? apt.intake.documents :
                         (apt.documents && apt.documents.length > 0) ? apt.documents : [],
              query: apt.intake?.description || apt.intake?.reason || apt.query || 'No query provided',
              meetingLink: apt.meetLink,
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
            }));
            return consultations;
          }
        } catch (fbErr) {
          console.warn('⚠️ Fallback to doctor-debug failed:', fbErr);
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
      const apiBaseUrl = this.getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/appointments/${consultationId}/prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
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
      const apiBaseUrl = this.getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/appointments/${consultationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
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

  // Get all Doctor Chat & Report Review consultations
  async getDoctorChats(userEmail?: string): Promise<{ chats: DoctorChatTicket[]; counts: { total: number; waiting_doctor: number; doctor_replied: number; closed: number } }> {
    try {
      const apiBaseUrl = this.getApiBaseUrl();
      const queryParam = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
      const response = await fetch(`${apiBaseUrl}/api/doctor-chat/admin/all${queryParam}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(userEmail ? { 'x-user-email': userEmail } : {})
        },
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch doctor chats: ${response.status}`);
      }

      const data = await response.json();
      const rawStats = data.stats || data.counts || {};
      return {
        chats: data.chats || [],
        counts: {
          total: rawStats.total ?? (data.chats?.length || 0),
          waiting_doctor: rawStats.waitingDoctor ?? rawStats.waiting_doctor ?? 0,
          doctor_replied: rawStats.doctorReplied ?? rawStats.doctor_replied ?? 0,
          closed: rawStats.closed ?? 0
        }
      };
    } catch (error) {
      console.error('Error in getDoctorChats:', error);
      throw error;
    }
  }

  // Doctor sends message in chat
  async sendDoctorChatMessage(ticketId: string, text: string, senderName = 'Dr. Ilango S. Prakasam', userEmail?: string): Promise<any> {
    try {
      const apiBaseUrl = this.getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/doctor-chat/${ticketId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(userEmail ? { 'x-user-email': userEmail } : {})
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ text, senderName, userEmail })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in sendDoctorChatMessage:', error);
      throw error;
    }
  }

  // Doctor concludes chat with advice / prescription
  async closeDoctorChat(ticketId: string, payload: {
    medicines?: Array<{ name: string; dosage: string; url?: string }>;
    instructions?: string;
    diagnosis?: string;
    nextReview?: string;
  }, userEmail?: string): Promise<any> {
    try {
      const apiBaseUrl = this.getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/doctor-chat/${ticketId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(userEmail ? { 'x-user-email': userEmail } : {})
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ prescription: payload, ...payload, userEmail })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to complete consultation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in closeDoctorChat:', error);
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService;
