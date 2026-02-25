import { useMemo } from "react";
import { routesConfig, type RouteConfig } from "../config/routes.config";
import { useAuthUser } from "./useAuthUser";

export function useAppRoutes() {
  const { user } = useAuthUser();

  const flatRoutes = useMemo(() => {
    const flat: RouteConfig[] = [];

    const flatten = (routes: RouteConfig[]) => {
      routes.forEach((route) => {
        flat.push(route);
        if (route.children) {
          flatten(route.children);
        }
      });
    };

    flatten(routesConfig);
    return flat;
  }, []);

  const navRoutes = useMemo(() => {
    const filter = (routes: RouteConfig[]): RouteConfig[] => {
      return routes
        .filter((route) => {
          if (route.hideFromMenu) return false;
          if (!route.requiredRole) return true;
          return route.requiredRole.includes(user?.role || "");
        })
        .map((route) => ({
          ...route,
          children: route.children ? filter(route.children) : undefined,
        }));
    };

    return filter(routesConfig);
  }, [user?.role]);

  return { flatRoutes, navRoutes, allRoutes: routesConfig };
}
