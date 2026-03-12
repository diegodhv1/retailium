import React from "react";
import { supabase } from "../supabaseClient";
import { SupabaseUserService } from "../services/user";
import type { AuthUser } from "../services/user";
import { SupabaseCompanyService, type Company } from "../services/company";

export function useAuthUser() {
  const [user, setUser] = React.useState<AuthUser>(null as unknown as AuthUser);
  const [company, setCompany] = React.useState<Company | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Use a ref to check the current user inside the callback without triggering re-renders
  const userRef = React.useRef(user);
  React.useEffect(() => {
    userRef.current = user;
  }, [user]);

  const loadUser = React.useCallback(async (silent = false) => {
    // Only show loading screen if we don't have a user yet and it's not a silent refresh
    if (!silent || !userRef.current) {
      setLoading(true);
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null as unknown as AuthUser);
        setCompany(null);
        return;
      }

      const _user = await SupabaseUserService.getAuthUser();
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
      console.error("Error loading auth user", err);
    } finally {
      // Small timeout to prevent flashing if the session is resolved instantly
      setLoading(false);
    }
  }, []); // Stable dependency

  React.useEffect(() => {
    // Initial load
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null as unknown as AuthUser);
        setCompany(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadUser(true); // Always silent when coming from events
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser]);

  const fullName = React.useMemo(() => {
    if (!user) return "";
    return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  }, [user]);

  return { user, company, fullName, loading, reload: loadUser };
}
