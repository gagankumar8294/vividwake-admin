"use client";

import React, { useState, useEffect } from "react";
import {
  FiSmartphone,
  FiArrowRight,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck
} from "react-icons/fi";

export default function TransfersTab({ password, onActionSuccess }) {
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(false);
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
      console.error("Failed to load transfer requests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocks();
  }, []);

  const handleTransfer = async (action, lock) => {
    const isApprove = action === "approve-transfer";
    const promptText = isApprove
      ? `Approve device transfer for ${lock.boundEmail} to ${lock.transferRequest?.newDeviceModel || "new phone"}?`
      : `Reject device transfer for ${lock.boundEmail}?`;

    if (!confirm(promptText)) return;

    setProcessingId(lock._id);
    setStatusMsg("");
    try {
      const res = await fetch("/api/admin/locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify({ action, id: lock._id, email: lock.boundEmail })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || (isApprove ? "Transfer approved!" : "Transfer rejected."));
        setTimeout(() => setStatusMsg(""), 4500);
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

  const pendingTransfers = locks.filter(
    (l) => l.transferRequest && l.transferRequest.status === "PENDING"
  );
  const resolvedTransfers = locks.filter(
    (l) => l.transferRequest && (l.transferRequest.status === "APPROVED" || l.transferRequest.status === "REJECTED")
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header Strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiSmartphone color="var(--accent-mint)" /> Device Rebind Approvals
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Authorize legitimate users moving to new phones while blocking shared accounts
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

      {/* Pending Queue Section */}
      <div className="mission-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiClock color="#facc15" /> Pending Approval Queue ({pendingTransfers.length})
          </h3>
          {pendingTransfers.length > 0 && (
            <span className="status-pill pending">
              Action Required
            </span>
          )}
        </div>

        {pendingTransfers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-sub)" }}>
            <FiCheckCircle size={32} color="var(--accent-mint)" style={{ margin: "0 auto 0.75rem auto", display: "block" }} />
            <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#ffffff" }}>All Transfer Requests Cleared</div>
            <div style={{ fontSize: "0.78rem", marginTop: "4px" }}>No legitimate users are waiting for phone rebind authorization.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pendingTransfers.map((lock) => {
              const req = lock.transferRequest;
              const isProcessing = processingId === lock._id;

              return (
                <div
                  key={lock._id}
                  style={{
                    background: "rgba(13, 17, 24, 0.7)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    borderRadius: "10px",
                    padding: "1.15rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ fontSize: "0.92rem", fontWeight: "700", color: "#ffffff" }}>
                        {lock.boundEmail}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", marginTop: "2px" }}>
                        Reason: &ldquo;{req.reason || "User requested device switch"}&rdquo;
                      </div>
                    </div>

                    <span style={{ fontSize: "0.72rem", color: "#facc15", background: "rgba(234, 179, 8, 0.12)", padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(234, 179, 8, 0.25)" }}>
                      Requested: {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : "Recently"}
                    </span>
                  </div>

                  {/* Device Comparison Strip */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: "1rem",
                    background: "rgba(0,0,0,0.25)",
                    padding: "0.85rem",
                    borderRadius: "8px"
                  }}>
                    {/* Old Device */}
                    <div>
                      <div style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "var(--text-sub)", fontWeight: "600" }}>
                        Currently Registered Phone
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff", marginTop: "2px" }}>
                        {lock.deviceBrand || "Android"} {lock.deviceModel || "Mobile"}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-sub)", fontFamily: "JetBrains Mono" }}>
                        {lock.hardwareFingerprint ? lock.hardwareFingerprint.substring(0, 14) + "..." : "Unknown"}
                      </div>
                    </div>

                    <FiArrowRight size={20} color="var(--accent-mint)" />

                    {/* New Requested Device */}
                    <div>
                      <div style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "#facc15", fontWeight: "600" }}>
                        New Target Phone
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff", marginTop: "2px" }}>
                        {req.newDeviceBrand || "Android"} {req.newDeviceModel || "Mobile"}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-sub)", fontFamily: "JetBrains Mono" }}>
                        {req.newHardwareFingerprint ? req.newHardwareFingerprint.substring(0, 14) + "..." : "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={() => handleTransfer("reject-transfer", lock)}
                      disabled={isProcessing}
                      style={{
                        padding: "6px 14px",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                        background: "rgba(239, 68, 68, 0.12)",
                        color: "var(--accent-rose)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      {isProcessing ? "..." : "Reject Request"}
                    </button>

                    <button
                      onClick={() => handleTransfer("approve-transfer", lock)}
                      disabled={isProcessing}
                      style={{
                        padding: "6px 16px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      {isProcessing ? "Processing..." : "Approve Rebind"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Transfers History */}
      {resolvedTransfers.length > 0 && (
        <div className="mission-card">
          <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff" }}>
            Recent Transfer Decisions ({resolvedTransfers.length})
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Current Phone</th>
                  <th>Decision</th>
                  <th>Decision Date</th>
                </tr>
              </thead>
              <tbody>
                {resolvedTransfers.map((l) => (
                  <tr key={l._id}>
                    <td>{l.boundEmail}</td>
                    <td>{l.deviceBrand} {l.deviceModel}</td>
                    <td>
                      <span className={`status-pill ${l.transferRequest.status === "APPROVED" ? "active" : "banned"}`}>
                        {l.transferRequest.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                      {l.transferRequest.reviewedAt ? new Date(l.transferRequest.reviewedAt).toLocaleString() : "Recently"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
