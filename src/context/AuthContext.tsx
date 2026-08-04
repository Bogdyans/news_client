import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchMe, login as loginRequest, register as registerRequest } from '../api/auth';
import type { User } from '../types/api';

const STORAGE_KEY = 'news-editor-auth-token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    fetchMe(storedToken)
      .then((result) => {
        setUser(result.user);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function persistSession(nextUser: User, nextToken: string) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(STORAGE_KEY, nextToken);
  }

  async function login(email: string, password: string) {
    const result = await loginRequest(email, password);
    persistSession(result.user, result.token);
  }

  async function register(email: string, password: string, name: string) {
    const result = await registerRequest(email, password, name);
    persistSession(result.user, result.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: token !== null,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth должен вызываться внутри <AuthProvider>');
  }

  return context;
}
