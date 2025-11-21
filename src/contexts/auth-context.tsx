import { createContext, useContext, useMemo, useState, ReactNode } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  openAuth: (action?: () => void) => void;
  closeAuth: () => void;
  login: (payload: { email: string; password: string }) => void;
  signup: (payload: { name: string; email: string; password: string }) => void;
  logout: () => void;
  isDialogOpen: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const runPending = () => {
    pendingAction?.();
    setPendingAction(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isDialogOpen,
      openAuth: (action) => {
        if (isAuthenticated) {
          action?.();
          return;
        }
        if (action) setPendingAction(() => action);
        setIsDialogOpen(true);
      },
      closeAuth: () => setIsDialogOpen(false),
      login: () => {
        setIsAuthenticated(true);
        setIsDialogOpen(false);
        runPending();
      },
      signup: () => {
        setIsAuthenticated(true);
        setIsDialogOpen(false);
        runPending();
      },
      logout: () => {
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated, isDialogOpen, pendingAction],
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

