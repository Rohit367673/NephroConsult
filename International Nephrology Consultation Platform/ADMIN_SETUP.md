# Admin User Setup Guide

This document explains how admin users are configured and managed in the NephroConsult application.

## Current Admin Users

The following email addresses have admin access to the system:

1. **suyambu54321@gmail.com** - Primary admin
2. **rohit367673@gmail.com** - Secondary admin (added for testing)

## How Admin Access Works

### Google Login Authentication
Admin access is primarily granted through Google OAuth login. When a user signs in with Google, the system checks their email address against the configured admin emails.

### Configuration Location
Admin emails are centrally managed in:
```
src/config/adminConfig.ts
```

### Authentication Flow
1. User clicks "Sign in with Google"
2. Google OAuth authentication completes
3. System checks if the user's email is in the admin list
4. If admin email → User gets `admin` role
5. If not admin email → User gets `patient` role

## Admin Capabilities

Admin users have access to:
- **Admin Panel** (`/admin` route)
- **Patient Management** - View all patient records
- **Appointment Management** - View and manage all appointments
- **Document Access** - View uploaded patient documents
- **System Analytics** - Usage statistics and reports
- **User Management** - View user accounts and activity

## Adding New Admin Users

### Method 1: Update Configuration File
1. Open `src/config/adminConfig.ts`
2. Add the new email to the `ADMIN_EMAILS` array:
```typescript
export const ADMIN_EMAILS = [
  'suyambu54321@gmail.com',
  'rohit367673@gmail.com',
  'newemail@gmail.com'  // Add new admin email here
];
```
3. Save and redeploy the application

### Method 2: Use Helper Functions (Future Enhancement)
The configuration file includes helper functions for dynamic admin management:
```typescript
// Add admin email programmatically
addAdminEmail('newemail@gmail.com');

// Remove admin email
removeAdminEmail('oldemail@gmail.com');

// Check if email is admin
const isAdmin = isAdminEmail('test@gmail.com');
```

## Security Considerations

### ✅ Best Practices Implemented
- **Email-based Authentication** - Only specific Google accounts can access admin features
- **Role-based Access Control** - Admin routes are protected by role checking
- **Centralized Configuration** - All admin emails managed in one location
- **Type Safety** - TypeScript interfaces ensure proper role assignment

### 🔒 Security Notes
1. **Google Account Security** - Admin users should enable 2FA on their Google accounts
2. **Email Verification** - Only verified Google accounts can authenticate
3. **Session Management** - Admin sessions are managed securely with cookies
4. **Route Protection** - Admin routes require proper authentication and role

## Testing Admin Access

### For Existing Admins
1. Go to the application homepage
2. Click "Sign in with Google"
3. Sign in with admin email (`suyambu54321@gmail.com` or `rohit367673@gmail.com`)
4. Verify "Admin Panel" appears in navigation
5. Navigate to `/admin` to access admin features

### For New Admin Testing
1. Add test email to `ADMIN_EMAILS` array
2. Deploy/restart application
3. Sign in with the test Google account
4. Verify admin access is granted

## Troubleshooting

### Admin Panel Not Showing
- **Check Email** - Ensure the exact email address is in the admin list
- **Case Sensitivity** - Email comparison is case-sensitive
- **Google Account** - Must be signed in with the correct Google account
- **Browser Cache** - Clear browser cache and cookies
- **Console Logs** - Check browser console for authentication errors

### Access Denied to Admin Routes
- **Role Assignment** - Verify user role is set to 'admin' in browser dev tools
- **Route Protection** - Ensure `ProtectedRoute` component is working correctly
- **Session State** - Check if user session is properly maintained

## Development Notes

### File Locations
- **Admin Config**: `src/config/adminConfig.ts`
- **Google Login**: `src/components/GoogleLoginButton.tsx`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Admin Panel**: `src/pages/AdminPanel.tsx`
- **Route Protection**: `src/App.tsx` (ProtectedRoute component)

### Environment Variables
No environment variables are required for admin email configuration. All admin emails are hardcoded in the configuration file for security.

### Future Enhancements
1. **Database-driven Admin Management** - Store admin emails in database
2. **Role Hierarchy** - Super admin, admin, moderator roles
3. **Permission Granularity** - Specific permissions for different admin functions
4. **Admin Audit Logs** - Track admin actions and changes
5. **Admin Invitation System** - Send invites to new admin users

---

**Last Updated**: October 2025  
**Admin Emails**: suyambu54321@gmail.com, rohit367673@gmail.com
