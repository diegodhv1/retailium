import { supabase } from "../supabaseClient";

const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const SupabaseService = {
  getUser,
  signOut,
};
