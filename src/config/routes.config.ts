export interface RouteConfig {
  path: string;
  label: string;
  icon?: string;
  requiredRole?: string[];
  children?: RouteConfig[];
  hideFromMenu?: boolean;
}

export const routesConfig: RouteConfig[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
  },
  {
    path: "/productos",
    label: "Productos",
    icon: "inventory",
  },
  {
    path: "/venta",
    label: "Ventas",
    icon: "shopping_cart",
  },
];
