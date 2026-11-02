import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

export interface VerifyStep1Response {
  success: boolean;
  step: 'OTP_REQUIRED';
  tempToken: string;
  deliveryChannel: 'SMS' | 'EMAIL';
  maskedTarget: string;
  demoOtp: string;
  userPreview: {
    name: string;
    role: string;
    designation: string;
    bureau: string;
  };
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  demoUsers: User[];
  login: (email: string, password?: string) => Promise<void>;
  verifyCredentialsAndSendOtp: (payload: {
    loginId: string;
    password: string;
    captchaAnswer: string;
    expectedCaptcha: string;
    deliveryChannel: 'SMS' | 'EMAIL';
  }) => Promise<VerifyStep1Response>;
  verifyOtpAndLogin: (payload: { tempToken: string; otp: string }) => Promise<void>;
  resendOtp: (payload: { tempToken: string; deliveryChannel: 'SMS' | 'EMAIL' }) => Promise<{
    demoOtp: string;
    maskedTarget: string;
    message: string;
  }>;
  logout: () => void;
  switchUser: (targetUser: User) => Promise<void>;
  updateProfile: (updatedData: Partial<User> & { currentPassword?: string; newPassword?: string }) => Promise<User>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'Dr. Abhay Jere',
  email: 'admin@aicte.gov.in',
  role: 'SUPER_ADMIN',
  designation: 'Chief Vigilance & Monitoring Officer',
  region: 'Central HQ (New Delhi)',
  phone: '+91-11-29581001',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('augms_user');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('augms_token'));
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch demo users from backend
  useEffect(() => {
    async function loadDemoUsers() {
      try {
        const res = await api.get('/auth/demo-users');
        setDemoUsers(res.data);
      } catch (err) {
        console.warn('Could not load demo users from backend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDemoUsers();
  }, []);

  // Step 1: Verify Credentials + CAPTCHA
  const verifyCredentialsAndSendOtp = async (payload: {
    loginId: string;
    password: string;
    captchaAnswer: string;
    expectedCaptcha: string;
    deliveryChannel: 'SMS' | 'EMAIL';
  }): Promise<VerifyStep1Response> => {
    const res = await api.post('/auth/verify-step1', payload);
    return res.data;
  };

  // Step 2: Verify 2FA OTP & complete login
  const verifyOtpAndLogin = async (payload: { tempToken: string; otp: string }) => {
    const res = await api.post('/auth/verify-otp', payload);
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('augms_token', receivedToken);
    localStorage.setItem('augms_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
  };

  // Resend OTP
  const resendOtp = async (payload: { tempToken: string; deliveryChannel: 'SMS' | 'EMAIL' }) => {
    const res = await api.post('/auth/resend-otp', payload);
    return res.data;
  };

  // Direct login
  const login = async (email: string, password = 'aicte@123') => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('augms_token', receivedToken);
      localStorage.setItem('augms_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('augms_token');
    localStorage.removeItem('augms_user');
    setToken(null);
    setUser(null);
  };

  const switchUser = async (targetUser: User) => {
    try {
      await login(targetUser.email, 'aicte@123');
    } catch (err) {
      setUser(targetUser);
      localStorage.setItem('augms_user', JSON.stringify(targetUser));
    }
  };

  const updateProfile = async (
    updatedData: Partial<User> & { currentPassword?: string; newPassword?: string }
  ): Promise<User> => {
    try {
      const res = await api.put('/users/profile', {
        userId: user?.id,
        email: user?.email,
        ...updatedData,
      });
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('augms_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err: any) {
      if (user) {
        const merged = { ...user, ...updatedData };
        setUser(merged);
        localStorage.setItem('augms_user', JSON.stringify(merged));
        return merged;
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        demoUsers,
        login,
        verifyCredentialsAndSendOtp,
        verifyOtpAndLogin,
        resendOtp,
        logout,
        switchUser,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
