import { supabase } from "../supabaseClient";
import type { Product } from "./products";

export type Sale = {
  id?: string;
  branch_id?: string;
  customer_id?: string | null;
  user_id?: string | null;
  sale_date?: string;
  total_amount: number;
  is_credit: boolean;
};

export type SaleDetail = {
  id?: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export async function processSale(
  saleData: Omit<Sale, "id" | "sale_date">,
  cartItems: CartItem[],
) {
  // Preparamos los detalles de la venta
  const details = cartItems.map((item) => ({
    product_id: item.product.id as string,
    quantity: item.quantity,
    unit_price: item.product.selling_price,
    subtotal: item.product.selling_price * item.quantity,
  }));

  // Llamamos al RPC con los parámetros exactos de PostgreSQL
  const { data, error } = await supabase.rpc("create_sale_with_details", {
    p_user_id: saleData.user_id,
    p_branch_id: saleData.branch_id,
    p_customer_id: saleData.customer_id || null, // Ensure a valid format for API
    p_sale_date: new Date().toISOString(),
    p_total_amount: saleData.total_amount,
    p_is_credit: saleData.is_credit,
    p_details: details,
  });

  if (error) {
    throw new Error(`Error al procesar la venta (RPC): ${error.message}`);
  }

  // Opcional: el RPC podría devolver el ID de la nueva venta insertada.
  return data;
}
