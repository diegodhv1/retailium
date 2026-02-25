import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SelectContent from "./SelectContent";
import MenuContent from "./MenuContent";
import OptionsMenu from "./OptionsMenu";
import { useAuthUser } from "../../hooks/useAuthUser";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  const { fullName, user } = useAuthUser();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        // make the drawer start below the fixed AppBar and respect any template frame offset
        [`& .${drawerClasses.paper}`]: {
          position: "fixed",
          left: 0,
          // use AppBar heights: 56px on xs, 64px on md and up.
          // include --template-frame-height if present.
          top: {
            xs: "calc(var(--template-frame-height, 0px) + 56px)",
            md: "calc(var(--template-frame-height, 0px) + 64px)",
          },
          height: {
            xs: "calc(100dvh - (var(--template-frame-height, 0px) + 56px))",
            md: "calc(100dvh - (var(--template-frame-height, 0px) + 64px))",
          },
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          zIndex: (theme) => theme.zIndex?.drawer ?? 1000,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <SelectContent />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar sizes="small" alt={fullName} sx={{ width: 36, height: 36 }} />
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }}
          >
            {fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {user?.email}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
