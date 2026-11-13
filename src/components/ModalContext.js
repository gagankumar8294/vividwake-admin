"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX
} from "react-icons/fi";

const ModalContext = createContext({
  showConfirm: async () => false,
  showAlert: async () => {}
});

export function ModalProvider({ children }) {
  const [modal, setModal] = useState({
    isOpen: false,
    type: "confirm", // 'confirm' | 'alert'
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger", // 'danger' | 'warning' | 'info' | 'success'
    resolve: null
  });

  const showConfirm = useCallback(
    ({
      title = "Please Confirm",
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "danger"
    }) => {
      return new Promise((resolve) => {
        setModal({
          isOpen: true,
          type: "confirm",
          title,
          message,
          confirmText,
          cancelText,
          variant,
          resolve
        });
      });
    },
    []
  );

  const showAlert = useCallback(
    ({
      title = "Notification",
      message = "",
      confirmText = "OK",
      variant = "info"
    }) => {
      return new Promise((resolve) => {
        setModal({
          isOpen: true,
          type: "alert",
          title,
          message,
          confirmText,
          cancelText: null,
          variant,
          resolve
        });
      });
    },
    []
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__showConfirm = showConfirm;
      window.__showAlert = showAlert;
    }
  }, [showConfirm, showAlert]);

  const handleConfirm = () => {
    if (modal.resolve) modal.resolve(true);
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (modal.resolve) modal.resolve(false);
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modal.isOpen) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal.isOpen, modal.resolve]);

  const getVariantStyles = () => {
    switch (modal.variant) {
      case "danger":
        return {
          icon: <FiAlertTriangle size={22} color="#f87171" />,
          iconBg: "rgba(239, 68, 68, 0.15)",
          border: "rgba(239, 68, 68, 0.35)",
          btnBg: "#ef4444",
          btnColor: "#ffffff"
        };
      case "warning":
        return {
          icon: <FiAlertTriangle size={22} color="#fbbf24" />,
          iconBg: "rgba(245, 158, 11, 0.15)",
          border: "rgba(245, 158, 11, 0.35)",
          btnBg: "#f59e0b",
          btnColor: "#000000"
        };
      case "success":
        return {
          icon: <FiCheckCircle size={22} color="#34d399" />,
          iconBg: "rgba(16, 185, 129, 0.15)",
          border: "rgba(16, 185, 129, 0.35)",
          btnBg: "#10b981",
          btnColor: "#ffffff"
        };
      case "info":
      default:
        return {
          icon: <FiInfo size={22} color="var(--accent-mint)" />,
          iconBg: "rgba(45, 212, 191, 0.15)",
          border: "rgba(45, 212, 191, 0.35)",
          btnBg: "var(--accent-mint)",
          btnColor: "#090c10"
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <ModalContext.Provider value={{ showConfirm, showAlert }}>
      {children}

      {modal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={modal.type === "alert" ? handleConfirm : handleCancel}
        >
          <div
            className="mission-card"
            style={{
              width: "100%",
              maxWidth: "460px",
              padding: "1.6rem",
              borderRadius: "14px",
              background: "rgba(15, 20, 28, 0.97)",
              border: `1px solid ${vStyles.border}`,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: vStyles.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                {vStyles.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
                  {modal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={modal.type === "alert" ? handleConfirm : handleCancel}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-sub)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px"
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Message Body */}
            <div
              style={{
                fontSize: "0.85rem",
                color: "#cbd5e1",
                lineHeight: "1.55",
                whiteSpace: "pre-line",
                wordBreak: "break-word",
                background: "rgba(0, 0, 0, 0.25)",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}
            >
              {modal.message}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              {modal.type === "confirm" && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.07)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "var(--text-muted)",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {modal.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                autoFocus
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  background: vStyles.btnBg,
                  border: "none",
                  color: vStyles.btnColor,
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.15s"
                }}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
