import React from "react";
import type { AuthUser } from "../services/user";

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null as unknown as AuthUser,
  loading: true,
});

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
