import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthService, User, AuthError } from "../services/AuthService";
import { isSome, isSuccess, isFailure } from "../../../shared/utils/functional";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: AuthError | null;
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const result = await AuthService.login(email, password);
    
    if (isSuccess(result)) {
      localStorage.setItem("vf_token", result.data.token);
      localStorage.setItem("vf_user", JSON.stringify(result.data.user));
      setUser(result.data.user);
    } else {
      setError(result.error);
      throw result.error;
    }
    
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("vf_token");
    localStorage.removeItem("vf_user");
    setUser(null);
    AuthService.logout();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        login, 
        logout,
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
