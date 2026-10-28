"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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

  // Keep auto-refresh OFF by default so page never jumps
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Timeline-specific controls
  const [timelineFilter, setTimelineFilter] = useState("all"); // 'all', 'clicks', 'wallpapers', 'auth', 'errors'
  const [timelineSearch, setTimelineSearch] = useState("");
  const [timelineSortOrder, setTimelineSortOrder] = useState("asc"); // 'asc' = 1 to N, 'desc' = latest first
  const [expandedEvents, setExpandedEvents] = useState({});
  const [copiedId, setCopiedId] = useState(false);

  // Ref to preserve currently selected session ID across refreshes without jumping
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
        const fetchedSessions = data.sessions || [];
        setSessions(fetchedSessions);
        setOverview(data.overview || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.totalRecords || 0);

        // Intelligently preserve currently viewed session without jumping
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

  // Optional background auto-refresh (only if user explicitly enables it)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchAnalytics(password, page, filterType, selectedDate, searchQuery, sortBy);
    }, 25000);
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

  // Processed sessions list
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

  // Unified Clean Color & Icon Mapper (No Rainbow Emojis)
  const getEventBadgeStyle = (type, action) => {
    const key = (type || action || "").toLowerCase();
    if (key.includes("apply_wallpaper")) {
      return { label: "SET WALLPAPER", iconType: "wallpaper", category: "wallpapers" };
    }
    if (key.includes("download_success")) {
      return { label: "DOWNLOAD COMPLETED", iconType: "download", category: "wallpapers" };
    }
    if (key.includes("download_failed") || key.includes("download_error")) {
      return { label: "DOWNLOAD FAILED", iconType: "download_fail", category: "errors" };
    }
    if (key.includes("download_start")) {
      return { label: "DOWNLOAD STARTED", iconType: "download", category: "wallpapers" };
    }
    if (key.includes("preview_stream")) {
      return { label: "PREVIEW STREAMED", iconType: "preview", category: "wallpapers" };
    }
    if (key.includes("delete_local_storage")) {
      return { label: "FREED STORAGE", iconType: "trash", category: "clicks" };
    }
    if (key.includes("google_signin_completed")) {
      return { label: "GOOGLE LOGIN SUCCESS", iconType: "auth", category: "auth" };
    }
    if (key.includes("google_signin")) {
      return { label: "GOOGLE SIGN-IN", iconType: "auth", category: "auth" };
    }
    if (key.includes("sign_out")) {
      return { label: "USER SIGN-OUT", iconType: "sign_out", category: "auth" };
    }
    if (key.includes("tab_clicked") || key.includes("tab_switch")) {
      return { label: "TAB NAVIGATION", iconType: "tab", category: "clicks" };
    }
    if (key.includes("notification")) {
      return { label: "NOTIFICATION EVENT", iconType: "bell", category: "clicks" };
    }
    if (key.includes("app_open")) {
      return { label: "APP LAUNCH", iconType: "app", category: "clicks" };
    }
    if (key.includes("toggle") || key.includes("change")) {
      return { label: "SETTING CHANGED", iconType: "settings", category: "clicks" };
    }
    return {
      label: (key || "ACTION").toUpperCase().replace(/_/g, " "),
      iconType: "action",
      category: "clicks"
    };
  };

  const renderBadgeIcon = (iconType) => {
    switch (iconType) {
      case "wallpaper": return <FiImage size={13} />;
      case "download": return <FiDownload size={13} />;
      case "download_fail": return <FiXCircle size={13} color="#FB7185" />;
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

  // Clean initials and subtle frosted avatar
  const getUserAvatarInfo = (session) => {
    const name = session.userName || session.email?.split("@")[0] || "Guest";
    const initial = name.charAt(0).toUpperCase();
    return { name, initial, isAuth: !!session.userId };
  };

  // ──────────────────────────────────────────────────────────
  // 1. Password Protection Gate (Glassmorphic)
  // ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard} className="glass-panel">
          <div style={styles.lockIconCircle}>
            <FiLock size={28} color="#818CF8" />
          </div>
          <h1 style={styles.loginTitle}>VividWake Console</h1>
          <p style={styles.loginSubtitle}>
            Administrative telemetry dashboard. Enter master password to access session analytics.
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
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 2. Main Admin Dashboard View (Glassmorphism & Light Accents)
  // ──────────────────────────────────────────────────────────
  const metrics = overview?.metrics || {};

  return (
    <div style={styles.dashboardContainer}>
      {/* Top Header Bar */}
      <header style={styles.topHeader}>
        <div style={styles.brandRow}>
          <div style={styles.brandLogoCircle}>
            <FiActivity size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={styles.headerTitle}>VividWake Analytics</h1>
              <span style={styles.versionPill}>v2.0 APM</span>
            </div>
            <span style={styles.headerSubtitle}>Real-time telemetry and user journey monitoring</span>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            onClick={() => fetchAnalytics(password, page, filterType, selectedDate, searchQuery, sortBy)}
            style={styles.btnAction}
            title="Refresh Data"
          >
            <FiRefreshCw size={13} className={loading ? "spin-anim" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button onClick={handleLogout} style={styles.btnLogout} title="Lock Dashboard">
            <FiLogOut size={13} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* KPI Summary Cards Grid (Minimal Glassmorphic) */}
      <section style={styles.kpiGrid}>
        <div style={styles.kpiCard} className="glass-panel">
          <div style={styles.kpiIconWrap}><FiSmartphone color="#818CF8" size={18} /></div>
          <div>
            <div style={styles.kpiValue}>{overview?.totalSessions || 0}</div>
            <div style={styles.kpiLabel}>Total Sessions</div>
          </div>
        </div>

        <div style={styles.kpiCard} className="glass-panel">
          <div style={styles.kpiIconWrap}><FiUsers color="#818CF8" size={18} /></div>
          <div>
            <div style={styles.kpiValue}>{overview?.authenticatedUsersCount || 0} / {overview?.uniqueDevicesCount || 0}</div>
            <div style={styles.kpiLabel}>Auth Users / Devices</div>
          </div>
        </div>

        <div style={styles.kpiCard} className="glass-panel">
          <div style={styles.kpiIconWrap}><FiEye color="#818CF8" size={18} /></div>
          <div>
            <div style={styles.kpiValue}>{metrics.totalPreviews || 0}</div>
            <div style={styles.kpiLabel}>Previews Streamed</div>
          </div>
        </div>

        <div style={styles.kpiCard} className="glass-panel">
          <div style={styles.kpiIconWrap}><FiDownload color="#34D399" size={18} /></div>
          <div>
            <div style={styles.kpiValue}>{metrics.totalDownloadsCompleted || 0}</div>
            <div style={styles.kpiLabel}>Downloads Completed</div>
          </div>
        </div>

        <div style={styles.kpiCard} className="glass-panel">
          <div style={styles.kpiIconWrap}><FiCheckCircle color="#34D399" size={18} /></div>
          <div>
            <div style={styles.kpiValue}>{metrics.totalAppliedToLockScreen || 0}</div>
            <div style={styles.kpiLabel}>Applied to Lock Screen</div>
          </div>
        </div>

        <div style={styles.kpiCard} className="glass-panel">
          <div style={styles.kpiIconWrap}><FiTrash2 color="#94A3B8" size={18} /></div>
          <div>
            <div style={styles.kpiValue}>{metrics.totalDeletedStorage || 0}</div>
            <div style={styles.kpiLabel}>Storage Cleanups</div>
          </div>
        </div>
      </section>

      {/* Global Filter & Search Bar */}
      <section style={styles.filterSection} className="glass-panel">
        {/* Date Selector Row */}
        <div style={styles.dateSelectorRow}>
          <span style={styles.filterSectionLabel}>Date Range:</span>
          <div style={styles.datePillsRow}>
            <button
              onClick={() => { setSelectedDate(""); setPage(1); }}
              style={{
                ...styles.pillBtn,
                backgroundColor: selectedDate === "" ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                borderColor: selectedDate === "" ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                color: selectedDate === "" ? "#FFFFFF" : "#94A3B8"
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
                  backgroundColor: selectedDate === day.ymd ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  borderColor: selectedDate === day.ymd ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                  color: selectedDate === day.ymd ? "#FFFFFF" : "#94A3B8",
                  fontWeight: selectedDate === day.ymd ? "600" : "400"
                }}
              >
                <span>{day.dayName}</span>
                <span style={{ fontSize: "11px", opacity: 0.75 }}>{day.monthName} {day.dayNum}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sort Controls Row */}
        <div style={styles.searchAndSortRow}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <FiSearch size={15} color="#94A3B8" style={{ marginLeft: "12px" }} />
            <input
              type="text"
              placeholder="Search user, device, session ID..."
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

          {/* User Type Tabs */}
          <div style={styles.userFilterRow}>
            <button
              onClick={() => { setFilterType("all"); setPage(1); }}
              style={{
                ...styles.typeBtn,
                backgroundColor: filterType === "all" ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                borderColor: filterType === "all" ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                color: filterType === "all" ? "#FFFFFF" : "#94A3B8"
              }}
            >
              <FiUsers size={12} style={{ marginRight: "6px" }} />
              <span>All</span>
            </button>
            <button
              onClick={() => { setFilterType("auth"); setPage(1); }}
              style={{
                ...styles.typeBtn,
                backgroundColor: filterType === "auth" ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                borderColor: filterType === "auth" ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                color: filterType === "auth" ? "#FFFFFF" : "#94A3B8"
              }}
            >
              <FiUser size={12} style={{ marginRight: "6px" }} />
              <span>Signed In</span>
            </button>
            <button
              onClick={() => { setFilterType("anon"); setPage(1); }}
              style={{
                ...styles.typeBtn,
                backgroundColor: filterType === "anon" ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                borderColor: filterType === "anon" ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                color: filterType === "anon" ? "#FFFFFF" : "#94A3B8"
              }}
            >
              <FiSmartphone size={12} style={{ marginRight: "6px" }} />
              <span>Anonymous</span>
            </button>
            <button
              onClick={() => { setFilterType("errors"); setPage(1); }}
              style={{
                ...styles.typeBtn,
                backgroundColor: filterType === "errors" ? "rgba(244, 63, 94, 0.2)" : "rgba(255, 255, 255, 0.03)",
                borderColor: filterType === "errors" ? "#F43F5E" : "rgba(255, 255, 255, 0.08)",
                color: filterType === "errors" ? "#FB7185" : "#94A3B8"
              }}
            >
              <FiAlertTriangle size={12} style={{ marginRight: "6px" }} />
              <span>Has Errors</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div style={styles.sortDropdownWrap}>
            <FiSliders size={13} color="#94A3B8" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              style={styles.sortSelect}
            >
              <option value="recent">Recent First</option>
              <option value="oldest">Oldest First</option>
              <option value="actions">Most Actions</option>
              <option value="duration">Longest Dwell</option>
              <option value="errors">Most Errors</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout (Fixed Height, Steady Internal Scrolling) */}
      <div style={styles.mainGrid}>
        {/* LEFT COLUMN: Sessions List */}
        <div style={styles.sessionsCol} className="glass-panel">
          <div style={styles.colHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={styles.colTitle}>Sessions</h3>
              <span style={styles.countBadge}>{totalRecords}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#64748B" }}>Page {page} of {totalPages}</span>
          </div>

          <div style={styles.sessionListScroll}>
            {sortedSessions.length === 0 ? (
              <div style={styles.emptyCard}>
                <FiActivity size={32} color="#475569" />
                <p style={{ marginTop: "12px", fontWeight: "600", color: "#94A3B8" }}>No sessions found</p>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Adjust search query or date filters</span>
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
                      borderLeft: isSelected ? "3px solid #818CF8" : "3px solid transparent",
                      backgroundColor: isSelected ? "rgba(99, 102, 241, 0.12)" : "rgba(255, 255, 255, 0.02)",
                      borderColor: isSelected ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.05)"
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
                              <FiCheck size={9} style={{ marginRight: "2px" }} />
                              G-Auth
                            </span>
                          )}
                          {errorCount > 0 && (
                            <span style={styles.errorIndicatorBadge}>
                              <FiAlertTriangle size={9} style={{ marginRight: "2px" }} />
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

                    {/* Metadata Badges */}
                    <div style={styles.sessionMetaBadges}>
                      <span style={styles.metaChip}>
                        <FiSmartphone size={10} /> {sess.deviceModel || "Android"}
                      </span>
                      <span style={styles.metaChip}>
                        <FiClock size={10} /> {formatDuration(sess.totalDuration)}
                      </span>
                      <span style={{ ...styles.metaChip, color: "#A5B4FC" }}>
                        <FiZap size={10} /> {eventCount} {eventCount === 1 ? "action" : "actions"}
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
                <FiChevronLeft size={12} /> Prev
              </button>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={styles.pageBtn}
              >
                Next <FiChevronRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Journey Timeline Flow */}
        <div style={styles.timelineCol} className="glass-panel">
          {!selectedSession ? (
            <div style={styles.emptyCard}>
              <FiLayers size={36} color="#475569" />
              <p style={{ marginTop: "12px", fontSize: "15px", fontWeight: "600", color: "#E2E8F0" }}>
                Select a session on the left to inspect its live journey
              </p>
              <span style={{ fontSize: "13px", color: "#64748B", marginTop: "4px" }}>
                Every click, response latency, and exception details will appear here
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
                          <FiCheckCircle size={11} style={{ marginRight: "4px" }} />
                          Google Account
                        </span>
                      ) : (
                        <span style={styles.guestStatusBadge}>
                          <FiSmartphone size={11} style={{ marginRight: "4px" }} />
                          Guest
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
                    <FiCopy size={12} />
                    <span>{copiedId ? "Copied" : "Copy ID"}</span>
                  </button>
                </div>

                {/* Session Summary KPI Strip */}
                <div style={styles.sessionKpiStrip}>
                  <div style={styles.miniKpiBox}>
                    <span style={styles.miniKpiValue}>{sessionStats.total}</span>
                    <span style={styles.miniKpiLabel}>Actions</span>
                  </div>
                  <div style={styles.miniKpiBox}>
                    <span style={{ ...styles.miniKpiValue, color: "#34D399" }}>{sessionStats.success}</span>
                    <span style={styles.miniKpiLabel}>Success</span>
                  </div>
                  <div style={styles.miniKpiBox}>
                    <span style={{ ...styles.miniKpiValue, color: sessionStats.failed > 0 ? "#FB7185" : "#64748B" }}>
                      {sessionStats.failed}
                    </span>
                    <span style={styles.miniKpiLabel}>Exceptions</span>
                  </div>
                  <div style={styles.miniKpiBox}>
                    <span style={{ ...styles.miniKpiValue, color: "#E2E8F0" }}>
                      {sessionStats.avgLatency > 0 ? `${sessionStats.avgLatency}ms` : "< 5ms"}
                    </span>
                    <span style={styles.miniKpiLabel}>Avg Latency</span>
                  </div>
                  <div style={styles.miniKpiBox}>
                    <span style={{ ...styles.miniKpiValue, color: "#A5B4FC" }}>
                      {formatDuration(selectedSession.totalDuration)}
                    </span>
                    <span style={styles.miniKpiLabel}>Dwell Time</span>
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
                      backgroundColor: timelineFilter === "all" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      borderColor: timelineFilter === "all" ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                      color: timelineFilter === "all" ? "#FFFFFF" : "#94A3B8"
                    }}
                  >
                    <FiActivity size={11} style={{ marginRight: "4px" }} />
                    <span>All ({sessionStats.total})</span>
                  </button>
                  <button
                    onClick={() => setTimelineFilter("wallpapers")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "wallpapers" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      borderColor: timelineFilter === "wallpapers" ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                      color: timelineFilter === "wallpapers" ? "#FFFFFF" : "#94A3B8"
                    }}
                  >
                    <FiImage size={11} style={{ marginRight: "4px" }} />
                    <span>Wallpapers</span>
                  </button>
                  <button
                    onClick={() => setTimelineFilter("clicks")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "clicks" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      borderColor: timelineFilter === "clicks" ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                      color: timelineFilter === "clicks" ? "#FFFFFF" : "#94A3B8"
                    }}
                  >
                    <FiMousePointer size={11} style={{ marginRight: "4px" }} />
                    <span>UI Clicks</span>
                  </button>
                  <button
                    onClick={() => setTimelineFilter("auth")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "auth" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      borderColor: timelineFilter === "auth" ? "#6366F1" : "rgba(255, 255, 255, 0.08)",
                      color: timelineFilter === "auth" ? "#FFFFFF" : "#94A3B8"
                    }}
                  >
                    <FiKey size={11} style={{ marginRight: "4px" }} />
                    <span>Auth</span>
                  </button>
                  <button
                    onClick={() => setTimelineFilter("errors")}
                    style={{
                      ...styles.timelineTabBtn,
                      backgroundColor: timelineFilter === "errors" ? "rgba(244, 63, 94, 0.2)" : "transparent",
                      borderColor: timelineFilter === "errors" ? "#F43F5E" : "rgba(255, 255, 255, 0.08)",
                      color: timelineFilter === "errors" ? "#FB7185" : "#94A3B8"
                    }}
                  >
                    <FiAlertCircle size={11} style={{ marginRight: "4px" }} />
                    <span>Errors ({sessionStats.failed})</span>
                  </button>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {/* Timeline Search */}
                  <div style={styles.timelineSearchWrap}>
                    <FiSearch size={13} color="#94A3B8" />
                    <input
                      type="text"
                      placeholder="Filter actions..."
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
                    <FiSliders size={11} style={{ marginRight: "4px" }} />
                    <span>{timelineSortOrder === "asc" ? "1 → End" : "Latest First"}</span>
                  </button>
                </div>
              </div>

              {/* Event Tree Timeline Cards */}
              <div style={styles.eventsScrollContainer}>
                {filteredEvents.length === 0 ? (
                  <div style={styles.emptyCard}>
                    <FiActivity size={28} color="#475569" />
                    <p style={{ color: "#94A3B8", marginTop: "10px", fontSize: "13px" }}>No matching actions in this session.</p>
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

                    const isFailed = ev.status === "FAILED";

                    return (
                      <div key={index} style={styles.eventRowCard}>
                        {/* Left step indicator */}
                        <div style={styles.eventLeftCol}>
                          <span style={styles.stepBadge}>#{index + 1}</span>
                          <span style={styles.eventTimeText}>{formattedTime}</span>
                          <div style={styles.timelineVerticalLine} />
                          <div
                            style={{
                              ...styles.timelineDot,
                              backgroundColor: isFailed ? "#FB7185" : "#818CF8"
                            }}
                          />
                        </div>

                        {/* Event Details Card (Glassmorphic) */}
                        <div
                          style={{
                            ...styles.eventCardBody,
                            backgroundColor: isFailed ? "rgba(244, 63, 94, 0.08)" : "rgba(255, 255, 255, 0.025)",
                            borderColor: isFailed ? "rgba(244, 63, 94, 0.3)" : "rgba(255, 255, 255, 0.07)"
                          }}
                        >
                          <div style={styles.eventCardTop}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={styles.categoryBadge}>
                                {renderBadgeIcon(badge.iconType)}
                                <span style={{ marginLeft: "5px" }}>{badge.label}</span>
                              </span>

                              {ev.status && (
                                <span
                                  style={{
                                    ...styles.statusChip,
                                    backgroundColor: isFailed ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                    color: isFailed ? "#FB7185" : "#34D399",
                                    borderColor: isFailed ? "rgba(244, 63, 94, 0.3)" : "rgba(16, 185, 129, 0.3)"
                                  }}
                                >
                                  {isFailed ? (
                                    <>
                                      <FiX size={10} style={{ marginRight: "3px" }} />
                                      <span>FAILED</span>
                                    </>
                                  ) : (
                                    <>
                                      <FiCheck size={10} style={{ marginRight: "3px" }} />
                                      <span>SUCCESS</span>
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
                              {isExpanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                              <span>{isExpanded ? "Collapse" : "Details"}</span>
                            </button>
                          </div>

                          {/* Target Tag */}
                          {ev.target && (
                            <div style={styles.targetRow}>
                              <FiImage size={11} color="#64748B" />
                              <span style={styles.targetLabel}>Target:</span>
                              <span style={styles.targetValue}>{ev.target}</span>
                            </div>
                          )}

                          {/* Error Alert Box */}
                          {ev.errorMessage && (
                            <div style={styles.errorAlertBox}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                                <FiAlertTriangle size={14} color="#FB7185" />
                                <strong style={{ color: "#FB7185", fontSize: "12px" }}>
                                  {ev.errorType || "Exception"}
                                </strong>
                              </div>
                              <span style={styles.errorMessageText}>{ev.errorMessage}</span>
                            </div>
                          )}

                          {/* Expandable Parameters / JSON Viewer */}
                          {isExpanded && (
                            <div style={styles.expandedDetailsWrap}>
                              <span style={styles.jsonHeader}>Payload Parameters:</span>
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
// Refined Glassmorphic Stylesheet (Light, Clean, Zero Rainbow)
// ──────────────────────────────────────────────────────────
const styles = {
  loginContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  loginCard: {
    borderRadius: "16px",
    padding: "36px",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  },
  lockIconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px"
  },
  loginTitle: {
    color: "#F8FAFC",
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "8px"
  },
  loginSubtitle: {
    color: "#94A3B8",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "22px"
  },
  loginInput: {
    width: "100%",
    padding: "11px 14px",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#F8FAFC",
    fontSize: "14px",
    marginBottom: "14px",
    outline: "none"
  },
  loginButton: {
    width: "100%",
    padding: "11px",
    backgroundColor: "#6366F1",
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: "13px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  loginError: {
    color: "#FB7185",
    fontSize: "12px",
    marginBottom: "10px"
  },

  // Main Dashboard
  dashboardContainer: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "18px 24px",
    boxSizing: "border-box"
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    flexWrap: "wrap",
    gap: "12px"
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  brandLogoCircle: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366F1, #818CF8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 16px rgba(99, 102, 241, 0.3)"
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: "-0.2px"
  },
  versionPill: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    color: "#A5B4FC",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 6px",
    borderRadius: "10px"
  },
  headerSubtitle: {
    fontSize: "12px",
    color: "#94A3B8"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  btnAction: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#F8FAFC",
    padding: "7px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer"
  },
  btnLogout: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    border: "1px solid rgba(244, 63, 94, 0.2)",
    color: "#FB7185",
    padding: "7px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer"
  },

  // KPI Grid
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    margin: "16px 0"
  },
  kpiCard: {
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  kpiIconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  kpiValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#F8FAFC"
  },
  kpiLabel: {
    fontSize: "11px",
    color: "#94A3B8",
    marginTop: "2px"
  },

  // Filter Section
  filterSection: {
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  filterSectionLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#94A3B8",
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
    padding: "5px 10px",
    borderRadius: "6px",
    border: "1px solid",
    cursor: "pointer",
    fontSize: "11px",
    display: "flex",
    gap: "4px",
    alignItems: "center"
  },

  searchAndSortRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px"
  },
  searchForm: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    flex: "1 1 280px",
    minWidth: "240px"
  },
  searchInput: {
    flex: 1,
    padding: "8px 10px",
    backgroundColor: "transparent",
    border: "none",
    color: "#F8FAFC",
    fontSize: "12px",
    outline: "none"
  },
  clearSearchBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#94A3B8",
    cursor: "pointer",
    padding: "4px 8px"
  },
  searchSubmitBtn: {
    backgroundColor: "#6366F1",
    border: "none",
    color: "#FFFFFF",
    padding: "6px 12px",
    margin: "3px",
    borderRadius: "6px",
    fontSize: "11px",
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
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer"
  },

  sortDropdownWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    padding: "3px 8px"
  },
  sortSelect: {
    backgroundColor: "transparent",
    border: "none",
    color: "#E2E8F0",
    fontSize: "11px",
    fontWeight: "500",
    outline: "none",
    cursor: "pointer"
  },

  // Main Grid Layout
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "16px",
    flex: 1,
    height: "calc(100vh - 310px)",
    minHeight: "560px",
    alignItems: "stretch"
  },

  // Left Column: Sessions List
  sessionsCol: {
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "100%"
  },
  colHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  colTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#F8FAFC"
  },
  countBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    color: "#A5B4FC",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "600"
  },
  sessionListScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  sessionCard: {
    borderRadius: "8px",
    padding: "10px 12px",
    cursor: "pointer",
    border: "1px solid",
    transition: "background 0.15s ease"
  },
  sessionCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  avatarWrap: {
    width: "32px",
    height: "32px",
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
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    color: "#A5B4FC",
    fontWeight: "600",
    fontSize: "13px"
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
    fontWeight: "600",
    color: "#F8FAFC",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  googleVerifiedBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    color: "#34D399",
    fontSize: "9px",
    fontWeight: "600",
    padding: "1px 5px",
    borderRadius: "4px"
  },
  errorIndicatorBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    color: "#FB7185",
    fontSize: "9px",
    fontWeight: "600",
    padding: "1px 5px",
    borderRadius: "8px"
  },
  userSubText: {
    fontSize: "11px",
    color: "#94A3B8",
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: "2px"
  },
  sessionTimeTag: {
    fontSize: "11px",
    color: "#64748B",
    flexShrink: 0
  },
  sessionMetaBadges: {
    display: "flex",
    gap: "6px",
    marginTop: "6px",
    flexWrap: "wrap"
  },
  metaChip: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    color: "#94A3B8",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  paginationRow: {
    padding: "8px 12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.07)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#E2E8F0",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer"
  },

  // Right Column: Timeline Flow
  timelineCol: {
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "100%"
  },
  timelineWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden"
  },
  userProfileBanner: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
    flexShrink: 0
  },
  userProfileTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  bannerAvatarWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    overflow: "hidden",
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
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    color: "#A5B4FC",
    fontWeight: "700",
    fontSize: "18px"
  },
  bannerUserName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#F8FAFC"
  },
  authStatusBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    color: "#34D399",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 6px",
    borderRadius: "10px"
  },
  guestStatusBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#94A3B8",
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 6px",
    borderRadius: "10px"
  },
  bannerSubInfoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "4px",
    flexWrap: "wrap"
  },
  bannerEmailText: {
    fontSize: "12px",
    color: "#A5B4FC",
    fontWeight: "500"
  },
  bannerDeviceText: {
    fontSize: "12px",
    color: "#94A3B8"
  },
  bannerIpText: {
    fontSize: "11px",
    color: "#64748B",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  btnCopyId: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#94A3B8",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer"
  },

  // KPI Strip
  sessionKpiStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
    gap: "8px",
    marginTop: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.05)"
  },
  miniKpiBox: {
    display: "flex",
    flexDirection: "column"
  },
  miniKpiValue: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#F8FAFC"
  },
  miniKpiLabel: {
    fontSize: "10px",
    color: "#64748B",
    marginTop: "2px"
  },

  // Timeline Toolbar
  timelineToolbar: {
    padding: "8px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
    flexShrink: 0
  },
  timelineTabsRow: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap"
  },
  timelineTabBtn: {
    display: "flex",
    alignItems: "center",
    padding: "5px 8px",
    borderRadius: "5px",
    border: "1px solid",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer"
  },
  timelineSearchWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    padding: "0 6px"
  },
  timelineSearchInput: {
    padding: "5px 6px",
    backgroundColor: "transparent",
    border: "none",
    color: "#F8FAFC",
    fontSize: "11px",
    outline: "none",
    width: "140px"
  },
  timelineClearSearch: {
    background: "transparent",
    border: "none",
    color: "#94A3B8",
    cursor: "pointer"
  },
  btnSortOrder: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#94A3B8",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer"
  },

  // Events Scroll List
  eventsScrollContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  eventRowCard: {
    display: "flex",
    gap: "12px"
  },
  eventLeftCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "70px",
    position: "relative",
    flexShrink: 0
  },
  stepBadge: {
    fontSize: "9px",
    fontWeight: "600",
    color: "#A5B4FC",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    padding: "2px 5px",
    borderRadius: "4px",
    marginBottom: "3px"
  },
  eventTimeText: {
    fontSize: "10px",
    color: "#64748B",
    fontWeight: "500"
  },
  timelineVerticalLine: {
    position: "absolute",
    top: "34px",
    bottom: "-10px",
    width: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  timelineDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    marginTop: "6px",
    zIndex: 2
  },

  eventCardBody: {
    flex: 1,
    borderRadius: "8px",
    padding: "10px 14px",
    border: "1px solid"
  },
  eventCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px"
  },
  categoryBadge: {
    display: "flex",
    alignItems: "center",
    padding: "3px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.3px",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    color: "#E2E8F0"
  },
  statusChip: {
    display: "flex",
    alignItems: "center",
    padding: "2px 5px",
    borderRadius: "4px",
    fontSize: "9px",
    fontWeight: "600",
    border: "1px solid"
  },
  durationChip: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    color: "#CBD5E1",
    padding: "2px 5px",
    borderRadius: "4px",
    fontSize: "9px",
    fontWeight: "500"
  },
  dwellChip: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    color: "#94A3B8",
    padding: "2px 5px",
    borderRadius: "4px",
    fontSize: "9px"
  },
  btnExpandEvent: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    backgroundColor: "transparent",
    border: "none",
    color: "#64748B",
    fontSize: "10px",
    cursor: "pointer"
  },
  targetRow: {
    marginTop: "6px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    gap: "5px"
  },
  targetLabel: {
    color: "#64748B",
    fontWeight: "500"
  },
  targetValue: {
    color: "#CBD5E1",
    fontWeight: "600",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: "1px 6px",
    borderRadius: "3px"
  },
  errorAlertBox: {
    marginTop: "8px",
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    border: "1px solid rgba(244, 63, 94, 0.25)",
    borderRadius: "6px",
    padding: "6px 10px"
  },
  errorMessageText: {
    color: "#FCA5A5",
    fontSize: "11px",
    fontFamily: "monospace",
    display: "block",
    wordBreak: "break-word"
  },
  expandedDetailsWrap: {
    marginTop: "10px",
    paddingTop: "8px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)"
  },
  jsonHeader: {
    fontSize: "10px",
    color: "#94A3B8",
    fontWeight: "500",
    display: "block",
    marginBottom: "4px"
  },
  jsonPre: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "10px",
    color: "#A5B4FC",
    overflowX: "auto",
    lineHeight: "1.3"
  },

  emptyCard: {
    flex: 1,
    height: "100%",
    padding: "36px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748B"
  }
};
