"use client";

import React, { useState, useEffect } from "react";
import {
  FiLock,
  FiUnlock,
  FiShield,
  FiSearch,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiSmartphone,
  FiAward,
  FiUser
} from "react-icons/fi";

export default function DeviceLocksTab({ password, onActionSuccess }) {
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const fetchLocks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locks", {
        headers: { "x-admin-authorization": password }
      });
      const data = await res.json();
      if (data.success) {
        setLocks(data.locks || []);
      }
    } catch (e) {
      console.error("Failed to load device locks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocks();
  }, []);

  const handleAction = async (action, lock, extra = {}) => {
    const email = lock.boundEmail;
    if (action === "ban" && !confirm(`🚨 REMOTE KILL SWITCH\n\nBan device for ${email}?\nThis instantly terminates lock screen playback and locks the app.`)) {
      return;
    }
    if (action === "unlock" && !confirm(`Release 1-to-1 device bond for ${email}?\nThis frees the user to bind a new physical phone.`)) {
      return;
    }

    setProcessingId(lock._id);
    setStatusMsg("");
    try {
      const res = await fetch("/api/admin/locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify({ action, id: lock._id, email, ...extra })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || "Command executed.");
        setTimeout(() => setStatusMsg(""), 4000);
        fetchLocks();
        if (onActionSuccess) onActionSuccess();
      } else {
        alert("Action failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredLocks = locks.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (l.boundEmail && l.boundEmail.toLowerCase().includes(q)) ||
      (l.deviceModel && l.deviceModel.toLowerCase().includes(q)) ||
      (l.hardwareFingerprint && l.hardwareFingerprint.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (filter === "ACTIVE") return l.status === "ACTIVE" && !l.isBanned;
    if (filter === "VIP") return l.tier === "VIP";
    if (filter === "BANNED") return l.isBanned;
    return true;
  });

  const bannedCount = locks.filter((l) => l.isBanned).length;
  const vipCount = locks.filter((l) => l.tier === "VIP").length;
  const activeCount = locks.filter((l) => l.status === "ACTIVE" && !l.isBanned).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header Strip with Metrics */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiLock color="var(--accent-mint)" /> Device & Hardware Bonds
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Strict 1-to-1 Phone Hardware Binding • Remote Kill Switch • VIP Tier Overrides
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {statusMsg && (
            <span style={{ fontSize: "0.78rem", color: "var(--accent-mint)", background: "rgba(45, 212, 191, 0.1)", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(45, 212, 191, 0.25)" }}>
              {statusMsg}
            </span>
          )}
          <button
            onClick={fetchLocks}
            disabled={loading}
            className="btn-header"
            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
          >
            <FiRefreshCw className={loading ? "spin" : ""} size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
        <div className="mission-card" style={{ padding: "0.95rem 1.15rem" }}>
          <span style={{ fontSize: "0.74rem", color: "var(--text-sub)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Total Registered</span>
          <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>{locks.length}</span>
        </div>
        <div className="mission-card" style={{ padding: "0.95rem 1.15rem" }}>
          <span style={{ fontSize: "0.74rem", color: "var(--text-sub)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Active Bonds</span>
          <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-mint)", marginTop: "4px" }}>{activeCount}</span>
        </div>
        <div className="mission-card" style={{ padding: "0.95rem 1.15rem" }}>
          <span style={{ fontSize: "0.74rem", color: "var(--text-sub)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>VIP Members</span>
          <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#fbbf24", marginTop: "4px" }}>{vipCount}</span>
        </div>
        <div className="mission-card" style={{ padding: "0.95rem 1.15rem" }}>
          <span style={{ fontSize: "0.74rem", color: "var(--text-sub)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Banned Devices</span>
          <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-rose)", marginTop: "4px" }}>{bannedCount}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mission-card" style={{ padding: "0.85rem 1.15rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(13, 17, 24, 0.6)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", minWidth: "280px" }}>
          <FiSearch size={14} color="var(--text-sub)" />
          <input
            type="text"
            placeholder="Search email, model, or hardware hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "#ffffff", fontSize: "0.82rem", width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {["ALL", "ACTIVE", "VIP", "BANNED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "4px 10px",
                borderRadius: "6px",
                border: filter === f ? "1px solid var(--accent-mint)" : "1px solid rgba(255, 255, 255, 0.08)",
                background: filter === f ? "rgba(45, 212, 191, 0.12)" : "transparent",
                color: filter === f ? "var(--accent-mint)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="mission-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>User / Account</th>
                <th>Physical Device</th>
                <th>Hardware Fingerprint</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Bound Since</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-sub)" }}>
                    {loading ? "Loading device locks..." : "No matching device lock records found."}
                  </td>
                </tr>
              ) : (
                filteredLocks.map((lock) => {
                  const isBanned = lock.isBanned;
                  const isVip = lock.tier === "VIP";
                  const isProcessing = processingId === lock._id;

                  return (
                    <tr key={lock._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "rgba(45, 212, 191, 0.12)",
                            color: "var(--accent-mint)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            fontWeight: "700"
                          }}>
                            {lock.boundEmail ? lock.boundEmail[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "#ffffff", fontSize: "0.85rem" }}>
                              {lock.boundEmail || "Anonymous Guest"}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>
                              UID: {lock.boundUserId ? lock.boundUserId.substring(0, 10) + "..." : "Guest"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiSmartphone size={14} color="var(--accent-mint)" />
                          <span style={{ fontWeight: "500" }}>{lock.deviceBrand || "Android"} {lock.deviceModel || "Mobile"}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", color: "var(--text-sub)", background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>
                          {lock.hardwareFingerprint ? lock.hardwareFingerprint.substring(0, 16) + "..." : "Unknown"}
                        </span>
                      </td>

                      <td>
                        <span className={`status-pill ${isVip ? "vip" : ""}`}>
                          {isVip ? "★ VIP UNLIMITED" : lock.tier || "FREE"}
                        </span>
                      </td>

                      <td>
                        {isBanned ? (
                          <span className="status-pill banned">
                            ● BANNED
                          </span>
                        ) : lock.status === "ACTIVE" ? (
                          <span className="status-pill active">
                            ● ACTIVE BOND
                          </span>
                        ) : (
                          <span className="status-pill" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-sub)" }}>
                            {lock.status || "UNLOCKED"}
                          </span>
                        )}
                      </td>

                      <td style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                        {lock.firstBoundAt ? new Date(lock.firstBoundAt).toLocaleDateString() : "Recent"}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          {/* Kill Switch Toggle */}
                          <button
                            onClick={() => handleAction(isBanned ? "unban" : "ban", lock)}
                            disabled={isProcessing}
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              background: isBanned ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: isBanned ? "#34d399" : "var(--accent-rose)",
                              border: isBanned ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                            title={isBanned ? "Restore app access for this device" : "Instant remote kill switch"}
                          >
                            {isProcessing ? "..." : isBanned ? "Restore" : "Kill Switch"}
                          </button>

                          {/* VIP Tier Toggle */}
                          <button
                            onClick={() => handleAction("set-tier", lock, { tier: isVip ? "FREE" : "VIP" })}
                            disabled={isProcessing}
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              background: "rgba(245, 158, 11, 0.12)",
                              color: "#fbbf24",
                              border: "1px solid rgba(245, 158, 11, 0.25)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                            title={isVip ? "Demote to Free" : "Grant VIP Unlimited"}
                          >
                            {isVip ? "Revoke VIP" : "Grant VIP"}
                          </button>

                          {/* Release Device Lock */}
                          <button
                            onClick={() => handleAction("unlock", lock)}
                            disabled={isProcessing}
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: "600",
                              background: "rgba(255, 255, 255, 0.05)",
                              color: "var(--text-muted)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                            title="Release 1-to-1 lock to allow user to switch phones"
                          >
                            Release
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
