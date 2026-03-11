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
import { getProvider, createProvider, updateProvider, type Provider } from "../../services/providers";

export default function ProviderEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, company } = AuthContextUtils.useAuthContext();
  const notifications = useNotifications();

  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Provider>({
    name: "",
    identification: "",
    contact_phone: "",
    address: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isNew = !id || id === "nuevo";

  React.useEffect(() => {
    if (!isNew && id) {
      const fetchProvider = async () => {
        try {
          const data = await getProvider(id);
          setFormData(data);
        } catch (error) {
          notifications.show(`Error al cargar proveedor: ${(error as Error).message}`, { severity: "error" });
        }
      };
      fetchProvider();
    }
  }, [id, isNew, notifications]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "El nombre es requerido";
    if (!formData.identification) newErrors.identification = "La cédula o Nit es requerida";
    if (!formData.contact_phone) newErrors.contact_phone = "El teléfono es requerido";
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
        const payload: Omit<Provider, "id"> = {
          ...formData,
          company_id: company?.id,
          user_id: user?.id,
        };
        await createProvider(payload);
        notifications.show("Proveedor creado correctamente", { severity: "success" });
      } else {
        const { id: _id, ...updatePayload } = formData;
        await updateProvider(id!, updatePayload);
        notifications.show("Proveedor actualizado correctamente", { severity: "success" });
      }
      navigate("/proveedores");
    } catch (error) {
      notifications.show(`Error al guardar proveedor: ${(error as Error).message}`, { severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <GoBackButton to="/proveedores" />
        <Typography variant="h4" component="h1">
          {isNew ? "Nuevo Proveedor" : "Editar Proveedor"}
        </Typography>
      </Stack>

      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              fullWidth
            />
            <TextField
              label="Cédula o Nit"
              name="identification"
              value={formData.identification}
              onChange={handleChange}
              error={!!errors.identification}
              helperText={errors.identification}
              required
              fullWidth
            />
            <TextField
              label="Teléfono"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              error={!!errors.contact_phone}
              helperText={errors.contact_phone}
              required
              fullWidth
            />
            <TextField
              label="Dirección"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
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
