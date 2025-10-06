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
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Send user data to backend (optional)
      try {
        await this.syncUserWithBackend(user);
      } catch (backendError) {
        console.warn('Backend sync failed, continuing with client-only auth:', backendError);
      }
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
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
      // Also sign out from backend
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
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
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/firebase-login`, {
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
        return 'Sign in was cancelled';
      case 'auth/popup-blocked':
        return 'Popup was blocked by browser. Please allow popups and try again';
      default:
        return 'An error occurred during authentication';
    }
  }
}

export const authService = new AuthService();
