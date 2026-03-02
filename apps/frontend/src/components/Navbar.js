import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

const LINKS = [
  { to: "/",          label: "Home"      },
  { to: "/products",  label: "Products"  },
  { to: "/orders",    label: "Orders"    },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { pathname }  = useLocation();
  const itemCount     = useCartStore((s) => s.itemCount);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 72, display: "flex", alignItems: "center", padding: "0 32px",
      background: scrolled ? "rgba(8,12,20,0.95)" : "rgba(8,12,20,0.6)",
      backdropFilter: "blur(20px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition: "all .3s",
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em" }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, boxShadow: "0 0 20px rgba(59,130,246,.35)" }}>C</div>
        CloudStore
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to} style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            color: pathname === to ? "var(--accent2)" : "var(--text2)",
            background: pathname === to ? "rgba(59,130,246,.12)" : "transparent",
            transition: "all .2s",
          }}>{label}</Link>
        ))}

        {/* Cart */}
        <Link to="/cart" style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          color: "white", background: "var(--accent)", marginLeft: 8,
          position: "relative", transition: "all .2s",
        }}>
          🛒 Cart
          {itemCount > 0 && (
            <span style={{
              position: "absolute", top: -7, right: -7,
              width: 20, height: 20, borderRadius: "50%",
              background: "#ef4444", fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{itemCount}</span>
          )}
        </Link>
      </div>
    </nav>
  );
}
