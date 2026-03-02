import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { useCreateOrder } from "../api/hooks";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, total } = useCartStore();
  const createOrder = useCreateOrder();
  const navigate    = useNavigate();
  const [address, setAddress] = useState({
    street: "123 Cloud Ave", city: "San Francisco", state: "CA", zip: "94105", country: "US",
  });

  const checkout = async () => {
    try {
      await createOrder.mutateAsync({
        user_id: DEMO_USER_ID,
        items:   items.map((i) => ({ product_id: i.id, quantity: i.qty })),
        shipping_address: address,
      });
      toast.success("Order placed! 🎉");
      clearCart();
      navigate("/orders");
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    }
  };

  if (!items.length) return (
    <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 32px" }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>🛒</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: "var(--text2)", marginBottom: 32 }}>Add some products to get started</p>
      <Link to="/products" className="btn btn-primary" style={{ padding: "12px 24px" }}>← Browse Products</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, marginBottom: 6 }}>Cart</h1>
      <p style={{ color: "var(--text2)", marginBottom: 36 }}>{items.length} item{items.length !== 1 ? "s" : ""}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: 18, display: "flex", gap: 18, alignItems: "center" }}>
              <img src={item.image_url} alt={item.name} style={{ width: 76, height: 76, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{item.name}</h3>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>{item.category}</span>
              </div>
              {/* Qty controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg4)", borderRadius: 8, padding: "7px 14px" }}>
                <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>−</button>
                <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>+</button>
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--accent2)", minWidth: 80, textAlign: "right" }}>${(item.price * item.qty).toFixed(2)}</span>
              <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text3)", transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = "#ef4444"}
                onMouseLeave={e => e.target.style.color = "var(--text3)"}>✕</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: 26, position: "sticky", top: 90, alignSelf: "flex-start" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, marginBottom: 22 }}>Order Summary</h3>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>Shipping Address</p>
          {Object.entries(address).map(([k, v]) => (
            <input key={k} placeholder={k.charAt(0).toUpperCase() + k.slice(1)} value={v}
              onChange={e => setAddress({ ...address, [k]: e.target.value })}
              style={{ marginBottom: 8, fontSize: 13 }} />
          ))}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, margin: "16px 0" }}>
            {items.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>
                <span>{i.name} × {i.qty}</span>
                <span>${(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, marginBottom: 20 }}>
            <span>Total</span>
            <span style={{ color: "var(--accent2)" }}>${total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 14 }}
            onClick={checkout} disabled={createOrder.isPending}>
            {createOrder.isPending ? "Placing Order..." : "Place Order →"}
          </button>
        </div>
      </div>
    </div>
  );
}
