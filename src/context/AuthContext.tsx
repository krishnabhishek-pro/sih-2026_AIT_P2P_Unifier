import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  demoUsers: User[];
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchUser: (targetUser: User) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial fallback mock user if offline/initializing
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
      // Re-authenticate as target demo user
      await login(targetUser.email, 'aicte@123');
    } catch (err) {
      // Fallback local switch
      setUser(targetUser);
      localStorage.setItem('augms_user', JSON.stringify(targetUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, demoUsers, login, logout, switchUser, loading }}>
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
