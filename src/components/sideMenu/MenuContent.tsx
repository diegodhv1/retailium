import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useAppRoutes } from "../../hooks/useAppRoutes";

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon />,
  inventory: <InventoryIcon />,
  shopping_cart: <ShoppingCartIcon />,
};

export default function MenuContent() {
  const { navRoutes } = useAppRoutes();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const handleToggle = (path: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <List sx={{ width: "100%", maxWidth: 360 }}>
      {navRoutes.map((route) => (
        <div key={route.path}>
          <ListItemButton
            onClick={() => {
              if (route.children && route.children.length > 0) {
                handleToggle(route.path);
              } else {
                handleNavigate(route.path);
              }
            }}
            selected={isActive(route.path)}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "action.selected",
                fontWeight: 400,
              },
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "text.secondary",
                minWidth: 40,
                fontSize: "1.2rem",
                "& svg": {
                  fontSize: "1.2rem",
                },
              }}
            >
              {iconMap[route.icon || ""]}
            </ListItemIcon>
            <ListItemText
              primary={route.label}
              sx={{
                "& .MuiTypography-root": {
                  fontSize: "0.95rem",
                },
              }}
            />
            {route.children && route.children.length > 0 && (
              <>
                {openMenus[route.path] ? (
                  <ExpandLess sx={{ fontSize: "1.2rem" }} />
                ) : (
                  <ExpandMore sx={{ fontSize: "1.2rem" }} />
                )}
              </>
            )}
          </ListItemButton>

          {route.children && route.children.length > 0 && (
            <Collapse in={openMenus[route.path]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {route.children.map((child) => (
                  <ListItemButton
                    key={child.path}
                    sx={{
                      pl: 4,
                      color: "text.secondary",
                      fontSize: "0.9rem",
                      "&:hover": {
                        color: "text.primary",
                      },
                    }}
                    onClick={() => handleNavigate(child.path)}
                    selected={isActive(child.path)}
                  >
                    <ListItemText
                      primary={child.label}
                      sx={{
                        "& .MuiTypography-root": {
                          fontSize: "0.9rem",
                        },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </div>
      ))}
    </List>
  );
}
