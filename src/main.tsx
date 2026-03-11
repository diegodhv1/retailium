import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import App from "./routes/App.tsx";
import NotificationsProvider from "./hooks/useNotifications/NotificationsProvider.tsx";
import DialogsProvider from "./hooks/useDialogs/DialogsProvider.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <NotificationsProvider>
        <DialogsProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </DialogsProvider>
      </NotificationsProvider>
    </StyledEngineProvider>
  </StrictMode>
);
