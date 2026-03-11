import { supabase } from "../supabaseClient";

export interface Provider {
  id?: string;
  name: string;
  identification: string;
  contact_phone: string;
  address?: string;
  company_id?: string;
  user_id?: string;
  created_at?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const getProviders = async (companyId: string): Promise<Provider[]> => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getProvider = async (id: string): Promise<Provider> => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const createProvider = async (provider: Omit<Provider, "id">): Promise<Provider> => {
  const { data, error } = await supabase
    .from("providers")
    .insert([provider])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProvider = async (id: string, provider: Partial<Provider>): Promise<Provider> => {
  const { data, error } = await supabase
    .from("providers")
    .update(provider)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProvider = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("providers")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
