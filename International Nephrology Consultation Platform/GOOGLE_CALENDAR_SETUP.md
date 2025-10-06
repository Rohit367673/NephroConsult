# Google Calendar Integration Setup

This guide explains how to set up Google Calendar integration for smart booking conflict detection.

## Current Status

The application currently uses **mock Google Calendar integration** for development. All calendar conflict detection is simulated with realistic data.

## Features Implemented

✅ **Smart Calendar UI**
- Large, interactive calendar view
- Real-time availability checking
- Visual conflict indicators
- Google Calendar connection status

✅ **Mock Integration**
- Simulated Google Calendar conflicts
- Realistic busy slot patterns
- Connection status simulation
- Development-ready API

## To Enable Real Google Calendar Integration

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3002/api/google-calendar/callback` (development)
   - `https://yourdomain.com/api/google-calendar/callback` (production)

### 2. Environment Variables

Create a `.env` file with:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3002/api/google-calendar/callback
```

### 3. Install Google APIs

```bash
npm install googleapis @types/google.auth
```

### 4. Replace Mock Implementation

Replace the mock implementation in `src/api/google-calendar.ts` with the real Google APIs implementation (commented code is provided).

### 5. Backend Setup

You'll need to set up Express.js routes to handle:
- `/api/google-calendar/auth-url` - Generate OAuth URL
- `/api/google-calendar/callback` - Handle OAuth callback
- `/api/google-calendar/status` - Check connection status
- `/api/google-calendar/availability` - Check calendar conflicts

## How It Works

### Smart Booking Process

1. **User selects date** → Calendar shows available slots
2. **System checks conflicts** → Queries both:
   - Existing bookings in your database
   - Google Calendar events (if connected)
3. **Visual feedback** → Shows:
   - ✅ Available slots (green)
   - ❌ Already booked (gray)
   - ⚠️ Calendar conflicts (red)

### Conflict Detection

The system prevents double bookings by:
- Checking your appointment database
- Querying Google Calendar for busy times
- Marking conflicting slots as unavailable
- Providing clear reasons for unavailability

### User Experience

- **Large calendar view** for easy date selection
- **Real-time availability** updates
- **Google Calendar integration** with one-click connect
- **Visual conflict indicators** with explanations
- **Smart suggestions** for alternative times

## Mock Data Patterns

For development, the mock API provides realistic patterns:

- **Monday**: Busy morning (9:00-11:30)
- **Tuesday**: Afternoon meetings (14:00-15:30)
- **Wednesday**: Scattered meetings throughout day
- **Thursday**: Morning block (9:00-10:30)
- **Friday**: Light schedule (13:30, 17:00)
- **Weekends**: Mostly free

## Security Considerations

- OAuth tokens are stored securely in session
- Calendar data is only accessed when needed
- Minimal permissions requested (read-only calendar)
- Secure redirect URIs configured

## Production Deployment

1. Set up proper OAuth credentials
2. Configure secure session storage
3. Add HTTPS redirect URIs
4. Implement token refresh logic
5. Add error handling and logging

## Testing

The current mock implementation allows you to:
- Test the calendar UI without Google setup
- See realistic conflict patterns
- Verify booking flow integration
- Develop frontend features independently

## Support

For Google Calendar API documentation:
- [Google Calendar API Reference](https://developers.google.com/calendar/api/v3/reference)
- [OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Node.js Quickstart](https://developers.google.com/calendar/api/quickstart/nodejs)
