"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiUsers,
  FiUser,
  FiUserCheck,
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
  FiSearch,
  FiFilter,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiZap,
  FiLayers,
  FiSliders,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiImage,
  FiSettings,
  FiPlay,
  FiKey,
  FiNavigation,
  FiMousePointer,
  FiWifi,
  FiCalendar,
  FiDatabase,
  FiSun
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
  const [filterType, setFilterType] = useState("all"); // 'all', 'auth', 'anon', 'errors'
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // 'recent', 'oldest', 'actions', 'duration', 'errors'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Timeline controls
  const [timelineFilter, setTimelineFilter] = useState("all"); // 'all', 'wallpapers', 'clicks', 'errors'
  const [timelineSearch, setTimelineSearch] = useState("");
  const [timelineSortOrder, setTimelineSortOrder] = useState("asc");
  const [expandedEvents, setExpandedEvents] = useState({});
  const [copiedId, setCopiedId] = useState(false);

  // Ref to preserve currently selected session across refreshes without jumping
  const selectedSessionIdRef = useRef(null);
  useEffect(() => {
    selectedSessionIdRef.current = selectedSession?.sessionId || null;
  }, [selectedSession]);

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
      list.push({ ymd, dayName, dayNum, monthName });
    }
    return list;
  }, []);

  // Fetch session analytics from backend
  const fetchAnalytics = async (
    pw = password,
    p = page,
    type = filterType,
    date = selectedDate,
    search = searchQuery,
    sort = sortBy
  ) => {
    if (!pw) return;
    setLoading(true);
    try {
      let url = `/api/analytics?page=${p}&limit=30&type=${type}&sortBy=${sort}`;
      if (date) url += `&date=${date}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url, {
        headers: {
          "x-admin-authorization": pw
        }
      });

      const data = await res.json();
      if (data.success) {
        const fetchedSessions = data.sessions || [];
        setSessions(fetchedSessions);
        setOverview(data.overview || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.totalRecords || 0);

        // Keep viewing the same session if possible, avoiding view jumping
        if (fetchedSessions.length > 0) {
          if (selectedSessionIdRef.current) {
            const existing = fetchedSessions.find((s) => s.sessionId === selectedSessionIdRef.current);
            if (existing) {
              setSelectedSession(existing);
            } else {
              setSelectedSession(fetchedSessions[0]);
            }
          } else {
            setSelectedSession(fetchedSessions[0]);
          }
        } else {
          setSelectedSession(null);
        }
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem("vividwake_admin_pw");
          setAuthError("Invalid password. Please enter master password.");
        }
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters, page, or credentials change
  useEffect(() => {
    if (isAuthenticated && password) {
      fetchAnalytics(password, page, filterType, selectedDate, searchQuery, sortBy);
    }
  }, [isAuthenticated, password, page, filterType, selectedDate, sortBy]);

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
    setSelectedSession(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAnalytics(password, 1, filterType, selectedDate, searchQuery, sortBy);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setPage(1);
    fetchAnalytics(password, 1, filterType, selectedDate, "", sortBy);
  };

  // Format dwell duration
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "< 5s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const copySessionId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const toggleEventExpand = (index) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Event category helper
  const getEventBadgeMeta = (type, action) => {
    const key = (type || action || "").toLowerCase();
    if (key.includes("wallpaper") || key.includes("apply") || key.includes("download")) {
      return { label: "WALLPAPER", icon: <FiImage size={11} />, category: "wallpapers" };
    }
    if (key.includes("click") || key.includes("tap") || key.includes("btn")) {
      return { label: "CLICK", icon: <FiMousePointer size={11} />, category: "clicks" };
    }
    if (key.includes("nav") || key.includes("screen") || key.includes("tab")) {
      return { label: "NAVIGATE", icon: <FiNavigation size={11} />, category: "nav" };
    }
    if (key.includes("auth") || key.includes("login") || key.includes("sign")) {
      return { label: "AUTH", icon: <FiKey size={11} />, category: "auth" };
    }
    return { label: "ACTION", icon: <FiZap size={11} />, category: "other" };
  };

  // Filtered & Sorted Timeline Events
  const filteredEvents = useMemo(() => {
    if (!selectedSession || !selectedSession.events) return [];
    let list = [...selectedSession.events];

    if (timelineFilter !== "all") {
      list = list.filter((ev) => {
        const meta = getEventBadgeMeta(ev.type, ev.action);
        if (timelineFilter === "errors") return ev.status === "FAILED";
        return meta.category === timelineFilter;
      });
    }

    if (timelineSearch.trim()) {
      const q = timelineSearch.trim().toLowerCase();
      list = list.filter((ev) => {
        const text = `${ev.type} ${ev.action} ${ev.target} ${ev.errorMessage || ""}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (timelineSortOrder === "desc") {
      list.reverse();
    }

    return list;
  }, [selectedSession, timelineFilter, timelineSearch, timelineSortOrder]);

  // Session Statistics
  const sessionStats = useMemo(() => {
    if (!selectedSession || !selectedSession.events) {
      return { total: 0, success: 0, failed: 0, successRate: "100%", avgLatency: 0 };
    }
    const total = selectedSession.events.length;
    const failed = selectedSession.events.filter((e) => e.status === "FAILED").length;
    const success = total - failed;
    const successRate = total > 0 ? `${Math.round((success / total) * 100)}%` : "100%";

    const durations = selectedSession.events
      .map((e) => e.durationMs || 0)
      .filter((d) => d > 0);
    const avgLatency =
      durations.length > 0
        ? Math.round(durations.reduce((acc, v) => acc + v, 0) / durations.length)
        : 0;

    return { total, success, failed, successRate, avgLatency };
  }, [selectedSession]);

  const getUserInitials = (session) => {
    const name = session.userName || session.email?.split("@")[0] || "Guest";
    return name.charAt(0).toUpperCase();
  };

  // ──────────────────────────────────────────────────────────
  // 1. Password Protection Gate
  // ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--page-bg, #0a0d14)",
          padding: "1rem"
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            background: "var(--card-bg, #111827)",
            border: "1px solid var(--card-border, rgba(255, 255, 255, 0.08))",
            borderRadius: "12px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-mint, #34d399)",
              marginBottom: "1rem"
            }}
          >
            <FiLock size={22} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#ffffff", marginBottom: "0.25rem" }}>
            VividWake Console
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-sub, #6d937d)", textAlign: "center", marginBottom: "1.5rem" }}>
            Enter master administrative password to unlock analytics
          </p>

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <input
              type="password"
              placeholder="Enter Master Password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                borderRadius: "6px",
                background: "var(--input-bg, #0d1117)",
                border: "1px solid var(--input-border, rgba(255,255,255,0.12))",
                color: "#ffffff",
                fontSize: "0.85rem",
                outline: "none",
                marginBottom: "0.75rem"
              }}
              autoFocus
            />
            {authError && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--accent-rose, #f87171)",
                  marginBottom: "0.75rem",
                  textAlign: "center"
                }}
              >
                {authError}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.65rem",
                borderRadius: "6px",
                background: "var(--accent-emerald, #10b981)",
                color: "#0a0d14",
                fontWeight: "700",
                fontSize: "0.85rem",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Unlock Dashboard
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
    <div className="analytics-page">
      {/* Top Header Bar */}
      <header className="header-top">
        <div className="brand-section">
          <div className="brand-icon-box">
            <FiActivity size={18} />
          </div>
          <div>
            <h1 className="brand-title">VividWake Analytics</h1>
            <span className="brand-subtitle">Real-time user journey & event telemetry monitoring</span>
          </div>
        </div>

        <div className="header-actions-strip">
          <button
            onClick={() => fetchAnalytics(password, page, filterType, selectedDate, searchQuery, sortBy)}
            className="btn-header"
            title="Refresh Data"
            disabled={loading}
          >
            <FiRefreshCw size={12} className={loading ? "spin-anim" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button onClick={handleLogout} className="btn-header btn-lock" title="Lock Dashboard">
            <FiLogOut size={12} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Overview KPIs Strip */}
      <section className="overview-kpis">
        <div className="kpi-stat-box">
          <div className="kpi-icon-pill">
            <FiSmartphone size={16} />
          </div>
          <div>
            <div className="kpi-val">{overview?.totalSessions || 0}</div>
            <div className="kpi-lbl">Total Sessions</div>
          </div>
        </div>

        <div className="kpi-stat-box">
          <div className="kpi-icon-pill">
            <FiUsers size={16} />
          </div>
          <div>
            <div className="kpi-val">
              {overview?.authenticatedUsersCount || 0} / {overview?.uniqueDevicesCount || 0}
            </div>
            <div className="kpi-lbl">Auth Users / Devices</div>
          </div>
        </div>

        <div className="kpi-stat-box">
          <div className="kpi-icon-pill">
            <FiEye size={16} />
          </div>
          <div>
            <div className="kpi-val">{metrics.totalPreviews || 0}</div>
            <div className="kpi-lbl">Previews Streamed</div>
          </div>
        </div>

        <div className="kpi-stat-box">
          <div className="kpi-icon-pill">
            <FiDownload size={16} />
          </div>
          <div>
            <div className="kpi-val">{metrics.totalDownloadsCompleted || 0}</div>
            <div className="kpi-lbl">Downloads Completed</div>
          </div>
        </div>

        <div className="kpi-stat-box">
          <div className="kpi-icon-pill">
            <FiCheckCircle size={16} />
          </div>
          <div>
            <div className="kpi-val">{metrics.totalAppliedToLockScreen || 0}</div>
            <div className="kpi-lbl">Applied to Lock Screen</div>
          </div>
        </div>

        <div className="kpi-stat-box">
          <div className="kpi-icon-pill">
            <FiTrash2 size={16} />
          </div>
          <div>
            <div className="kpi-val">{metrics.totalDeletedStorage || 0}</div>
            <div className="kpi-lbl">Storage Cleanups</div>
          </div>
        </div>
      </section>

      {/* Filter Controls Strip */}
      <section className="filter-controls-strip">
        <div className="date-days-row">
          <button
            type="button"
            className={`round-day-pill ${selectedDate === "" ? "round-day-pill--active" : ""}`}
            onClick={() => {
              setSelectedDate("");
              setPage(1);
            }}
          >
            <FiCalendar size={12} />
            All Days
          </button>

          {recentDays.map((d) => {
            const isSelected = selectedDate === d.ymd;
            return (
              <button
                key={d.ymd}
                type="button"
                className={`round-day-pill ${isSelected ? "round-day-pill--active" : ""}`}
                onClick={() => {
                  setSelectedDate(d.ymd);
                  setPage(1);
                }}
              >
                <span>{d.dayName}</span>
                <span style={{ fontSize: "0.68rem", opacity: 0.8 }}>
                  {d.dayNum} {d.monthName}
                </span>
              </button>
            );
          })}
        </div>

        <div className="filter-actions-row">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="search-input-box">
            <FiSearch size={13} color="var(--text-sub)" />
            <input
              type="text"
              placeholder="Search user, device, session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                style={{ background: "none", border: "none", color: "var(--text-sub)", cursor: "pointer", display: "flex", padding: 0 }}
              >
                <FiX size={13} />
              </button>
            )}
          </form>

          {/* User Type Filter Pills */}
          <button
            type="button"
            className={`filter-type-pill ${filterType === "all" ? "active" : ""}`}
            onClick={() => {
              setFilterType("all");
              setPage(1);
            }}
          >
            <FiUsers size={12} /> All
          </button>
          <button
            type="button"
            className={`filter-type-pill ${filterType === "auth" ? "active" : ""}`}
            onClick={() => {
              setFilterType("auth");
              setPage(1);
            }}
          >
            <FiUserCheck size={12} /> Signed In
          </button>
          <button
            type="button"
            className={`filter-type-pill ${filterType === "anon" ? "active" : ""}`}
            onClick={() => {
              setFilterType("anon");
              setPage(1);
            }}
          >
            <FiSmartphone size={12} /> Anonymous
          </button>
          <button
            type="button"
            className={`filter-type-pill ${filterType === "errors" ? "active" : ""}`}
            onClick={() => {
              setFilterType("errors");
              setPage(1);
            }}
            style={{
              color: filterType === "errors" ? "var(--accent-rose)" : undefined,
              borderColor: filterType === "errors" ? "var(--accent-red)" : undefined,
              background: filterType === "errors" ? "rgba(239, 68, 68, 0.15)" : undefined
            }}
          >
            <FiAlertTriangle size={12} /> Errors
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="sort-select-box"
          >
            <option value="recent">Recent First</option>
            <option value="oldest">Oldest First</option>
            <option value="actions">Most Actions</option>
            <option value="duration">Longest Dwell</option>
            <option value="errors">Most Errors</option>
          </select>
        </div>
      </section>

      {/* Main Two-Panel Body */}
      <main className="analytics-body">
        {/* Left Panel: Session Stream */}
        <section className="session-panel">
          <div className="panel-title">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2>Recent Activity Sessions</h2>
              <span className="records-badge">
                <FiDatabase size={10} style={{ marginRight: "3px" }} />
                {totalRecords} {totalRecords === 1 ? "Session" : "Sessions"}
              </span>
            </div>
            {selectedDate && (
              <span style={{ fontSize: "0.68rem", color: "var(--accent-mint)" }}>
                <FiSun size={10} style={{ marginRight: "3px" }} />
                Filtered by Day
              </span>
            )}
          </div>

          <div className="sessions-list">
            {sessions.length === 0 ? (
              <div className="empty-radar-wrap">
                <FiActivity size={32} />
                <p style={{ marginTop: "10px", fontSize: "0.85rem", fontWeight: "600" }}>No sessions found</p>
                <span style={{ fontSize: "0.72rem", color: "var(--text-sub)", marginTop: "4px" }}>
                  Try resetting date or search filters
                </span>
              </div>
            ) : (
              sessions.map((sess) => {
                const isSelected = selectedSession?.sessionId === sess.sessionId;
                const initial = getUserInitials(sess);
                const eventCount = sess.events?.length || 0;
                const errorCount = (sess.events || []).filter((e) => e.status === "FAILED").length;
                const formattedTime = new Date(sess.updatedAt || sess.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                });

                return (
                  <div
                    key={sess.sessionId}
                    onClick={() => setSelectedSession(sess)}
                    className={`session-card ${isSelected ? "selected" : ""}`}
                  >
                    <div className="card-top">
                      <div className="user-profile">
                        {sess.userPhoto ? (
                          <img
                            src={sess.userPhoto}
                            alt="Avatar"
                            className="user-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="guest-avatar">{initial}</div>
                        )}

                        <div className="user-details">
                          <span className="user-name">
                            {sess.userName ||
                              (sess.email ? sess.email.split("@")[0] : `${sess.deviceBrand || "Android"} Device`)}
                          </span>
                          <span className="user-email">
                            {sess.email || `${sess.deviceBrand || "Android"} ${sess.deviceModel || ""}`}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        {sess.userId && (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: "700",
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "var(--accent-mint)",
                              padding: "1px 5px",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px"
                            }}
                          >
                            <FiCheck size={9} /> G-Auth
                          </span>
                        )}
                        {errorCount > 0 && (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: "700",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "var(--accent-rose)",
                              padding: "1px 5px",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px"
                            }}
                          >
                            <FiAlertTriangle size={9} /> {errorCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="card-meta-chips">
                      <span className="meta-chip-item">
                        <FiSmartphone size={10} /> {sess.deviceModel || "Android"}
                      </span>
                      <span className="meta-chip-item">
                        <FiClock size={10} /> {formatDuration(sess.totalDuration)}
                      </span>
                      <span className="meta-chip-item" style={{ color: "var(--accent-mint)" }}>
                        <FiZap size={10} /> {eventCount} {eventCount === 1 ? "action" : "actions"}
                      </span>
                    </div>

                    <div className="card-footer-time">{formattedTime}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="page-btn"
            >
              <FiChevronLeft size={13} /> Prev
            </button>

            <span className="page-info-text">
              Showing {sessions.length} of {totalRecords} records • Page {page} of {totalPages}
            </span>

            {/* Quick Page Jump Buttons */}
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: "4px" }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 5) {
                    if (page > 3) {
                      pNum = page - 2 + i;
                      if (pNum > totalPages) pNum = totalPages - (4 - i);
                    }
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className="page-btn"
                      style={{
                        minWidth: "26px",
                        padding: "0.2rem 0.45rem",
                        background: page === pNum ? "rgba(16, 185, 129, 0.25)" : undefined,
                        borderColor: page === pNum ? "var(--accent-emerald)" : undefined,
                        color: page === pNum ? "var(--accent-mint)" : undefined,
                        fontWeight: page === pNum ? "700" : "500"
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="page-btn"
            >
              Next <FiChevronRight size={13} />
            </button>
          </div>
        </section>

        {/* Right Panel: Journey Flow Visualizer */}
        <section className="visualizer-panel">
          {!selectedSession ? (
            <div className="empty-radar-wrap">
              <FiLayers size={36} />
              <p style={{ marginTop: "12px", fontSize: "0.95rem", fontWeight: "600", color: "var(--text-main)" }}>
                Select a session on the left to inspect its live journey
              </p>
              <span style={{ fontSize: "0.75rem", color: "var(--text-sub)", marginTop: "4px" }}>
                Every tap, response latency, wallpaper set, and error trail will appear here
              </span>
            </div>
          ) : (
            <>
              {/* Header Profile & Session Stats */}
              <div className="timeline-header-strip">
                <div className="user-identity-card">
                  {selectedSession.userPhoto ? (
                    <img
                      src={selectedSession.userPhoto}
                      alt="Avatar"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "1.5px solid var(--accent-mint)",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="guest-avatar" style={{ width: "36px", height: "36px" }}>
                      {getUserInitials(selectedSession)}
                    </div>
                  )}

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff" }}>
                        {selectedSession.userName || selectedSession.email || "Guest Android User"}
                      </span>
                      {selectedSession.userId && (
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: "700",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "var(--accent-mint)",
                            padding: "1px 5px",
                            borderRadius: "4px"
                          }}
                        >
                          Google Auth
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                      <span
                        onClick={() => copySessionId(selectedSession.sessionId)}
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--text-sub)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px"
                        }}
                        title="Click to copy Session ID"
                      >
                        <FiCopy size={10} />
                        {selectedSession.sessionId}
                        {copiedId && <span style={{ color: "var(--accent-mint)" }}>copied!</span>}
                      </span>
                      {selectedSession.ip && (
                        <span style={{ fontSize: "0.68rem", color: "var(--text-sub)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <FiWifi size={10} /> {selectedSession.ip}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="timeline-summary-stats">
                  <div className="summary-stat-cell">
                    <span className="stat-cell-num">{formatDuration(selectedSession.totalDuration)}</span>
                    <span className="stat-cell-lbl">Dwell Time</span>
                  </div>
                  <div className="summary-stat-cell">
                    <span className="stat-cell-num">{sessionStats.total}</span>
                    <span className="stat-cell-lbl">Actions</span>
                  </div>
                  <div className="summary-stat-cell">
                    <span className="stat-cell-num" style={{ color: "var(--accent-mint)" }}>
                      {sessionStats.successRate}
                    </span>
                    <span className="stat-cell-lbl">Success Rate</span>
                  </div>
                  <div className="summary-stat-cell">
                    <span className="stat-cell-num">
                      {sessionStats.avgLatency > 0 ? `${sessionStats.avgLatency}ms` : "< 1ms"}
                    </span>
                    <span className="stat-cell-lbl">Avg Latency</span>
                  </div>
                </div>
              </div>

              {/* Event Sub-Filter Strip */}
              <div
                style={{
                  padding: "0.45rem 1.25rem",
                  background: "var(--card-bg)",
                  borderBottom: "1px solid var(--card-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0
                }}
              >
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => setTimelineFilter("all")}
                    className={`round-day-pill ${timelineFilter === "all" ? "round-day-pill--active" : ""}`}
                    style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                  >
                    All Events ({selectedSession.events?.length || 0})
                  </button>
                  <button
                    onClick={() => setTimelineFilter("wallpapers")}
                    className={`round-day-pill ${timelineFilter === "wallpapers" ? "round-day-pill--active" : ""}`}
                    style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                  >
                    Wallpapers
                  </button>
                  <button
                    onClick={() => setTimelineFilter("clicks")}
                    className={`round-day-pill ${timelineFilter === "clicks" ? "round-day-pill--active" : ""}`}
                    style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                  >
                    Clicks
                  </button>
                  {sessionStats.failed > 0 && (
                    <button
                      onClick={() => setTimelineFilter("errors")}
                      className={`round-day-pill ${timelineFilter === "errors" ? "round-day-pill--active" : ""}`}
                      style={{
                        padding: "2px 8px",
                        fontSize: "0.7rem",
                        color: "var(--accent-rose)",
                        borderColor: "rgba(239, 68, 68, 0.4)"
                      }}
                    >
                      <FiAlertTriangle size={10} /> Errors ({sessionStats.failed})
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => setTimelineSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                    className="round-day-pill"
                    style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                    title="Toggle timeline ordering"
                  >
                    {timelineSortOrder === "asc" ? "Oldest First" : "Latest First"}
                  </button>
                </div>
              </div>

              {/* Internal Vertical Scrollable Trail */}
              <div className="timeline-trail-scroll">
                {/* Session Start Anchor */}
                <div className="trail-step-node">
                  <div className="step-time-lbl">
                    {new Date(selectedSession.createdAt || selectedSession.startedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </div>
                  <div className="step-connector-rail">
                    <div className="rail-line" style={{ top: "50%" }}></div>
                    <div className="rail-dot">
                      <FiPlay size={10} />
                    </div>
                  </div>
                  <div className="step-card-box">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#ffffff" }}>
                        Session Initiated
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-sub)" }}>
                        {selectedSession.deviceBrand || "Android"} • {selectedSession.deviceModel || "Mobile"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Nodes */}
                {filteredEvents.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-sub)", fontSize: "0.8rem" }}>
                    No events match current filter.
                  </div>
                ) : (
                  filteredEvents.map((ev, index) => {
                    const isFailed = ev.status === "FAILED";
                    const meta = getEventBadgeMeta(ev.type, ev.action);
                    const isExpanded = !!expandedEvents[index];
                    const eventTime = new Date(ev.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });

                    return (
                      <div key={index} className="trail-step-node">
                        {/* Time Stamp */}
                        <div className="step-time-lbl">{eventTime}</div>

                        {/* Visual Connector Dot & Line */}
                        <div className="step-connector-rail">
                          <div className="rail-line"></div>
                          <div className={`rail-dot ${isFailed ? "failed" : ""}`}>
                            {isFailed ? <FiAlertTriangle size={10} /> : meta.icon}
                          </div>
                        </div>

                        {/* Event Content Card */}
                        <div className={`step-card-box ${isFailed ? "failed" : ""}`}>
                          <div className="step-card-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span className={`action-badge-pill ${isFailed ? "failed" : ""}`}>
                                {meta.icon}
                                <span>{meta.label}</span>
                              </span>
                              <span className={`status-indicator-tag ${isFailed ? "failed" : "success"}`}>
                                {isFailed ? <FiAlertCircle size={9} /> : <FiCheck size={9} />}
                                {ev.status || "SUCCESS"}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {ev.durationMs ? (
                                <span className="duration-chip-box">
                                  <FiClock size={10} /> {ev.durationMs}ms
                                </span>
                              ) : null}
                              <button
                                onClick={() => toggleEventExpand(index)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--text-sub)",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center"
                                }}
                                title="Toggle JSON Payload"
                              >
                                {isExpanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                              </button>
                            </div>
                          </div>

                          {/* Target and Action description */}
                          <div className="step-target-row">
                            <span style={{ color: "var(--text-sub)" }}>Action:</span>
                            <span className="step-target-name">{ev.action || ev.type || "Interaction"}</span>
                            {ev.target && (
                              <>
                                <span style={{ color: "var(--text-sub)", marginLeft: "4px" }}>Target:</span>
                                <span className="step-target-name">{ev.target}</span>
                              </>
                            )}
                          </div>

                          {/* Error Message if failed */}
                          {isFailed && ev.errorMessage && (
                            <div className="error-banner-callout">
                              <strong>Exception:</strong> {ev.errorMessage}
                            </div>
                          )}

                          {/* Expandable Technical Details */}
                          {isExpanded && (
                            <pre
                              style={{
                                background: "rgba(0, 0, 0, 0.4)",
                                padding: "0.5rem",
                                borderRadius: "4px",
                                fontSize: "0.68rem",
                                color: "var(--text-main)",
                                overflowX: "auto",
                                marginTop: "4px"
                              }}
                            >
                              {JSON.stringify(ev.metadata || ev, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
