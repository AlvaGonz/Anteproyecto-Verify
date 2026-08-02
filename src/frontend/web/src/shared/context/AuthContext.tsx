import { createContext, use, useState, useEffect, useRef, ReactNode, useCallback, useMemo } from "react";
import {
  AuthService,
  User,
  AuthError,
  type LoginResult,
  type TwoFactorChallengeInfo,
} from "../../features/auth/services/AuthService";
import { queryClient } from "../../infrastructure/api/queryClient";

export type PendingChallenge = TwoFactorChallengeInfo;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  error: AuthError | null;
  googleLogin: (credential: string) => Promise<LoginResult>;
  pendingChallenge: PendingChallenge | null;
  clearChallenge: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<PendingChallenge | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      const currentUser = await AuthService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handler = () => {
      queryClient.clear();
      setUser(null);
      setPendingChallenge(null);
      AuthService.logout();
      window.location.hash = '#/login';
    };
    window.addEventListener('auth:force-logout', handler);
    return () => window.removeEventListener('auth:force-logout', handler);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    setError(null);
    queryClient.clear();

    const result = await AuthService.login(email, password);

    if (result.succeeded) {
      setUser(result.user);
      setPendingChallenge(null);
    } else if (result.requires2fa) {
      setPendingChallenge(result.challenge);
      setError(null);
    } else {
      setError(result.error);
      setPendingChallenge(null);
    }
    setLoading(false);
    return result;
  }, []);

  const googleLogin = useCallback(async (credential: string): Promise<LoginResult> => {
    setLoading(true);
    setError(null);
    queryClient.clear();

    const result = await AuthService.googleLogin(credential);

    if (result.succeeded) {
      setUser(result.user);
      setPendingChallenge(null);
    } else if (result.requires2fa) {
      setPendingChallenge(result.challenge);
      setError(null);
    } else {
      setError(result.error);
      setPendingChallenge(null);
    }
    setLoading(false);
    return result;
  }, []);

  const clearChallenge = useCallback(() => {
    setPendingChallenge(null);
    setError(null);
  }, []);

  const logout = useCallback(() => {
    queryClient.clear();
    setUser(null);
    setPendingChallenge(null);
    AuthService.logout();
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await AuthService.getCurrentUser();
    if (result) {
      setUser(result);
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
    googleLogin,
    pendingChallenge,
    clearChallenge,
  }), [user, loading, login, logout, refreshUser, updateUser, error, googleLogin, pendingChallenge, clearChallenge]);

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
