import React, { useState, useEffect } from "react";
import { useHealth, useProducts, useOrders } from "../api/hooks";

const INFRA = [
  { icon: "☸️", label: "GKE Cluster",   value: "us-central1",    sub: "Regional • 3 zones",           badge: "HEALTHY", cls: "badge-green"  },
  { icon: "🗄️", label: "Cloud SQL",     value: "PostgreSQL 15",  sub: "HA • Auto-backup",             badge: "ONLINE",  cls: "badge-green"  },
  { icon: "🔄", label: "ArgoCD",        value: "GitOps Sync",    sub: "Last sync: 2 min ago",         badge: "SYNCED",  cls: "badge-blue"   },
  { icon: "🛡️", label: "Security",      value: "Zero-Trust",     sub: "Workload Identity active",     badge: "ENABLED", cls: "badge-purple" },
];

const TIERS = [
  { label: "Tier 1 — Frontend",    tech: "React 18 + nginx",     detail: "3 replicas • HPA(3–20) • PDB min:2", port: ":3000", color: "#3b82f6" },
  { label: "Tier 2 — Backend API", tech: "Node.js 20 Express",   detail: "3 replicas • HPA(3–20) • PDB min:2", port: ":8080", color: "#22c55e" },
  { label: "Tier 3 — Database",    tech: "Cloud SQL PostgreSQL",  detail: "HA • Private IP • Cloud SQL Proxy",  port: ":5432", color: "#a855f7" },
];

const PIPELINE = [
  { step: "Push to main branch",   time: "14:32:01" },
  { step: "Unit Tests (Jest)",      time: "14:32:18" },
  { step: "Trivy Security Scan",   time: "14:32:45" },
  { step: "Docker Build + Push",   time: "14:33:12" },
  { step: "Update GitOps Repo",    time: "14:33:14" },
  { step: "ArgoCD Sync → GKE",     time: "14:33:48" },
];

function Gauge({ label, value, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: "var(--text2)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: "var(--bg4)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const { data: health } = useHealth();
  const { data: products } = useProducts({ limit: 100 });
  const { data: orders }   = useOrders();

  const cpu = Math.round(32 + Math.sin(tick * .7) * 12);
  const mem = Math.round(61 + Math.sin(tick * .4) * 8);
  const rps = Math.round(142 + Math.sin(tick * .9) * 30);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, marginBottom: 6 }}>DevOps Dashboard</h1>
      <p style={{ color: "var(--text2)", marginBottom: 36 }}>Live system overview — GKE 3-Tier Application</p>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "API Status",    value: health ? "Online" : "Offline", icon: "💚", color: "#22c55e" },
          { label: "Requests/sec",  value: rps,                            icon: "⚡", color: "var(--accent2)" },
          { label: "Active Pods",   value: "9 / 9",                        icon: "☸️", color: "#a78bfa" },
          { label: "Products",      value: products?.pagination?.total ?? "—", icon: "📦", color: "#4ade80" },
          { label: "Total Orders",  value: orders?.data?.length ?? "—",    icon: "📋", color: "#fbbf24" },
          { label: "Uptime",        value: "99.97%",                       icon: "📈", color: "#22c55e" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>{label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Infra cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16, marginBottom: 28 }}>
        {INFRA.map(({ icon, label, value, sub, badge, cls }) => (
          <div key={label} className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>{icon}</span>
              <span className={`badge ${cls}`}>{badge}</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 11, color: "var(--text2)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {/* Architecture */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, marginBottom: 20 }}>Architecture</h3>
          {TIERS.map(({ label, tech, detail, port, color }, i) => (
            <div key={i}>
              <div style={{ padding: 14, borderRadius: 10, background: "var(--bg2)", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: color }} />
                <div style={{ paddingLeft: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>{label}</span>
                    <code style={{ fontSize: 10, color: "var(--accent)", background: "rgba(59,130,246,.1)", padding: "1px 6px", borderRadius: 4 }}>{port}</code>
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{tech}</p>
                  <p style={{ fontSize: 10, color: "var(--text3)" }}>{detail}</p>
                </div>
              </div>
              {i < TIERS.length - 1 && <div style={{ textAlign: "center", color: "var(--bg4)", fontSize: 16, lineHeight: "20px" }}>↕</div>}
            </div>
          ))}
        </div>

        {/* Live metrics */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Live Metrics</h3>
          <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 20 }}>Updates every 2s</p>
          <Gauge label="CPU Usage"    value={cpu} color="#3b82f6" />
          <Gauge label="Memory Usage" value={mem} color="#a855f7" />
          <Gauge label="Disk I/O"     value={47}  color="#22c55e" />
          <Gauge label="Network"      value={28}  color="#f59e0b" />
          <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 8, background: "rgba(59,130,246,.08)", border: "1px solid rgba(59,130,246,.15)" }}>
            <p style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600, marginBottom: 4 }}>HPA Status</p>
            <p style={{ fontSize: 13, fontWeight: 700 }}>3 pods <span style={{ color: "var(--text3)", fontWeight: 400 }}>/ 20 max</span></p>
          </div>
        </div>

        {/* CI/CD pipeline */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, marginBottom: 20 }}>Last CI/CD Run ✅</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PIPELINE.map(({ step, time }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: "var(--bg2)" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(34,197,94,.12)", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>✓</div>
                <span style={{ fontSize: 12, flex: 1, fontWeight: 500 }}>{step}</span>
                <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "monospace" }}>{time}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 8, background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.18)", fontSize: 12, color: "#4ade80", fontWeight: 700 }}>
            🚀 Deployed · Zero downtime rolling update
          </div>
        </div>
      </div>
    </div>
  );
}
