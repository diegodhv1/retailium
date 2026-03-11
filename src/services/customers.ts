import { supabase } from "../supabaseClient";

export type Customer = {
  id?: string;
  full_name: string;
  id_number: string;
  phone?: string;
  email?: string;
  branch_id?: string;
  company_id?: string;
  user_id?: string; // ID of the admin/seller who created this customer
};

export async function createCustomer(values: Omit<Customer, "id">) {
  const { data, error } = await supabase
    .from("customers")
    .insert(values)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function getCustomers(companyId: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("company_id", companyId)
    .order("full_name", { ascending: true });

  if (error) throw error;
  return data as Customer[];
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, values: Partial<Customer>) {
  const { data, error } = await supabase
    .from("customers")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  const query = supabase
    .from("customers")
    .select("*")
    .or(`full_name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`)
    .limit(20);

  const { data, error } = await query;
  if (error) throw error;
  return data as Customer[];
}
