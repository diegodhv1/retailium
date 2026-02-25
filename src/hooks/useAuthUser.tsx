import React from "react";
import { SupabaseUserService } from "../services/user";
type AuthUser = {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
} | null;

export function useAuthUser() {
  const [user, setUser] = React.useState<AuthUser>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const loadUser = React.useCallback(async () => {
    setLoading(true);
    try {
      const u = await SupabaseUserService.getAuthUser();
      setUser(u ?? null);
    } catch (err) {
      setUser(null);
      throw new Error("Error loading auth user", err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  const fullName = React.useMemo(() => {
    if (!user) return "";
    return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  }, [user]);

  return { user, fullName, loading, reload: loadUser };
}
