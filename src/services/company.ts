import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

export interface AuthUser extends User {
  first_name: string;
  last_name: string;
}

const getCompany = async (): Promise<AuthUser | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? null;
  const { data } = await supabase.from("users").select("*").eq("email", email);

  return data ? data[0] : null;
};

export const SupabaseUserService = {
  getCompany,
};
