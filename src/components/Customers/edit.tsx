import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import * as AuthContextUtils from "../../context/AuthContextUtils";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import GoBackButton from "../shared/GoBackButton";
import { getCustomer, createCustomer, updateCustomer, type Customer } from "../../services/customers";

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, company, selectedBranchId } = AuthContextUtils.useAuthContext();
  const notifications = useNotifications();

  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Customer>({
    full_name: "",
    id_number: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isNew = !id || id === "nuevo";

  React.useEffect(() => {
    if (!isNew && id) {
      const fetchCustomer = async () => {
        try {
          const data = await getCustomer(id);
          setFormData(data);
        } catch (error) {
          notifications.show(`Error al cargar cliente: ${(error as Error).message}`, { severity: "error" });
        }
      };
      fetchCustomer();
    }
  }, [id, isNew, notifications]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name) newErrors.full_name = "El nombre completo es requerido";
    if (!formData.id_number) newErrors.id_number = "La cédula es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isNew) {
        const payload: Omit<Customer, "id"> = {
          ...formData,
          company_id: company?.id,
          branch_id: selectedBranchId || user?.branch_id,
          user_id: user?.id,
        };
        await createCustomer(payload);
        notifications.show("Cliente creado correctamente", { severity: "success" });
      } else {
        const { id: _id, ...updatePayload } = formData;
        await updateCustomer(id!, updatePayload);
        notifications.show("Cliente actualizado correctamente", { severity: "success" });
      }
      navigate("/clientes");
    } catch (error) {
      notifications.show(`Error al guardar cliente: ${(error as Error).message}`, { severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <GoBackButton to="/clientes" />
        <Typography variant="h4" component="h1">
          {isNew ? "Nuevo Cliente" : "Editar Cliente"}
        </Typography>
      </Stack>

      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <TextField
              label="Nombre Completo"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              error={!!errors.full_name}
              helperText={errors.full_name}
              required
              fullWidth
            />
            <TextField
              label="Cédula"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              error={!!errors.id_number}
              helperText={errors.id_number}
              required
              fullWidth
            />
            <TextField
              label="Correo"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Teléfono"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              fullWidth
            />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
