import React from "react";
import toast from "react-hot-toast";
import { useOrders, useUpdateOrderStatus } from "../api/hooks";

const STATUS = {
  pending:   { label: "Pending",   cls: "badge-yellow", icon: "⏳" },
  confirmed: { label: "Confirmed", cls: "badge-blue",   icon: "✅" },
  shipped:   { label: "Shipped",   cls: "badge-purple", icon: "📦" },
  delivered: { label: "Delivered", cls: "badge-green",  icon: "🎉" },
  cancelled: { label: "Cancelled", cls: "badge-red",    icon: "❌" },
};

const NEXT = { pending: "confirmed", confirmed: "shipped", shipped: "delivered" };
const STEPS = ["pending","confirmed","shipped","delivered"];

const COLORS = { pending: "#f59e0b", confirmed: "#3b82f6", shipped: "#a855f7", delivered: "#22c55e", cancelled: "#ef4444" };

export default function Orders() {
  const { data, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const advance = async (order) => {
    const next = NEXT[order.status];
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ id: order.id, status: next });
      toast.success(`Order marked as ${next}`);
    } catch { toast.error("Update failed"); }
  };

  if (isLoading) return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
      {Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height: 130, marginBottom: 16 }} />)}
    </div>
  );

  const orders = data?.data ?? [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, marginBottom: 6 }}>Orders</h1>
      <p style={{ color: "var(--text2)", marginBottom: 36 }}>{orders.length} total orders</p>

      {!orders.length ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text3)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ fontSize: 18 }}>No orders yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order, i) => {
            const cfg   = STATUS[order.status] || STATUS.pending;
            const color = COLORS[order.status] || COLORS.pending;
            const cur   = STEPS.indexOf(order.status);
            return (
              <div key={order.id} className="card fade-up" style={{ padding: 24, animationDelay: `${i * .06}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
                        Order #{order.id.slice(0,8).toUpperCase()}
                      </h3>
                      <span className={`badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(order.items || []).filter(Boolean).map((item, j) => (
                        <span key={j} style={{ fontSize: 12, color: "var(--text2)", background: "var(--bg4)", padding: "3px 10px", borderRadius: 6 }}>
                          {item.product_name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--accent2)", marginBottom: 10 }}>
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    {NEXT[order.status] && (
                      <button className="btn btn-outline" style={{ fontSize: 11, padding: "6px 12px" }}
                        onClick={() => advance(order)} disabled={updateStatus.isPending}>
                        → Mark {NEXT[order.status]}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {STEPS.map((s, idx) => (
                      <div key={s} style={{ flex: 1, height: 3, borderRadius: 3, background: idx <= cur ? color : "var(--bg4)", transition: "background .4s" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {STEPS.map((s, idx) => (
                      <span key={s} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: idx <= cur ? "var(--text2)" : "var(--text3)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
