# AI Healthcare Assistant Integration Guide

## Overview

This guide explains how to integrate the multi-tenant AI Healthcare Assistant SaaS platform into the NephroConsult website. The integration provides two options:

1. **OPTION 1**: Floating AI Doctor Assistant bubble (site-wide)
2. **OPTION 2**: Inline booking chat portal (on booking page)

**Clinic ID:** `nephroconsult`

---

## Prerequisites

Before proceeding with the integration, ensure you have:

- ✅ Backend URL for your AI Assistant platform (Render deployment)
- ✅ Frontend URL for your AI Assistant platform (Vercel deployment)
- ✅ Clinic ID: `nephroconsult`
- ✅ Access to NephroConsult codebase

---

## OPTION 1: Floating AI Doctor Assistant (Site-Wide)

### Description

A floating medical assistant chat bubble appears in the bottom-right corner of all pages on the website. Users can click it to open the AI assistant for quick queries and support.

### Implementation

**File Modified:** `International Nephrology Consultation Platform/index.html`

**Location:** Before the closing `</body>` tag (line 206)

**Code Added:**
```html
<!-- AI Healthcare Assistant Widget (Floating Chat Bubble) -->
<!-- Replace [INSERT_YOUR_RENDER_BACKEND_URL_HERE] with your actual backend URL -->
<script
  src="[INSERT_YOUR_RENDER_BACKEND_URL_HERE]/widget.js"
  data-clinic-id="nephroconsult"
  defer>
</script>
```

### Configuration Steps

1. **Replace the placeholder URL:**
   - Find `[INSERT_YOUR_RENDER_BACKEND_URL_HERE]` in the script tag
   - Replace with your actual Render backend URL
   - Example: `https://ai-assistant-backend.onrender.com`

2. **Final code should look like:**
   ```html
   <script
     src="https://ai-assistant-backend.onrender.com/widget.js"
     data-clinic-id="nephroconsult"
     defer>
   </script>
   ```

### Features

- ✅ Site-wide availability on all pages
- ✅ Floating chat bubble in bottom-right corner
- ✅ Automatic clinic ID configuration
- ✅ Deferred loading for performance
- ✅ No hydration errors (loaded after React)

### Testing

1. Deploy the frontend changes
2. Navigate to any page on the website
3. Look for the floating chat bubble in the bottom-right corner
4. Click the bubble to open the AI assistant
5. Test basic chat functionality

---

## OPTION 2: Inline Booking Chat Portal (Booking Page)

### Description

An interactive AI Doctor scheduler embedded directly into the booking page layout. Users can use voice or text to schedule appointments through the AI assistant.

### Implementation

**File Modified:** `International Nephrology Consultation Platform/src/pages/BookingPage.tsx`

**Location:** After the `<Navigation />` component, before the progress steps (line 1918)

**Code Added:**
```tsx
{/* AI Healthcare Assistant - Inline Booking Chat Portal */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="mb-8"
>
  <Card className="overflow-hidden border-2 border-[#006f6f]/20 shadow-xl">
    <CardHeader className="bg-gradient-to-r from-[#006f6f] to-[#059669] text-white">
      <CardTitle className="flex items-center space-x-2">
        <Video className="w-6 h-6" />
        <span>AI-Powered Booking Assistant</span>
      </CardTitle>
      <CardDescription className="text-gray-100">
        Book your appointment instantly with our AI Doctor Assistant. Use voice or text to schedule your consultation.
      </CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      {/* Replace [INSERT_YOUR_VERCEL_FRONTEND_URL_HERE] with your actual frontend URL */}
      <iframe
        src="[INSERT_YOUR_VERCEL_FRONTEND_URL_HERE]/assistant-embed?clinicId=nephroconsult"
        width="100%"
        height="650px"
        style={{
          border: 'none',
          borderRadius: '0',
          background: '#0b0f19',
          boxShadow: 'none'
        }}
        allow="microphone; speech-synthesis"
        title="AI Healthcare Assistant"
      />
    </CardContent>
  </Card>
</motion.div>
```

### Configuration Steps

1. **Replace the placeholder URL:**
   - Find `[INSERT_YOUR_VERCEL_FRONTEND_URL_HERE]` in the iframe src
   - Replace with your actual Vercel frontend URL
   - Example: `https://ai-assistant-frontend.vercel.app`
   - **Important:** Use the `/assistant-embed` path, not `/assistant`

2. **For local testing:**
   ```tsx
   <iframe
     src="http://localhost:5173/assistant-embed?clinicId=nephroconsult"
     // ... rest of props
   />
   ```

