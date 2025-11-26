import { createContext, useContext, useMemo, useState, ReactNode } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => void;
  signup: (payload: { name: string; email: string; password: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      login: () => {
        setIsAuthenticated(true);
      },
      signup: () => {
        setIsAuthenticated(true);
      },
      logout: () => {
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

