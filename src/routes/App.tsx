import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SignUp from "../SignUp";
import Dashboard from "../components/dashboard/Dashboard";
import ProductForm from "../components/ProductForm/ProductForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signIn" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/createProduct"
          element={
            <ProductForm
              formState={{ values: {}, errors: {} }}
              onSubmit={async () => Promise.resolve()}
              onFieldChange={() => {}}
              submitButtonLabel="Create Product"
            />
          }
        />
      </Routes>
    </Router>
  );
}
