import React from "react";
import type { AuthUser } from "../services/user";
import type { Company } from "../services/company";

interface AuthContextType {
  user: AuthUser;
  company: Company | null;
  loading: boolean;
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null as unknown as AuthUser,
  company: null,
  loading: true,
  selectedBranchId: null,
  setSelectedBranchId: () => {},
  logout: async () => {},
});

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
