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
    children: [
      {
        path: "/productos/nuevo",
        label: "Nuevo Producto",
        hideFromMenu: true,
      },
      {
        path: "/productos/:id",
        label: "Detalle",
        hideFromMenu: true,
      },
    ],
  },
  {
    path: "/venta",
    label: "Ventas",
    icon: "shopping_cart",
  },
];