3. **For production:**
   ```tsx
   <iframe
     src="https://ai-assistant-frontend-lilac.vercel.app/assistant-embed?clinicId=nephroconsult"
     width="100%"
     height="650px"
     style={{
       border: 'none',
       borderRadius: '20px',
       background: '#0b0f19',
       boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
     }}
     allow="microphone; speech-synthesis"
     title="AI Healthcare Assistant"
   />
   ```

**Current Deployment:** The iframe is now configured with the production URL `https://ai-assistant-frontend-lilac.vercel.app/assistant-embed?clinicId=nephroconsult`

### Features

- ✅ Embedded directly on booking page
- ✅ Voice conversation support (microphone permission)
- ✅ Text-based chat interface
- ✅ Seamless integration with existing booking flow
- ✅ Animated entrance with motion effects
- ✅ Styled to match NephroConsult branding
- ✅ Responsive design (100% width)

### Testing

1. Deploy the frontend changes
2. Navigate to the booking page (`/book`)
3. Look for the "AI-Powered Booking Assistant" card at the top
4. Test voice functionality (allow microphone permission)
5. Test text-based chat
6. Verify appointment scheduling through AI

---

## Environment Variables

### Required Variables

Add these to your frontend `.env` file if you want to make the URLs configurable:

```bash
# AI Healthcare Assistant URLs
VITE_AI_ASSISTANT_BACKEND_URL=https://ai-assistant-backend.onrender.com
VITE_AI_ASSISTANT_FRONTEND_URL=https://ai-assistant-frontend.vercel.app
```

### Using Environment Variables

**For index.html (OPTION 1):**

Since `index.html` is static, you'll need to use a build script to replace placeholders:

```javascript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // ... existing config
  define: {
    'import.meta.env.VITE_AI_ASSISTANT_BACKEND_URL': JSON.stringify(process.env.VITE_AI_ASSISTANT_BACKEND_URL)
  }
});
```

**For BookingPage.tsx (OPTION 2):**

Update the iframe src to use environment variables:

```tsx
<iframe
  src={`${import.meta.env.VITE_AI_ASSISTANT_FRONTEND_URL}/assistant-embed?clinicId=nephroconsult`}
  // ... rest of props
/>
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Replace `[INSERT_YOUR_RENDER_BACKEND_URL_HERE]` in `index.html`
- [ ] Replace `[INSERT_YOUR_VERCEL_FRONTEND_URL_HERE]` in `BookingPage.tsx`
- [ ] Test both integrations locally
- [ ] Verify microphone permissions work for OPTION 2
- [ ] Check for console errors
- [ ] Test on mobile devices

### Deployment Steps

1. **Commit the changes:**
   ```bash
   git add index.html src/pages/BookingPage.tsx
   git commit -m "feat: Integrate AI Healthcare Assistant"
   ```

2. **Push to repository:**
   ```bash
   git push origin main
   ```

3. **Deploy to Vercel:**
   - Vercel will auto-deploy on push
   - Monitor deployment logs for errors

4. **Verify production:**
   - Check floating chat bubble on live site
   - Check inline assistant on booking page
   - Test functionality with real users

---

## Troubleshooting

### Common Issues

#### 1. Floating Chat Bubble Not Appearing

**Symptoms:** No chat bubble visible on any page

**Possible Causes:**
- Backend URL is incorrect or unreachable
- Script loading blocked by CORS
- Script syntax error

**Solutions:**
- Check browser console for errors
- Verify backend URL is correct
- Test backend URL directly in browser
- Check network tab for failed requests

#### 2. Inline Iframe Not Loading

**Symptoms:** Blank space or error in iframe

**Possible Causes:**
- Frontend URL is incorrect
- Iframe blocked by X-Frame-Options
- Network connectivity issues

**Solutions:**
- Verify frontend URL is correct
- Check console for iframe errors
- Test frontend URL directly in browser
- Ensure frontend allows embedding (CORS headers)

#### 3. Microphone Permission Denied

**Symptoms:** Voice feature not working

**Possible Causes:**
- Browser blocking microphone
- HTTPS not enabled (required for microphone)
- User denied permission

**Solutions:**
- Ensure site is served over HTTPS
- Check browser permission settings
- Test in different browser
- Verify `allow="microphone"` attribute is present

#### 4. Hydration Errors (React)

**Symptoms:** React hydration mismatch errors

**Possible Causes:**
- Script loaded before React hydration
- DOM manipulation by external script

**Solutions:**
- Ensure `defer` attribute is on script tag
- Script is placed after `</body>` tag
- Script doesn't manipulate React root

---

## Security Considerations

### Content Security Policy (CSP)

If you have CSP headers configured, add these directives:

```http
Content-Security-Policy:
  script-src 'self' https://ai-assistant-backend.onrender.com;
  frame-src 'self' https://ai-assistant-frontend.vercel.app;
  connect-src 'self' https://ai-assistant-backend.onrender.com;
