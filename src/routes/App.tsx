import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SignUp from "../SignUp";
import { useAppRoutes } from "../hooks/useAppRoutes";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Dashboard from "../components/Dashboard";
import ProductsList from "../components/Products";
import ProductForm from "../components/ProductForm";
import Sales from "../components/sales";
import ProductDetail from "../components/ProductDetail";

// Importar páginas
const pageComponents: Record<string, React.ReactNode> = {
  "/dashboard": <Dashboard />,
  "/productos": <ProductsList />,
  "/productos/nuevo": <ProductForm />,
  "/productos/:id": <ProductDetail />,
  "/venta": <Sales />,
};

export default function App() {
  const { flatRoutes } = useAppRoutes();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signIn" element={<SignUp />} />

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
