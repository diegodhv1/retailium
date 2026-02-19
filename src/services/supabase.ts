import { supabase } from "../supabaseClient";

const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const SupabaseService = {
  getUser,
};
