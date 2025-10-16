import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import apiService from '../services/apiService';
import { auth } from '../config/firebase';
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { authService } from '../services/authService';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  country?: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  reloadSession: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  reloadSession: () => {},
  updateUser: () => {},
});

// Cookie utility functions
const LOGOUT_FLAG_KEY = 'nephro_explicit_logout';

const setLogoutFlag = () => {
  try {
    localStorage.setItem(LOGOUT_FLAG_KEY, Date.now().toString());
  } catch {}
};

const clearLogoutFlag = () => {
  try {
    localStorage.removeItem(LOGOUT_FLAG_KEY);
  } catch {}
};

const hasLogoutFlag = () => {
  try {
    return localStorage.getItem(LOGOUT_FLAG_KEY) !== null;
  } catch {
    return false;
  }
};

const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Add SameSite and Secure attributes for better cookie handling
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  console.log(`Cookie set: ${name} (expires in ${days} days)`);
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Utility function to detect user's country
const getUserCountry = (): string => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.includes('Kolkata') || timezone.includes('Mumbai')) return 'IN';
  if (timezone.includes('New_York') || timezone.includes('Chicago')) return 'US';
  if (timezone.includes('London')) return 'GB';
  if (timezone.includes('Sydney')) return 'AU';
  if (timezone.includes('Toronto')) return 'CA';
  return 'default';
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from cookie immediately, then sync with backend
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for Firebase redirect result first
        if (auth) {
          try {
            const redirectResult = await getRedirectResult(auth);
            if (redirectResult && redirectResult.user) {
              clearLogoutFlag();
              console.log('Firebase redirect result found:', redirectResult.user);
              const firebaseUser = {
                id: redirectResult.user.uid,
                name: redirectResult.user.displayName || redirectResult.user.email?.split('@')[0] || 'User',
                email: redirectResult.user.email || '',
                role: 'patient' as const,
                avatar: redirectResult.user.photoURL || '',
                country: getUserCountry()
              };
              setUser(firebaseUser);
              setCookie('nephro_user', encodeURIComponent(JSON.stringify(firebaseUser)), 7);
              console.log('Firebase user set from redirect:', firebaseUser);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error handling redirect result:', error);
          }
        }

        if (hasLogoutFlag()) {
          deleteCookie('nephro_user');
          console.log('AuthContext: explicit logout flag detected, skipping auto login');
          setLoading(false);
          return;
        }

        // First, try to load from cookie immediately for faster UX
        const savedUser = getCookie('nephro_user');
        console.log('AuthContext: Checking for saved user cookie:', !!savedUser);
        
        if (savedUser) {
          try {
            const userData = JSON.parse(decodeURIComponent(savedUser));
            console.log('AuthContext: Parsed user data:', userData);
            
            // Validate that we have essential user data
            if (userData && userData.email && userData.name) {
              setUser(userData);
              console.log('Loaded user from cookie (immediate):', userData);
              
              // For admin users, skip backend verification to prevent logout issues
              const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com'];
              if (adminEmails.includes(userData.email)) {
                console.log('🔐 Admin user detected - skipping backend verification to prevent logout');
                setLoading(false);
                return;
              }
              
              // Verify session with backend
              try {
                const response = await apiService.makeRequest<{user: User}>('/auth/me', {});
                if (response.success && response.data?.user) {
                  console.log('Session verified with backend:', response.data.user);
                  const backendUser = response.data.user;
                  if (
                    backendUser?.email &&
                    userData?.email &&
                    backendUser.email !== userData.email
                  ) {
                    console.warn('Session email mismatch. Keeping cookie user and ignoring backend session user.');
                  } else if (JSON.stringify(userData) !== JSON.stringify(backendUser)) {
                    setUser(backendUser);
                    setCookie('nephro_user', encodeURIComponent(JSON.stringify(backendUser)), 7);
                  }
                } else {
                  console.log('Session verification failed. Response:', response);
                  // For admin/doctor users, be more lenient to prevent false logouts
                  if (userData.role === 'admin' || userData.role === 'doctor') {
                    console.log('Admin/Doctor user - keeping session despite backend verification failure');
                    // Don't clear admin sessions - they should persist through network issues
                  } else {
                    console.log('Regular user - clearing session');
                    setUser(null);
                    deleteCookie('nephro_user');
                  }
                }
              } catch (error) {
                console.error('Error verifying session with backend:', error);
                // Keep local user data if backend verification fails (might be offline)
                console.log('Keeping local user data due to backend verification failure');
              }
            }
          } catch (error) {
            console.error('Error parsing user cookie:', error);
            deleteCookie('nephro_user');
          }
        } else {
          console.log('AuthContext: No saved user cookie found');
          // Try to get session from backend anyway
          try {
            const response = await apiService.makeRequest<{user: User}>('/auth/me', {});
            if (response.success && response.data?.user) {
              console.log('Found session on backend without cookie:', response.data.user);
              setUser(response.data.user);
              setCookie('nephro_user', encodeURIComponent(JSON.stringify(response.data.user)), 7);
            }
          } catch (error) {
            console.error('Error checking backend session:', error);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading user:', error);
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const userData = response.data as User;
        setUser(userData);
        // Save to cookie as backup
        setCookie('nephro_user', encodeURIComponent(JSON.stringify(userData)), 7);
        clearLogoutFlag();
        console.log('User logged in successfully:', userData);
        return true;
      } else {
        console.error('Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    deleteCookie('nephro_user');
    setLogoutFlag();
    console.log('User logged out and cookie removed');
  };

  const register = async (userData: any): Promise<boolean> => {
    // Mock registration
    const newUser = {
      id: userData.id || Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'patient',
      country: userData.country || getUserCountry(),
      avatar: userData.avatar || ''
    };
    
    console.log('AuthContext register - userData received:', userData);
    console.log('AuthContext register - newUser created:', newUser);
    console.log('AuthContext register - avatar URL:', newUser.avatar);
    console.log('AuthContext register - avatar length:', newUser.avatar ? newUser.avatar.length : 0);
    
    setUser(newUser);
    // Save to cookie for persistent session
    setCookie('nephro_user', encodeURIComponent(JSON.stringify(newUser)), 7);
    clearLogoutFlag();
    console.log('User registered and saved to cookie:', newUser);
    return true;
  };

  const reloadSession = () => {
    // In a real app, this would reload user session from server
    // For now, just trigger a re-render
    if (user) {
      setUser({ ...user });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Update cookie with new user data
      setCookie('nephro_user', encodeURIComponent(JSON.stringify(updatedUser)), 7);
      console.log('User updated and saved to cookie:', updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, reloadSession, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};