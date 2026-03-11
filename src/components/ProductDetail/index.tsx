import * as React from "react";
import { useNavigate, useParams } from "react-router";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import GoBackButton from "../shared/GoBackButton";
import type { FormFieldValue, ProductFormState } from "../Forms/Product";
import {
  getProduct,
  skuExists,
  updateProduct,
  type Product,
} from "../../services/products";
import { validateProduct } from "../Forms/Product/validation";
import ProductForm from "../Forms/Product";

export default function ProductEdit() {
  const { id } = useParams<{ id: string | undefined }>();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [loading, setLoading] = React.useState(true);
  const [formState, setFormState] = React.useState<ProductFormState>({
    values: {},
    errors: {},
  });
  const [originalSku, setOriginalSku] = React.useState<string>("");
  const [, setIsSaving] = React.useState(false);

  // Load product data on mount
  React.useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const product = await getProduct(id);
        setFormState({
          values: {
            name: product.name,
            sku: product.sku,
            stock: product.stock,
            purchase_price: String(product.purchase_price),
            selling_price: String(product.selling_price),
          },
          errors: {},
        });
        setOriginalSku(product.sku);
      } catch (err) {
        notifications.show(
          `No se pudo cargar el producto: ${(err as Error).message}`,
          { severity: "error", autoHideDuration: 5000 },
        );
        navigate("/productos");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, notifications]);

  const setFormValues = React.useCallback(
    (v: Partial<ProductFormState["values"]>) => {
      setFormState((s) => ({ ...s, values: { ...s.values, ...v } }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (e: Partial<ProductFormState["errors"]>) => {
      setFormState((s) => ({ ...s, errors: { ...s.errors, ...e } }));
    },
    [],
  );

  const handleFieldChange = React.useCallback(
    (name: keyof ProductFormState["values"], value: FormFieldValue) => {
      const newValues = { ...formState.values, [name]: value };

      const runValidation = async () => {
        const valuesToValidate = {
          ...formState.values,
          stock:
            formState.values.stock === "" || formState.values.stock == null
              ? undefined
              : Number(formState.values.stock),
          purchase_price:
            formState.values.purchase_price === "" ||
            formState.values.purchase_price == null
              ? undefined
              : Number(formState.values.purchase_price),
          selling_price:
            formState.values.selling_price === "" ||
            formState.values.selling_price == null
              ? undefined
              : Number(formState.values.selling_price),
        };
        const { issues } = validateProduct(valuesToValidate);
        let message = issues.find((i) => i.path?.[0] === name)?.message;

        // Check SKU uniqueness only if it changed
        if (
          name === "sku" &&
          typeof value === "string" &&
          value !== originalSku
        ) {
          const exists = await skuExists(value, Number(id));
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
    [
      formState.values,
      formState.errors,
      setFormErrors,
      setFormValues,
      originalSku,
      id,
    ],
  );

  const handleReset = React.useCallback(() => {
    // Reset to original values
    if (formState.values.name) {
      setFormState({
        values: {
          name: formState.values.name,
          sku: originalSku,
          stock: formState.values.stock,
          purchase_price: formState.values.purchase_price,
          selling_price: formState.values.selling_price,
        },
        errors: {},
      });
    }
  }, [formState.values, originalSku]);

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

    // Check SKU uniqueness if changed
    if (
      formState.values.sku &&
      formState.values.sku !== originalSku &&
      (await skuExists(formState.values.sku as string, Number(id)))
    ) {
      setFormErrors({ sku: "El SKU ya existe" });
      return;
    }

    try {
      setIsSaving(true);
      const payload: Omit<Product, "id" | "branch_id"> = {
        name: formState.values.name as string,
        sku: formState.values.sku as string,
        stock: Number(formState.values.stock) || 0,
        purchase_price: Number(formState.values.purchase_price) || 0,
        selling_price: Number(formState.values.selling_price) || 0,
      };
      await updateProduct(id, payload);
      notifications.show("Producto actualizado correctamente", {
        severity: "success",
        autoHideDuration: 3000,
      });
      navigate(`/productos/${id}`);
    } catch (err) {
      notifications.show(
        `No se pudo actualizar el producto: ${(err as Error).message}`,
        { severity: "error", autoHideDuration: 5000 },
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    formState.values,
    id,
    originalSku,
    navigate,
    notifications,
    setFormErrors,
  ]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const currentStock =
    formState.values.stock === "" || formState.values.stock == null
      ? 0
      : Number(formState.values.stock);
  const purchasePrice =
    formState.values.purchase_price === "" ||
    formState.values.purchase_price == null
      ? 0
      : Number(formState.values.purchase_price);
  const sellingPrice =
    formState.values.selling_price === "" ||
    formState.values.selling_price == null
      ? 0
      : Number(formState.values.selling_price);

  const marginPercentage =
    purchasePrice > 0
      ? (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2)
      : "0.00";

  return (
    <div style={{ padding: "2rem" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <GoBackButton to="/productos" />
        <Typography variant="h4" component="h1">
          Detalle Producto
        </Typography>
      </Stack>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {currentStock < 5 && (
          <Alert severity="warning">
            Atención: El nivel de stock es bajo ({currentStock} {currentStock === 1 ? 'unidad restante' : 'unidades restantes'}).
          </Alert>
        )}
        <Alert severity="info">
          Margen de ganancia estimado: <strong>{marginPercentage}%</strong>
        </Alert>
      </Stack>

      <ProductForm
        formState={formState}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitButtonLabel="Actualizar"
      />
    </div>
  );
}
