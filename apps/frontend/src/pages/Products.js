import React, { useState } from "react";
import toast from "react-hot-toast";
import { useProducts } from "../api/hooks";
import { useCartStore } from "../store/cartStore";

const CATS = ["All","Electronics","Accessories","Audio"];

function ProductCard({ p, onAdd }) {
  return (
    <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 170, background: "linear-gradient(135deg,var(--bg2),var(--bg4))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"} />
        {p.stock > 0 && p.stock <= 5 && <span className="badge badge-yellow" style={{ position: "absolute", top: 10, right: 10 }}>Low Stock</span>}
        {p.stock === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#ef4444", letterSpacing: ".1em" }}>OUT OF STOCK</div>}
      </div>
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        <span className="badge badge-blue" style={{ alignSelf: "flex-start", marginBottom: 10 }}>{p.category}</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{p.name}</h3>
        <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{p.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--accent2)" }}>${parseFloat(p.price).toFixed(2)}</span>
            <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 7 }}>{p.stock} left</span>
          </div>
          <button className="btn btn-primary" style={{ padding: "7px 13px", fontSize: 12 }}
            onClick={() => { onAdd(p); toast.success(`${p.name} added!`); }}
            disabled={p.stock === 0}>
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [cat,    setCat]    = useState("All");
  const [page,   setPage]   = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading } = useProducts({
    ...(search && { search }),
    ...(cat !== "All" && { category: cat }),
    page, limit: 12,
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, marginBottom: 6 }}>Products</h1>
      <p style={{ color: "var(--text2)", marginBottom: 32 }}>{data?.pagination?.total ?? "—"} products available</p>

      <div style={{ display: "flex", gap: 14, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 14 }}>🔍</span>
          <input style={{ paddingLeft: 40 }} placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {CATS.map(c => <button key={c} className={`btn btn-ghost ${cat === c ? "active" : ""}`} onClick={() => { setCat(c); setPage(1); }}>{c}</button>)}
        </div>
      </div>

      {isLoading ? (
        <div className="product-grid">{Array(8).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height: 360 }} />)}</div>
      ) : !data?.data?.length ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text3)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p style={{ fontSize: 18 }}>No products found</p>
        </div>
      ) : (
        <div className="product-grid">
          {data.data.map((p) => <ProductCard key={p.id} p={p} onAdd={addItem} />)}
        </div>
      )}

      {data?.pagination?.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`btn ${page === p ? "btn-primary" : "btn-ghost"}`} style={{ minWidth: 40, padding: "8px 14px" }} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
