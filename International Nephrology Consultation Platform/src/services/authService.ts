import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { UserCredential, User } from 'firebase/auth';
import { auth, googleProvider, hasFirebaseCredentials } from '../config/firebase';
import { getApiBaseUrl } from './apiService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class AuthService {
  // Google Sign In
  async signInWithGoogle(): Promise<AuthUser> {
    if (!hasFirebaseCredentials || !auth || !googleProvider) {
      throw new Error('Google authentication is not available. Firebase credentials are missing.');
    }

    try {
      console.log('🔐 Attempting Google sign in with popup...');
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log('✅ Google popup sign in successful:', user.email);

      // Send user data to backend (optional)
      try {
        await this.syncUserWithBackend(user);
        console.log('✅ Backend sync successful');
      } catch (backendError) {
        console.warn('⚠️ Backend sync failed, continuing with client-only auth:', backendError);
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('❌ Google popup sign in error:', error);

      // Handle specific COOP and popup errors
      if (error.code === 'auth/popup-blocked' ||
          error.code === 'auth/popup-closed-by-user' ||
          error.message?.includes('Cross-Origin-Opener-Policy') ||
          error.message?.includes('window.closed') ||
          error.message?.includes('disconnected port')) {

        console.log('🔄 Popup failed or blocked, trying redirect method...');

        // Wait a bit before trying redirect to avoid rapid successive calls
        await new Promise(resolve => setTimeout(resolve, 1000));

        return this.signInWithGoogleRedirect();
      }

      // Handle other errors
      const errorMessage = this.getErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  // Google Sign In with Redirect (fallback method)
  async signInWithGoogleRedirect(): Promise<AuthUser> {
    if (!hasFirebaseCredentials || !auth || !googleProvider) {
      throw new Error('Google authentication is not available. Firebase credentials are missing.');
    }

    try {
      console.log('🔄 Starting Google redirect sign in...');

      // Check if there's a redirect result first
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('✅ Found redirect result:', result.user.email);
        const user = result.user;

        // Send user data to backend (optional)
        try {
          await this.syncUserWithBackend(user);
          console.log('✅ Backend sync successful');
        } catch (backendError) {
          console.warn('⚠️ Backend sync failed, continuing with client-only auth:', backendError);
        }

        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
      } else {
        console.log('🚀 Initiating Google redirect flow...');
        // Start redirect flow
        await signInWithRedirect(auth, googleProvider);
        throw new Error('redirect_in_progress');
      }
    } catch (error: any) {
      console.error('❌ Google redirect sign in error:', error);

      if (error.message === 'redirect_in_progress') {
        throw error;
      }

      const errorMessage = this.getErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }
    
    try {
      const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser> {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }
    
    try {
      const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update profile if displayName provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Send user data to backend
      await this.syncUserWithBackend(user);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('Email sign up error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      if (auth) {
        await signOut(auth);
      }
      // Also sign out from backend (same-origin in prod)
      const API_BASE = getApiBaseUrl();
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Sync user with backend
  private async syncUserWithBackend(user: User): Promise<void> {
    try {
      const idToken = await user.getIdToken();
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/auth/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          idToken,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync with backend');
      }
    } catch (error) {
      console.error('Backend sync error:', error);
      // Don't throw here - allow frontend auth to proceed
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth?.currentUser || null;
  }

  // Get error message
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/popup-closed-by-user':
        return 'Sign in was cancelled. Please try again';
      case 'auth/popup-blocked':
        return 'Popup was blocked by browser. Please allow popups for this site and try again';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method';
      case 'auth/invalid-credential':
        return 'Invalid credentials provided';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-token-expired':
        return 'Your session has expired. Please sign in again';
      case 'auth/web-storage-unsupported':
        return 'Web storage is not supported in this browser';
      default:
        return 'An error occurred during authentication. Please try again';
    }
  }
}

export const authService = new AuthService();
