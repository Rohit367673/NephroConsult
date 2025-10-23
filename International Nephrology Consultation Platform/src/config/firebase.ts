import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

// Check if Firebase credentials are available
const hasFirebaseCredentials = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dummy-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:dummy'
};

// Initialize Firebase only if credentials are available
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (hasFirebaseCredentials) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Configure Google provider with better COOP handling
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      // Help with COOP issues by not requiring immediate popup
      auth_type: 'rerequest'
    });

    console.log('✅ Firebase initialized successfully');
    console.log('Firebase config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
  } catch (error) {
    console.warn('❌ Firebase initialization failed:', error);
    console.warn('This might be due to missing or invalid Firebase credentials');
  }
} else {
  console.warn('⚠️ Firebase credentials not found. Google authentication will be disabled.');
  console.warn('Please check your .env file and ensure VITE_FIREBASE_* variables are set');
}

export { auth, googleProvider, hasFirebaseCredentials };
export default app;
