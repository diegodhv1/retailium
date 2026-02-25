import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import AppTheme from "../../theme/AppTheme";
import AppNavbar from "./sideMenu/AppNavbar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import SideMenu from "./sideMenu/SideMenu";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute(props: ProtectedRouteProps) {
  const { element, requiredRole } = props;
  const { user, loading } = useAuthUser();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signIn" replace />;
  }

  if (requiredRole && !requiredRole.includes(user?.role || "")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: "flex", minHeight: "100dvh" }}>
          <SideMenu />

          {/* main area: navbar on top, page content below */}
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              // space for the fixed AppBar (responsive: 56px mobile, 64px desktop)
              pt: { xs: "56px", md: "64px" },
              // leave space for the permanent Drawer (match width above)
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: "auto",
            })}
          >
            {/* AppNavbar fixed at top inside main so it's visible */}
            <Box sx={{ zIndex: 1200 }}>
              <AppNavbar />
            </Box>

            {/* page content */}
            <Stack
              spacing={2}
              sx={{
                alignItems: "stretch",
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
                flexGrow: 1,
              }}
            >
              {element}
            </Stack>
          </Box>
        </Box>
      </AppTheme>
    </>
  );
}
