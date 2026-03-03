import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";

export type FormFieldValue = string | number | boolean | null;

export interface ProductFormValues {
  name?: string;
  sku?: string;
  stock?: number | string;
  purchase_price?: string;
  selling_price?: string;
}

export interface ProductFormState {
  values: ProductFormValues;
  errors: Partial<Record<keyof ProductFormValues, string>>;
}

export interface ProductFormProps {
  formState: ProductFormState;
  onFieldChange: (name: keyof ProductFormValues, value: FormFieldValue) => void;
  onSubmit: () => void;
  onReset: () => void;
  submitButtonLabel?: string;
}

function TextInput(
  props: React.ComponentProps<typeof TextField> & {
    name: keyof ProductFormValues;
  },
) {
  const { name, ...other } = props;
  return <TextField fullWidth name={name} {...other} />;
}

function NumberInput(
  props: React.ComponentProps<typeof TextField> & {
    name: keyof ProductFormValues;
  },
) {
  const { name, ...other } = props;
  return <TextField fullWidth type="number" name={name} {...other} />;
}

function CurrencyInput(
  props: React.ComponentProps<typeof TextField> & {
    name: keyof ProductFormValues;
  },
) {
  const { name, onChange, value, ...other } = props;

  const formatter = React.useMemo(() => new Intl.NumberFormat("es-CO"), []);
  const formatValue = React.useCallback(
    (val: string | number | undefined) => {
      if (val == null || val === "") return "";
      const num = Number(String(val).replace(/\D/g, ""));
      if (Number.isNaN(num)) return "";
      return formatter.format(num);
    },
    [formatter],
  );

  const [display, setDisplay] = React.useState<string>(
    formatValue(value as string | number | undefined),
  );

  React.useEffect(() => {
    setDisplay(formatValue(value as string | number | undefined));
  }, [value, formatValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setDisplay(raw);
    onChange?.({
      target: { name, value: raw },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleBlur = () => {
    setDisplay(formatValue(display));
  };

  return (
    <TextField
      fullWidth
      {...other}
      name={name as string}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      }}
    />
  );
}

export default function ProductForm({
  formState,
  onFieldChange,
  onSubmit,
  onReset,
  submitButtonLabel = "Guardar",
}: ProductFormProps) {
  const { values, errors } = formState;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    onFieldChange(name as keyof ProductFormValues, value);
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      sx={{ mt: 8 }}
    >
      <Grid container spacing={2} sx={{ mb: 2, width: "100%" }}>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
          <TextInput
            name="name"
            label="Nombre"
            required
            value={values.name ?? ""}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
          <TextInput
            name="sku"
            label="SKU"
            required
            value={values.sku ?? ""}
            onChange={handleChange}
            error={!!errors.sku}
            helperText={errors.sku}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
          <NumberInput
            name="stock"
            label="Cantidad inicial"
            value={values.stock ?? ""}
            onChange={handleChange}
            error={!!errors.stock}
            helperText={errors.stock}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
          <CurrencyInput
            name="purchase_price"
            label="Precio de compra"
            value={values.purchase_price ?? ""}
            onChange={handleChange}
            error={!!errors.purchase_price}
            helperText={errors.purchase_price}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
          <CurrencyInput
            name="selling_price"
            label="Precio de venta"
            value={values.selling_price ?? ""}
            onChange={handleChange}
            error={!!errors.selling_price}
            helperText={errors.selling_price}
          />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Button type="submit" variant="contained">
          {submitButtonLabel}
        </Button>
        <Button type="button" onClick={onReset}>
          Limpiar
        </Button>
      </Stack>
    </Box>
  );
}
