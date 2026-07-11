import { createContext, use, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { AuthService, User, AuthError } from "../../features/auth/services/AuthService";
import { isSome, isSuccess } from "../utils/functional";
import { queryClient } from "../../infrastructure/api/queryClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  error: AuthError | null;
  googleLogin: (credential: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const currentUserOption = await AuthService.getCurrentUser();
      
      if (isSome(currentUserOption)) {
        setUser(currentUserOption.value);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handler = () => {
      queryClient.clear();
      setUser(null);
      AuthService.logout();
      window.location.hash = '#/login';
    };
    window.addEventListener('auth:force-logout', handler);
    return () => window.removeEventListener('auth:force-logout', handler);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    queryClient.clear();
    
    const result = await AuthService.login(email, password);
    
    if (isSuccess(result)) {
      setUser(result.data.user);
    } else {
      setError(result.error);
    }
    setLoading(false);
    if (!isSuccess(result)) throw result.error;
    return result.data.user;
  }, []);

  const googleLogin = useCallback(async (credential: string): Promise<User> => {
    setLoading(true);
    setError(null);
    queryClient.clear();
    
    const result = await AuthService.googleLogin(credential);
    
    if (isSuccess(result)) {
      setUser(result.data.user);
    } else {
      setError(result.error);
    }
    setLoading(false);
    if (!isSuccess(result)) throw result.error;
    return result.data.user;
  }, []);

  const logout = useCallback(() => {
    queryClient.clear();
    setUser(null);
    AuthService.logout();
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await AuthService.getCurrentUser();
    if (isSome(result)) {
      setUser(result.value);
    } else {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } as User : null);
  }, []);

  const value = useMemo(() => ({ 
    user, 
    isAuthenticated: !!user, 
    loading, 
    login, 
    logout, 
    refreshUser, 
    updateUser, 
    error,
    googleLogin
  }), [user, loading, login, logout, refreshUser, updateUser, error, googleLogin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
