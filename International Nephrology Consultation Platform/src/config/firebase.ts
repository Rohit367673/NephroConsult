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
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase credentials not found. Google authentication will be disabled.');
}

export { auth, googleProvider, hasFirebaseCredentials };
export default app;
