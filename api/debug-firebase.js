export default async function handler(req, res) {
  // This endpoint checks if Firebase env vars are configured
  const firebaseConfig = {
    hasApiKey: !!process.env.VITE_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.VITE_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
    hasStorageBucket: !!process.env.VITE_FIREBASE_STORAGE_BUCKET,
    hasMessagingSenderId: !!process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    hasAppId: !!process.env.VITE_FIREBASE_APP_ID,
  };

  const allConfigured = Object.values(firebaseConfig).every(v => v);

  res.json({
    message: 'Firebase config check',
    configured: firebaseConfig,
    allConfigured,
    note: 'VITE_ env vars are build-time, not runtime. Check if they were set during build.',
    timestamp: new Date().toISOString()
  });
}
