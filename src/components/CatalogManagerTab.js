"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPlay,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiCheck,
  FiX,
  FiLayers,
  FiStar,
  FiEye,
  FiExternalLink,
  FiCopy,
  FiDatabase,
  FiDownload,
  FiTag,
  FiFolder,
  FiFilm,
  FiImage,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiSliders,
  FiLock,
  FiUnlock,
  FiList,
  FiGrid,
  FiAward
} from "react-icons/fi";
import { useModal } from "@/components/ModalContext";

export default function CatalogManagerTab({ password }) {
  const { showConfirm, showAlert } = useModal();
  const [wallpapers, setWallpapers] = useState([]);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'list'
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState({
    total: 0,
    published: 0,
    draft: 0,
    restricted: 0,
    featured: 0,
    diskJsonCount: 0
  });
  const [categories, setCategories] = useState(["All"]);
  const [subCategories, setSubCategories] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = Create, object = Edit
  const [saving, setSaving] = useState(false);
  const [detectingMeta, setDetectingMeta] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    wallpaperId: "",
    title: "",
    category: "Gaming",
    customCategory: "",
    subCategory: "",
    description: "",
    tags: "",
    videoUrl: "",
    thumbUrl: "",
    sizeBytes: 0,
    sizeDisplay: "",
    durationMs: 8000,
    width: 1080,
    height: 1920,
    version: 1,
    status: "published",
    isFeatured: true,
    isVipOnly: false
  });

  // Video Preview Modal State
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info"); // 'info', 'success', 'error'
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (msg, type = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast(`Copied "${text}" to clipboard!`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchCatalog = async (pg = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pg,
        limit: 20,
        status: selectedStatus,
        category: selectedCategory,
        search: search.trim()
      });

      const res = await fetch(`/api/admin/catalog?${params.toString()}`, {
        headers: { "x-admin-authorization": password }
      });
      const data = await res.json();
      if (data.success) {
        setWallpapers(data.wallpapers || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.total || 0);
        setPage(data.page || 1);
        if (data.summary) setSummary(data.summary);
        if (data.categories) setCategories(data.categories);
        if (data.subCategories) setSubCategories(data.subCategories);
      } else {
        showToast("Error: " + (data.error || "Failed to load catalog"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error loading catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog(1);
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCatalog(1);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      wallpaperId: "",
      title: "",
      category: categories.find((c) => c !== "All") || "Gaming",
      customCategory: "",
      subCategory: "",
      description: "",
      tags: "",
      videoUrl: "",
      thumbUrl: "",
      sizeBytes: 0,
      sizeDisplay: "",
      durationMs: 8000,
      width: 1080,
      height: 1920,
      version: 1,
      status: "published",
      isFeatured: true,
      isVipOnly: false
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    const isStandardCat = categories.includes(item.category);
    setFormData({
      wallpaperId: item.wallpaperId || "",
      title: item.title || "",
      category: isStandardCat ? item.category : "Custom",
      customCategory: isStandardCat ? "" : item.category,
      subCategory: item.subCategory || "",
      description: item.description || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
      videoUrl: item.videoUrl || "",
      thumbUrl: item.thumbUrl || "",
      sizeBytes: item.sizeBytes || 0,
      sizeDisplay: item.sizeDisplay || "",
      durationMs: item.durationMs || 8000,
      width: item.width || 1080,
      height: item.height || 1920,
      version: item.version || 1,
      status: item.status || "published",
      isFeatured: !!item.isFeatured,
      isVipOnly: !!item.isVipOnly
    });
    setModalOpen(true);
  };

  // Auto-detect metadata via backend HEAD request
  const handleAutoDetectMeta = async () => {
    if (!formData.videoUrl) {
      showToast("Please enter a valid Video URL first", "error");
      return;
    }
    setDetectingMeta(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify({
          action: "detect_meta",
          videoUrl: formData.videoUrl.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          sizeBytes: data.sizeBytes || prev.sizeBytes,
          sizeDisplay: data.sizeDisplay || prev.sizeDisplay
        }));
        showToast(`Metadata detected: ${data.sizeDisplay}`, "success");
      } else {
        showToast("Could not detect metadata: " + data.error, "error");
      }
    } catch (err) {
      showToast("Detection failed: " + err.message, "error");
    } finally {
      setDetectingMeta(false);
    }
  };

  // Save (Create or Update)
  const handleSaveWallpaper = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please provide a Title", "error");
      return;
    }
    if (!formData.videoUrl.trim()) {
      showToast("Please provide a Video URL", "error");
      return;
    }

    setSaving(true);
    try {
      const finalCat =
        formData.category === "Custom"
          ? formData.customCategory.trim() || "General"
          : formData.category;

      const payload = {
        action: editingItem ? "update" : "create",
        wallpaperId: formData.wallpaperId.trim(),
        title: formData.title.trim(),
        category: finalCat,
        subCategory: formData.subCategory.trim(),
        description: formData.description.trim(),
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        videoUrl: formData.videoUrl.trim(),
        thumbUrl: formData.thumbUrl.trim(),
        sizeBytes: Number(formData.sizeBytes) || 0,
        sizeDisplay: formData.sizeDisplay.trim(),
        durationMs: Number(formData.durationMs) || 8000,
        width: Number(formData.width) || 1080,
        height: Number(formData.height) || 1920,
        version: Number(formData.version) || 1,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isVipOnly: formData.isVipOnly
      };

      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Wallpaper saved and synced to wallpapers.json!", "success");
        setModalOpen(false);
        fetchCatalog(page);
      } else {
        showToast("Error: " + (data.error || "Failed saving wallpaper"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Save error: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle status
  const handleToggleStatus = async (wallpaper, newStatus) => {
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify({
          action: "toggle_status",
          wallpaperId: wallpaper.wallpaperId,
          newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Status updated!", "success");
        fetchCatalog(page);
      } else {
        showToast("Error: " + (data.error || "Failed toggling status"), "error");
      }
    } catch (err) {
      showToast("Error toggling: " + err.message, "error");
    }
  };

  // Delete
  const handleDeleteWallpaper = async (wallpaper) => {
    const ok = await showConfirm({
      title: "Delete Wallpaper",
      message: `Permanently delete '${wallpaper.title}' (${wallpaper.wallpaperId})?\n\nThis will remove it from the MongoDB catalog database and the mobile app catalog.`,
      confirmText: "Delete Wallpaper",
      variant: "danger"
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/catalog?id=${encodeURIComponent(wallpaper.wallpaperId)}`, {
        method: "DELETE",
        headers: { "x-admin-authorization": password }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Wallpaper deleted successfully", "success");
        fetchCatalog(page);
      } else {
        showToast("Delete error: " + (data.error || "Failed deleting"), "error");
      }
    } catch (err) {
      showToast("Delete error: " + err.message, "error");
    }
  };

  // Full DB -> wallpapers.json Sync
  const handleSyncAllToJson = async () => {
    const ok = await showConfirm({
      title: "Sync Catalog to App Files",
      message: "Sync all database published wallpapers into the mobile app's wallpapers.json files now?",
      confirmText: "Sync Now",
      variant: "info"
    });
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-authorization": password
        },
        body: JSON.stringify({ action: "sync_all_to_json" })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchCatalog(page);
      } else {
        showToast("Sync error: " + (data.error || "Failed syncing"), "error");
      }
    } catch (err) {
      showToast("Sync error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            backgroundColor:
              toastType === "success"
                ? "rgba(16, 185, 129, 0.95)"
                : toastType === "error"
                ? "rgba(239, 68, 68, 0.95)"
                : "rgba(30, 41, 59, 0.95)",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.88rem",
            fontWeight: "600",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)"
          }}
        >
          {toastType === "success" ? (
            <FiCheckCircle size={18} />
          ) : toastType === "error" ? (
            <FiAlertCircle size={18} />
          ) : (
            <FiDatabase size={18} />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stats Strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          padding: "20px",
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-flex",
                padding: "8px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--accent-mint)"
              }}
            >
              <FiLayers size={22} />
            </span>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                Wallpaper Catalog Studio
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-sub)" }}>
                Add new records, edit metadata, and auto-sync catalog into{" "}
                <code style={{ color: "var(--accent-mint)", fontSize: "0.78rem" }}>wallpapers.json</code>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={openCreateModal}
            className="action-btn"
            style={{
              backgroundColor: "var(--accent-mint)",
              color: "#0f172a",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
            }}
          >
            <FiPlus size={18} />
            <span>Add New Wallpaper</span>
          </button>

          <button
            onClick={handleSyncAllToJson}
            disabled={loading}
            className="action-btn"
            style={{
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              color: "var(--accent-cyan)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
            title="Re-synchronize database into local wallpapers.json"
          >
            <FiDownload size={16} />
            <span>Sync to wallpapers.json</span>
          </button>

          <button
            onClick={() => fetchCatalog(page)}
            disabled={loading}
            className="action-btn"
            style={{
              backgroundColor: "var(--bg-input)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
              padding: "10px 14px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
            title="Refresh Catalog"
          >
            <FiRefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px"
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", textTransform: "uppercase" }}>
            Database Records
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>
            {summary.total}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", textTransform: "uppercase" }}>
            Published (Live)
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--accent-mint)", marginTop: "4px" }}>
            {summary.published}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", textTransform: "uppercase" }}>
            Drafts / Hidden
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--accent-amber)", marginTop: "4px" }}>
            {summary.draft}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", textTransform: "uppercase" }}>
            Featured
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--accent-purple)", marginTop: "4px" }}>
            {summary.featured}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", textTransform: "uppercase" }}>
            Local JSON Catalog
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--accent-cyan)", marginTop: "4px" }}>
            {summary.diskJsonCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
          background: "var(--bg-card)",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)"
        }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", flex: "1 1 280px", gap: "8px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <FiSearch
              size={16}
              style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-sub)" }}
            />
            <input
              type="text"
              placeholder="Search by title, ID, subcategory, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.85rem"
              }}
            />
          </div>
          <button
            type="submit"
            className="action-btn"
            style={{
              padding: "10px 16px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-color)",
              color: "var(--text-main)",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </form>

        {/* Category Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-sub)" }}>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "9px 12px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-sub)" }}>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: "9px 12px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published (Live)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="restricted">Restricted (VIP)</option>
          </select>

          {/* View Mode Toggle: Cards vs List */}
          <div style={{ display: "inline-flex", background: "rgba(13, 17, 24, 0.7)", borderRadius: "8px", padding: "2px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "6px 12px",
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
            <button
              type="button"
              onClick={() => setViewMode("list")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "6px 12px",
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
          </div>
        </div>
      </div>

      {/* Grid or Table of Wallpaper Records */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-sub)" }}>
          <FiRefreshCw size={32} className="spin" style={{ margin: "0 auto 12px auto" }} />
          <div>Loading catalog records...</div>
        </div>
      ) : wallpapers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bg-card)",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            color: "var(--text-sub)"
          }}
        >
          <FiImage size={40} style={{ margin: "0 auto 14px auto", opacity: 0.4 }} />
          <h3 style={{ color: "#ffffff", margin: "0 0 8px 0" }}>No Wallpapers Found</h3>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>
            No wallpapers matched your search or filter. Click &ldquo;Add New Wallpaper&rdquo; to create one.
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* Table List View */
        <div className="mission-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th style={{ width: "45px", textAlign: "center" }}>#</th>
                  <th style={{ width: "60px" }}>Preview</th>
                  <th>Title & Wallpaper ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Access / Tier</th>
                  <th>Specs</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallpapers.map((wp, idx) => {
                  const isPub = wp.status === "published";
                  const isDraft = wp.status === "draft";

                  return (
                    <tr key={wp.wallpaperId}>
                      <td style={{ textAlign: "center", color: "var(--text-sub)", fontSize: "0.75rem", fontWeight: "700" }}>
                        #{(page - 1) * 20 + idx + 1}
                      </td>
                      <td>
                        <div
                          style={{
                            width: "44px",
                            height: "64px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            backgroundColor: "#090d16",
                            cursor: "pointer",
                            position: "relative"
                          }}
                          onClick={() => {
                            setPreviewVideoUrl(wp.videoUrl);
                            setPreviewTitle(wp.title);
                          }}
                          title="Click to preview video"
                        >
                          {wp.thumbUrl ? (
                            <img src={wp.thumbUrl} alt={wp.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-sub)" }}>
                              <FiImage size={18} />
                            </div>
                          )}
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FiPlay size={12} color="#ffffff" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: "700", color: "#ffffff", fontSize: "0.86rem" }}>{wp.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-sub)", fontFamily: "JetBrains Mono" }}>ID: {wp.wallpaperId}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{wp.category || "General"}</div>
                        {wp.subCategory && <div style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>{wp.subCategory}</div>}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(wp)}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            border: "none",
                            cursor: "pointer",
                            backgroundColor: isPub
                              ? "rgba(16, 185, 129, 0.15)"
                              : isDraft
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(168, 85, 247, 0.15)",
                            color: isPub ? "#34d399" : isDraft ? "#fbbf24" : "#c084fc"
                          }}
                        >
                          {wp.status}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {wp.isFeatured && (
                            <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#fbbf24", background: "rgba(234, 179, 8, 0.15)", padding: "2px 6px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              <FiStar size={11} /> Featured
                            </span>
                          )}
                          {wp.isVipOnly && (
                            <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#c084fc", background: "rgba(168, 85, 247, 0.15)", padding: "2px 6px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              <FiAward size={11} /> VIP
                            </span>
                          )}
                          {!wp.isFeatured && !wp.isVipOnly && (
                            <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>Standard</span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.73rem", color: "var(--text-sub)" }}>
                        <div>{wp.sizeDisplay || (wp.sizeBytes ? `${(wp.sizeBytes / 1024 / 1024).toFixed(1)} MB` : "—")}</div>
                        <div>{wp.width || 1080}×{wp.height || 1920}</div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          <button
                            onClick={() => handleToggleFeatured(wp)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              background: wp.isFeatured ? "rgba(234, 179, 8, 0.15)" : "transparent",
                              color: wp.isFeatured ? "#fbbf24" : "var(--text-muted)",
                              cursor: "pointer",
                              fontSize: "0.72rem"
                            }}
                            title="Toggle Featured in Explore Store"
                          >
                            <FiStar size={12} />
                          </button>
                          <button
                            onClick={() => openEditModal(wp)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              background: "rgba(255, 255, 255, 0.05)",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              fontSize: "0.72rem"
                            }}
                            title="Edit details"
                          >
                            <FiEdit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteWallpaper(wp)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "var(--accent-rose)",
                              cursor: "pointer",
                              fontSize: "0.72rem"
                            }}
                            title="Delete wallpaper"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "18px"
          }}
        >
          {wallpapers.map((wp, idx) => {
            const isPub = wp.status === "published";
            const isDraft = wp.status === "draft";
            const isRest = wp.status === "restricted";

            return (
              <div
                key={wp.wallpaperId}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "14px",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.15s, border-color 0.15s"
                }}
              >
                {/* Visual Thumbnail & Play Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "190px",
                    backgroundColor: "#090d16",
                    overflow: "hidden",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setPreviewVideoUrl(wp.videoUrl);
                    setPreviewTitle(wp.title);
                  }}
                >
                  {wp.thumbUrl ? (
                    <img
                      src={wp.thumbUrl}
                      alt={wp.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-sub)"
                      }}
                    >
                      <FiImage size={36} />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.85
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0f172a",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                      }}
                    >
                      <FiPlay size={18} style={{ marginLeft: "2px" }} />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      right: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pointerEvents: "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span
                        style={{
                          padding: "3px 6px",
                          borderRadius: "6px",
                          fontSize: "0.7rem",
                          fontWeight: "800",
                          backgroundColor: "rgba(15, 20, 28, 0.85)",
                          color: "var(--accent-mint)",
                          border: "1px solid rgba(45, 212, 191, 0.3)"
                        }}
                      >
                        #{(page - 1) * 20 + idx + 1}
                      </span>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          backgroundColor: isPub
                            ? "rgba(16, 185, 129, 0.9)"
                            : isDraft
                            ? "rgba(245, 158, 11, 0.9)"
                            : "rgba(168, 85, 247, 0.9)",
                          color: "#ffffff"
                        }}
                      >
                        {wp.status}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "4px" }}>
                      {wp.isFeatured && (
                        <span
                          style={{
                            padding: "3px 6px",
                            borderRadius: "6px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            backgroundColor: "rgba(234, 179, 8, 0.9)",
                            color: "#0f172a",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                          title="Featured in Store"
                        >
                          <FiStar size={12} />
                        </span>
                      )}
                      {wp.isVipOnly && (
                        <span
                          style={{
                            padding: "3px 6px",
                            borderRadius: "6px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            backgroundColor: "rgba(168, 85, 247, 0.9)",
                            color: "#ffffff",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                          title="VIP Only"
                        >
                          <FiAward size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {wp.durationMs > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        backgroundColor: "rgba(0,0,0,0.75)",
                        color: "#ffffff",
                        fontWeight: "600"
                      }}
                    >
                      {(wp.durationMs / 1000).toFixed(1)}s
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        color: "#ffffff",
                        lineHeight: "1.3",
                        wordBreak: "break-word"
                      }}
                      title={wp.title}
                    >
                      {wp.title}
                    </div>
                  </div>

                  {/* ID with copy */}
                  <div
                    onClick={() => copyToClipboard(wp.wallpaperId, wp.wallpaperId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.74rem",
                      color: copiedId === wp.wallpaperId ? "var(--accent-mint)" : "var(--text-sub)",
                      cursor: "pointer",
                      width: "fit-content"
                    }}
                    title="Click to copy ID"
                  >
                    <code style={{ background: "var(--bg-input)", padding: "1px 6px", borderRadius: "4px" }}>
                      {wp.wallpaperId}
                    </code>
                    {copiedId === wp.wallpaperId ? <FiCheck size={12} /> : <FiCopy size={12} />}
                  </div>

                  {/* Category and Sub-category */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "2px" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(56, 189, 248, 0.12)",
                        color: "var(--accent-cyan)",
                        fontWeight: "600"
                      }}
                    >
                      {wp.category}
                    </span>
                    {wp.subCategory && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: "rgba(168, 85, 247, 0.12)",
                          color: "var(--accent-purple)",
                          fontWeight: "500"
                        }}
                      >
                        {wp.subCategory}
                      </span>
                    )}
                    {wp.sizeDisplay && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "var(--bg-input)",
                          color: "var(--text-sub)"
                        }}
                      >
                        {wp.sizeDisplay}
                      </span>
                    )}
                  </div>

                  {/* Description preview */}
                  {wp.description && (
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-sub)",
                        lineHeight: "1.35",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}
                    >
                      {wp.description}
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "10px",
                      borderTop: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px"
                    }}
                  >
                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(wp, isPub ? "draft" : "published")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.74rem",
                        fontWeight: "600",
                        color: isPub ? "var(--accent-amber)" : "var(--accent-mint)",
                        padding: "4px 8px",
                        borderRadius: "6px"
                      }}
                      title={isPub ? "Unpublish (Make Draft)" : "Publish (Make Live)"}
                    >
                      {isPub ? <FiLock size={12} /> : <FiUnlock size={12} />}
                      <span>{isPub ? "Unpublish" : "Publish"}</span>
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => openEditModal(wp)}
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-main)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600"
                        }}
                        title="Edit Details"
                      >
                        <FiEdit2 size={12} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteWallpaper(wp)}
                        style={{
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          color: "var(--accent-rose)",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                        title="Delete Wallpaper"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
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
            padding: "16px 20px",
            background: "var(--bg-card)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            fontSize: "0.85rem",
            color: "var(--text-sub)"
          }}
        >
          <div>
            Showing Page <strong style={{ color: "#ffffff" }}>{page}</strong> of{" "}
            <strong style={{ color: "#ffffff" }}>{totalPages}</strong> ({totalRecords} records)
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => fetchCatalog(page - 1)}
              disabled={page <= 1 || loading}
              style={{
                padding: "6px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                color: page <= 1 ? "var(--text-sub)" : "#ffffff",
                borderRadius: "6px",
                cursor: page <= 1 ? "not-allowed" : "pointer"
              }}
            >
              Previous
            </button>
            <button
              onClick={() => fetchCatalog(page + 1)}
              disabled={page >= totalPages || loading}
              style={{
                padding: "6px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                color: page >= totalPages ? "var(--text-sub)" : "#ffffff",
                borderRadius: "6px",
                cursor: page >= totalPages ? "not-allowed" : "pointer"
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ===================== ADD / EDIT MODAL ===================== */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "18px",
              border: "1px solid var(--border-color)",
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    background: editingItem ? "rgba(56, 189, 248, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    color: editingItem ? "var(--accent-cyan)" : "var(--accent-mint)"
                  }}
                >
                  {editingItem ? <FiEdit2 size={18} /> : <FiPlus size={18} />}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "#ffffff" }}>
                    {editingItem ? `Edit '${editingItem.title}'` : "Add New Wallpaper Record"}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                    Saves to MongoDB and synchronizes automatically with local wallpapers.json
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-sub)",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveWallpaper} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Row 1: Title & ID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
                    Wallpaper Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GTA VI - Lucia Intense Editorial Portrait"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
                    Wallpaper ID (Leave blank to auto-generate)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. wp_gta6_lucia_editorial_portrait_01"
                    value={formData.wallpaperId}
                    onChange={(e) => setFormData({ ...formData, wallpaperId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Category & Sub-Category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
                    Category
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "0.88rem"
                      }}
                    >
                      {categories.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Custom">+ Custom Category...</option>
                    </select>

                    {formData.category === "Custom" && (
                      <input
                        type="text"
                        placeholder="Type category..."
                        value={formData.customCategory}
                        onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                          color: "#ffffff",
                          fontSize: "0.88rem"
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
                    Sub-Category (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grand Theft Auto VI, Viral Pop & Music Videos"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed visual description shown in the app preview..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Row 4: Video URL & Metadata Detector */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)" }}>
                    Video URL (.mp4) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDetectMeta}
                    disabled={detectingMeta}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-cyan)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "600"
                    }}
                  >
                    <FiRefreshCw size={12} className={detectingMeta ? "spin" : ""} />
                    <span>Auto-detect Size</span>
                  </button>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/.../release/.../video.mp4"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.88rem"
                  }}
                />
              </div>

              {/* Row 5: Thumbnail URL */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
                  Thumbnail Image URL (.jpg / .png)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/.../release/.../image.jpg"
                  value={formData.thumbUrl}
                  onChange={(e) => setFormData({ ...formData, thumbUrl: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.88rem"
                  }}
                />
              </div>

              {/* Row 6: Tags */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GTA 6, Lucia, Vice City, Gaming, Action, Aesthetic"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.88rem"
                  }}
                />
              </div>

              {/* Row 7: Technical Specs (Duration, Size, Dimensions) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-sub)", marginBottom: "4px" }}>
                    Size Display
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7.02 MB"
                    value={formData.sizeDisplay}
                    onChange={(e) => setFormData({ ...formData, sizeDisplay: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      color: "#ffffff",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-sub)", marginBottom: "4px" }}>
                    Duration (ms)
                  </label>
                  <input
                    type="number"
                    placeholder="8000"
                    value={formData.durationMs}
                    onChange={(e) => setFormData({ ...formData, durationMs: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      color: "#ffffff",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-sub)", marginBottom: "4px" }}>
                    Resolution
                  </label>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      style={{
                        width: "50%",
                        padding: "8px 6px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontSize: "0.82rem"
                      }}
                    />
                    <span style={{ color: "var(--text-sub)", fontSize: "0.8rem" }}>×</span>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      style={{
                        width: "50%",
                        padding: "8px 6px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontSize: "0.82rem"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-sub)", marginBottom: "4px" }}>
                    Version
                  </label>
                  <input
                    type="number"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      color: "#ffffff",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>
              </div>

              {/* Row 8: Status & Badges Toggles */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-sub)", marginBottom: "6px" }}>
                    Catalog Status
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["published", "draft", "restricted"].map((st) => (
                      <label
                        key={st}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.82rem",
                          color: formData.status === st ? "#ffffff" : "var(--text-sub)",
                          cursor: "pointer"
                        }}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={st}
                          checked={formData.status === st}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />
                        <span style={{ textTransform: "capitalize" }}>{st}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#ffffff" }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><FiStar color="#fbbf24" size={14} /> Featured in Store</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#ffffff" }}>
                    <input
                      type="checkbox"
                      checked={formData.isVipOnly}
                      onChange={(e) => setFormData({ ...formData, isVipOnly: e.target.checked })}
                    />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><FiAward color="#c084fc" size={14} /> VIP Only</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border-color)"
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-sub)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 22px",
                    background: "var(--accent-mint)",
                    color: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
                  }}
                >
                  {saving ? <FiRefreshCw size={16} className="spin" /> : <FiCheck size={16} />}
                  <span>{editingItem ? "Update & Sync to wallpapers.json" : "Save & Sync to wallpapers.json"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== VIDEO PREVIEW MODAL ===================== */}
      {previewVideoUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
            padding: "20px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewVideoUrl(null);
          }}
        >
          <div
            style={{
              position: "relative",
              width: "360px",
              height: "640px",
              maxHeight: "85vh",
              borderRadius: "24px",
              overflow: "hidden",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
              backgroundColor: "#000000"
            }}
          >
            {/* Top Close Bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: "16px",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10
              }}
            >
              <div style={{ color: "#ffffff", fontSize: "0.85rem", fontWeight: "700" }}>{previewTitle}</div>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Video Player */}
            <video
              src={previewVideoUrl}
              autoPlay
              loop
              controls
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
