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
  FiUser,
  FiTrash2,
  FiX,
  FiList,
  FiGrid,
  FiClock
} from "react-icons/fi";
import { useModal } from "@/components/ModalContext";

export default function DeviceLocksTab({ password, onActionSuccess }) {
  const { showConfirm, showAlert } = useModal();
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'cards'
  const [processingId, setProcessingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeInput, setPurgeInput] = useState("");
  const [purgingDirect, setPurgingDirect] = useState(false);

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

    if (action === "ban") {
      const ok = await showConfirm({
        title: "Activate Remote Kill Switch",
        message: `Ban device for ${email}?\n\nThis immediately terminates lock screen playback and locks the mobile application.`,
        confirmText: "Activate Kill Switch",
        variant: "danger"
      });
      if (!ok) return;
    }

    if (action === "unlock") {
      const ok = await showConfirm({
        title: "Release 1-to-1 Device Bond",
        message: `Release hardware lock bond for ${email}?\n\nThis frees the user to bind a new physical phone.`,
        confirmText: "Release Bond",
        variant: "warning"
      });
      if (!ok) return;
    }

    if (action === "purge-user") {
      const ok = await showConfirm({
        title: "Permanent User & Hardware Purge",
        message: `Entirely delete all database records for:\nEmail: ${email || "None"}\nDevice: ${lock.hardwareFingerprint || "Unknown"}\n\nThis will permanently delete:\n• 1-to-1 Phone Hardware Lock\n• All session analytics & telemetry logs\n• VIP and wallpaper access rights\n\nThe user will be able to register fresh from the start as a brand-new customer.`,
        confirmText: "Purge Permanently",
        variant: "danger"
      });
      if (!ok) return;
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
        body: JSON.stringify({
          action,
          id: lock._id,
          email,
          hardwareFingerprint: lock.hardwareFingerprint,
          userId: lock.boundUserId,
          ...extra
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || "Command executed.");
        setTimeout(() => setStatusMsg(""), 5000);
        fetchLocks();
        if (onActionSuccess) onActionSuccess();
      } else {
        await showAlert({
          title: "Action Failed",
          message: data.error || "Unknown error occurred",
          variant: "danger"
        });
      }
    } catch (e) {
      await showAlert({
        title: "Error",
        message: e.message,
        variant: "danger"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDirectPurge = async (e) => {
    if (e) e.preventDefault();
    const query = purgeInput.trim();
    if (!query) return;

    const ok = await showConfirm({
      title: "Permanent User & Device Purge",
      message: `Purge all database records matching:\n"${query}"\n\nThis will delete device locks and session logs so this account/device can register fresh from the start.`,
      confirmText: "Confirm Permanent Deletion",
      variant: "danger"
    });
    if (!ok) return;

    setPurgingDirect(true);
    setStatusMsg("");
    try {
      const payload = {
        action: "purge-user",
        email: query.includes("@") ? query : undefined,
        hardwareFingerprint: !query.includes("@") ? query : undefined
      };

      const res = await fetch("/api/admin/locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || "User purged successfully.");
        setTimeout(() => setStatusMsg(""), 5000);
        setShowPurgeModal(false);
        setPurgeInput("");
        fetchLocks();
        if (onActionSuccess) onActionSuccess();
      } else {
        await showAlert({
          title: "Purge Failed",
          message: data.error || "Unknown error occurred",
          variant: "danger"
        });
      }
    } catch (err) {
      await showAlert({
        title: "Purge Error",
        message: err.message,
        variant: "danger"
      });
    } finally {
      setPurgingDirect(false);
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
            onClick={() => setShowPurgeModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              padding: "6px 12px",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontWeight: "600",
              cursor: "pointer"
            }}
            title="Purge user and device from DB by Email or Hardware Fingerprint"
          >
            <FiTrash2 size={13} />
            <span>Purge User Account</span>
          </button>
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* View Mode Toggle (List vs Cards) */}
          <div style={{ display: "inline-flex", background: "rgba(13, 17, 24, 0.7)", borderRadius: "8px", padding: "2px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background: viewMode === "list" ? "rgba(45, 212, 191, 0.15)" : "transparent",
                color: viewMode === "list" ? "var(--accent-mint)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              title="Table List View"
            >
              <FiList size={13} />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background: viewMode === "cards" ? "rgba(45, 212, 191, 0.15)" : "transparent",
                color: viewMode === "cards" ? "var(--accent-mint)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              title="Card Grid View"
            >
              <FiGrid size={13} />
              <span>Cards</span>
            </button>
          </div>

          {/* Filter Pills */}
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
      </div>

      {/* Main Content: Table or Card Grid */}
      {viewMode === "list" ? (
        <div className="mission-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th style={{ width: "45px", textAlign: "center" }}>#</th>
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
                    <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-sub)" }}>
                      {loading ? "Loading device locks..." : "No matching device lock records found."}
                    </td>
                  </tr>
                ) : (
                  filteredLocks.map((lock, idx) => {
                    const isBanned = lock.isBanned;
                    const isVip = lock.tier === "VIP";
                    const isProcessing = processingId === lock._id;

                    return (
                      <tr key={lock._id}>
                        <td style={{ textAlign: "center", color: "var(--text-sub)", fontSize: "0.75rem", fontWeight: "700" }}>
                          #{idx + 1}
                        </td>
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
                            {isVip ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <FiAward size={12} /> VIP UNLIMITED
                              </span>
                            ) : (
                              lock.tier || "FREE"
                            )}
                          </span>
                        </td>

                        <td>
                          {isBanned ? (
                            <span className="status-pill banned">
                              <FiShield size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> BANNED
                            </span>
                          ) : lock.status === "ACTIVE" ? (
                            <span className="status-pill active">
                              <FiCheckCircle size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> ACTIVE BOND
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

                            {/* Purge / Delete User Completely */}
                            <button
                              onClick={() => handleAction("purge-user", lock)}
                              disabled={isProcessing}
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: "700",
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              title="Permanently erase user and lock from database so they can re-register from scratch"
                            >
                              <FiTrash2 size={11} />
                              <span>Purge</span>
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
      ) : (
        /* Card Grid View */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {filteredLocks.length === 0 ? (
            <div className="mission-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-sub)" }}>
              {loading ? "Loading device locks..." : "No matching device lock records found."}
            </div>
          ) : (
            filteredLocks.map((lock, idx) => {
              const isBanned = lock.isBanned;
              const isVip = lock.tier === "VIP";
              const isProcessing = processingId === lock._id;

              return (
                <div
                  key={lock._id}
                  className="mission-card"
                  style={{
                    padding: "1.15rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.9rem",
                    border: isBanned ? "1px solid rgba(239, 68, 68, 0.35)" : isVip ? "1px solid rgba(251, 191, 36, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                    position: "relative"
                  }}
                >
                  {/* Card Header: # Serial and Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-mint)", background: "rgba(45, 212, 191, 0.1)", padding: "2px 8px", borderRadius: "5px", border: "1px solid rgba(45, 212, 191, 0.2)" }}>
                      #{idx + 1}
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className={`status-pill ${isVip ? "vip" : ""}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                        {isVip ? <><FiAward size={11} style={{ marginRight: 2 }} /> VIP</> : lock.tier || "FREE"}
                      </span>
                      {isBanned ? (
                        <span className="status-pill banned" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                          <FiShield size={10} style={{ marginRight: 2 }} /> BANNED
                        </span>
                      ) : (
                        <span className="status-pill active" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                          <FiCheckCircle size={10} style={{ marginRight: 2 }} /> ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(45, 212, 191, 0.15)",
                      color: "var(--accent-mint)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      flexShrink: 0
                    }}>
                      {lock.boundEmail ? lock.boundEmail[0].toUpperCase() : "U"}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontWeight: "700", color: "#ffffff", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lock.boundEmail || "Anonymous Guest"}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-sub)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FiSmartphone size={11} color="var(--accent-mint)" />
                        <span>{lock.deviceBrand || "Android"} {lock.deviceModel || "Mobile"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hardware Fingerprint Chip */}
                  <div style={{ background: "rgba(0, 0, 0, 0.35)", padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-sub)", textTransform: "uppercase", fontWeight: "600" }}>Hardware Hash</div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lock.hardwareFingerprint || "Unknown"}
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "var(--text-sub)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <FiClock size={11} /> Bound: {lock.firstBoundAt ? new Date(lock.firstBoundAt).toLocaleDateString() : "Recent"}
                    </span>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "auto", paddingTop: "6px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <button
                      onClick={() => handleAction(isBanned ? "unban" : "ban", lock)}
                      disabled={isProcessing}
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        background: isBanned ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: isBanned ? "#34d399" : "var(--accent-rose)",
                        border: isBanned ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                    >
                      <FiShield size={11} />
                      <span>{isProcessing ? "..." : isBanned ? "Restore" : "Kill Switch"}</span>
                    </button>

                    <button
                      onClick={() => handleAction("set-tier", lock, { tier: isVip ? "FREE" : "VIP" })}
                      disabled={isProcessing}
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        background: "rgba(245, 158, 11, 0.12)",
                        color: "#fbbf24",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                    >
                      <FiAward size={11} />
                      <span>{isVip ? "Revoke VIP" : "Grant VIP"}</span>
                    </button>

                    <button
                      onClick={() => handleAction("unlock", lock)}
                      disabled={isProcessing}
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "600",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text-muted)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                    >
                      <FiUnlock size={11} />
                      <span>Release</span>
                    </button>

                    <button
                      onClick={() => handleAction("purge-user", lock)}
                      disabled={isProcessing}
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                    >
                      <FiTrash2 size={11} />
                      <span>Purge</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Manual User & Hardware Purge Modal */}
      {showPurgeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem"
          }}
        >
          <div
            className="mission-card"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "1.5rem",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "6px", borderRadius: "8px" }}>
                  <FiTrash2 size={18} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                  Purge User Completely
                </h3>
              </div>
              <button
                onClick={() => setShowPurgeModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-sub)", cursor: "pointer", padding: "4px" }}
              >
                <FiX size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--text-sub)", lineHeight: "1.45", marginBottom: "1.25rem" }}>
              Enter the target user&apos;s Google Email or Device Hardware Fingerprint. All device bonds, session logs, and permissions will be permanently purged from the database, allowing the user to register fresh from the start.
            </p>

            <form onSubmit={handleDirectPurge} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#ffffff", marginBottom: "6px" }}>
                  Google Email or Hardware Fingerprint
                </label>
                <input
                  type="text"
                  placeholder="e.g. user@gmail.com or a1b2c3d4..."
                  value={purgeInput}
                  onChange={(e) => setPurgeInput(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    background: "rgba(13, 17, 24, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "10px 12px", fontSize: "0.75rem", color: "#fca5a5", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <FiAlertTriangle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span><strong>Warning:</strong> This cannot be undone. All active locks, session flows, and preferences for this account/hardware will be erased immediately.</span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowPurgeModal(false)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!purgeInput.trim() || purgingDirect}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    background: "#ef4444",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    opacity: !purgeInput.trim() || purgingDirect ? 0.6 : 1
                  }}
                >
                  {purgingDirect ? "Purging..." : "Confirm & Delete Completely"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
