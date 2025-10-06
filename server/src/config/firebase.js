import admin from 'firebase-admin';
import { env } from '../config.js';

let firebaseApp = null;

// Initialize Firebase Admin SDK
if (env.FIREBASE_PROJECT_ID && env.FIREBASE_PRIVATE_KEY && env.FIREBASE_CLIENT_EMAIL) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: env.FIREBASE_PROJECT_ID,
      private_key: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: env.FIREBASE_CLIENT_EMAIL,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: env.FIREBASE_PROJECT_ID
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else {
  console.warn('Firebase Admin not initialized - missing environment variables');
}

export { firebaseApp };
export const auth = firebaseApp ? admin.auth() : null;
