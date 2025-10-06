// Meeting service for generating and managing video consultation URLs

export interface MeetingDetails {
  id: string;
  url: string;
  roomId: string;
  consultationId: string;
  patientEmail: string;
  doctorEmail?: string;
  createdAt: string;
  expiresAt?: string;
}

class MeetingService {
  private meetings: Map<string, MeetingDetails> = new Map();

  /**
   * Generate a consistent Google Meet URL for a consultation
   * This ensures both patient and doctor get the same meeting URL
   */
  generateMeetingURL(consultationId: string, patientEmail: string): string {
    // Check if meeting already exists for this consultation
    const existingMeeting = this.getMeetingByConsultationId(consultationId);
    if (existingMeeting) {
      console.log(`Using existing meeting URL for consultation ${consultationId}:`, existingMeeting.url);
      return existingMeeting.url;
    }

    // Generate a unique room ID based on consultation details
    const roomId = this.generateRoomId(consultationId, patientEmail);
    const meetingUrl = `https://meet.google.com/${roomId}`;
    
    // Store meeting details
    const meetingDetails: MeetingDetails = {
      id: this.generateMeetingId(),
      url: meetingUrl,
      roomId,
      consultationId,
      patientEmail,
      createdAt: new Date().toISOString(),
      expiresAt: this.getExpirationDate()
    };
    
    this.meetings.set(consultationId, meetingDetails);
    
    console.log(`Generated new meeting URL for consultation ${consultationId}:`, meetingUrl);
    return meetingUrl;
  }

  /**
   * Get meeting details by consultation ID
   */
  getMeetingByConsultationId(consultationId: string): MeetingDetails | null {
    return this.meetings.get(consultationId) || null;
  }

  /**
   * Get meeting URL by consultation ID (creates if doesn't exist)
   */
  getMeetingURL(consultationId: string, patientEmail: string): string {
    const existing = this.getMeetingByConsultationId(consultationId);
    if (existing) {
      return existing.url;
    }
    
    return this.generateMeetingURL(consultationId, patientEmail);
  }

  /**
   * Update meeting with doctor information
   */
  addDoctorToMeeting(consultationId: string, doctorEmail: string): void {
    const meeting = this.meetings.get(consultationId);
    if (meeting) {
      meeting.doctorEmail = doctorEmail;
      this.meetings.set(consultationId, meeting);
      console.log(`Added doctor ${doctorEmail} to meeting for consultation ${consultationId}`);
    }
  }

  /**
   * Generate a unique room ID based on consultation details
   * This ensures the same consultation always gets the same room ID
   */
  private generateRoomId(consultationId: string, patientEmail: string): string {
    // Create a hash-like string from consultation ID and patient email
    const combined = `${consultationId}-${patientEmail}`;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to a Google Meet-like room ID format
    const hashStr = Math.abs(hash).toString(36);
    const roomId = `${hashStr.slice(0, 3)}-${hashStr.slice(3, 7)}-${hashStr.slice(7, 10)}`;
    
    // Ensure minimum length and add random suffix if needed
    if (roomId.length < 11) {
      const suffix = Math.random().toString(36).substring(2, 5);
      return `${roomId}-${suffix}`;
    }
    
    return roomId;
  }

  /**
   * Generate a unique meeting ID
   */
  private generateMeetingId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get expiration date (24 hours from now)
   */
  private getExpirationDate(): string {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    return expiration.toISOString();
  }

  /**
   * Clean up expired meetings
   */
  cleanupExpiredMeetings(): void {
    const now = new Date();
    const expiredMeetings: string[] = [];
    
    this.meetings.forEach((meeting, consultationId) => {
      if (meeting.expiresAt && new Date(meeting.expiresAt) < now) {
        expiredMeetings.push(consultationId);
      }
    });
    
    expiredMeetings.forEach(consultationId => {
      this.meetings.delete(consultationId);
      console.log(`Cleaned up expired meeting for consultation ${consultationId}`);
    });
    
    if (expiredMeetings.length > 0) {
      console.log(`Cleaned up ${expiredMeetings.length} expired meetings`);
    }
  }

  /**
   * Get all active meetings
   */
  getAllMeetings(): MeetingDetails[] {
    this.cleanupExpiredMeetings();
    return Array.from(this.meetings.values());
  }

  /**
   * Delete a meeting
   */
  deleteMeeting(consultationId: string): boolean {
    const deleted = this.meetings.delete(consultationId);
    if (deleted) {
      console.log(`Deleted meeting for consultation ${consultationId}`);
    }
    return deleted;
  }

  /**
   * Initialize meetings from existing consultation data
   * This is useful when the system starts up and needs to rebuild meeting URLs
   */
  initializeMeetingsFromConsultations(consultations: any[]): void {
    consultations.forEach(consultation => {
      if (consultation.meetingLink && !this.meetings.has(consultation.id)) {
        // Extract room ID from existing meeting link
        const roomIdMatch = consultation.meetingLink.match(/meet\.google\.com\/(.+)$/);
        const roomId = roomIdMatch ? roomIdMatch[1] : this.generateRoomId(consultation.id, consultation.patientEmail);
        
        const meetingDetails: MeetingDetails = {
          id: this.generateMeetingId(),
          url: consultation.meetingLink,
          roomId,
          consultationId: consultation.id,
          patientEmail: consultation.patientEmail,
          createdAt: new Date().toISOString(),
          expiresAt: this.getExpirationDate()
        };
        
        this.meetings.set(consultation.id, meetingDetails);
      }
    });
    
    console.log(`Initialized ${this.meetings.size} meetings from existing consultations`);
  }
}

// Export singleton instance
export const meetingService = new MeetingService();
export default meetingService;
