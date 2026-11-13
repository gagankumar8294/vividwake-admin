"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiImage,
  FiSearch,
  FiFilter,
  FiGlobe,
  FiLock,
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiCheckCircle,
  FiX,
  FiBell,
  FiSend,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiShield,
  FiInfo
} from "react-icons/fi";
import { useModal } from "@/components/ModalContext";

export default function WallpapersTab({ password }) {
  const { showConfirm, showAlert } = useModal();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState({ total: 0, draft: 0, published: 0, restricted: 0 });
  const [categories, setCategories] = useState([]);
  const [knownUsers, setKnownUsers] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all"); // 'all', 'draft', 'restricted', 'published'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeWallpaper, setActiveWallpaper] = useState(null);
  const [accessMode, setAccessMode] = useState("draft"); // 'draft', 'published', 'restricted'
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newBlockedEmail, setNewBlockedEmail] = useState("");

  // Targeted Notification State inside Modal
  const [sendNotif, setSendNotif] = useState(true);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifImageUrl, setNotifImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const fetchWallpapers = async (pg = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pg,
        limit: 24,
        status: selectedStatus,
        category: selectedCategory,
        search: search.trim()
      });

      const res = await fetch(`/api/admin/wallpapers?${params.toString()}`, {
        headers: { "x-admin-authorization": password }
      });
      const data = await res.json();
      if (data.success) {
        setWallpapers(data.wallpapers || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.total || 0);
        setPage(data.page || 1);
        if (data.summary) setSummary(data.summary);
        if (data.categories) setCategories(["All", ...data.categories]);
        if (data.knownUsers) setKnownUsers(data.knownUsers);
      } else {
        showToast("Error: " + (data.error || "Failed to load wallpapers"));
      }
    } catch (err) {
      console.error(err);
      showToast("Network error loading wallpapers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers(1);
  }, [selectedStatus, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWallpapers(1);
  };

  const openAccessModal = (wp) => {
    setActiveWallpaper(wp);
    setAccessMode(wp.status || "draft");
    setAllowedUsers([...(wp.allowedUsers || [])]);
    setBlockedUsers([...(wp.blockedUsers || [])]);
    setNewUserEmail("");
    setNewBlockedEmail("");

    // Prefill targeted notification
    setSendNotif(true);
    setNotifTitle(`✨ Exclusive Wallpaper: ${wp.title}`);
    setNotifBody(`You've been granted VIP access to '${wp.title}'! Tap to preview & set as live lock screen.`);
    setNotifImageUrl(wp.thumbUrl || "");
    setModalOpen(true);
  };

  const handleAddAllowedUser = async (emailToAdd) => {
    const email = (emailToAdd || newUserEmail).trim().toLowerCase();
    if (!email || !email.includes("@")) {
      await showAlert({
        title: "Invalid Email",
        message: "Please enter a valid Google email address.",
        variant: "warning"
      });
      return;
    }
    if (!allowedUsers.includes(email)) {
      setAllowedUsers([...allowedUsers, email]);
      // Remove from blocked if present
      setBlockedUsers(blockedUsers.filter((u) => u !== email));
    }
    setNewUserEmail("");
  };

  const handleRemoveAllowedUser = (emailToRemove) => {
    setAllowedUsers(allowedUsers.filter((u) => u !== emailToRemove));
  };

  const handleAddBlockedUser = async (emailToBlock) => {
    const email = (emailToBlock || newBlockedEmail).trim().toLowerCase();
    if (!email || !email.includes("@")) {
      await showAlert({
        title: "Invalid Email",
        message: "Please enter a valid Google email address.",
        variant: "warning"
      });
      return;
    }
    if (!blockedUsers.includes(email)) {
      setBlockedUsers([...blockedUsers, email]);
      // Remove from allowed if present
      setAllowedUsers(allowedUsers.filter((u) => u !== email));
    }
    setNewBlockedEmail("");
  };

  const handleRemoveBlockedUser = (emailToRemove) => {
    setBlockedUsers(blockedUsers.filter((u) => u !== emailToRemove));
  };

  const handleSaveAccess = async () => {
    if (!activeWallpaper) return;

    if (accessMode === "restricted" && allowedUsers.length === 0) {
      const ok = await showConfirm({
        title: "No Users Assigned",
        message: "No users are assigned yet. This wallpaper will remain hidden until you add at least one allowed user.\n\nProceed with saving?",
        confirmText: "Save Anyway",
        variant: "warning"
      });
      if (!ok) return;
    }

    setSaving(true);
    try {
      const payload = {
        wallpaperId: activeWallpaper.wallpaperId,
        status: accessMode,
        allowedUsers,
        blockedUsers,
        sendNotification: sendNotif,
        notificationTitle: notifTitle,
        notificationBody: notifBody,
        notificationImageUrl: notifImageUrl
      };

      const res = await fetch("/api/admin/wallpapers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Access updated successfully!");
        setModalOpen(false);
        fetchWallpapers(page);
      } else {
        await showAlert({
          title: "Update Failed",
          message: data.error || "Unknown error occurred",
          variant: "danger"
        });
      }
    } catch (err) {
      await showAlert({
        title: "Error",
        message: err.message,
        variant: "danger"
      });
    } finally {
      setSaving(false);
    }
  };

  // Quick 1-click status change
  const handleQuickStatusChange = async (wp, newStatus) => {
    try {
      const payload = {
        wallpaperId: wp.wallpaperId,
        status: newStatus,
        allowedUsers: wp.allowedUsers || [],
        blockedUsers: wp.blockedUsers || [],
        sendNotification: false
      };

      const res = await fetch("/api/admin/wallpapers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`'${wp.title}' set to ${newStatus.toUpperCase()}`);
        fetchWallpapers(page);
      } else {
        await showAlert({
          title: "Status Update Failed",
          message: data.error || "Unknown error",
          variant: "danger"
        });
      }
    } catch (e) {
      await showAlert({
        title: "Error",
        message: e.message,
        variant: "danger"
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "700",
            fontSize: "0.9rem",
            zIndex: 9999
          }}
        >
          <FiCheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem"
        }}
      >
        {/* Total */}
        <div className="telemetry-card" style={{ padding: "1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-sub)", fontWeight: "600" }}>Total Catalog</span>
            <FiImage size={18} color="var(--accent-mint)" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>
            {summary.total?.toLocaleString() || "6,177"}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Managed in MongoDB
          </div>
        </div>

        {/* Unpublished / Draft (Default) */}
        <div
          className="telemetry-card"
          style={{
            padding: "1.1rem",
            borderLeft: "4px solid #F59E0B",
            cursor: "pointer",
            background: selectedStatus === "draft" ? "rgba(245, 158, 11, 0.08)" : undefined
          }}
          onClick={() => setSelectedStatus(selectedStatus === "draft" ? "all" : "draft")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#FCD34D", fontWeight: "700" }}>🔒 Unpublished (Draft)</span>
            <FiLock size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#F59E0B", marginTop: "4px" }}>
            {summary.draft?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Hidden from regular users (Default)
          </div>
        </div>

        {/* Restricted / Allowed Users */}
        <div
          className="telemetry-card"
          style={{
            padding: "1.1rem",
            borderLeft: "4px solid #8B5CF6",
            cursor: "pointer",
            background: selectedStatus === "restricted" ? "rgba(139, 92, 246, 0.08)" : undefined
          }}
          onClick={() => setSelectedStatus(selectedStatus === "restricted" ? "all" : "restricted")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#C4B5FD", fontWeight: "700" }}>👥 Restricted (VIP / Allowed)</span>
            <FiUsers size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#A78BFA", marginTop: "4px" }}>
            {summary.restricted?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Visible only to granted users
          </div>
        </div>

        {/* Public / All Users */}
        <div
          className="telemetry-card"
          style={{
            padding: "1.1rem",
            borderLeft: "4px solid #10B981",
            cursor: "pointer",
            background: selectedStatus === "published" ? "rgba(16, 185, 129, 0.08)" : undefined
          }}
          onClick={() => setSelectedStatus(selectedStatus === "published" ? "all" : "published")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#6EE7B7", fontWeight: "700" }}>🌐 Public (All Users)</span>
            <FiGlobe size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#10B981", marginTop: "4px" }}>
            {summary.published?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", marginTop: "2px" }}>
            Visible to all app users
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="telemetry-card" style={{ padding: "1rem" }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 280px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <FiSearch
                size={16}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-sub)" }}
              />
              <input
                type="text"
                placeholder="Search wallpaper by title, ID, or user email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontSize: "0.85rem"
                }}
              />
            </div>
            <button
              type="submit"
              className="admin-action-btn"
              style={{ background: "var(--accent-mint)", color: "#000000", fontWeight: "700" }}
            >
              Search
            </button>
          </div>

          {/* Status Pills */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Access" },
              { id: "draft", label: "🔒 Drafts" },
              { id: "restricted", label: "👥 Restricted" },
              { id: "published", label: "🌐 Public" }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: selectedStatus === st.id ? "700" : "500",
                  background: selectedStatus === st.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
                  border: selectedStatus === st.id ? "1px solid var(--accent-mint)" : "1px solid rgba(255,255,255,0.08)",
                  color: selectedStatus === st.id ? "var(--accent-mint)" : "var(--text-sub)",
                  cursor: "pointer"
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c} style={{ background: "#1F1B2E", color: "#ffffff" }}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchWallpapers(page)}
            className="admin-action-btn"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
            title="Reload from MongoDB"
          >
            <FiRefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Reload</span>
          </button>
        </form>
      </div>

      {/* Main Wallpaper Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-sub)" }}>
          <FiRefreshCw size={28} className="spin" style={{ margin: "0 auto 12px auto", display: "block" }} />
          <div>Loading wallpaper catalog & access rules...</div>
        </div>
      ) : wallpapers.length === 0 ? (
        <div
          className="telemetry-card"
          style={{
            padding: "3rem 1rem",
            textAlign: "center",
            color: "var(--text-sub)"
          }}
        >
          <FiImage size={36} style={{ margin: "0 auto 12px auto", display: "block", opacity: 0.5 }} />
          <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>No Wallpapers Found</div>
          <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            No wallpapers matched your active search or filter criteria.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.1rem"
          }}
        >
          {wallpapers.map((wp) => {
            const isDraft = wp.status === "draft";
            const isRestricted = wp.status === "restricted";
            const isPublished = wp.status === "published";

            return (
              <div
                key={wp.wallpaperId}
                className="telemetry-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  padding: "0",
                  border: isRestricted
                    ? "1px solid rgba(139, 92, 246, 0.4)"
                    : isPublished
                    ? "1px solid rgba(16, 185, 129, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
              >
                {/* Thumbnail Frame */}
                <div style={{ position: "relative", width: "100%", height: "160px", background: "#0E0B16", overflow: "hidden" }}>
                  {wp.thumbUrl ? (
                    <img
                      src={wp.thumbUrl}
                      alt={wp.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-sub)" }}>
                      <FiImage size={32} />
                    </div>
                  )}

                  {/* Status Badge Over Thumbnail */}
                  <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                    {isDraft && (
                      <span
                        style={{
                          background: "rgba(245, 158, 11, 0.9)",
                          color: "#000000",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <FiLock size={12} /> UNPUBLISHED
                      </span>
                    )}
                    {isRestricted && (
                      <span
                        style={{
                          background: "rgba(139, 92, 246, 0.95)",
                          color: "#ffffff",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <FiUsers size={12} /> RESTRICTED ({wp.allowedUsers?.length || 0})
                      </span>
                    )}
                    {isPublished && (
                      <span
                        style={{
                          background: "rgba(16, 185, 129, 0.95)",
                          color: "#000000",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <FiGlobe size={12} /> PUBLIC (ALL)
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      background: "rgba(0,0,0,0.75)",
                      color: "#E2E8F0",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "600"
                    }}
                  >
                    {wp.category || "General"}
                  </div>

                  {/* Size Pill */}
                  {wp.sizeDisplay && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        background: "rgba(0,0,0,0.75)",
                        color: "var(--accent-mint)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: "700"
                      }}
                    >
                      {wp.sizeDisplay}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: "1", gap: "8px" }}>
                  <div style={{ fontWeight: "700", color: "#ffffff", fontSize: "0.95rem" }} title={wp.title}>
                    {wp.title}
                  </div>

                  {/* Allowed Users Preview */}
                  {isRestricted && wp.allowedUsers && wp.allowedUsers.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                      {wp.allowedUsers.slice(0, 3).map((email) => (
                        <span
                          key={email}
                          style={{
                            background: "rgba(139, 92, 246, 0.15)",
                            color: "#C4B5FD",
                            fontSize: "0.7rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: "1px solid rgba(139, 92, 246, 0.3)"
                          }}
                        >
                          {email}
                        </span>
                      ))}
                      {wp.allowedUsers.length > 3 && (
                        <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>
                          +{wp.allowedUsers.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : isDraft ? (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                      Not visible in app Explore Store.
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: "#6EE7B7" }}>
                      Visible to all app users in Explore Store.
                    </div>
                  )}

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    <button
                      onClick={() => openAccessModal(wp)}
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        padding: "7px 10px",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <FiUsers size={14} />
                      <span>Manage Access</span>
                    </button>

                    {/* Quick Toggle Button */}
                    {isPublished ? (
                      <button
                        onClick={() => handleQuickStatusChange(wp, "draft")}
                        title="Unpublish (Move to Draft)"
                        style={{
                          background: "rgba(245, 158, 11, 0.15)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          color: "#FCD34D",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        <FiLock size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickStatusChange(wp, "published")}
                        title="Publish to All Users"
                        style={{
                          background: "rgba(16, 185, 129, 0.15)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          color: "#6EE7B7",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        <FiGlobe size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "8px"
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--text-sub)" }}>
            Showing page {page} of {totalPages} ({totalRecords.toLocaleString()} wallpapers)
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => fetchWallpapers(page - 1)}
              disabled={page <= 1}
              className="admin-action-btn"
              style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <FiChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => fetchWallpapers(page + 1)}
              disabled={page >= totalPages}
              className="admin-action-btn"
              style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              Next <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Access & Notification Modal */}
      {modalOpen && activeWallpaper && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            style={{
              background: "#161224",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {activeWallpaper.thumbUrl && (
                  <img
                    src={activeWallpaper.thumbUrl}
                    alt={activeWallpaper.title}
                    style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }}
                  />
                )}
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>
                    Configure Wallpaper Access
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--accent-mint)", fontWeight: "600" }}>
                    {activeWallpaper.title} ({activeWallpaper.category || "General"})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-sub)",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Access Level Selector */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#ffffff", display: "block", marginBottom: "8px" }}>
                  1. Choose Access Level:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {/* Draft */}
                  <button
                    type="button"
                    onClick={() => setAccessMode("draft")}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: accessMode === "draft" ? "2px solid #F59E0B" : "1px solid rgba(255,255,255,0.08)",
                      background: accessMode === "draft" ? "rgba(245, 158, 11, 0.12)" : "rgba(255,255,255,0.03)",
                      color: accessMode === "draft" ? "#FCD34D" : "var(--text-sub)",
                      textAlign: "center"
                    }}
                  >
                    <FiLock size={18} style={{ margin: "0 auto 4px auto", display: "block" }} />
                    <div style={{ fontWeight: "700", fontSize: "0.82rem" }}>Unpublished</div>
                    <div style={{ fontSize: "0.68rem", opacity: 0.8 }}>Hidden from all</div>
                  </button>

                  {/* Restricted */}
                  <button
                    type="button"
                    onClick={() => setAccessMode("restricted")}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: accessMode === "restricted" ? "2px solid #8B5CF6" : "1px solid rgba(255,255,255,0.08)",
                      background: accessMode === "restricted" ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.03)",
                      color: accessMode === "restricted" ? "#C4B5FD" : "var(--text-sub)",
                      textAlign: "center"
                    }}
                  >
                    <FiUsers size={18} style={{ margin: "0 auto 4px auto", display: "block" }} />
                    <div style={{ fontWeight: "700", fontSize: "0.82rem" }}>Restricted</div>
                    <div style={{ fontSize: "0.68rem", opacity: 0.8 }}>Allowed users only</div>
                  </button>

                  {/* Public */}
                  <button
                    type="button"
                    onClick={() => setAccessMode("published")}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: accessMode === "published" ? "2px solid #10B981" : "1px solid rgba(255,255,255,0.08)",
                      background: accessMode === "published" ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.03)",
                      color: accessMode === "published" ? "#6EE7B7" : "var(--text-sub)",
                      textAlign: "center"
                    }}
                  >
                    <FiGlobe size={18} style={{ margin: "0 auto 4px auto", display: "block" }} />
                    <div style={{ fontWeight: "700", fontSize: "0.82rem" }}>Public (All)</div>
                    <div style={{ fontSize: "0.68rem", opacity: 0.8 }}>Everyone can see</div>
                  </button>
                </div>
              </div>

              {/* User Assignment Section (When Restricted or Custom) */}
              {accessMode === "restricted" && (
                <div
                  style={{
                    background: "rgba(139, 92, 246, 0.05)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "10px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#C4B5FD" }}>
                      👥 Allowed Users ({allowedUsers.length}):
                    </label>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-sub)" }}>
                      Only these registered emails will unlock this wallpaper
                    </span>
                  </div>

                  {/* Add User Input + Autocomplete Suggestion */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="email"
                      placeholder="Type user email (e.g. gagankumar8294@gmail.com)..."
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAllowedUser();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        fontSize: "0.82rem"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddAllowedUser()}
                      style={{
                        background: "#8B5CF6",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 14px",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      + Grant
                    </button>
                  </div>

                  {/* Known Users Quick Chips */}
                  {knownUsers.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>Quick Add:</span>
                      {knownUsers.map((u) => {
                        const isAlreadyAdded = allowedUsers.includes(u);
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => handleAddAllowedUser(u)}
                            disabled={isAlreadyAdded}
                            style={{
                              background: isAlreadyAdded ? "rgba(255,255,255,0.05)" : "rgba(139, 92, 246, 0.15)",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                              color: isAlreadyAdded ? "var(--text-sub)" : "#C4B5FD",
                              borderRadius: "4px",
                              padding: "2px 6px",
                              fontSize: "0.7rem",
                              cursor: isAlreadyAdded ? "default" : "pointer"
                            }}
                          >
                            {isAlreadyAdded ? `✓ ${u}` : `+ ${u}`}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* List of currently granted users */}
                  {allowedUsers.length === 0 ? (
                    <div style={{ fontSize: "0.78rem", color: "#F87171", padding: "6px 0" }}>
                      ⚠️ No users assigned yet. Add at least one user above.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                      {allowedUsers.map((email) => (
                        <div
                          key={email}
                          style={{
                            background: "rgba(139, 92, 246, 0.25)",
                            border: "1px solid #8B5CF6",
                            color: "#ffffff",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAllowedUser(email)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#F87171",
                              cursor: "pointer",
                              padding: "0"
                            }}
                            title="Revoke access"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Blocked Users Section */}
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.04)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  borderRadius: "10px",
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "#FCA5A5" }}>
                    🚫 Blocked / Excluded Users ({blockedUsers.length}):
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>
                    Deny access even if wallpaper is set to Public
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="email"
                    placeholder="Email to deny access..."
                    value={newBlockedEmail}
                    onChange={(e) => setNewBlockedEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      borderRadius: "6px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      fontSize: "0.8rem"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddBlockedUser()}
                    style={{
                      background: "rgba(239, 68, 68, 0.8)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Block
                  </button>
                </div>

                {blockedUsers.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {blockedUsers.map((email) => (
                      <div
                        key={email}
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "1px solid #EF4444",
                          color: "#FCA5A5",
                          padding: "3px 6px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedUser(email)}
                          style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer" }}
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Integrated Targeted Push Notification Section */}
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.04)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "10px",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "#6EE7B7",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sendNotif}
                      onChange={(e) => setSendNotif(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#10B981", cursor: "pointer" }}
                    />
                    <span>🔔 Send Matching Push Notification Banner</span>
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-sub)" }}>
                    Target: {accessMode === "published" ? "All Users" : `${allowedUsers.length} Assigned User(s)`}
                  </span>
                </div>

                {sendNotif && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-sub)" }}>Notification Title:</span>
                      <input
                        type="text"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="Notification Title..."
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#ffffff",
                          fontSize: "0.82rem",
                          marginTop: "2px"
                        }}
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-sub)" }}>Notification Message:</span>
                      <textarea
                        rows={2}
                        value={notifBody}
                        onChange={(e) => setNotifBody(e.target.value)}
                        placeholder="Notification message body..."
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#ffffff",
                          fontSize: "0.82rem",
                          marginTop: "2px",
                          resize: "vertical"
                        }}
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-sub)" }}>Matching Banner Image URL (Auto-scaled for all models):</span>
                      <input
                        type="url"
                        value={notifImageUrl}
                        onChange={(e) => setNotifImageUrl(e.target.value)}
                        placeholder="https://.../banner.jpg"
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#ffffff",
                          fontSize: "0.82rem",
                          marginTop: "2px"
                        }}
                      />
                    </div>

                    {/* Live Mobile Notification Shade Preview */}
                    <div style={{ marginTop: "6px" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--accent-mint)", fontWeight: "700" }}>
                        📱 Mobile Device Lock Screen / Notification Shade Preview:
                      </span>
                      <div
                        style={{
                          background: "#1E1A2E",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          padding: "10px",
                          marginTop: "4px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-sub)" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-mint)" }} />
                          <span style={{ fontWeight: "700", color: "#ffffff" }}>VividWake</span>
                          <span>• now</span>
                        </div>
                        <div style={{ fontWeight: "700", color: "#ffffff", fontSize: "0.82rem" }}>
                          {notifTitle || "Notification Title"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#E2E8F0" }}>
                          {notifBody || "Notification Body"}
                        </div>
                        {notifImageUrl && (
                          <div style={{ width: "100%", height: "110px", borderRadius: "6px", overflow: "hidden", marginTop: "4px" }}>
                            <img
                              src={notifImageUrl}
                              alt="Banner"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
              }}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="admin-action-btn"
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAccess}
                disabled={saving}
                style={{
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {saving ? (
                  <>
                    <FiRefreshCw size={14} className="spin" />
                    <span>Saving & Notifying...</span>
                  </>
                ) : (
                  <>
                    <FiCheck size={16} />
                    <span>Save Access & Apply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
