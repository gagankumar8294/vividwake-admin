"use client";

import React from "react";
import {
  FiActivity,
  FiLock,
  FiSmartphone,
  FiBell,
  FiDownload,
  FiShield,
  FiLogOut
} from "react-icons/fi";

export default function Sidebar({ activeTab, onSelectTab, pendingTransfersCount = 0, onLogout }) {
  const navItems = [
    { id: "sessions", label: "Live Telemetry", icon: FiActivity },
    { id: "locks", label: "Device Bonds & Bans", icon: FiLock },
    {
      id: "transfers",
      label: "Rebind Approvals",
      icon: FiSmartphone,
      badge: pendingTransfersCount > 0 ? pendingTransfersCount : null
    },
    { id: "notifications", label: "Push Notifications", icon: FiBell },
    { id: "versions", label: "Force-Update Gate", icon: FiDownload },
    { id: "shield", label: "CDN Bot Shield", icon: FiShield }
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div className="sidebar-brand-box">
          <FiActivity size={20} />
        </div>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.01em" }}>
            VividWake
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--accent-mint)", fontWeight: "600" }}>
            Mission Control v2.0
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.badge !== null && (
                <span className="nav-badge-pending">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "var(--text-sub)", padding: "0 4px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-mint)" }} />
          <span>Master Auth Verified</span>
        </div>

        <button
          onClick={onLogout}
          className="sidebar-nav-btn"
          style={{ color: "var(--accent-rose)", marginTop: "4px" }}
          title="Lock Mission Control"
        >
          <FiLogOut size={14} />
          <span>Lock Dashboard</span>
        </button>
      </div>
    </aside>
  );
}
