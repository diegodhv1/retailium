import * as React from "react";
import { useAuthUser } from "../hooks/useAuthUser";
import type { AuthUser } from "../services/user";
import { AuthContext } from "./AuthContextUtils";
import { SupabaseService } from "../services/supabase";

export interface User extends AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  branch_id: string;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, company, loading } = useAuthUser();
  const [selectedBranchId, setSelectedBranchId] = React.useState<string | null>(null);

  const logout = async () => {
    try {
      await SupabaseService.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  React.useEffect(() => {
    if (user?.branch_id && !selectedBranchId) {
      setSelectedBranchId(user.branch_id);
    }
  }, [user, selectedBranchId]);

  return (
    <AuthContext.Provider value={{ user, company, loading, selectedBranchId, setSelectedBranchId, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
