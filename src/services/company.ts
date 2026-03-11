import { supabase } from "../supabaseClient";

export type Company = {
  id: string;
  name: string;
};

const getCompanyByBranchId = async (branch_id: string): Promise<Company | null> => {
  // First get the branch to find the company_id
  const { data: branch, error: branchError } = await supabase
    .from("branches")
    .select("company_id")
    .eq("id", branch_id)
    .single();

  if (branchError || !branch?.company_id) return null;

  // Then fetch the company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", branch.company_id)
    .single();

  if (companyError) return null;
  return company as Company;
};

export const SupabaseCompanyService = {
  getCompanyByBranchId,
};
