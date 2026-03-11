import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SharedModal from "../shared/SharedModal";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import { createCustomer, type Customer } from "../../services/customers";
import { useAuthUser } from "../../hooks/useAuthUser";

export interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

export default function CreateCustomerModal({
  open,
  onClose,
  onSuccess,
}: CreateCustomerModalProps) {
  const notifications = useNotifications();
  const { user } = useAuthUser();
  const [loading, setLoading] = React.useState(false);

  // Form state
  const [fullName, setFullName] = React.useState("");
  const [idNumber, setIdNumber] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Simple validation
  const isFormValid = fullName.trim() !== "" && idNumber.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setLoading(true);
      const newCustomer = await createCustomer({
        full_name: fullName.trim(),
        id_number: idNumber.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        user_id: user?.id,
      });

      notifications.show("Cliente creado exitosamente", { severity: "success" });
      onSuccess(newCustomer);
      handleClose(); // Reset and close
    } catch (err) {
      notifications.show(
        `Error creando cliente: ${(err as Error).message}`,
        { severity: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFullName("");
    setIdNumber("");
    setPhone("");
    setEmail("");
    onClose();
  };

  const actions = (
    <>
      <Button onClick={handleClose} disabled={loading} color="inherit">
        Cancelar
      </Button>
      <Button
        variant="contained"
        onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
        disabled={loading || !isFormValid}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        Crear Cliente
      </Button>
    </>
  );

  return (
    <SharedModal
      open={open}
      onClose={handleClose}
      title="Creación Rápida de Cliente"
      actions={actions}
      maxWidth="sm"
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Los campos marcados con * son obligatorios.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              required
              fullWidth
              label="Nombre Completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              required
              fullWidth
              label="Documento de Identidad (RUT/Cédula)"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </Box>
    </SharedModal>
  );
}
