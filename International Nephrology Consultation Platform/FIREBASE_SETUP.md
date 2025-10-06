# Firebase Google Authentication Setup Guide

## Overview
This guide will help you set up Firebase authentication with Google login for your NephroConsult platform.

## Prerequisites
- Google account
- Firebase project
- Google Cloud Console access

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enter project name: `nephroconsult-platform`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable**
4. Set **Project support email** (your email)
5. Click **Save**

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web app** icon (`</>`)
4. Register app name: `NephroConsult Web`
5. Copy the Firebase config object

## Step 4: Configure Frontend Environment

1. Create/update `.env` file in your frontend directory:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Step 5: Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Find the **Web client** (auto-created by Firebase)
5. Click **Edit** (pencil icon)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Click **Save**

## Step 6: Configure Backend Firebase Admin

1. In Firebase Console, go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Extract these values for your backend `.env`:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important**: Replace `\n` with actual newlines in the private key, or keep as `\n` and let the code handle it.

## Step 7: Test the Setup

1. Start your backend server:
```bash
cd server
npm run dev
```

2. Start your frontend:
```bash
cd "International Nephrology Consultation Platform"
npm run dev
```

3. Open `http://localhost:3000`
4. Click **Login** → **Continue with Google**
5. Complete Google OAuth flow

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch"**
   - Check authorized redirect URIs in Google Cloud Console
   - Make sure `http://localhost:3000` is added for development

2. **"Firebase not configured"**
   - Verify all environment variables are set
   - Check Firebase project ID matches

3. **"Token verification failed"**
   - Ensure Firebase Admin SDK is properly configured
   - Check private key format (newlines)

4. **"Popup blocked"**
   - Allow popups in browser
   - Try different browser

### Environment Variables Checklist:

**Frontend (.env):**
- ✅ VITE_FIREBASE_API_KEY
- ✅ VITE_FIREBASE_AUTH_DOMAIN  
- ✅ VITE_FIREBASE_PROJECT_ID
- ✅ VITE_FIREBASE_STORAGE_BUCKET
- ✅ VITE_FIREBASE_MESSAGING_SENDER_ID
- ✅ VITE_FIREBASE_APP_ID

**Backend (.env):**
- ✅ FIREBASE_PROJECT_ID
- ✅ FIREBASE_PRIVATE_KEY
- ✅ FIREBASE_CLIENT_EMAIL

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Use different projects** for development/production
3. **Restrict API keys** to specific domains in production
4. **Enable App Check** for production (optional)
5. **Set up Firebase Security Rules** for database access

## Features Enabled

✅ **Google OAuth Login/Signup**
✅ **Email/Password Authentication** (existing)
✅ **Automatic user creation** in MongoDB
✅ **Session management** with Express
✅ **Role-based access** (patient/doctor/admin)
✅ **Profile photo** from Google account
✅ **Email verification** (automatic with Google)

## Next Steps

1. Set up production Firebase project
2. Configure production domain in Google Cloud Console
3. Set up Firebase hosting (optional)
4. Add additional OAuth providers (Facebook, Apple, etc.)
5. Implement password reset functionality
6. Add two-factor authentication

Your Google authentication is now ready to use! 🎉
