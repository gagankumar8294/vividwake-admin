"use client";

import React, { useState, useEffect } from "react";
import {
  FiBell,
  FiSend,
  FiSmartphone,
  FiUsers,
  FiAward,
  FiMail,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiEye,
  FiMousePointer,
  FiActivity,
  FiTrendingUp,
  FiInbox
} from "react-icons/fi";
import { useModal } from "@/components/ModalContext";

export default function NotificationsTab({ password }) {
  const { showConfirm, showAlert } = useModal();
  const [target, setTarget] = useState("ALL");
  const [targetEmail, setTargetEmail] = useState("");
  const [deliveryType, setDeliveryType] = useState("both");
  const [title, setTitle] = useState("New 4K Live Wallpapers Available ✨");
  const [body, setBody] = useState("Immerse your lock screen in stunning fluid animations now in Explore Store!");
  const [wallpaperId, setWallpaperId] = useState("");

  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalModalOpens: 0,
    uniqueOpenersCount: 0,
    totalClicks: 0,
    overallCtr: "0.0%"
  });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { "x-admin-authorization": password }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.notifications || []);
        setSystemNotifications(data.systemNotifications || []);
        if (data.analytics) {
          setAnalytics(data.analytics);
        }
      }
    } catch (e) {
      console.error("Failed to load notifications history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      await showAlert({
        title: "Missing Content",
        message: "Please enter both a title and notification body.",
        variant: "warning"
      });
      return;
    }
    if (target === "CUSTOM" && !targetEmail.trim()) {
      await showAlert({
        title: "Missing Target Email",
        message: "Please specify the target user's registered Google email.",
        variant: "warning"
      });
      return;
    }

    const targetDesc = target === "ALL" ? "All Active Users" : target === "VIP" ? "VIP Members" : targetEmail;
    const ok = await showConfirm({
      title: "Broadcast Notification",
      message: `Broadcast push notification to ${targetDesc}?\n\n"${title}"`,
      confirmText: "Broadcast Now",
      variant: "info"
    });
    if (!ok) return;

    setSending(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify({
          title,
          body,
          wallpaperId,
          target,
          targetEmail,
          deliveryType
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Notification broadcast successfully!");
        fetchHistory();
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        await showAlert({
          title: "Send Failed",
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
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiBell color="var(--accent-mint)" /> Push Notification Studio & Engagement Analytics
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Admin-controlled notification dispatching with real-time open and click telemetry
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="btn-header"
            style={{ fontSize: "0.78rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FiRefreshCw className={loadingHistory ? "spin" : ""} size={12} />
            Refresh Analytics
          </button>
          {successMsg && (
            <span style={{ fontSize: "0.78rem", color: "var(--accent-mint)", background: "rgba(45, 212, 191, 0.1)", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(45, 212, 191, 0.25)" }}>
              {successMsg}
            </span>
          )}
        </div>
      </div>

      {/* Engagement Analytics KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        {/* Card 1: Dispatched */}
        <div className="mission-card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiSend size={18} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", textTransform: "uppercase", fontWeight: "600" }}>Total Dispatched</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }}>{history.length}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Broadcast campaigns</div>
          </div>
        </div>

        {/* Card 2: Opens */}
        <div className="mission-card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(45, 212, 191, 0.15)", border: "1px solid rgba(45, 212, 191, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiEye size={18} color="var(--accent-mint)" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", textTransform: "uppercase", fontWeight: "600" }}>In-App Modal Opens</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }}>{analytics.totalModalOpens}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--accent-mint)" }}>{analytics.uniqueOpenersCount} unique devices</div>
          </div>
        </div>

        {/* Card 3: Clicks */}
        <div className="mission-card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiMousePointer size={18} color="#fb7185" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", textTransform: "uppercase", fontWeight: "600" }}>Notification Clicks</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }}>{analytics.totalClicks}</div>
            <div style={{ fontSize: "0.7rem", color: "#fb7185" }}>Direct wallpaper taps</div>
          </div>
        </div>

        {/* Card 4: CTR */}
        <div className="mission-card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiTrendingUp size={18} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", textTransform: "uppercase", fontWeight: "600" }}>Click-Through Rate (CTR)</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }}>{analytics.overallCtr}</div>
            <div style={{ fontSize: "0.7rem", color: "#c084fc" }}>Clicks / Modal Opens</div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Form (Left) & Phone Preview (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.25rem", alignItems: "start" }}>
        {/* Left: Compose Form */}
        <div className="mission-card">
          <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiSend color="var(--accent-mint)" /> Compose Targeted Broadcast
          </h3>

          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Target Audience */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-sub)", textTransform: "uppercase" }}>
                Target Audience
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "6px" }}>
                {[
                  { id: "ALL", label: "All Users", icon: FiUsers },
                  { id: "VIP", label: "VIP Only", icon: FiAward },
                  { id: "CUSTOM", label: "Single User", icon: FiMail }
                ].map((t) => {
                  const Icon = t.icon;
                  const active = target === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTarget(t.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        border: active ? "1px solid var(--accent-mint)" : "1px solid rgba(255, 255, 255, 0.08)",
                        background: active ? "rgba(45, 212, 191, 0.12)" : "rgba(13, 17, 24, 0.6)",
                        color: active ? "var(--accent-mint)" : "var(--text-muted)"
                      }}
                    >
                      <Icon size={13} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Email Input */}
            {target === "CUSTOM" && (
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-sub)" }}>
                  Recipient Google Email
                </label>
                <input
                  type="email"
                  placeholder="user@gmail.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    padding: "8px 12px",
                    background: "rgba(13, 17, 24, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    outline: "none"
                  }}
                  required
                />
              </div>
            )}

            {/* Delivery Channel */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-sub)", textTransform: "uppercase" }}>
                Delivery Channels
              </label>
              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                {[
                  { id: "both", label: "Status Bar + In-App Inbox" },
                  { id: "system", label: "Status Bar Only" },
                  { id: "in_app", label: "In-App Inbox Only" }
                ].map((d) => (
                  <label key={d.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-main)", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === d.id}
                      onChange={() => setDeliveryType(d.id)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-sub)" }}>
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "8px 12px",
                  background: "rgba(13, 17, 24, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  outline: "none"
                }}
                required
              />
            </div>

            {/* Body */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-sub)" }}>
                Message Content
              </label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "8px 12px",
                  background: "rgba(13, 17, 24, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  outline: "none",
                  resize: "vertical"
                }}
                required
              />
            </div>

            {/* Deep-link Wallpaper ID */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-sub)" }}>
                Deep-Link Wallpaper ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. wp_game_character_01 or cyberpunk_neon_city_4k"
                value={wallpaperId}
                onChange={(e) => setWallpaperId(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "8px 12px",
                  background: "rgba(13, 17, 24, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  outline: "none"
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              style={{
                marginTop: "0.5rem",
                padding: "10px",
                background: "linear-gradient(135deg, #059669 0%, #2dd4bf 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FiSend size={14} />
              {sending ? "Broadcasting to Devices..." : "Dispatch Push Notification"}
            </button>
          </form>
        </div>

        {/* Right: Live Phone Preview Mockup */}
        <div className="mission-card" style={{ background: "rgba(10, 14, 22, 0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--text-sub)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiSmartphone size={14} /> Live Phone Banner Preview
          </div>

          <div style={{
            marginTop: "1rem",
            background: "rgba(22, 28, 40, 0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "12px 14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: "var(--accent-mint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiBell size={10} color="#090c10" />
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--accent-mint)", textTransform: "uppercase" }}>
                  VividWake
                </span>
              </div>
              <span style={{ fontSize: "0.68rem", color: "var(--text-sub)" }}>now</span>
            </div>

            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#ffffff", marginBottom: "3px" }}>
              {title || "Live Wallpaper Alert"}
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.35" }}>
              {body || "Preview message text goes here..."}
            </div>

            {wallpaperId && (
              <div style={{ marginTop: "8px", fontSize: "0.68rem", color: "var(--accent-mint)", background: "rgba(45, 212, 191, 0.1)", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>
                Deep-link: #{wallpaperId}
              </div>
            )}
          </div>

          <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", marginTop: "1rem", lineHeight: "1.4" }}>
            💡 <strong>Visual Dimming Enabled:</strong> In-app notifications automatically dim upon tap by the user, while unread messages remain bright with an alert badge until clicked.
          </div>
        </div>
      </div>

      {/* Broadcast History & Engagement Telemetry */}
      <div className="mission-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
              <FiClock color="var(--accent-mint)" /> Notification Broadcast History & Click Telemetry ({history.length})
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-sub)", marginTop: "2px" }}>
              Track real-time delivery and click engagement across all sent broadcast notifications
            </p>
          </div>
          <button onClick={fetchHistory} disabled={loadingHistory} className="btn-header" style={{ fontSize: "0.74rem", padding: "4px 8px" }}>
            <FiRefreshCw className={loadingHistory ? "spin" : ""} size={10} />
          </button>
        </div>

        <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>Title & Message</th>
                <th>Target</th>
                <th>Channel</th>
                <th>Engagement / Clicks</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "var(--text-sub)" }}>
                    No push notifications dispatched yet.
                  </td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: "600", color: "#ffffff", fontSize: "0.82rem" }}>{h.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", marginTop: "2px" }}>{h.body}</div>
                      {h.wallpaperId && (
                        <span style={{ fontSize: "0.68rem", color: "var(--accent-mint)", background: "rgba(45, 212, 191, 0.08)", padding: "1px 6px", borderRadius: "4px", display: "inline-block", marginTop: "4px" }}>
                          Deep-link: {h.wallpaperId}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                        {h.target === "CUSTOM" ? h.targetEmail : h.target}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                      {h.deliveryType || "both"}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background: (h.clicks || 0) > 0 ? "rgba(45, 212, 191, 0.15)" : "rgba(255, 255, 255, 0.05)",
                            color: (h.clicks || 0) > 0 ? "var(--accent-mint)" : "var(--text-muted)",
                            border: (h.clicks || 0) > 0 ? "1px solid rgba(45, 212, 191, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                            width: "fit-content"
                          }}
                        >
                          <FiMousePointer size={11} /> {h.clicks || 0} clicks
                        </span>
                        {(h.uniqueClickers || 0) > 0 && (
                          <span style={{ fontSize: "0.68rem", color: "var(--text-sub)" }}>
                            👥 {h.uniqueClickers} unique device{h.uniqueClickers > 1 ? "s" : ""}
                          </span>
                        )}
                        {h.uniqueUsers && h.uniqueUsers.length > 0 && (
                          <span style={{ fontSize: "0.68rem", color: "var(--accent-mint)" }}>
                            👤 {h.uniqueUsers.join(", ")}
                          </span>
                        )}
                        {h.lastClickedAt && (
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                            Last tap: {new Date(h.lastClickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                      {h.sentAt ? new Date(h.sentAt).toLocaleString() : "Recently"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System In-App Notification Clicks (e.g., Welcome drop, Featured wallpapers) */}
      {systemNotifications.length > 0 && (
        <div className="mission-card" style={{ border: "1px solid rgba(168, 85, 247, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                <FiInbox color="#c084fc" /> In-App Default Notifications Engagement ({systemNotifications.length})
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-sub)", marginTop: "2px" }}>
                User interaction on pre-loaded welcome drops and automated in-app announcements
              </p>
            </div>
          </div>

          <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Notification Title</th>
                  <th>Deep-Link</th>
                  <th>Engagement / Clicks</th>
                  <th>Last Clicked</th>
                </tr>
              </thead>
              <tbody>
                {systemNotifications.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: "600", color: "#ffffff", fontSize: "0.82rem" }}>{s.title}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>ID: {s.id}</div>
                    </td>
                    <td>
                      {s.wallpaperId ? (
                        <span style={{ fontSize: "0.72rem", color: "var(--accent-mint)" }}>
                          #{s.wallpaperId}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>None</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          background: "rgba(168, 85, 247, 0.15)",
                          color: "#c084fc",
                          border: "1px solid rgba(168, 85, 247, 0.3)"
                        }}
                      >
                        <FiMousePointer size={11} /> {s.clicks} clicks ({s.uniqueClickers} devices)
                      </span>
                      {s.uniqueUsers && s.uniqueUsers.length > 0 && (
                        <div style={{ fontSize: "0.68rem", color: "var(--text-sub)", marginTop: "2px" }}>
                          👤 {s.uniqueUsers.join(", ")}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                      {s.lastClickedAt ? new Date(s.lastClickedAt).toLocaleString() : "Recently"}
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
