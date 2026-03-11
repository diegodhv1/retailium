import { supabase } from "../supabaseClient";

export type Branch = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
};

export async function getBranches(companyId?: string): Promise<Branch[]> {
  let query = supabase
    .from("branches")
    .select("*")
    .order("name", { ascending: true });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Branch[];
}
