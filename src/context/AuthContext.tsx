import { useAuthUser } from "../hooks/useAuthUser";
import type { AuthUser } from "../services/user";
import { AuthContext } from "./AuthContextUtils";

export interface User extends AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  branch_id: number;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, loading } = useAuthUser();

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
