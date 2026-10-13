import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DemoUser } from '../types';
import { api, setAuthToken, getAuthToken } from '../lib/api';

interface AuthContextType {
  user: DemoUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  currentRoute: string;
  navigate: (route: string) => void;
  login: (email: string, password: string) => Promise<DemoUser>;
  logout: () => void;
  switchDemoUser: (email: string) => Promise<DemoUser>;
  resetDemoData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<DemoUser | null>(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('mycampus_demo_user') : null;
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p === '' ? '/' : p;
    }
    return '/';
  });

  const navigate = useCallback((route: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== route) {
        window.history.pushState(null, '', route);
      }
      setCurrentRoute(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Validate session on app initialization
  useEffect(() => {
    const initSession = async () => {
      const existingToken = getAuthToken();
      if (!existingToken) {
        setUser(null);
        setIsLoadingAuth(false);
        return;
      }

      try {
        const verifiedUser = await api.auth.getMe();
        setUser(verifiedUser);
        localStorage.setItem('mycampus_demo_user', JSON.stringify(verifiedUser));
      } catch (err) {
        console.warn('Existing session invalid or expired:', err);
        setAuthToken(null);
        setToken(null);
        setUser(null);
        localStorage.removeItem('mycampus_demo_user');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<DemoUser> => {
    setIsLoadingAuth(true);
    try {
      const res = await api.auth.demoLogin(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('mycampus_demo_user', JSON.stringify(res.user));
      navigate('/dashboard');
      return res.user;
    } finally {
      setIsLoadingAuth(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('mycampus_demo_user');
    navigate('/login');
  }, [navigate]);

  const switchDemoUser = useCallback(async (email: string): Promise<DemoUser> => {
    return await login(email, 'demo123');
  }, [login]);

  const resetDemoData = useCallback(async () => {
    await api.auth.resetDemoData();
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoadingAuth,
        currentRoute,
        navigate,
        login,
        logout,
        switchDemoUser,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
