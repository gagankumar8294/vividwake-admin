"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiUsers,
  FiSmartphone,
  FiEye,
  FiDownload,
  FiCheckCircle,
  FiTrash2,
  FiClock,
  FiGlobe,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiLock,
  FiRefreshCw,
  FiLogOut,
  FiCpu,
  FiNavigation,
  FiPlay,
  FiLayers
} from "react-icons/fi";

export default function AdminAnalyticsDashboard() {
  const [password, setPassword] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'auth', 'anon'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check saved password on mount
  useEffect(() => {
    const saved = localStorage.getItem("vividwake_admin_pw");
    if (saved) {
      setPassword(saved);
      setIsAuthenticated(true);
    }
  }, []);

  // Last 7 days quick-pills
  const recentDays = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayName = i === 0 ? "Today" : i === 1 ? "Yesterday" : d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      list.push({ ymd, dayName, dayNum, monthName, isToday: i === 0 });
    }
    return list;
  }, []);

  // Fetch session analytics
  const fetchAnalytics = async (pw = password, p = page, type = filterType, date = selectedDate) => {
    if (!pw) return;
    setLoading(true);
    try {
      let url = `/api/analytics?page=${p}&limit=20&type=${type}`;
      if (date) url += `&date=${date}`;

      const res = await fetch(url, {
        headers: {
          "x-admin-authorization": pw
        }
      });

      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
        setOverview(data.overview || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.totalRecords || 0);

        // Auto-select first session if none selected
        if (!selectedSession && data.sessions && data.sessions.length > 0) {
          setSelectedSession(data.sessions[0]);
        } else if (selectedSession) {
          const updated = data.sessions.find((s) => s.sessionId === selectedSession.sessionId);
          if (updated) setSelectedSession(updated);
        }
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem("vividwake_admin_pw");
          setAuthError("Invalid password. Please enter 'romeoPistol'.");
        }
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && password) {
      fetchAnalytics(password, page, filterType, selectedDate);
    }
  }, [isAuthenticated, password, page, filterType, selectedDate]);

  // Auto-refresh interval (every 15s)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchAnalytics(password, page, filterType, selectedDate);
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, password, page, filterType, selectedDate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPassword === "romeoPistol") {
      setPassword("romeoPistol");
      localStorage.setItem("vividwake_admin_pw", "romeoPistol");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Hint: romeoPistol");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vividwake_admin_pw");
    setPassword("");
    setIsAuthenticated(false);
    setSessions([]);
  };

  // Helper formatting functions
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "< 5s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const getEventBadgeStyle = (type) => {
    switch (type) {
      case "apply_wallpaper":
        return { bg: "#22C55E", text: "#FFFFFF", label: "✨ SET TO LOCK SCREEN" };
      case "download_success":
        return { bg: "#38BDF8", text: "#0A0812", label: "⬇ DOWNLOAD COMPLETED" };
      case "download_failed":
      case "download_error":
        return { bg: "#EF4444", text: "#FFFFFF", label: "❌ DOWNLOAD FAILED" };
      case "download_start":
        return { bg: "#A855F7", text: "#FFFFFF", label: "⏳ DOWNLOAD STARTED" };
      case "preview_stream_ready":
      case "preview_stream_start":
        return { bg: "#D4AF37", text: "#0A0812", label: "🎬 PREVIEW STREAMED" };
      case "preview_stream_error":
      case "preview_stream_failed":
        return { bg: "#F87171", text: "#FFFFFF", label: "⚠️ PREVIEW ERROR" };
      case "delete_local_storage":
        return { bg: "#EF4444", text: "#FFFFFF", label: "🗑️ FREED STORAGE" };
      case "explore_store_tab_clicked":
        return { bg: "#F59E0B", text: "#0A0812", label: "🏬 EXPLORE STORE TAB" };
      case "my_wallpapers_tab_clicked":
        return { bg: "#3B82F6", text: "#FFFFFF", label: "🖼️ MY WALLPAPERS TAB" };
      case "store_catalog_fetch":
        return { bg: "#10B981", text: "#FFFFFF", label: "📡 CATALOG FETCH" };
      case "set_wallpaper_button_click":
        return { bg: "#8B5CF6", text: "#FFFFFF", label: "📱 SET WALLPAPER TAP" };
      case "google_signin_button_clicked":
        return { bg: "#4285F4", text: "#FFFFFF", label: "🔑 GOOGLE SIGN-IN CLICK" };
      case "google_signin_completed":
        return { bg: "#34A853", text: "#FFFFFF", label: "✅ GOOGLE SIGN-IN SUCCESS" };
      case "sign_out_clicked":
        return { bg: "#64748B", text: "#FFFFFF", label: "🚪 USER SIGN-OUT" };
      case "notification_bell_clicked":
        return { bg: "#EC4899", text: "#FFFFFF", label: "🔔 NOTIFICATION BELL TAP" };
      case "notification_item_clicked":
        return { bg: "#D946EF", text: "#FFFFFF", label: "📩 NOTIFICATION ITEM OPENED" };
      case "notification_clear_all_clicked":
        return { bg: "#64748B", text: "#FFFFFF", label: "🧹 NOTIFICATIONS CLEARED" };
      case "toggle_audio_mute":
        return { bg: "#06B6D4", text: "#0A0812", label: "🔊 AUDIO MUTE TOGGLE" };
      case "change_playback_mode":
        return { bg: "#EAB308", text: "#0A0812", label: "⚙️ PLAYBACK MODE CHANGE" };
      case "direct_gallery_handoff_click":
        return { bg: "#8B5CF6", text: "#FFFFFF", label: "📤 GALLERY DIRECT HAND-OFF" };
      case "clear_lock_override_click":
        return { bg: "#F97316", text: "#FFFFFF", label: "🔓 CLEAR LOCK OVERRIDE" };
      case "export_video_click":
        return { bg: "#14B8A6", text: "#FFFFFF", label: "💾 EXPORT VIDEO CLICK" };
      case "refresh_store_click":
        return { bg: "#10B981", text: "#FFFFFF", label: "🔄 REFRESH STORE CLICK" };
      case "thumbnail_ready":
        return { bg: "#06B6D4", text: "#0A0812", label: "🖼️ THUMB EXTRACTED" };
      case "tab_switch":
        return { bg: "#64748B", text: "#FFFFFF", label: "🧭 TAB NAVIGATION" };
      case "app_open":
        return { bg: "#818CF8", text: "#FFFFFF", label: "📱 APP LAUNCH" };
      default:
        return { bg: "#334155", text: "#E2E8F0", label: (type || "ACTION").toUpperCase().replace(/_/g, " ") };
    }
  };

  // ──────────────────────────────────────────────────────────
  // 1. Password Protection Gate
  // ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.lockIconCircle}>
            <FiLock size={32} color="#D4AF37" />
          </div>
          <h1 style={styles.loginTitle}>VividWake Mission Control</h1>
          <p style={styles.loginSubtitle}>
            Restricted administrative telemetry dashboard. Enter master password to access live session journeys.
          </p>

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <input
              type="password"
              placeholder="Enter Master Password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              style={styles.loginInput}
              autoFocus
            />
            {authError && <div style={styles.loginError}>{authError}</div>}
            <button type="submit" style={styles.loginButton}>
              Unlock Analytics Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 2. Main Admin Dashboard View
  // ──────────────────────────────────────────────────────────
  const metrics = overview?.metrics || {};

  return (
    <div style={styles.dashboardContainer}>
      {/* Top Navigation Bar */}
      <header style={styles.topHeader}>
        <div style={styles.brandRow}>
          <div style={styles.brandLogoCircle}>
            <FiActivity size={20} color="#0A0812" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>VividWake Analytics</h1>
            <span style={styles.headerSubtitle}>Real-time Native Android Telemetry &amp; Session Journeys</span>
          </div>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.liveIndicator}>
            <span style={styles.liveDot} />
            <span style={{ fontSize: "12px", color: "#A855F7" }}>Live Sync</span>
          </div>

          <button
            onClick={() => fetchAnalytics(password, page, filterType, selectedDate)}
            style={styles.btnAction}
            title="Refresh Data"
          >
            <FiRefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          <button onClick={handleLogout} style={styles.btnLogout} title="Lock Dashboard">
            <FiLogOut size={14} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* KPI Summary Cards Grid */}
      <section style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderTop: "3px solid #D4AF37" }}>
          <div style={styles.kpiIconWrap}><FiSmartphone color="#D4AF37" size={20} /></div>
          <div>
            <div style={styles.kpiValue}>{overview?.totalSessions || 0}</div>
            <div style={styles.kpiLabel}>Total Sessions</div>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "3px solid #38BDF8" }}>
          <div style={styles.kpiIconWrap}><FiUsers color="#38BDF8" size={20} /></div>
          <div>
            <div style={styles.kpiValue}>{overview?.uniqueDevicesCount || 0}</div>
            <div style={styles.kpiLabel}>Unique Devices</div>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "3px solid #A855F7" }}>
          <div style={styles.kpiIconWrap}><FiEye color="#A855F7" size={20} /></div>
          <div>
            <div style={styles.kpiValue}>{metrics.totalPreviews || 0}</div>
            <div style={styles.kpiLabel}>Previews Streamed</div>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "3px solid #22C55E" }}>
          <div style={styles.kpiIconWrap}><FiDownload color="#22C55E" size={20} /></div>
          <div>
            <div style={styles.kpiValue}>{metrics.totalDownloadsCompleted || 0}</div>
            <div style={styles.kpiLabel}>Downloads Completed</div>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "3px solid #EAB308" }}>
          <div style={styles.kpiIconWrap}><FiCheckCircle color="#EAB308" size={20} /></div>
          <div>
            <div style={styles.kpiValue}>{metrics.totalAppliedToLockScreen || 0}</div>
            <div style={styles.kpiLabel}>Applied to Lock Screen</div>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "3px solid #EF4444" }}>
          <div style={styles.kpiIconWrap}><FiTrash2 color="#EF4444" size={20} /></div>
          <div>
            <div style={styles.kpiValue}>{metrics.totalDeletedStorage || 0}</div>
            <div style={styles.kpiLabel}>Storage Cleanups</div>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section style={styles.filterToolbar}>
        {/* Date Quick-Select Pills */}
        <div style={styles.datePillsRow}>
          <button
            onClick={() => { setSelectedDate(""); setPage(1); }}
            style={{
              ...styles.pillBtn,
              backgroundColor: selectedDate === "" ? "#D4AF37" : "#1A142E",
              color: selectedDate === "" ? "#0A0812" : "#9D8EB9"
            }}
          >
            All Dates
          </button>
          {recentDays.map((day) => (
            <button
              key={day.ymd}
              onClick={() => { setSelectedDate(day.ymd); setPage(1); }}
              style={{
                ...styles.pillBtn,
                backgroundColor: selectedDate === day.ymd ? "#D4AF37" : "#1A142E",
                color: selectedDate === day.ymd ? "#0A0812" : "#9D8EB9",
                fontWeight: selectedDate === day.ymd ? "700" : "500"
              }}
            >
              <span>{day.dayName}</span>
              <span style={{ fontSize: "11px", opacity: 0.85 }}>{day.monthName} {day.dayNum}</span>
            </button>
          ))}
        </div>

        {/* User Type Filters */}
        <div style={styles.userFilterRow}>
          <button
            onClick={() => { setFilterType("all"); setPage(1); }}
            style={{
              ...styles.typeBtn,
              backgroundColor: filterType === "all" ? "#7C3AED" : "#1A142E",
              color: "#FFFFFF"
            }}
          >
            All Visitors
          </button>
          <button
            onClick={() => { setFilterType("auth"); setPage(1); }}
            style={{
              ...styles.typeBtn,
              backgroundColor: filterType === "auth" ? "#7C3AED" : "#1A142E",
              color: "#FFFFFF"
            }}
          >
            Signed In
          </button>
          <button
            onClick={() => { setFilterType("anon"); setPage(1); }}
            style={{
              ...styles.typeBtn,
              backgroundColor: filterType === "anon" ? "#7C3AED" : "#1A142E",
              color: "#FFFFFF"
            }}
          >
            Anonymous Guests
          </button>
        </div>
      </section>

      {/* Two-Column Session & Journey Explorer */}
      <div style={styles.mainGrid}>
        {/* LEFT COLUMN: Session List */}
        <div style={styles.sessionsCol}>
          <div style={styles.colHeader}>
            <h3>Mobile Sessions ({totalRecords})</h3>
            <span style={{ fontSize: "12px", color: "#9D8EB9" }}>Page {page} of {totalPages}</span>
          </div>

          <div style={styles.sessionListScroll}>
            {sessions.length === 0 ? (
              <div style={styles.emptyCard}>
                <FiActivity size={32} color="#6E6188" />
                <p>No mobile sessions recorded for this filter.</p>
              </div>
            ) : (
              sessions.map((sess) => {
                const isSelected = selectedSession?.sessionId === sess.sessionId;
                const eventCount = sess.events?.length || 0;
                const formattedTime = new Date(sess.updatedAt || sess.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                });

                return (
                  <div
                    key={sess.sessionId}
                    onClick={() => setSelectedSession(sess)}
                    style={{
                      ...styles.sessionCard,
                      borderLeft: isSelected ? "4px solid #D4AF37" : "4px solid transparent",
                      backgroundColor: isSelected ? "#221B3C" : "#1A142E"
                    }}
                  >
                    <div style={styles.sessionCardTop}>
                      <div style={styles.deviceRow}>
                        <FiSmartphone color="#D4AF37" size={16} />
                        <span style={styles.deviceName}>
                          {sess.deviceBrand || "Android"} {sess.deviceModel || "Device"}
                        </span>
                      </div>
                      <span style={styles.sessionTime}>{formattedTime}</span>
                    </div>

                    <div style={styles.sessionMetaRow}>
                      <span style={styles.metaBadge}>{sess.osVersion || "Android"}</span>
                      {sess.ip && <span style={styles.ipBadge}><FiGlobe size={10} /> {sess.ip}</span>}
                      {sess.email && <span style={styles.userBadge}>{sess.email}</span>}
                    </div>

                    <div style={styles.sessionFooterRow}>
                      <span style={styles.durationTag}>
                        <FiClock size={11} /> {formatDuration(sess.totalDuration)}
                      </span>
                      <span style={styles.eventsTag}>
                        {eventCount} {eventCount === 1 ? "action" : "actions"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.paginationRow}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={styles.pageBtn}
              >
                <FiChevronLeft /> Prev
              </button>
              <span style={{ fontSize: "13px" }}>{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={styles.pageBtn}
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Visual Session Journey Timeline */}
        <div style={styles.timelineCol}>
          <div style={styles.colHeader}>
            <h3>Session Journey Flow</h3>
            {selectedSession && (
              <span style={styles.sessionIdPill}>ID: {selectedSession.sessionId.slice(0, 12)}...</span>
            )}
          </div>

          {!selectedSession ? (
            <div style={styles.emptyCard}>
              <FiLayers size={32} color="#6E6188" />
              <p>Select a session on the left to inspect its complete clickstream timeline.</p>
            </div>
          ) : (
            <div style={styles.timelineContent}>
              {/* Selected Session Metadata Banner */}
              <div style={styles.selectedBanner}>
                <div style={styles.bannerRow}>
                  <div>
                    <h4 style={styles.bannerDevice}>
                      {selectedSession.deviceBrand} {selectedSession.deviceModel}
                    </h4>
                    <span style={styles.bannerSub}>
                      {selectedSession.osVersion} • IP: {selectedSession.ip || "Unknown"}
                    </span>
                  </div>
                  <div style={styles.bannerStat}>
                    <span style={styles.bannerStatValue}>{formatDuration(selectedSession.totalDuration)}</span>
                    <span style={styles.bannerStatLabel}>Total Dwell</span>
                  </div>
                </div>
              </div>

              {/* Event Tree Timeline */}
              <div style={styles.treeContainer}>
                {(selectedSession.events || []).map((ev, index) => {
                  const badge = getEventBadgeStyle(ev.type);
                  const timeStr = new Date(ev.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  });

                  return (
                    <div key={index} style={styles.treeNode}>
                      {/* Left time & line connector */}
                      <div style={styles.timelineLeft}>
                        <span style={styles.nodeTime}>{timeStr}</span>
                        <div style={styles.nodeConnector} />
                        <div style={{ ...styles.nodeDot, backgroundColor: badge.bg }} />
                      </div>

                      {/* Right event content card */}
                      <div style={styles.nodeCard}>
                        <div style={styles.nodeCardHeader}>
                          <span style={{ ...styles.eventTypeBadge, backgroundColor: badge.bg, color: badge.text }}>
                            {badge.label}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {ev.status && (
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  backgroundColor: ev.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                                  color: ev.status === 'SUCCESS' ? '#4ADE80' : '#F87171',
                                  border: `1px solid ${ev.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                                }}
                              >
                                {ev.status === 'SUCCESS' ? '✓ SUCCESS' : '✗ FAILED'}
                              </span>
                            )}
                            {(ev.durationMs > 0 || ev.durationSec) && (
                              <span style={styles.durationBadge}>
                                ⚡ {ev.durationMs > 0 ? `${ev.durationMs}ms` : `${ev.durationSec}s`}
                              </span>
                            )}
                            {ev.dwellMs > 0 && (
                              <span style={styles.dwellBadge}>
                                {(ev.dwellMs / 1000).toFixed(1)}s dwell
                              </span>
                            )}
                          </div>
                        </div>

                        {ev.target && (
                          <div style={styles.nodeTarget}>
                            <strong>Target:</strong> {ev.target}
                          </div>
                        )}

                        {ev.errorMessage && (
                          <div style={styles.nodeErrorBox}>
                            <span style={{ color: '#F87171', fontWeight: '700' }}>
                              ⚠️ {ev.errorType || 'Exception'}:
                            </span>{' '}
                            {ev.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// CSS-in-JS Styles (No external css module bugs)
// ──────────────────────────────────────────────────────────
const styles = {
  loginContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0812",
    padding: "20px"
  },
  loginCard: {
    backgroundColor: "#1A142E",
    border: "1px solid #2F244C",
    borderRadius: "16px",
    padding: "36px",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
  },
  lockIconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px"
  },
  loginTitle: {
    color: "#D4AF37",
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "8px"
  },
  loginSubtitle: {
    color: "#9D8EB9",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "24px"
  },
  loginInput: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #2F244C",
    backgroundColor: "#0A0812",
    color: "#F3E8FF",
    fontSize: "14px",
    marginBottom: "12px",
    outline: "none"
  },
  loginError: {
    color: "#EF4444",
    fontSize: "12px",
    marginBottom: "12px"
  },
  loginButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#D4AF37",
    color: "#0A0812",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s"
  },
  dashboardContainer: {
    padding: "24px",
    maxWidth: "1440px",
    margin: "0 auto",
    minHeight: "100vh"
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "20px",
    borderBottom: "1px solid #2F244C",
    marginBottom: "24px"
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  brandLogoCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#D4AF37",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#D4AF37",
    margin: 0
  },
  headerSubtitle: {
    fontSize: "12px",
    color: "#9D8EB9"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#1A142E",
    borderRadius: "20px",
    border: "1px solid #2F244C"
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22C55E"
  },
  btnAction: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#1A142E",
    color: "#F3E8FF",
    border: "1px solid #2F244C",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
  },
  btnLogout: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#EF4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "24px"
  },
  kpiCard: {
    backgroundColor: "#1A142E",
    border: "1px solid #2F244C",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  kpiIconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    backgroundColor: "#140F22",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  kpiValue: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#F3E8FF"
  },
  kpiLabel: {
    fontSize: "12px",
    color: "#9D8EB9"
  },
  filterToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  datePillsRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  pillBtn: {
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid #2F244C",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    lineHeight: "1.2"
  },
  userFilterRow: {
    display: "flex",
    gap: "8px"
  },
  typeBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #2F244C",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.6fr",
    gap: "20px"
  },
  sessionsCol: {
    backgroundColor: "#140F22",
    border: "1px solid #2F244C",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column"
  },
  timelineCol: {
    backgroundColor: "#140F22",
    border: "1px solid #2F244C",
    borderRadius: "14px",
    padding: "18px"
  },
  colHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid #2F244C",
    marginBottom: "14px"
  },
  sessionListScroll: {
    maxHeight: "680px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  sessionCard: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #2F244C",
    cursor: "pointer",
    transition: "background 0.2s"
  },
  sessionCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  },
  deviceRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  deviceName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#F3E8FF"
  },
  sessionTime: {
    fontSize: "11px",
    color: "#9D8EB9"
  },
  sessionMetaRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "8px"
  },
  metaBadge: {
    fontSize: "10px",
    backgroundColor: "#261E38",
    color: "#D4AF37",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  ipBadge: {
    fontSize: "10px",
    backgroundColor: "#1A142E",
    color: "#38BDF8",
    padding: "2px 6px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  userBadge: {
    fontSize: "10px",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    color: "#22C55E",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  sessionFooterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  durationTag: {
    fontSize: "11px",
    color: "#9D8EB9",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  eventsTag: {
    fontSize: "11px",
    color: "#A855F7",
    fontWeight: "600"
  },
  paginationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "14px",
    marginTop: "10px",
    borderTop: "1px solid #2F244C"
  },
  pageBtn: {
    padding: "6px 12px",
    backgroundColor: "#1A142E",
    border: "1px solid #2F244C",
    color: "#F3E8FF",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  emptyCard: {
    padding: "40px",
    textAlign: "center",
    color: "#6E6188",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
  },
  timelineContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  selectedBanner: {
    backgroundColor: "#1A142E",
    border: "1px solid #2F244C",
    borderRadius: "10px",
    padding: "14px"
  },
  bannerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bannerDevice: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#D4AF37",
    marginBottom: "2px"
  },
  bannerSub: {
    fontSize: "11px",
    color: "#9D8EB9"
  },
  bannerStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },
  bannerStatValue: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#38BDF8"
  },
  bannerStatLabel: {
    fontSize: "10px",
    color: "#9D8EB9"
  },
  sessionIdPill: {
    fontSize: "11px",
    color: "#9D8EB9",
    backgroundColor: "#1A142E",
    padding: "3px 8px",
    borderRadius: "6px"
  },
  treeContainer: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "560px",
    overflowY: "auto",
    paddingRight: "8px"
  },
  treeNode: {
    display: "flex",
    gap: "14px",
    position: "relative",
    paddingBottom: "16px"
  },
  timelineLeft: {
    width: "75px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    position: "relative",
    flexShrink: 0
  },
  nodeTime: {
    fontSize: "11px",
    color: "#9D8EB9",
    fontFamily: "monospace"
  },
  nodeConnector: {
    position: "absolute",
    right: "-7px",
    top: "16px",
    bottom: "-16px",
    width: "2px",
    backgroundColor: "#2F244C"
  },
  nodeDot: {
    position: "absolute",
    right: "-11px",
    top: "6px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    zIndex: 2
  },
  nodeCard: {
    flex: 1,
    backgroundColor: "#1A142E",
    border: "1px solid #2F244C",
    borderRadius: "8px",
    padding: "10px 14px"
  },
  nodeCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px"
  },
  eventTypeBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  dwellBadge: {
    fontSize: "11px",
    color: "#D4AF37",
    fontWeight: "600"
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
    letterSpacing: "0.4px"
  },
  durationBadge: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#C084FC",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  nodeErrorBox: {
    marginTop: "8px",
    padding: "8px 12px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#FCA5A5",
    fontSize: "12px",
    fontFamily: "monospace",
    lineHeight: "1.4"
  },
  nodeTarget: {
    fontSize: "12px",
    color: "#E2E8F0"
  }
};
