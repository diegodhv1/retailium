import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import ColorModeSelect from "../theme/ColorModeSelect";
import AppTheme from "../theme/AppTheme";
import Card from "./components/card";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

const items = [
  {
    icon: <InventoryRoundedIcon sx={{ color: "text.primary" }} />,
    title: "Gestión Simplificada",
    description: "Control total sobre tus productos, clientes y proveedores en un solo lugar.",
  },
  {
    icon: <AssessmentRoundedIcon sx={{ color: "text.primary" }} />,
    title: "Análisis en Tiempo Real",
    description: "Visualiza el rendimiento de tu negocio con reportes y analíticas instantáneas.",
  },
  {
    icon: <AccountTreeRoundedIcon sx={{ color: "text.primary" }} />,
    title: "Control de Sucursales",
    description: "Administra todas tus sedes y puntos de venta de forma centralizada y eficiente.",
  },
  {
    icon: <VerifiedUserRoundedIcon sx={{ color: "text.primary" }} />,
    title: "Seguridad Garantizada",
    description: "Tu información comercial protegida con los más altos estándares de seguridad.",
  },
];

function Content() {
  return (
    <Stack
      sx={{ flexDirection: "column", alignSelf: "center", gap: 4, maxWidth: 450 }}
    >
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
        <BusinessRoundedIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="span" fontWeight="bold">
          Retailium
        </Typography>
      </Box>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: "medium" }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const navigate = useNavigate();

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Por favor ingrese un correo válido.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailError || passwordError) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    const { error } = await supabase.auth.signInWithPassword({
      email: email as string,
      password: password as string,
    });

    if (error) {
      console.error("Error al iniciar sesión:", error.message);
      setEmailError(true);
      setEmailErrorMessage("Credenciales inválidas.");
    } else {
      navigate("/dashboard");
      console.log("Sesión iniciada correctamente");
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <SignInContainer direction="column" justifyContent="space-between">
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          sx={{
            justifyContent: "center",
            gap: { xs: 6, md: 12 },
            p: 2,
            m: "auto",
          }}
        >
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Content />
          </Box>
          <Card>
            <Typography
              component="h1"
              variant="h4"
              sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
            >
              Iniciar sesión
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <FormControl>
                <FormLabel htmlFor="email">Correo electrónico</FormLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="tu@correo.com"
                  name="email"
                  autoComplete="email"
                  variant="outlined"
                  error={emailError}
                  helperText={emailErrorMessage}
                  color={emailError ? "error" : "primary"}
                />
              </FormControl>
              <FormControl>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <FormLabel htmlFor="password">Contraseña</FormLabel>
                </Box>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  variant="outlined"
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  color={passwordError ? "error" : "primary"}
                />
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={validateInputs}
                sx={{ mt: 1 }}
              >
                Entrar
              </Button>
            </Box>
          </Card>
        </Stack>
      </SignInContainer>
    </AppTheme>
  );
}