```

### HTTPS Requirement

Both integrations require HTTPS for:
- Microphone access (OPTION 2)
- Secure script loading (OPTION 1)
- Mixed content prevention

### Data Privacy

- Clinic ID is publicly visible
- No sensitive data hardcoded
- All communication encrypted via HTTPS
- User data handled by AI Assistant platform

---

## Customization

### Styling the Floating Bubble

The floating bubble styling is controlled by the widget script. To customize:

1. Contact AI Assistant platform provider
2. Request custom styling options
3. Or use CSS overrides (if supported)

### Styling the Inline Portal

The inline portal iframe can be styled via the `style` prop:

```tsx
<iframe
  // ... existing props
  style={{
    border: 'none',
    borderRadius: '20px', // Change border radius
    background: '#0b0f19',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)' // Add shadow
  }}
/>
```

### Positioning the Inline Portal

To move the inline portal to a different location:

1. Find the component in `BookingPage.tsx`
2. Cut the entire `motion.div` block
3. Paste at desired location
4. Adjust `className` margins as needed

---

## Performance Optimization

### Lazy Loading the Widget

The widget script already uses `defer` for performance. For additional optimization:

```html
<script
  src="https://ai-assistant-backend.onrender.com/widget.js"
  data-clinic-id="nephroconsult"
  defer
  async
  crossorigin="anonymous"
>
</script>
```

### Lazy Loading the Iframe

To lazy load the iframe until user interaction:

```tsx
const [loadIframe, setLoadIframe] = useState(false);

// In JSX:
{loadIframe ? (
  <iframe
    src="https://ai-assistant-frontend.vercel.app/assistant-embed?clinicId=nephroconsult"
    // ... props
  />
) : (
  <Button onClick={() => setLoadIframe(true)}>
    Load AI Assistant
  </Button>
)}
```

---

## Monitoring & Analytics

### Tracking Usage

To track AI Assistant usage:

1. **Google Analytics:**
   - Add event tracking to button clicks
   - Track iframe interactions

2. **Custom Analytics:**
   - Implement callback from AI Assistant
   - Log user interactions to backend

### Error Tracking

Monitor for errors using:

- Sentry (already integrated)
- Custom error logging
- Browser console monitoring

---

## Support & Contact

### For Integration Issues

- **Documentation:** This guide
- **AI Assistant Platform:** Contact your platform provider
- **NephroConsult Dev:** dev@nephroconsultation.com

### For AI Assistant Issues

- **Platform Documentation:** [Platform Docs URL]
- **Support Email:** support@ai-assistant-platform.com
- **Status Page:** [Status Page URL]

---

## Future Enhancements

### Planned Improvements

1. **Conditional Loading:** Load widget only on specific pages
2. **User Preferences:** Allow users to disable AI Assistant
3. **Custom Branding:** Match AI Assistant to NephroConsult theme
4. **Analytics Dashboard:** Track AI Assistant usage metrics
5. **Multi-language:** Support multiple languages in AI Assistant

### Integration Roadmap

- [ ] Add AI Assistant to admin panel
- [ ] Integrate with patient dashboard
- [ ] Add AI Assistant to mobile app
- [ ] Implement AI-powered triage
- [ ] Add voice-to-text for medical history

---

## Version History

### v1.0.0 (Current)
- Initial integration
- OPTION 1: Floating chat bubble
- OPTION 2: Inline booking portal
- Voice support for inline portal
- Complete documentation

---

## Quick Reference

### Key Files Modified

1. `index.html` - Floating widget script
2. `src/pages/BookingPage.tsx` - Inline iframe

### Key URLs to Replace

1. `[INSERT_YOUR_RENDER_BACKEND_URL_HERE]` → Your backend URL
2. `[INSERT_YOUR_VERCEL_FRONTEND_URL_HERE]` → Your frontend URL

### Clinic ID

- **Value:** `nephroconsult`
- **Used in:** Both integrations
- **Purpose:** Multi-tenant identification

---

*Last Updated: July 13, 2026*
*Document Version: 1.0.0*
