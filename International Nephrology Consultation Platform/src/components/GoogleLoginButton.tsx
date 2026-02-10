import React, { useState, useContext } from 'react';
import { Button } from './ui/button';
import { authService } from '../services/authService';
import { useAuth, AuthContext } from '../contexts/AuthContext';
import { toast } from 'sonner';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { auth, hasFirebaseCredentials } from '../config/firebase';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  disabled = false,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Don't render if Firebase credentials are missing
  if (!hasFirebaseCredentials) {
    return null;
  }

  const handleGoogleLogin = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await authService.signInWithGoogle();
      
      if (result) {
        console.log('Google login result:', result);
        console.log('Photo URL:', result.photoURL);
        
        // Check if this is an admin email
        const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com'];
        const isAdmin = adminEmails.includes(result.email || '');
        
        // Fix Google profile image CORS issues by modifying URL
        let avatarUrl = result.photoURL || '';
        console.log('Original Google photo URL:', avatarUrl);
        
        if (avatarUrl && avatarUrl.includes('googleusercontent.com')) {
          // Remove size restrictions and add better parameters for larger images
          avatarUrl = avatarUrl.replace(/=s\d+-c$/, '=s400-c');
          console.log('Modified Google photo URL:', avatarUrl);
        }
        
        // Validate that avatar URL is not empty
        if (!avatarUrl || avatarUrl.trim() === '') {
          console.warn('No avatar URL available from Google');
          avatarUrl = '';
        }
        
        // Detect user's country from timezone
        const getUserCountry = (): string => {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timezone.includes('Kolkata') || timezone.includes('Mumbai') || timezone.includes('Calcutta')) return 'IN';
          if (timezone.includes('New_York') || timezone.includes('Chicago') || timezone.includes('Los_Angeles')) return 'US';
          if (timezone.includes('London')) return 'GB';
          if (timezone.includes('Sydney') || timezone.includes('Melbourne')) return 'AU';
          if (timezone.includes('Toronto') || timezone.includes('Vancouver')) return 'CA';
          if (timezone.includes('Tokyo')) return 'JP';
          if (timezone.includes('Singapore')) return 'SG';
          if (timezone.includes('Dubai')) return 'AE';
          return 'default';
        };

        // Get the actual Firebase ID token from the Firebase user
        if (!auth) {
          throw new Error('Firebase auth not initialized');
        }

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          throw new Error('No Firebase user found');
        }

        const idToken = await firebaseUser.getIdToken();
        console.log('Got Firebase ID token, length:', idToken.length);

        // Prepare user data for Firebase login (not registration)
        const firebaseLoginData = {
          idToken: idToken,
          user: {
            uid: result.uid,
            email: result.email,
            displayName: result.displayName,
            photoURL: avatarUrl
          }
        };

        console.log('Firebase login data:', firebaseLoginData);

        // Call Firebase login API instead of register
        const apiBaseUrl = import.meta.env.VITE_API_URL || '';
        const endpoint = apiBaseUrl
          ? `${apiBaseUrl}/api/auth/firebase-login`
          : `/api/auth/firebase-login`;

        console.log('🔗 [GOOGLE LOGIN] API endpoint:', endpoint);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(firebaseLoginData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Firebase login failed');
        }

        const loginResult = await response.json();
        console.log('Firebase login result:', loginResult);

        if (loginResult.user) {
          // Set user data in auth context using updateUser from context
          updateUser({
            id: loginResult.user.id,
            name: loginResult.user.name,
            email: loginResult.user.email,
            role: loginResult.user.role,
            avatar: loginResult.user.photoURL || avatarUrl,
            country: getUserCountry()
          });

          toast.success('🎉 Successfully signed in with Google!');

          // Call success callback
          if (onSuccess) {
            onSuccess();
          }

          // Navigate based on user role
          setTimeout(() => {
            if (isAdmin) {
              console.log('Redirecting admin user to admin panel');
              navigate('/admin');
            } else {
              navigate('/profile');
            }
          }, 500);
        } else {
          throw new Error('Login failed - no user data received');
        }
        
        toast.success('🎉 Successfully signed in with Google!');
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
        
        // Navigate based on user role
        setTimeout(() => {
          if (isAdmin) {
            console.log('Redirecting admin user to admin panel');
            navigate('/admin');
          } else {
            navigate('/profile');
          }
        }, 500);
      }
      
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(`❌ ${error.message || 'Failed to sign in with Google'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center gap-3 ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};
