import { z } from "zod";
import type { Product } from "../../../services/products";

export function validateProduct(values: Partial<Product>): {
  issues: { path?: (string | number)[]; message: string }[];
} {
  const schema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    sku: z.string().min(1, "El SKU es obligatorio"),
    stock: z
      .number()
      .int("Debe ser un entero")
      .nonnegative("No puede ser negativo"),
    purchase_price: z.number().nonnegative("No puede ser negativo"),
    selling_price: z.number().nonnegative("No puede ser negativo"),
  });

  const result = schema.safeParse(values);
  if (result.success) {
    return { issues: [] };
  }
  return {
    issues: result.error.issues.map((issue) => ({
      path: issue.path?.filter(
        (path): path is string | number =>
          typeof path === "string" || typeof path === "number",
      ),
      message: issue.message,
    })),
  };
}
