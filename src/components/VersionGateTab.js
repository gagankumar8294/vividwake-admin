"use client";

import React, { useState, useEffect } from "react";
import {
  FiDownload,
  FiSave,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw
} from "react-icons/fi";

export default function VersionGateTab({ password }) {
  const [config, setConfig] = useState({
    minSupportedVersionCode: 1,
    minSupportedVersionName: "1.0.0",
    latestVersionCode: 1,
    latestVersionName: "1.0.0",
    forceUpdateEnabled: false,
    updateTitle: "Critical Security & Performance Update",
    updateMessage: "A newer version of VividWake is required to ensure secure lock screen rendering and prevent service disruption.",
    updateDownloadUrl: "https://github.com/gagankumar8294/vividwake/releases"
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config", {
        headers: { "x-admin-authorization": password }
      });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig((prev) => ({ ...prev, ...data.config }));
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Version gate settings updated successfully!");
        setTimeout(() => setStatusMsg(""), 4500);
      } else {
        alert("Failed to save: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error saving config: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiDownload color="var(--accent-mint)" /> Remote Force-Update & Version Gate
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Multi-tier app version control to block outdated or compromised APKs
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {statusMsg && (
            <span style={{ fontSize: "0.78rem", color: "var(--accent-mint)", background: "rgba(45, 212, 191, 0.1)", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(45, 212, 191, 0.25)" }}>
              {statusMsg}
            </span>
          )}
          <button onClick={fetchConfig} disabled={loading} className="btn-header" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
            <FiRefreshCw className={loading ? "spin" : ""} size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.25rem", alignItems: "start" }}>
        {/* Left Column: Version Configuration Form */}
        <div className="mission-card">
          <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiShield color="var(--accent-mint)" /> Version Gate Policy
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Force Update Switch */}
            <div style={{
              background: config.forceUpdateEnabled ? "rgba(239, 68, 68, 0.12)" : "rgba(13, 17, 24, 0.6)",
              border: config.forceUpdateEnabled ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.85rem", color: config.forceUpdateEnabled ? "var(--accent-rose)" : "#ffffff" }}>
                  Mandatory Force-Update Gate
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", marginTop: "2px" }}>
                  {config.forceUpdateEnabled
                    ? "Active: Users on versions older than minimum MUST update before accessing the app."
                    : "Soft Mode: Recommended update notification shown without blocking app features."}
                </div>
              </div>

              <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={config.forceUpdateEnabled}
                  onChange={(e) => setConfig({ ...config, forceUpdateEnabled: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: config.forceUpdateEnabled ? "#ef4444" : "rgba(255,255,255,0.2)",
                  transition: "0.3s",
                  borderRadius: "24px"
                }}>
                  <span style={{
                    position: "absolute",
                    content: "",
                    height: "18px",
                    width: "18px",
                    left: config.forceUpdateEnabled ? "22px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: "0.3s",
                    borderRadius: "50%"
                  }} />
                </span>
              </label>
            </div>

            {/* Version Codes Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.74rem", fontWeight: "600", color: "var(--text-sub)" }}>
                  Min Supported Version Code
                </label>
                <input
                  type="number"
                  value={config.minSupportedVersionCode}
                  onChange={(e) => setConfig({ ...config, minSupportedVersionCode: e.target.value })}
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

              <div>
                <label style={{ fontSize: "0.74rem", fontWeight: "600", color: "var(--text-sub)" }}>
                  Min Version Name
                </label>
                <input
                  type="text"
                  value={config.minSupportedVersionName}
                  onChange={(e) => setConfig({ ...config, minSupportedVersionName: e.target.value })}
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
            </div>

            {/* Dialog Title */}
            <div>
              <label style={{ fontSize: "0.74rem", fontWeight: "600", color: "var(--text-sub)" }}>
                Update Dialog Title
              </label>
              <input
                type="text"
                value={config.updateTitle}
                onChange={(e) => setConfig({ ...config, updateTitle: e.target.value })}
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

            {/* Dialog Message */}
            <div>
              <label style={{ fontSize: "0.74rem", fontWeight: "600", color: "var(--text-sub)" }}>
                Update Explanation Message
              </label>
              <textarea
                rows={3}
                value={config.updateMessage}
                onChange={(e) => setConfig({ ...config, updateMessage: e.target.value })}
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

            {/* Download Link */}
            <div>
              <label style={{ fontSize: "0.74rem", fontWeight: "600", color: "var(--text-sub)" }}>
                APK Download URL / Store Link
              </label>
              <input
                type="url"
                value={config.updateDownloadUrl}
                onChange={(e) => setConfig({ ...config, updateDownloadUrl: e.target.value })}
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

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
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
              <FiSave size={14} />
              {saving ? "Saving Changes..." : "Deploy Version Configuration"}
            </button>
          </div>
        </div>

        {/* Right Column: Exploit Prevention & Policy Overview */}
        <div className="mission-card" style={{ background: "rgba(10, 14, 22, 0.9)" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiAlertTriangle color="#facc15" /> How Version Gating Works
          </h4>

          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            <div>
              <strong>1. Instant Cold-Boot Check:</strong> When the Android app launches, it checks its installed `BuildConfig.VERSION_CODE` against `minSupportedVersionCode`.
            </div>
            <div>
              <strong>2. Exploited APK Invalidation:</strong> If an older version had an offline lease loophole or broken DRM, bumping `minSupportedVersionCode` locks that version remotely.
            </div>
            <div>
              <strong>3. Zero Play Store Lag:</strong> The update URL points directly to your verified GitHub APK release or server CDN, delivering fast security patches without waiting for external store approval.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
