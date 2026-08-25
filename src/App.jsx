import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import { useAuthStore } from "./stores/authStore";

function LoginRoute() {
  const token = useAuthStore((state) => state.token);
  return token ? <Navigate to="/products" replace /> : <LoginPage />;
}

function ProductsRoute() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return <ProductsPage user={user} onLogout={handleLogout} />;
}

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginRoute />} />
    <Route
      path="/products"
      element={
        <ProtectedRoute>
          <ProductsRoute />
        </ProtectedRoute>
      }
    />
    <Route path="/" element={<Navigate to="/products" replace />} />
    <Route path="*" element={<Navigate to="/products" replace />} />
  </Routes>
);

export default App;
