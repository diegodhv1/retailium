import * as React from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import { validateProduct } from "../Forms/Product/validation";
import {
  createProduct,
  skuExists,
  type Product,
} from "../../services/products";
import type { ProductFormState } from "../Forms/Product";
import ProductForm from "../Forms/Product";
import type { FormFieldValue } from "../Forms/Product";

const INITIAL_VALUES: Partial<ProductFormState["values"]> = {
  stock: "",
  purchase_price: "",
  selling_price: "",
};

export default function ProductCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<ProductFormState>({
    values: INITIAL_VALUES,
    errors: {},
  });

  const setFormValues = React.useCallback(
    (v: Partial<ProductFormState["values"]>) => {
      setFormState((s) => ({ ...s, values: v }));
    },
    [],
  );
  const setFormErrors = React.useCallback(
    (e: Partial<ProductFormState["errors"]>) => {
      setFormState((s) => ({ ...s, errors: e }));
    },
    [],
  );

  const handleFieldChange = React.useCallback(
    (name: keyof ProductFormState["values"], value: FormFieldValue) => {
      const newValues = { ...formState.values, [name]: value };

      const runValidation = async () => {
        const normalizedValues = {
          ...newValues,
          stock:
            newValues.stock === "" || newValues.stock == null
              ? 0
              : Number(newValues.stock),
          purchase_price:
            newValues.purchase_price === "" || newValues.purchase_price == null
              ? 0
              : Number(newValues.purchase_price),
          selling_price:
            newValues.selling_price === "" || newValues.selling_price == null
              ? 0
              : Number(newValues.selling_price),
        };
        const { issues } = validateProduct(normalizedValues);
        let message = issues.find((i) => i.path?.[0] === name)?.message;

        if (name === "sku" && typeof value === "string") {
          const exists = await skuExists(value);
          if (exists) message = "El SKU ya existe";
        }

        if (
          (name === "selling_price" || name === "purchase_price") &&
          typeof newValues.selling_price === "string" &&
          typeof newValues.purchase_price === "string" &&
          Number(newValues.selling_price) < Number(newValues.purchase_price)
        ) {
          message = "Precio de venta menor que el de compra";
        }

        setFormErrors({ ...formState.errors, [name]: message });
      };

      setFormValues(newValues);
      runValidation();
    },
    [formState.values, formState.errors, setFormErrors, setFormValues],
  );

  const handleReset = React.useCallback(() => {
    setFormValues(INITIAL_VALUES);
    setFormErrors({});
  }, [setFormValues, setFormErrors]);

  const handleSubmit = React.useCallback(async () => {
    const normalizedValues = {
      ...formState.values,
      stock:
        formState.values.stock === "" || formState.values.stock == null
          ? 0
          : Number(formState.values.stock),
      purchase_price:
        formState.values.purchase_price === "" ||
        formState.values.purchase_price == null
          ? 0
          : Number(formState.values.purchase_price),
      selling_price:
        formState.values.selling_price === "" ||
        formState.values.selling_price == null
          ? 0
          : Number(formState.values.selling_price),
    };
    const { issues } = validateProduct(normalizedValues);
    if (issues.length) {
      setFormErrors(
        Object.fromEntries(
          issues.map((i) => [i.path?.[0] as string, i.message]),
        ),
      );
      return;
    }

    // comprobación final de SKU único
    if (
      formState.values.sku &&
      (await skuExists(formState.values.sku as string))
    ) {
      setFormErrors({ sku: "El SKU ya existe" });
      return;
    }

    try {
      // convertir antes de enviar
      const payload: Omit<Product, "id"> = {
        name: formState.values.name as string,
        sku: formState.values.sku as string,
        stock: Number(formState.values.stock) || 0,
        purchase_price: Number(formState.values.purchase_price) || 0,
        selling_price: Number(formState.values.selling_price) || 0,
      };
      await createProduct(payload);
      notifications.show("Producto creado correctamente", {
        severity: "success",
        autoHideDuration: 3000,
      });
      navigate("/productos");
    } catch (err) {
      notifications.show(
        `No se pudo guardar el producto: ${(err as Error).message}`,
        { severity: "error", autoHideDuration: 5000 },
      );
    }
  }, [formState.values, navigate, notifications, setFormErrors]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Nuevo Producto</h1>
      <Box sx={{ mt: 8 }}>
        <ProductForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitButtonLabel="Crear"
        />
      </Box>
    </div>
  );
}
