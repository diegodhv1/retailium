import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SignIn from "../SignIn";
import { useAppRoutes } from "../hooks/useAppRoutes";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Dashboard from "../components/Dashboard";
import ProductsList from "../components/Products";
import Sales from "../components/sales";
import ProductDetail from "../components/ProductDetail";
import ProductCreate from "../components/Products/create";
import CustomersList from "../components/Customers";
import CustomerEdit from "../components/Customers/edit";
import ProvidersList from "../components/Providers";
import ProviderEdit from "../components/Providers/edit";

// Importar páginas
const pageComponents: Record<string, React.ReactNode> = {
  "/dashboard": <Dashboard />,
  "/productos": <ProductsList />,
  "/productos/nuevo": <ProductCreate />,
  "/productos/:id": <ProductDetail />,
  "/venta": <Sales />,
  "/clientes": <CustomersList />,
  "/clientes/:id": <CustomerEdit />,
  "/clientes/nuevo": <CustomerEdit />,
  "/proveedores": <ProvidersList />,
  "/proveedores/:id": <ProviderEdit />,
  "/proveedores/nuevo": <ProviderEdit />,
};

export default function App() {
  const { flatRoutes } = useAppRoutes();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signIn" element={<SignIn />} />

        {flatRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute
                element={pageComponents[route.path]}
                requiredRole={route.requiredRole}
              />
            }
          />
        ))}
      </Routes>
    </Router>
  );
}
