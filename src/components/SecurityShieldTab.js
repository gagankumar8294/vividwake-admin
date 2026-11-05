"use client";

import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiCpu,
  FiActivity,
  FiCheckCircle,
  FiAlertOctagon,
  FiRefreshCw,
  FiLock,
  FiClock
} from "react-icons/fi";

export default function SecurityShieldTab({ password }) {
  const [backendHealth, setBackendHealth] = useState("CHECKING");
  const [latency, setLatency] = useState(null);

  const checkHealth = async () => {
    setBackendHealth("CHECKING");
    const start = performance.now();
    try {
      const res = await fetch("/api/analytics?limit=1", {
        headers: { "x-admin-authorization": password }
      });
      const end = performance.now();
      if (res.ok) {
        setBackendHealth("ONLINE");
        setLatency(Math.round(end - start));
      } else {
        setBackendHealth("DEGRADED");
      }
    } catch (e) {
      setBackendHealth("OFFLINE");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiShield color="var(--accent-mint)" /> CDN Bot Shield & Rate Limiting Engine
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Active token-bucket scraper defense and multi-tier cryptographic integrity status
          </p>
        </div>

        <button onClick={checkHealth} className="btn-header" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
          <FiRefreshCw size={12} />
          <span>Ping Engine</span>
        </button>
      </div>

      {/* Grid of Security Defenses */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {/* Token-Bucket CDN Shield */}
        <div className="mission-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiCpu color="var(--accent-mint)" size={18} />
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#ffffff" }}>Token-Bucket Shield</span>
            <span className="status-pill active" style={{ marginLeft: "auto" }}>ENFORCED</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
            Blocks automated scraper bots from draining CDN video bandwidth.
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-sub)" }}>Burst Capacity:</span>
            <span style={{ fontWeight: "700", color: "#ffffff" }}>40 tokens / IP</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-sub)" }}>Refill Rate:</span>
            <span style={{ fontWeight: "700", color: "var(--accent-mint)" }}>+1 token / second</span>
          </div>
        </div>

        {/* 1-Phone = 1-Email Hardware Binding */}
        <div className="mission-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiLock color="#facc15" size={18} />
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#ffffff" }}>Hardware Lock</span>
            <span className="status-pill active" style={{ marginLeft: "auto" }}>STRICT 1:1</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
            SHA-256 Android ID + Hardware Fingerprint binding prevents 10 friends sharing a single Google account.
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-sub)" }}>Multi-Device Login:</span>
            <span style={{ fontWeight: "700", color: "var(--accent-rose)" }}>Instantly Blocked (403)</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-sub)" }}>Rebind Protocol:</span>
            <span style={{ fontWeight: "700", color: "#facc15" }}>Admin Queue Approval</span>
          </div>
        </div>

        {/* Monotonic Clock & DRM Scramble */}
        <div className="mission-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiClock color="#38bdf8" size={18} />
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#ffffff" }}>Anti-Rollback & DRM</span>
            <span className="status-pill active" style={{ marginLeft: "auto" }}>PROTECTED</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
            Hardware uptime clock + in-place 1KB XOR scrambling protects video assets from extraction.
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-sub)" }}>Offline Lease:</span>
            <span style={{ fontWeight: "700", color: "#ffffff" }}>48-Hour Hard Max</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-sub)" }}>Calendar Rollback:</span>
            <span style={{ fontWeight: "700", color: "var(--accent-rose)" }}>Detected & Revoked</span>
          </div>
        </div>
      </div>

      {/* Engine Status Card */}
      <div className="mission-card">
        <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiActivity color="var(--accent-mint)" /> Backend Cluster Status
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: backendHealth === "ONLINE" ? "#34d399" : backendHealth === "CHECKING" ? "#facc15" : "#ef4444",
              boxShadow: backendHealth === "ONLINE" ? "0 0 10px #34d399" : "none"
            }} />
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#ffffff" }}>
              API Cluster: {backendHealth}
            </span>
          </div>

          {latency !== null && (
            <span style={{ fontSize: "0.78rem", color: "var(--text-sub)", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: "4px" }}>
              Latency: {latency}ms
            </span>
          )}

          <span style={{ fontSize: "0.78rem", color: "var(--text-sub)", marginLeft: "auto" }}>
            MongoDB Atlas (vividwake) • Node.js Express 5.0 • Next.js 14 Mission Control
          </span>
        </div>
      </div>
    </div>
  );
}
