"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiUsers,
  FiUser,
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
  FiBell,
  FiPlay,
  FiKey,
  FiNavigation,
  FiMousePointer,
  FiXCircle
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
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Timeline-specific controls
  const [timelineFilter, setTimelineFilter] = useState("all"); // 'all', 'clicks', 'wallpapers', 'auth', 'errors'
  const [timelineSearch, setTimelineSearch] = useState("");
  const [timelineSortOrder, setTimelineSortOrder] = useState("asc"); // 'asc' = 1 to N, 'desc' = latest first
  const [expandedEvents, setExpandedEvents] = useState({});
  const [copiedId, setCopiedId] = useState(false);

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
        setSessions(data.sessions || []);
        setOverview(data.overview || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.totalRecords || 0);

        // Auto-select session
        if (data.sessions && data.sessions.length > 0) {
          if (!selectedSession) {
            setSelectedSession(data.sessions[0]);
          } else {
            const updated = data.sessions.find((s) => s.sessionId === selectedSession.sessionId);
            if (updated) setSelectedSession(updated);
            else setSelectedSession(data.sessions[0]);
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

  useEffect(() => {
    if (isAuthenticated && password) {
      fetchAnalytics(password, page, filterType, selectedDate, searchQuery, sortBy);
    }
  }, [isAuthenticated, password, page, filterType, selectedDate, sortBy]);

  // Auto-refresh interval (every 12s)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchAnalytics(password, page, filterType, selectedDate, searchQuery, sortBy);
    }, 12000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, password, page, filterType, selectedDate, searchQuery, sortBy]);

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

  // Helper formatting functions
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

  // Client-side processed sessions list (with sorting options)
  const sortedSessions = useMemo(() => {
    const list = [...sessions];
    if (sortBy === "actions") {
      list.sort((a, b) => (b.events?.length || 0) - (a.events?.length || 0));
    } else if (sortBy === "duration") {
      list.sort((a, b) => (b.totalDuration || 0) - (a.totalDuration || 0));
    } else if (sortBy === "errors") {
      const getErrors = (s) => (s.events || []).filter((e) => e.status === "FAILED").length;
      list.sort((a, b) => getErrors(b) - getErrors(a));
    }
    return list;
  }, [sessions, sortBy]);

  // Event category & SVG icon mapper (Zero Emojis)
  const getEventBadgeStyle = (type, action) => {
    const key = (type || action || "").toLowerCase();
    if (key.includes("apply_wallpaper")) {
      return { bg: "#10B981", border: "#059669", text: "#FFFFFF", label: "SET WALLPAPER", iconType: "wallpaper", category: "wallpapers" };
    }
    if (key.includes("download_success")) {
      return { bg: "#0EA5E9", border: "#0284C7", text: "#FFFFFF", label: "DOWNLOAD COMPLETED", iconType: "download", category: "wallpapers" };
    }
    if (key.includes("download_failed") || key.includes("download_error")) {
      return { bg: "#EF4444", border: "#DC2626", text: "#FFFFFF", label: "DOWNLOAD FAILED", iconType: "download_fail", category: "errors" };
    }
    if (key.includes("download_start")) {
      return { bg: "#8B5CF6", border: "#7C3AED", text: "#FFFFFF", label: "DOWNLOAD STARTED", iconType: "download", category: "wallpapers" };
    }
    if (key.includes("preview_stream")) {
      return { bg: "#F59E0B", border: "#D97706", text: "#0A0812", label: "PREVIEW STREAMED", iconType: "preview", category: "wallpapers" };
    }
    if (key.includes("delete_local_storage")) {
      return { bg: "#EF4444", border: "#DC2626", text: "#FFFFFF", label: "FREED STORAGE", iconType: "trash", category: "clicks" };
    }
    if (key.includes("google_signin_completed")) {
      return { bg: "#22C55E", border: "#16A34A", text: "#FFFFFF", label: "GOOGLE LOGIN SUCCESS", iconType: "auth", category: "auth" };
    }
    if (key.includes("google_signin")) {
      return { bg: "#3B82F6", border: "#2563EB", text: "#FFFFFF", label: "GOOGLE SIGN-IN", iconType: "auth", category: "auth" };
    }
    if (key.includes("sign_out")) {
      return { bg: "#64748B", border: "#475569", text: "#FFFFFF", label: "USER SIGN-OUT", iconType: "sign_out", category: "auth" };
    }
    if (key.includes("tab_clicked") || key.includes("tab_switch")) {
      return { bg: "#A855F7", border: "#9333EA", text: "#FFFFFF", label: "TAB NAVIGATION", iconType: "tab", category: "clicks" };
    }
    if (key.includes("notification")) {
      return { bg: "#EC4899", border: "#DB2777", text: "#FFFFFF", label: "NOTIFICATION EVENT", iconType: "bell", category: "clicks" };
    }
    if (key.includes("app_open")) {
      return { bg: "#6366F1", border: "#4F46E5", text: "#FFFFFF", label: "APP LAUNCH", iconType: "app", category: "clicks" };
    }
    if (key.includes("toggle") || key.includes("change")) {
      return { bg: "#14B8A6", border: "#0D9488", text: "#FFFFFF", label: "SETTING CHANGED", iconType: "settings", category: "clicks" };
    }
    return {
      bg: "#334155",
      border: "#475569",
      text: "#E2E8F0",
      label: (key || "ACTION").toUpperCase().replace(/_/g, " "),
      iconType: "action",
      category: "clicks"
    };
  };

  const renderBadgeIcon = (iconType) => {
    switch (iconType) {
      case "wallpaper": return <FiImage size={13} />;
      case "download": return <FiDownload size={13} />;
      case "download_fail": return <FiXCircle size={13} />;
      case "preview": return <FiPlay size={13} />;
      case "trash": return <FiTrash2 size={13} />;
      case "auth": return <FiKey size={13} />;
      case "sign_out": return <FiLogOut size={13} />;
      case "tab": return <FiNavigation size={13} />;
      case "bell": return <FiBell size={13} />;
      case "app": return <FiSmartphone size={13} />;
      case "settings": return <FiSettings size={13} />;
      default: return <FiZap size={13} />;
    }
  };

  // Selected session metrics calculation
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

  // Filtered & Sorted Timeline Events
  const filteredEvents = useMemo(() => {
    if (!selectedSession || !selectedSession.events) return [];
    let list = [...selectedSession.events];

    // Filter by Category
    if (timelineFilter !== "all") {
      list = list.filter((ev) => {
        const badge = getEventBadgeStyle(ev.type, ev.action);
        if (timelineFilter === "errors") return ev.status === "FAILED";
        return badge.category === timelineFilter;
      });
    }

    // Filter by Event Search query
    if (timelineSearch.trim()) {
      const q = timelineSearch.trim().toLowerCase();
      list = list.filter((ev) => {
        const text = `${ev.type} ${ev.action} ${ev.target} ${ev.errorMessage || ""}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Sort Order (asc = chronological 1 to N, desc = reverse)
    if (timelineSortOrder === "desc") {
      list.reverse();
    }

    return list;
  }, [selectedSession, timelineFilter, timelineSearch, timelineSortOrder]);

  // Helper to extract clean initials and color
  const getUserAvatarInfo = (session) => {
    const name = session.userName || session.email?.split("@")[0] || "Guest";
    const initial = name.charAt(0).toUpperCase();
    const colors = [
      "linear-gradient(135deg, #7C3AED, #EC4899)",
      "linear-gradient(135deg, #2563EB, #06B6D4)",
      "linear-gradient(135deg, #059669, #10B981)",
      "linear-gradient(135deg, #D97706, #F59E0B)",
      "linear-gradient(135deg, #DC2626, #EF4444)"
    ];
    const colorIndex = (name.charCodeAt(0) || 0) % colors.length;
    return { name, initial, gradient: colors[colorIndex], isAuth: !!session.userId };
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
      {/* Top Header Bar */}
      <header style={styles.topHeader}>
        <div style={styles.brandRow}>
          <div style={styles.brandLogoCircle}>
            <FiActivity size={22} color="#0A0812" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={styles.headerTitle}>VividWake Analytics</h1>
              <span style={styles.versionPill}>v2.0 APM</span>
            </div>
            <span style={styles.headerSubtitle}>Real-time Native Telemetry &amp; User Flow Explorer</span>
          </div>
        </div>

        <div style={styles.headerActions}>
          <div
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              ...styles.liveIndicator,
              backgroundColor: autoRefresh ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
              border: `1px solid ${autoRefresh ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              cursor: "pointer"
            }}
            title="Click to toggle auto-refresh"
          >
            <span style={{ ...styles.liveDot, backgroundColor: autoRefresh ? "#22C55E" : "#EF4444" }} />
            <span style={{ fontSize: "12px", color: autoRefresh ? "#4ADE80" : "#F87171", fontWeight: "600" }}>
              {autoRefresh ? "Live Sync (12s)" : "Paused"}
            </span>
          </div>

          <button
            onClick={() => fetchAnalytics(password, page, filterType, selectedDate, searchQuery, sortBy)}
            style={styles.btnAction}
            title="Refresh Data Now"
          >
            <FiRefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          <button onClick={handleLogout} style={styles.btnLogout} title="Lock Dashboard">
            <FiLogOut size={14} />
            <span>Lock</span>
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
            <div style={styles.kpiValue}>{overview?.authenticatedUsersCount || 0} / {overview?.uniqueDevicesCount || 0}</div>
            <div style={styles.kpiLabel}>Auth Users / Devices</div>
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

      {/* Global Filter & Search Bar */}
      <section style={styles.filterSection}>
        {/* Date Selector Row */}
        <div style={styles.dateSelectorRow}>
          <span style={styles.filterSectionLabel}>Date Range:</span>
          <div style={styles.datePillsRow}>
            <button
              onClick={() => { setSelectedDate(""); setPage(1); }}
              style={{
                ...styles.pillBtn,
                backgroundColor: selectedDate === "" ? "#D4AF37" : "#1A142E",
                color: selectedDate === "" ? "#0A0812" : "#9D8EB9"
              }}
            >
              All Time
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
        </div>

        {/* Search & Sort Controls Row */}
        <div style={styles.searchAndSortRow}>
          {/* Real-time Search Input */}
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <FiSearch size={16} color="#9D8EB9" style={{ marginLeft: "12px" }} />
            <input
              type="text"
              placeholder="Search by User Name, Email, Device, Session ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} style={styles.clearSearchBtn}>
                <FiX size={14} />
              </button>
            )}
            <button type="submit" style={styles.searchSubmitBtn}>
              Search
            </button>
          </form>

          {/* User Type Tabs with Vector Icons */}
          <div style={styles.userFilterRow}>
            <button
              onClick={() => { setFilterType("all"); setPage(1); }}
              style={{
                ...styles.typeBtn,
                backgroundColor: filterType === "all" ? "#7C3AED" : "#1A142E",
                color: "#FFFFFF"
              }}
            >
              <FiUsers size={13} style={{ marginRight: "6px" }} />
              <span>All Visitors</span>
            </button>
            <button
              onClick={() => { setFilterType("auth"); setPage(1); }}
              style={{
                ...styles.typeBtn,
                backgroundColor: filterType === "auth" ? "#7C3AED" : "#1A142E",
                color: "#FFFFFF"
              }}
            >
              <FiUser size={13} style={{ marginRight: "6px" }} />
              <span>Signed In</span>
            </button>
            <button
              onClick={() => { setFilterType("anon"); setPage(1); }}
              style={{
                ...styles.typeBtn,
                backgroundColor: filterType === "anon" ? "#7C3AED" : "#1A142E",
                color: "#FFFFFF"
              }}
            >
              <FiSmartphone size={13} style={{ marginRight: "6px" }} />
              <span>Anonymous</span>
            </button>
            <button
              onClick={() => { setFilterType("errors"); setPage(1); }}
              style={{
                ...styles.typeBtn,
                backgroundColor: filterType === "errors" ? "#EF4444" : "#1A142E",
                color: "#FFFFFF"
              }}
            >
              <FiAlertTriangle size={13} style={{ marginRight: "6px" }} />
              <span>Has Errors</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div style={styles.sortDropdownWrap}>
            <FiSliders size={14} color="#9D8EB9" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              style={styles.sortSelect}
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="actions">Sort: Most Actions / Clicks</option>
              <option value="duration">Sort: Longest Session</option>
              <option value="errors">Sort: Most Errors First</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Two-Column Explorer Layout (Full-Height Flex Grid) */}
      <div style={styles.mainGrid}>
        {/* LEFT COLUMN: Sessions List */}
        <div style={styles.sessionsCol}>
          <div style={styles.colHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={styles.colTitle}>Sessions</h3>
              <span style={styles.countBadge}>{totalRecords}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#9D8EB9" }}>Page {page} of {totalPages}</span>
          </div>

          <div style={styles.sessionListScroll}>
            {sortedSessions.length === 0 ? (
              <div style={styles.emptyCard}>
                <FiActivity size={36} color="#6E6188" />
                <p style={{ marginTop: "12px", fontWeight: "600" }}>No sessions found</p>
                <span style={{ fontSize: "12px", color: "#9D8EB9" }}>Try adjusting your search query or date filters</span>
              </div>
            ) : (
              sortedSessions.map((sess) => {
                const isSelected = selectedSession?.sessionId === sess.sessionId;
                const avatar = getUserAvatarInfo(sess);
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
                    style={{
                      ...styles.sessionCard,
                      borderLeft: isSelected ? "4px solid #D4AF37" : "4px solid transparent",
                      backgroundColor: isSelected ? "#22193D" : "#171228"
                    }}
                  >
                    <div style={styles.sessionCardHeader}>
                      {/* User Avatar Circle */}
                      <div style={styles.avatarWrap}>
                        {sess.userPhoto ? (
                          <img
                            src={sess.userPhoto}
                            alt={avatar.name}
                            style={styles.avatarImg}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : null}
                        <div
                          style={{
                            ...styles.avatarFallback,
                            background: avatar.gradient,
                            display: sess.userPhoto ? "none" : "flex"
                          }}
                        >
                          {avatar.initial}
                        </div>
                      </div>

                      {/* User Info / Device Title */}
                      <div style={styles.sessionUserMeta}>
                        <div style={styles.userNameRow}>
                          <span style={styles.userNameText}>
                            {sess.userName || (sess.email ? sess.email.split("@")[0] : `${sess.deviceBrand || "Android"} Device`)}
                          </span>
                          {sess.userId && (
                            <span style={styles.googleVerifiedBadge}>
                              <FiCheck size={10} style={{ marginRight: "2px" }} />
                              G-Auth
                            </span>
                          )}
                          {errorCount > 0 && (
                            <span style={styles.errorIndicatorBadge}>
                              <FiAlertTriangle size={10} style={{ marginRight: "2px" }} />
                              {errorCount}
                            </span>
                          )}
                        </div>

                        <span style={styles.userSubText}>
                          {sess.email || `${sess.deviceBrand || "Android"} ${sess.deviceModel || ""}`}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <span style={styles.sessionTimeTag}>{formattedTime}</span>
                    </div>

                    {/* Metadata Badges with SVG Icons */}
                    <div style={styles.sessionMetaBadges}>
                      <span style={styles.metaChip}>
                        <FiSmartphone size={11} /> {sess.deviceModel || "Android"}
                      </span>
                      <span style={styles.metaChip}>
                        <FiClock size={11} /> {formatDuration(sess.totalDuration)}
                      </span>
                      <span style={{ ...styles.metaChip, backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#C084FC" }}>
                        <FiZap size={11} /> {eventCount} {eventCount === 1 ? "action" : "actions"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={styles.paginationRow}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={styles.pageBtn}
              >
                <FiChevronLeft /> Prev
              </button>
              <span style={{ fontSize: "13px", color: "#E9D5FF" }}>{page} / {totalPages}</span>
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

        {/* RIGHT COLUMN: Journey Timeline Flow */}
        <div style={styles.timelineCol}>
          {!selectedSession ? (
            <div style={styles.emptyCard}>
              <FiLayers size={44} color="#6E6188" />
              <p style={{ marginTop: "14px", fontSize: "16px", fontWeight: "600", color: "#E2E8F0" }}>
                Select a session on the left to inspect its live journey
              </p>
              <span style={{ fontSize: "13px", color: "#9D8EB9", marginTop: "4px" }}>
                Every single click, execution duration in ms, and exception block will appear here
              </span>
            </div>
          ) : (
            <div style={styles.timelineWrapper}>
              {/* Profile & Device Identity Banner */}
              <div style={styles.userProfileBanner}>
                <div style={styles.userProfileTop}>
                  <div style={styles.bannerAvatarWrap}>
                    {selectedSession.userPhoto ? (
                      <img
                        src={selectedSession.userPhoto}
                        alt="Avatar"
                        style={styles.bannerAvatarImg}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : null}
                    <div
                      style={{
                        ...styles.bannerAvatarFallback,
                        background: getUserAvatarInfo(selectedSession).gradient,
                        display: selectedSession.userPhoto ? "none" : "flex"
                      }}
                    >
                      {getUserAvatarInfo(selectedSession).initial}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h2 style={styles.bannerUserName}>
                        {selectedSession.userName || selectedSession.email?.split("@")[0] || "Guest Visitor"}
                      </h2>
                      {selectedSession.userId ? (
                        <span style={styles.authStatusBadge}>
                          <FiCheckCircle size={12} style={{ marginRight: "4px" }} />
                          Google Account Verified
                        </span>
                      ) : (
                        <span style={styles.guestStatusBadge}>
                          <FiSmartphone size={12} style={{ marginRight: "4px" }} />
                          Anonymous Guest
                        </span>
                      )}
                    </div>

                    <div style={styles.bannerSubInfoRow}>
                      {selectedSession.email && (
                        <span style={styles.bannerEmailText}>{selectedSession.email}</span>
                      )}
                      <span style={styles.bannerDeviceText}>
                        {selectedSession.deviceBrand} {selectedSession.deviceModel} • {selectedSession.osVersion || "Android"}
                      </span>
                      {selectedSession.ip && (
                        <span style={styles.bannerIpText}><FiGlobe size={11} /> IP: {selectedSession.ip}</span>
                      )}
                    </div>
                  </div>

                  {/* Copy Session ID Button */}
                  <button
                    onClick={() => copySessionId(selectedSession.sessionId)}
                    style={styles.btnCopyId}
                    title="Copy Session ID"
                  >
                    <FiCopy size={13} />
                    <span>{copiedId ? "Copied!" : "Copy Session ID"}</span>
                  </button>
                </div>

                {/* Session Summary KPI Strip */}
                <div style={styles.sessionKpiStrip}>
                  <div style={styles.miniKpiBox}>
                    <span style={styles.miniKpiValue}>{sessionStats.total}</span>
                    <span style={styles.miniKpiLabel}>Actions / Clicks</span>
                  </div>
                  <div style={styles.miniKpiBox}>
                    <span style={{ ...styles.miniKpiValue, color: "#4ADE80" }}>{sessionStats.success}</span>
                    <span style={styles.miniKpiLabel}>Successful</span>
                  </div>
                  <div style={styles.miniKpiBox}>
                    <span style={{ ...styles.miniKpiValue, color: sessionStats.failed > 0 ? "#F87171" : "#9D8EB9" }}>
                      {sessionStats.failed}
                    </span>
                    <span style={styles.miniKpiLabel}>Failures / Exceptions</span>
                  </div>
                  <div style={styles.miniKpiBox}>
                    <span style={{ ...styles.miniKpiValue, color: "#FBBF24" }}>
                      {sessionStats.avgLatency > 0 ? `${sessionStats.avgLatency}ms` : "Fast (<5ms)"}
                    </span>
                    <span style={styles.miniKpiLabel}>Avg Action Latency</span>
                  </div>
                  <div style={styles.miniKpiBox}>
                    <span style={{ ...styles.miniKpiValue, color: "#C084FC" }}>
                      {formatDuration(selectedSession.totalDuration)}
                    </span>
                    <span style={styles.miniKpiLabel}>Session Dwell</span>
                  </div>
                </div>
              </div>

              {/* Timeline Filter & Search Bar */}
              <div style={styles.timelineToolbar}>
                <div style={styles.timelineTabsRow}>
                  <button
                    onClick={() => setTimelineFilter("all")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "all" ? "#7C3AED" : "#1A142E",
                      color: "#FFFFFF"
                    }}
                  >
                    <FiActivity size={12} style={{ marginRight: "4px" }} />
                    <span>All Actions ({sessionStats.total})</span>
                  </button>
                  <button
                    onClick={() => setTimelineFilter("wallpapers")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "wallpapers" ? "#7C3AED" : "#1A142E",
                      color: "#FFFFFF"
                    }}
                  >
                    <FiImage size={12} style={{ marginRight: "4px" }} />
                    <span>Wallpapers</span>
                  </button>
                  <button
                    onClick={() => setTimelineFilter("clicks")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "clicks" ? "#7C3AED" : "#1A142E",
                      color: "#FFFFFF"
                    }}
                  >
                    <FiMousePointer size={12} style={{ marginRight: "4px" }} />
                    <span>UI &amp; Clicks</span>
                  </button>
                  <button
                    onClick={() => setTimelineFilter("auth")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "auth" ? "#7C3AED" : "#1A142E",
                      color: "#FFFFFF"
                    }}
                  >
                    <FiKey size={12} style={{ marginRight: "4px" }} />
                    <span>Auth &amp; Account</span>
                  </button>
                  <button
                    onClick={() => setTimelineFilter("errors")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "errors" ? "#EF4444" : "#1A142E",
                      color: "#FFFFFF"
                    }}
                  >
                    <FiAlertCircle size={12} style={{ marginRight: "4px" }} />
                    <span>Errors ({sessionStats.failed})</span>
                  </button>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {/* Timeline Search */}
                  <div style={styles.timelineSearchWrap}>
                    <FiSearch size={14} color="#9D8EB9" />
                    <input
                      type="text"
                      placeholder="Filter session events..."
                      value={timelineSearch}
                      onChange={(e) => setTimelineSearch(e.target.value)}
                      style={styles.timelineSearchInput}
                    />
                    {timelineSearch && (
                      <button onClick={() => setTimelineSearch("")} style={styles.timelineClearSearch}>
                        <FiX size={12} />
                      </button>
                    )}
                  </div>

                  {/* Chronological Sorting Switch */}
                  <button
                    onClick={() => setTimelineSortOrder(timelineSortOrder === "asc" ? "desc" : "asc")}
                    style={styles.btnSortOrder}
                    title="Toggle timeline order"
                  >
                    <FiSliders size={12} style={{ marginRight: "4px" }} />
                    <span>{timelineSortOrder === "asc" ? "Flow: 1 → End" : "Flow: Latest First"}</span>
                  </button>
                </div>
              </div>

              {/* Event Tree Timeline Cards */}
              <div style={styles.eventsScrollContainer}>
                {filteredEvents.length === 0 ? (
                  <div style={styles.emptyCard}>
                    <FiActivity size={32} color="#6E6188" />
                    <p style={{ color: "#9D8EB9", marginTop: "10px" }}>No actions match this filter in this session.</p>
                  </div>
                ) : (
                  filteredEvents.map((ev, index) => {
                    const badge = getEventBadgeStyle(ev.type, ev.action);
                    const isExpanded = !!expandedEvents[index];
                    const timeObj = new Date(ev.timestamp);
                    const formattedTime = timeObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });

                    return (
                      <div key={index} style={styles.eventRowCard}>
                        {/* Left timeline indicator */}
                        <div style={styles.eventLeftCol}>
                          <span style={styles.stepBadge}>#{index + 1}</span>
                          <span style={styles.eventTimeText}>{formattedTime}</span>
                          <div style={styles.timelineVerticalLine} />
                          <div style={{ ...styles.timelineDot, backgroundColor: badge.bg }} />
                        </div>

                        {/* Event Details Card */}
                        <div
                          style={{
                            ...styles.eventCardBody,
                            borderLeft: `4px solid ${badge.bg}`,
                            backgroundColor: ev.status === "FAILED" ? "#2B161E" : "#1B1530"
                          }}
                        >
                          <div style={styles.eventCardTop}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ ...styles.categoryBadge, backgroundColor: badge.bg, color: badge.text }}>
                                {renderBadgeIcon(badge.iconType)}
                                <span style={{ marginLeft: "5px" }}>{badge.label}</span>
                              </span>

                              {ev.status && (
                                <span
                                  style={{
                                    ...styles.statusChip,
                                    backgroundColor: ev.status === "SUCCESS" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.2)",
                                    color: ev.status === "SUCCESS" ? "#4ADE80" : "#F87171",
                                    border: `1px solid ${ev.status === "SUCCESS" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`
                                  }}
                                >
                                  {ev.status === "SUCCESS" ? (
                                    <>
                                      <FiCheck size={10} style={{ marginRight: "3px" }} />
                                      <span>SUCCESS</span>
                                    </>
                                  ) : (
                                    <>
                                      <FiX size={10} style={{ marginRight: "3px" }} />
                                      <span>FAILED</span>
                                    </>
                                  )}
                                </span>
                              )}

                              {(ev.durationMs > 0 || ev.durationSec) && (
                                <span style={styles.durationChip}>
                                  <FiZap size={10} style={{ marginRight: "3px" }} />
                                  <span>{ev.durationMs > 0 ? `${ev.durationMs}ms` : `${ev.durationSec}`}</span>
                                </span>
                              )}

                              {ev.dwellMs > 0 && (
                                <span style={styles.dwellChip}>
                                  <FiClock size={10} style={{ marginRight: "3px" }} />
                                  <span>{(ev.dwellMs / 1000).toFixed(1)}s dwell</span>
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => toggleEventExpand(index)}
                              style={styles.btnExpandEvent}
                              title="Toggle payload details"
                            >
                              {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                              <span>{isExpanded ? "Collapse" : "Details"}</span>
                            </button>
                          </div>

                          {/* Target Tag */}
                          {ev.target && (
                            <div style={styles.targetRow}>
                              <FiImage size={12} color="#86789D" />
                              <span style={styles.targetLabel}>Target:</span>
                              <span style={styles.targetValue}>{ev.target}</span>
                            </div>
                          )}

                          {/* Error Banner if Try/Catch failed */}
                          {ev.errorMessage && (
                            <div style={styles.errorAlertBox}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                <FiAlertTriangle size={15} color="#EF4444" />
                                <strong style={{ color: "#F87171", fontSize: "13px" }}>
                                  {ev.errorType || "Application Exception"}
                                </strong>
                              </div>
                              <span style={styles.errorMessageText}>{ev.errorMessage}</span>
                            </div>
                          )}

                          {/* Expandable Parameters / JSON Viewer */}
                          {isExpanded && (
                            <div style={styles.expandedDetailsWrap}>
                              <span style={styles.jsonHeader}>Telemetry Parameters Payload:</span>
                              <pre style={styles.jsonPre}>
                                {JSON.stringify(ev, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Modern Full-Height Dark Theme Styles (Zero White Space)
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
    backgroundColor: "#171228",
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
    padding: "12px 16px",
    backgroundColor: "#0A0812",
    border: "1px solid #3D3254",
    borderRadius: "10px",
    color: "#FFFFFF",
    fontSize: "14px",
    marginBottom: "16px",
    outline: "none"
  },
  loginButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#D4AF37",
    color: "#0A0812",
    fontWeight: "700",
    fontSize: "14px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  loginError: {
    color: "#F87171",
    fontSize: "13px",
    marginBottom: "12px"
  },

  // Main Dashboard Full-Height Layout
  dashboardContainer: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#0A0812",
    color: "#F3E8FF",
    display: "flex",
    flexDirection: "column",
    padding: "16px 24px",
    boxSizing: "border-box"
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "16px",
    borderBottom: "1px solid #231C38",
    flexWrap: "wrap",
    gap: "12px"
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  brandLogoCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #D4AF37, #F59E0B)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 16px rgba(212, 175, 55, 0.3)"
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: "-0.3px"
  },
  versionPill: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    color: "#C084FC",
    border: "1px solid rgba(168, 85, 247, 0.4)",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "12px"
  },
  headerSubtitle: {
    fontSize: "12px",
    color: "#9D8EB9"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px"
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%"
  },
  btnAction: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#1A142E",
    border: "1px solid #3D3254",
    color: "#E2E8F0",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },
  btnLogout: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#F87171",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },

  // KPI Grid
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    margin: "18px 0"
  },
  kpiCard: {
    backgroundColor: "#151024",
    border: "1px solid #261D3D",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  },
  kpiIconWrap: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  kpiValue: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#FFFFFF"
  },
  kpiLabel: {
    fontSize: "11px",
    color: "#9D8EB9",
    marginTop: "2px"
  },

  // Filter Section
  filterSection: {
    backgroundColor: "#151024",
    border: "1px solid #261D3D",
    borderRadius: "14px",
    padding: "14px 18px",
    marginBottom: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  filterSectionLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#9D8EB9",
    marginRight: "6px"
  },
  dateSelectorRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px"
  },
  datePillsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },
  pillBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #332650",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    gap: "5px",
    alignItems: "center",
    transition: "all 0.15s ease"
  },

  searchAndSortRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px"
  },
  searchForm: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#0E0B18",
    border: "1px solid #332650",
    borderRadius: "10px",
    flex: "1 1 320px",
    minWidth: "260px"
  },
  searchInput: {
    flex: 1,
    padding: "10px 12px",
    backgroundColor: "transparent",
    border: "none",
    color: "#FFFFFF",
    fontSize: "13px",
    outline: "none"
  },
  clearSearchBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#9D8EB9",
    cursor: "pointer",
    padding: "4px 8px"
  },
  searchSubmitBtn: {
    backgroundColor: "#7C3AED",
    border: "none",
    color: "#FFFFFF",
    padding: "8px 14px",
    margin: "4px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },

  userFilterRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  typeBtn: {
    display: "flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #332650",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease"
  },

  sortDropdownWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#0E0B18",
    border: "1px solid #332650",
    borderRadius: "8px",
    padding: "4px 10px"
  },
  sortSelect: {
    backgroundColor: "transparent",
    border: "none",
    color: "#E2E8F0",
    fontSize: "12px",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer"
  },

  // Main Responsive Grid (Filling Full Available Height)
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: "18px",
    flex: 1,
    alignItems: "stretch",
    minHeight: "650px",
    marginBottom: "16px"
  },

  // Left Column: Sessions List
  sessionsCol: {
    backgroundColor: "#130E22",
    border: "1px solid #231C38",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "calc(100vh - 280px)",
    minHeight: "600px"
  },
  colHeader: {
    padding: "14px 16px",
    borderBottom: "1px solid #231C38",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#171228"
  },
  colTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#FFFFFF"
  },
  countBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    color: "#D4AF37",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700"
  },
  sessionListScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  sessionCard: {
    borderRadius: "10px",
    padding: "12px",
    cursor: "pointer",
    border: "1px solid #261E3E",
    transition: "all 0.15s ease"
  },
  sessionCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  avatarWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: "14px"
  },
  sessionUserMeta: {
    flex: 1,
    minWidth: 0
  },
  userNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  userNameText: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#FFFFFF",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  googleVerifiedBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    color: "#4ADE80",
    fontSize: "9px",
    fontWeight: "700",
    padding: "1px 5px",
    borderRadius: "4px"
  },
  errorIndicatorBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#F87171",
    fontSize: "10px",
    fontWeight: "700",
    padding: "1px 6px",
    borderRadius: "10px"
  },
  userSubText: {
    fontSize: "11px",
    color: "#9D8EB9",
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: "2px"
  },
  sessionTimeTag: {
    fontSize: "11px",
    color: "#6E6188",
    flexShrink: 0
  },
  sessionMetaBadges: {
    display: "flex",
    gap: "6px",
    marginTop: "8px",
    flexWrap: "wrap"
  },
  metaChip: {
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#9D8EB9",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  paginationRow: {
    padding: "10px 14px",
    borderTop: "1px solid #231C38",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#171228"
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#1A142E",
    border: "1px solid #332650",
    color: "#E2E8F0",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer"
  },

  // Right Column: Timeline Flow
  timelineCol: {
    backgroundColor: "#130E22",
    border: "1px solid #231C38",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "calc(100vh - 280px)",
    minHeight: "600px"
  },
  timelineWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden"
  },
  userProfileBanner: {
    padding: "18px 20px",
    borderBottom: "1px solid #261D3D",
    backgroundColor: "#171228",
    flexShrink: 0
  },
  userProfileTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap"
  },
  bannerAvatarWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    overflow: "hidden",
    boxShadow: "0 0 12px rgba(124, 58, 237, 0.4)",
    flexShrink: 0
  },
  bannerAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  bannerAvatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: "20px"
  },
  bannerUserName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#FFFFFF"
  },
  authStatusBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    color: "#4ADE80",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "12px"
  },
  guestStatusBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: "#9D8EB9",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "12px"
  },
  bannerSubInfoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "4px",
    flexWrap: "wrap"
  },
  bannerEmailText: {
    fontSize: "12px",
    color: "#D4AF37",
    fontWeight: "600"
  },
  bannerDeviceText: {
    fontSize: "12px",
    color: "#9D8EB9"
  },
  bannerIpText: {
    fontSize: "11px",
    color: "#6E6188",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  btnCopyId: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid #332650",
    color: "#C084FC",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer"
  },

  // KPI Strip
  sessionKpiStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: "10px",
    marginTop: "16px",
    backgroundColor: "#0F0B1A",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #231B38"
  },
  miniKpiBox: {
    display: "flex",
    flexDirection: "column"
  },
  miniKpiValue: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#FFFFFF"
  },
  miniKpiLabel: {
    fontSize: "10px",
    color: "#86789D",
    marginTop: "2px"
  },

  // Timeline Toolbar
  timelineToolbar: {
    padding: "10px 18px",
    borderBottom: "1px solid #231C38",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    backgroundColor: "#161026",
    flexShrink: 0
  },
  timelineTabsRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  timelineTabBtn: {
    display: "flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #332650",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer"
  },
  timelineSearchWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#0D0918",
    border: "1px solid #332650",
    borderRadius: "6px",
    padding: "0 8px"
  },
  timelineSearchInput: {
    padding: "6px 8px",
    backgroundColor: "transparent",
    border: "none",
    color: "#FFFFFF",
    fontSize: "12px",
    outline: "none",
    width: "160px"
  },
  timelineClearSearch: {
    background: "transparent",
    border: "none",
    color: "#9D8EB9",
    cursor: "pointer"
  },
  btnSortOrder: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#1A142E",
    border: "1px solid #332650",
    color: "#D4AF37",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer"
  },

  // Events Scroll List
  eventsScrollContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  eventRowCard: {
    display: "flex",
    gap: "14px"
  },
  eventLeftCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "74px",
    position: "relative",
    flexShrink: 0
  },
  stepBadge: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#D4AF37",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    padding: "2px 6px",
    borderRadius: "4px",
    marginBottom: "4px"
  },
  eventTimeText: {
    fontSize: "11px",
    color: "#9D8EB9",
    fontWeight: "600"
  },
  timelineVerticalLine: {
    position: "absolute",
    top: "38px",
    bottom: "-14px",
    width: "2px",
    backgroundColor: "#261D3D"
  },
  timelineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginTop: "8px",
    zIndex: 2
  },

  eventCardBody: {
    flex: 1,
    borderRadius: "10px",
    padding: "12px 16px",
    border: "1px solid #281F42"
  },
  eventCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px"
  },
  categoryBadge: {
    display: "flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.4px"
  },
  statusChip: {
    display: "flex",
    alignItems: "center",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "700"
  },
  durationChip: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    color: "#FBBF24",
    border: "1px solid rgba(234, 179, 8, 0.3)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "700"
  },
  dwellChip: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    color: "#C084FC",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "600"
  },
  btnExpandEvent: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "transparent",
    border: "none",
    color: "#9D8EB9",
    fontSize: "11px",
    cursor: "pointer"
  },
  targetRow: {
    marginTop: "8px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  targetLabel: {
    color: "#86789D",
    fontWeight: "600"
  },
  targetValue: {
    color: "#E2E8F0",
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  errorAlertBox: {
    marginTop: "10px",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    borderRadius: "8px",
    padding: "8px 12px"
  },
  errorMessageText: {
    color: "#FCA5A5",
    fontSize: "12px",
    fontFamily: "monospace",
    display: "block",
    wordBreak: "break-word"
  },
  expandedDetailsWrap: {
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid #281F42"
  },
  jsonHeader: {
    fontSize: "11px",
    color: "#9D8EB9",
    fontWeight: "600",
    display: "block",
    marginBottom: "6px"
  },
  jsonPre: {
    backgroundColor: "#0A0812",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "11px",
    color: "#A5B4FC",
    overflowX: "auto",
    lineHeight: "1.4"
  },

  emptyCard: {
    flex: 1,
    height: "100%",
    padding: "40px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#9D8EB9"
  }
};
