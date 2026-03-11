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
  {
    path: "/clientes",
    label: "Clientes",
    icon: "people",
    children: [
      {
        path: "/clientes/:id",
        label: "Detalle",
        hideFromMenu: true,
      },
      {
        path: "/clientes/nuevo",
        label: "Nuevo Cliente",
        hideFromMenu: true,
      }
    ]
  },
  {
    path: "/proveedores",
    label: "Proveedores",
    icon: "local_shipping",
    children: [
      {
        path: "/proveedores/:id",
        label: "Detalle",
        hideFromMenu: true,
      },
      {
        path: "/proveedores/nuevo",
        label: "Nuevo Proveedor",
        hideFromMenu: true,
      }
    ]
  }
];
