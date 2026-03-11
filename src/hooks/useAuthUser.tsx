import React from "react";
import { SupabaseUserService } from "../services/user";
import type { AuthUser } from "../services/user";
import { SupabaseCompanyService, type Company } from "../services/company";

export function useAuthUser() {
  const [user, setUser] = React.useState<AuthUser>(null as unknown as AuthUser);
  const [company, setCompany] = React.useState<Company | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const loadUser = React.useCallback(async () => {
    setLoading(true);
    try {
      const _user = await SupabaseUserService.getAuthUser();
      console.log(_user);

      if (_user?.email && _user.email !== "") {
        setUser(_user);
        
        if (_user.branch_id) {
          const _company = await SupabaseCompanyService.getCompanyByBranchId(_user.branch_id);
          setCompany(_company);
        }
      }
    } catch (err) {
      setUser(null as unknown as AuthUser);
      setCompany(null);
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

  return { user, company, fullName, loading, reload: loadUser };
}
