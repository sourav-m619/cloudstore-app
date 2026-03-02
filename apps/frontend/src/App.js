import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar    from "./components/Navbar";
import Home      from "./pages/Home";
import Products  from "./pages/Products";
import Cart      from "./pages/Cart";
import Orders    from "./pages/Orders";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: 72 }}>
        <Routes>
          <Route path="/"          element={<Home />}      />
          <Route path="/products"  element={<Products />}  />
          <Route path="/cart"      element={<Cart />}      />
          <Route path="/orders"    element={<Orders />}    />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}
