import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";

const App = () => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? {} : null; // đã có token thì coi như đăng nhập, chưa lưu thông tin user
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u || {})} />;
  }

  return <ProductsPage user={user} onLogout={handleLogout} />;
};

export default App;
