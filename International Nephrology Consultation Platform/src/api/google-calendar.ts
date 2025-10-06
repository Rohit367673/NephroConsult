// Google Calendar API integration (Mock implementation for development)
// Note: In production, install googleapis package: npm install googleapis @types/google.auth

export interface CalendarEvent {
  start: string;
  end: string;
  summary: string;
}

export class GoogleCalendarService {
  
  // Generate authentication URL (Mock)
  static getAuthUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3002/api/google-calendar/callback';
    const scope = 'https://www.googleapis.com/auth/calendar.readonly';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
  }

  // Exchange authorization code for tokens (Mock)
  static async getTokens(code: string) {
    // Mock implementation - in production, exchange code for actual tokens
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600
    };
  }

  // Get busy time slots for a specific date (Mock with realistic data)
  static async getBusySlots(date: string, tokens: any): Promise<string[]> {
    try {
      // Mock busy slots - in production, call Google Calendar API
      const mockBusySlots = [
        '10:00', '10:30', // Morning meeting
        '14:00', '14:30', '15:00', // Afternoon block
        '16:30' // Late afternoon appointment
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return different busy slots based on date for demo
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 1) { // Monday
        return ['09:00', '09:30', '11:00', '15:30'];
      } else if (dayOfWeek === 3) { // Wednesday
        return ['10:00', '10:30', '14:00', '14:30', '16:00'];
      } else if (dayOfWeek === 5) { // Friday
        return ['09:30', '13:00', '13:30', '17:00'];
      }
      
      return mockBusySlots;
    } catch (error) {
      console.error('Error fetching Google Calendar busy slots:', error);
      return [];
    }
  }

  // Get upcoming events for display (Mock)
  static async getUpcomingEvents(tokens: any, maxResults: number = 10): Promise<CalendarEvent[]> {
    try {
      // Mock events
      const mockEvents: CalendarEvent[] = [
        {
          start: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          end: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          summary: 'Team Meeting'
        },
        {
          start: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          end: new Date(Date.now() + 172800000 + 1800000).toISOString(),
          summary: 'Doctor Appointment'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockEvents.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  }

  // Create a new calendar event (Mock)
  static async createEvent(tokens: any, eventData: {
    summary: string;
    description: string;
    start: string;
    end: string;
    attendees?: string[];
  }) {
    try {
      // Mock event creation
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
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }
}

// Express.js route handlers
export const googleCalendarRoutes = {
  
  // GET /api/google-calendar/auth-url
  getAuthUrl: (req: any, res: any) => {
    try {
      const authUrl = GoogleCalendarService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate auth URL' });
    }
  },

  // GET /api/google-calendar/callback
  handleCallback: async (req: any, res: any) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
      }

      const tokens = await GoogleCalendarService.getTokens(code);
      
      // Store tokens in session or database
      req.session.googleTokens = tokens;
      
      // Close the popup window
      res.send(`
        <script>
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
          window.close();
        </script>
      `);
    } catch (error) {
      console.error('Google Calendar callback error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  },

  // GET /api/google-calendar/status
  getStatus: (req: any, res: any) => {
    const connected = !!req.session.googleTokens;
    res.json({ connected });
  },

  // POST /api/google-calendar/availability
  checkAvailability: async (req: any, res: any) => {
    try {
      const { date } = req.body;
      const tokens = req.session.googleTokens;

      if (!tokens) {
        return res.json({ busySlots: [] });
      }

      const busySlots = await GoogleCalendarService.getBusySlots(date, tokens);
      res.json({ busySlots });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: 'Failed to check availability' });
    }
  },

  // GET /api/google-calendar/events
  getEvents: async (req: any, res: any) => {
    try {
      const tokens = req.session.googleTokens;
      
      if (!tokens) {
        return res.status(401).json({ error: 'Google Calendar not connected' });
      }

      const events = await GoogleCalendarService.getUpcomingEvents(tokens);
      res.json({ events });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  },

  // POST /api/google-calendar/create-event
  createEvent: async (req: any, res: any) => {
    try {
      const tokens = req.session.googleTokens;
      
      if (!tokens) {
        return res.status(401).json({ error: 'Google Calendar not connected' });
      }

      const event = await GoogleCalendarService.createEvent(tokens, req.body);
      res.json({ event });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
};
