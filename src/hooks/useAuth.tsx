import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('fh_token');
    const savedUser = localStorage.getItem('fh_user');
    if (saved) setToken(saved);
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // Mock login — replace with API call
    const fakeToken = 'mock-jwt-token';
    const fakeUser: User = { id: 'u1', name: email.split('@')[0], email, role: 'farmer' };
    localStorage.setItem('fh_token', fakeToken);
    localStorage.setItem('fh_user', JSON.stringify(fakeUser));
    setToken(fakeToken);
    setUser(fakeUser);
  };

  const logout = () => {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
