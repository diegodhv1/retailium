import { supabase } from "../supabaseClient";

export type Product = {
  id?: string;
  name: string;
  sku: string;
  stock: number;
  purchase_price: number;
  selling_price: number;
  branch_id?: string;
  user_id?: string;
};

export async function createProduct(
  values: Omit<Product, "id">,
) {
  const { error } = await supabase.from("products").insert(values);

  if (error) throw error;
}

export async function getProduct(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: number | string | undefined,
  values: Omit<Product, "id" | "branch_id">,
) {
  const { error } = await supabase.from("products").update(values).eq("id", id);

  if (error) throw error;
}

export async function skuExists(
  sku: string,
  excludeId?: number,
): Promise<boolean> {
  let query = supabase
    .from("products")
    .select("id", { count: "exact" })
    .eq("sku", sku);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) throw error;
  return !!data;
}
