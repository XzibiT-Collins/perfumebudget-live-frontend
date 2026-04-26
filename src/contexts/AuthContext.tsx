import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, LoginResponse } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const USER_STORAGE_KEY = 'pb_user';

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string
  ) => Promise<string>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  verifyLoginOtp: (challengeToken: string, otp: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount: call /auth/me to validate the session cookie
    // and get fresh user details. Fallback: if not authenticated,
    // isLoading is set to false and user stays null.
    const checkSession = async () => {
      try {
        const me = await authService.getMe();
        setUser(me);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      } catch {
        // 401 or network error — clear any stale user in storage
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Listen for session expiry dispatched by the api.ts refresh interceptor.
  // This fires when the refresh token itself is expired/invalid.
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      toast.error('Your session has expired. Please log in again.', { id: 'session-expired' });
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const res = await authService.login({ email, password });
    if (!res.requiresOtp && res.auth) {
      setUser(res.auth);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.auth));
    }
    return res;
  };

  /** Registers a new user. Returns the email for OTP redirect. Does NOT log in. */
  const register = async (
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string
  ): Promise<string> => {
    await authService.register({
      email,
      fullName,
      password,
      confirmPassword,
    });
    return email;
  };

  /** Verifies Registration OTP, activates account, and sets auth state. */
  const verifyOtp = async (email: string, otp: string) => {
    const authResponse = await authService.verifyOtp({ email, otp });
    setUser(authResponse);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authResponse));
  };

  /** Verifies Login OTP, sets auth state. */
  const verifyLoginOtp = async (challengeToken: string, otp: string) => {
    const authResponse = await authService.verifyLoginOtp({ challengeToken, otp });
    setUser(authResponse);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authResponse));
  };

  const loginWithGoogle = () => {
    return new Promise<void>((_resolve, reject) => {
      const authUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;
      if (!authUrl) {
        toast.error('Google Auth URL is not configured in .env');
        return reject(new Error('Google Auth URL missing'));
      }

      // Redirect in the same tab
      window.location.href = authUrl;
      // The promise will never resolve because the page redirects
    });
  };

  /** Logs out on the server, then clears local state. */
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // If the API call fails (e.g. already expired), still clear locally
    } finally {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'FRONT_DESK') {
      return user.permissions?.includes(permission as any) || false;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyOtp, verifyLoginOtp, loginWithGoogle, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
