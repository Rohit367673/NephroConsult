// Mock API functions for Google Calendar integration
// This simulates the backend API calls for development

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface MockSession {
  googleTokens?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

// Simulate session storage
let mockSession: MockSession = {};

export const mockCalendarAPI = {
  // Mock Google Calendar auth URL
  getAuthUrl: async (): Promise<{ authUrl: string }> => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&redirect_uri=${encodeURIComponent('http://localhost:3002/api/google-calendar/callback')}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}&access_type=offline&prompt=consent`;
    
    return { authUrl };
  },

  // Mock auth callback
  handleCallback: async (code: string): Promise<void> => {
    // Simulate token exchange
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mockSession.googleTokens = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600
    };
  },

  // Check connection status
  getStatus: (): { connected: boolean } => {
    return { connected: !!mockSession.googleTokens };
  },

  // Check availability with Google Calendar conflicts
  checkAvailability: async (date: string): Promise<{ busySlots: string[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!mockSession.googleTokens) {
      return { busySlots: [] };
    }

    // Mock busy slots based on day of week for realistic demo
    const dayOfWeek = new Date(date).getDay();
    let busySlots: string[] = [];

    switch (dayOfWeek) {
      case 1: // Monday - busy morning
        busySlots = ['09:00', '09:30', '11:00', '11:30'];
        break;
      case 2: // Tuesday - afternoon meetings
        busySlots = ['14:00', '14:30', '15:00', '15:30'];
        break;
      case 3: // Wednesday - scattered meetings
        busySlots = ['10:00', '10:30', '13:00', '16:00', '16:30'];
        break;
      case 4: // Thursday - morning block
        busySlots = ['09:00', '09:30', '10:00', '10:30'];
        break;
      case 5: // Friday - light schedule
        busySlots = ['13:30', '17:00'];
        break;
      default: // Weekend - mostly free
        busySlots = [];
    }

    return { busySlots };
  },

  // Get existing bookings from our system
  getExistingBookings: async (date: string): Promise<{ slots: TimeSlot[] }> => {
    // Simulate existing bookings
    await new Promise(resolve => setTimeout(resolve, 200));

    // Generate all time slots
    const allSlots: string[] = [];
    for (let hour = 9; hour < 18; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // Mock some existing bookings
    const bookedSlots = ['12:00', '12:30', '17:30']; // Lunch and end of day typically booked

    const slots: TimeSlot[] = allSlots.map(time => ({
      time,
      available: !bookedSlots.includes(time)
    }));

    return { slots };
  },

  // Connect to Google Calendar (mock)
  connectGoogleCalendar: async (): Promise<void> => {
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    mockSession.googleTokens = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600
    };
  },

  // Disconnect Google Calendar
  disconnectGoogleCalendar: (): void => {
    delete mockSession.googleTokens;
  },

  // Create calendar event after booking
  createCalendarEvent: async (eventData: {
    summary: string;
    description: string;
    start: string;
    end: string;
    attendees?: string[];
  }) => {
    if (!mockSession.googleTokens) {
      throw new Error('Google Calendar not connected');
    }

    // Simulate event creation
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      id: `mock-event-${Date.now()}`,
      summary: eventData.summary,
      description: eventData.description,
      start: { dateTime: eventData.start },
      end: { dateTime: eventData.end },
      htmlLink: 'https://calendar.google.com/calendar/event?eid=mock',
      hangoutLink: 'https://meet.google.com/mock-meeting-id'
    };
  }
};

// Helper function to simulate network requests
export const mockFetch = (url: string, options?: RequestInit): Promise<Response> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let mockResponse: any = {};
      
      if (url.includes('/api/google-calendar/auth-url')) {
        mockResponse = mockCalendarAPI.getAuthUrl();
      } else if (url.includes('/api/google-calendar/status')) {
        mockResponse = mockCalendarAPI.getStatus();
      } else if (url.includes('/api/google-calendar/availability')) {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        mockResponse = mockCalendarAPI.checkAvailability(body.date);
      } else if (url.includes('/api/availability')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const date = urlParams.get('date') || '';
        mockResponse = mockCalendarAPI.getExistingBookings(date);
      }

      resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        status: 200,
        statusText: 'OK'
      } as Response);
    }, 100 + Math.random() * 400); // Random delay 100-500ms
  });
};
