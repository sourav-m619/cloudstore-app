import React from "react";
import { Link } from "react-router-dom";
import { useHealth } from "../api/hooks";

const FEATURES = [
  { icon: "☸️",  title: "GKE Powered",        desc: "Private regional cluster — auto-scaling, multi-zone HA",     color: "#3b82f6" },
  { icon: "🔄",  title: "GitOps CI/CD",        desc: "GitHub Actions + ArgoCD — code to production in minutes",    color: "#22c55e" },
  { icon: "🛡️",  title: "Zero-Trust Security", desc: "Workload Identity, Network Policies, Trivy image scanning",  color: "#a855f7" },
  { icon: "🗄️",  title: "Cloud SQL HA",        desc: "PostgreSQL 15 — regional failover, automated backups",       color: "#f59e0b" },
];

const STACK = ["GKE","Terraform","GitHub Actions","ArgoCD","Cloud SQL","Prometheus","Workload Identity"];

export default function Home() {
  const { data: health, isError } = useHealth();

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 32px 64px" }}>
      {/* Status pill */}
      <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 28, fontSize: 12, fontWeight: 700, color: "#4ade80", letterSpacing: "0.05em" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: isError ? "#ef4444" : "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
        {isError ? "API OFFLINE" : "ALL SYSTEMS OPERATIONAL"}
      </div>

      {/* Hero */}
      <h1 className="fade-up" style={{ fontSize: "clamp(44px,7vw,88px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20, animationDelay: ".08s" }}>
        Cloud-Native<br />
        <span style={{ background: "linear-gradient(130deg,#3b82f6,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Commerce Platform
        </span>
      </h1>

      <p className="fade-up" style={{ fontSize: 17, color: "var(--text2)", maxWidth: 560, lineHeight: 1.75, marginBottom: 40, animationDelay: ".16s" }}>
        A production-grade 3-tier app on GKE. Terraform infrastructure, GitHub Actions CI/CD,
        ArgoCD GitOps, and Cloud SQL — the complete DevOps portfolio project.
      </p>

      <div className="fade-up" style={{ display: "flex", gap: 14, marginBottom: 72, animationDelay: ".24s" }}>
        <Link to="/products" className="btn btn-primary" style={{ padding: "13px 26px", fontSize: 15 }}>Browse Products →</Link>
        <Link to="/dashboard" className="btn btn-outline" style={{ padding: "13px 26px", fontSize: 15 }}>View Dashboard</Link>
      </div>

      {/* Tech strip */}
      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "14px 0", display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 72, background: "rgba(255,255,255,.01)" }}>
        {STACK.map((t) => (
          <span key={t} style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".1em", textTransform: "uppercase" }}>{t}</span>
        ))}
      </div>

      {/* Features */}
      <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, letterSpacing: "-.02em" }}>Built for Production</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
        {FEATURES.map(({ icon, title, desc, color }, i) => (
          <div key={title} className="card fade-up" style={{ padding: 28, animationDelay: `${.1 * i}s` }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>{icon}</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
