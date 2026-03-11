import { supabase } from "../supabaseClient";

export interface DailySummary {
  totalSales: number;
  totalCash: number;
  totalCredit: number;
  inventoryMovements: InventoryMovement[];
  topProduct: InventoryMovement | null;
}

export interface InventoryMovement {
  id: number;
  name: string;
  quantitySold: number;
  finalStock: number;
  revenue: number;
}

export async function getDailyDashboardData(
  dateStr: string,
  branchId: string,
): Promise<DailySummary> {
  // Query sales for the given date
  // sale_date is usually a timestamp depending on the DB type, so we query a range for the day.
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: salesInfo, error: salesError } = await supabase
    .from("sales")
    .select("*, sale_details(*, products(*))")
    .eq("branch_id", branchId)
    .gte("created_at", startOfDay.toISOString())
    .lte("created_at", endOfDay.toISOString());

  if (salesError) {
    throw new Error(`Error loading sales: ${salesError.message}`);
  }

  let totalSales = 0;
  let totalCash = 0;
  let totalCredit = 0;

  // Track inventory mapping by product id
  const productMovements: Record<number, InventoryMovement> = {};

  salesInfo?.forEach((sale: any) => {
    // Totals
    totalSales += Number(sale.total_amount) || 0;
    if (sale.is_credit) {
      totalCredit += Number(sale.total_amount) || 0;
    } else {
      totalCash += Number(sale.total_amount) || 0;
    }

    // Detail movements
    sale.sale_details?.forEach((detail: any) => {
      const pid = detail.product_id;
      const product = detail.products; // Joins mapping

      if (!productMovements[pid]) {
        productMovements[pid] = {
          id: pid,
          name: product?.name || `Producto #${pid}`,
          quantitySold: 0,
          finalStock: product?.stock || 0,
          revenue: 0,
        };
      }

      productMovements[pid].quantitySold += Number(detail.quantity) || 0;
      productMovements[pid].revenue += Number(detail.subtotal) || 0;
    });
  });

  const inventoryMovements = Object.values(productMovements).sort(
    (a, b) => b.quantitySold - a.quantitySold,
  );

  const topProduct = inventoryMovements.length > 0 ? inventoryMovements[0] : null;

  return {
    totalSales,
    totalCash,
    totalCredit,
    inventoryMovements,
    topProduct,
  };
}
