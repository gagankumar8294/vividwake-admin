"use client";

import React, { useState } from "react";
import {
  FiDownload,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiSettings,
  FiSmartphone,
  FiZap,
  FiCpu,
  FiBatteryCharging,
  FiLock,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiPlay,
  FiArrowRight,
  FiInfo,
  FiHelpCircle
} from "react-icons/fi";

export default function InstallGuidePage() {
  const [activeWallpaperTab, setActiveWallpaperTab] = useState("lucia");
  const [activeOemTab, setActiveOemTab] = useState("motorola");
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const oemGuides = {
    motorola: {
      brand: "Motorola (HelloUI / Clean AOSP)",
      icon: "📱",
      steps: [
        "Tap 'Download VividWake APK' and tap 'Download anyway' in Chrome.",
        "Open Chrome Downloads, tap 'VividWake-v1.0.apk', and tap 'Settings' -> enable 'Allow from this source'.",
        "On the Play Protect dialog, tap 'More details' -> 'Install anyway'.",
        "Launch VividWake, tap 'Apply to Lock Screen', and select 'Home screen and lock screen'."
      ]
    },
    samsung: {
      brand: "Samsung (OneUI 6.0 / 6.1)",
      icon: "✨",
      steps: [
        "Download APK and open via 'My Files' -> 'Downloads' or Chrome notifications.",
        "If Samsung 'Auto Blocker' is enabled: go to Settings -> Security and privacy -> Auto Blocker -> Temporarily toggle OFF.",
        "Allow installation from Chrome/My Files, then tap 'Install anyway' on Google Play Protect.",
        "Open VividWake -> Settings -> Battery -> Set to 'Unrestricted' for uninterrupted smooth 60fps playback."
      ]
    },
    xiaomi: {
      brand: "Xiaomi / POCO / Redmi (HyperOS / MIUI)",
      icon: "⚡",
      steps: [
        "Download APK -> In Package Installer, check 'I am aware of the possible risks' after the 10-second countdown.",
        "Tap 'OK' -> Tap 'More details' on Play Protect -> 'Install anyway'.",
        "Long-press VividWake app icon -> App info -> Enable 'Autostart' and set Battery Saver to 'No restrictions'.",
        "Set wallpaper via VividWake with 1-tap live application."
      ]
    },
    oneplus: {
      brand: "OnePlus / Realme / OPPO (OxygenOS / ColorOS)",
      icon: "🚀",
      steps: [
        "Download APK -> Tap 'Install' -> Tap 'Settings' -> Enable 'Allow app installs from this source'.",
        "Tap 'Install anyway' on the security scan prompt.",
        "Go to App info -> Battery -> Enable 'Allow background activity' and 'Allow auto-launch'.",
        "Open VividWake and choose either Sabrina Carpenter or Lucia for immediate lock screen setup."
      ]
    },
    pixel: {
      brand: "Google Pixel (Android 14 / 15)",
      icon: "💎",
      steps: [
        "Download APK in Chrome -> Tap 'Download anyway'.",
        "Tap notification -> Settings -> Enable 'Allow from this source'.",
        "When Play Protect prompt appears, tap 'More details' -> 'Install anyway'.",
        "Pixel native wallpaper chooser will open -> Select 'Home and lock screen'."
      ]
    }
  };

  const faqs = [
    {
      q: "Why does Chrome say 'File might be harmful'?",
      a: "This is Google Chrome's standard automated warning for EVERY .apk file downloaded outside the Google Play Store. It simply means the file is an application installer. VividWake contains ZERO malicious code, ZERO spyware, and ZERO tracking ads. Tap 'Download anyway' to safely proceed."
    },
    {
      q: "Why does Google Play Protect show 'Unrecognized app' or 'Blocked'?",
      a: "Google Play Protect displays this for all newly released direct APKs that use self-signed developer certificates. Because VividWake is distributed directly to users without Play Store middleman fees, Google flags it as 'unrecognized'. Simply tap 'More details' and click 'Install anyway' to complete the installation."
    },
    {
      q: "Will VividWake drain my phone battery?",
      a: "No! Unlike standard live wallpaper apps that continuously render in the background, VividWake's OpenGL ES engine automatically PAUSES decoding the exact millisecond your screen is locked or an app is in the foreground. It consumes 0.0% background battery."
    },
    {
      q: "Can I download both Sabrina Carpenter and GTA VI Lucia wallpapers?",
      a: "Yes! Both wallpapers come fully optimized in 4K 60FPS vertical format. You can switch between them with a single tap inside the 'My Wallpapers' or 'Explore Store' tabs."
    },
    {
      q: "How do I update VividWake in the future?",
      a: "VividWake features built-in version checking. When an update is ready, a clean in-app banner will notify you, allowing 1-tap download and seamless in-place upgrade without losing your downloaded wallpapers."
    }
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#06090e", color: "#f1f5f9", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Top Announcement Bar */}
      <div style={{
        background: "linear-gradient(90deg, rgba(5,150,105,0.2) 0%, rgba(45,212,191,0.2) 50%, rgba(197,160,89,0.2) 100%)",
        borderBottom: "1px solid rgba(45,212,191,0.2)",
        padding: "8px 16px",
        textAlign: "center",
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px"
      }}>
        <span style={{ backgroundColor: "#059669", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "700" }}>
          NEW v1.0.0
        </span>
        <span style={{ color: "#94a3b8" }}>Direct Sideload Release — GTA VI Lucia & Sabrina Carpenter 4K 60FPS Wallpapers now available!</span>
      </div>

      {/* Navigation Header */}
      <header style={{
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(6,9,14,0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            backgroundColor: "#0f172a",
            border: "1px solid rgba(45,212,191,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(45,212,191,0.2)"
          }}>
            <img src="/logo.png" alt="VividWake" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
              VividWake
            </div>
            <div style={{ fontSize: "0.7rem", color: "#2dd4bf", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Cinematic Lock Screen Engine
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }} className="hidden-mobile">
          <a href="#showcase" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500", transition: "color 0.2s" }}>
            Wallpapers
          </a>
          <a href="#install-guide" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500", transition: "color 0.2s" }}>
            Install Guide
          </a>
          <a href="#inapp-walkthrough" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500", transition: "color 0.2s" }}>
            App Setup
          </a>
          <a href="#tech-specs" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500", transition: "color 0.2s" }}>
            0% Battery Tech
          </a>
          <a href="#faq" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500", transition: "color 0.2s" }}>
            FAQ
          </a>
        </nav>

        <a
          href="/api/download"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#059669",
            backgroundImage: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "0.9rem",
            fontWeight: "700",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
            transition: "all 0.2s"
          }}
        >
          <FiDownload style={{ fontSize: "1.1rem" }} />
          <span>Download APK (19.7 MB)</span>
        </a>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "60px 24px 40px 24px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "rgba(45,212,191,0.1)",
          border: "1px solid rgba(45,212,191,0.3)",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "0.82rem",
          color: "#2dd4bf",
          fontWeight: "600",
          marginBottom: "24px"
        }}>
          <FiShield style={{ fontSize: "0.95rem" }} />
          <span>Verified Safe Standalone APK • Direct Website Download</span>
        </div>

        <h1 style={{
          fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
          fontWeight: "900",
          letterSpacing: "-0.03em",
          lineHeight: "1.1",
          marginBottom: "20px",
          background: "linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Transform Your Lock Screen Into A <br />
          <span style={{
            background: "linear-gradient(135deg, #2dd4bf 0%, #38bdf8 50%, #c5a059 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Cinematic 4K Live Experience
          </span>
        </h1>

        <p style={{
          maxWidth: "760px",
          margin: "0 auto 36px auto",
          fontSize: "1.15rem",
          lineHeight: "1.6",
          color: "#94a3b8",
          fontWeight: "400"
        }}>
          VividWake brings hardware-accelerated 60 FPS video lock screens to Android with <strong style={{ color: "#f1f5f9" }}>0% background battery drain</strong> and <strong style={{ color: "#f1f5f9" }}>zero wake-up lag</strong>. Sideload safely directly from our official website.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "48px" }}>
          <a
            href="/api/download"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#059669",
              backgroundImage: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              color: "#ffffff",
              padding: "16px 32px",
              borderRadius: "12px",
              fontSize: "1.05rem",
              fontWeight: "800",
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(16,185,129,0.4)",
              transition: "transform 0.2s"
            }}
          >
            <FiDownload style={{ fontSize: "1.3rem" }} />
            <span>Download VividWake APK</span>
            <span style={{ fontSize: "0.8rem", opacity: 0.85, fontWeight: "500", marginLeft: "4px" }}>v1.0.0 • 19.7 MB</span>
          </a>

          <a
            href="#install-guide"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#f1f5f9",
              padding: "16px 28px",
              borderRadius: "12px",
              fontSize: "1.05rem",
              fontWeight: "600",
              textDecoration: "none",
              transition: "background 0.2s"
            }}
          >
            <span>How to Install & Bypass Warnings</span>
            <FiChevronDown style={{ fontSize: "1.2rem" }} />
          </a>
        </div>

        {/* Quick Spec Badges */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          flexWrap: "wrap",
          padding: "20px",
          backgroundColor: "rgba(15,23,42,0.5)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.05)",
          maxWidth: "880px",
          margin: "0 auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiBatteryCharging style={{ color: "#2dd4bf", fontSize: "1.3rem" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f1f5f9" }}>0% Idle Battery</div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Pauses GL loop when unlocked</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiZap style={{ color: "#38bdf8", fontSize: "1.3rem" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f1f5f9" }}>Zero Wake Delay</div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Instant power-button playback</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiCpu style={{ color: "#c5a059", fontSize: "1.3rem" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f1f5f9" }}>60 FPS Native</div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>OpenGL ES 3.0 Decoded</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiLock style={{ color: "#a855f7", fontSize: "1.3rem" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f1f5f9" }}>Offline Vault</div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Encrypted local storage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Wallpapers Showcase: Sabrina Carpenter & Lucia GTA VI */}
      <section id="showcase" style={{ maxWidth: "1240px", margin: "40px auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Featured Live Wallpapers
          </div>
          <h2 style={{ fontSize: "2.3rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
            Experience Ultra-HD 60FPS On Your Lock Screen
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1rem", maxWidth: "600px", margin: "10px auto 0 auto" }}>
            Captured directly from real Android devices running VividWake. Click each tab to preview the real lock screen visuals.
          </p>
        </div>

        {/* Wallpaper Selector Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveWallpaperTab("lucia")}
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: "pointer",
              border: activeWallpaperTab === "lucia" ? "1px solid #c5a059" : "1px solid rgba(255,255,255,0.1)",
              backgroundColor: activeWallpaperTab === "lucia" ? "rgba(197,160,89,0.18)" : "rgba(255,255,255,0.03)",
              color: activeWallpaperTab === "lucia" ? "#c5a059" : "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <span>👑 GTA VI — Lucia Editorial Portrait</span>
          </button>

          <button
            onClick={() => setActiveWallpaperTab("sabrina")}
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: "pointer",
              border: activeWallpaperTab === "sabrina" ? "1px solid #f43f5e" : "1px solid rgba(255,255,255,0.1)",
              backgroundColor: activeWallpaperTab === "sabrina" ? "rgba(244,63,94,0.18)" : "rgba(255,255,255,0.03)",
              color: activeWallpaperTab === "sabrina" ? "#f43f5e" : "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <span>💋 Sabrina Carpenter — Taste Kiss Scene</span>
          </button>

          <button
            onClick={() => setActiveWallpaperTab("wheelie")}
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: "pointer",
              border: activeWallpaperTab === "wheelie" ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)",
              backgroundColor: activeWallpaperTab === "wheelie" ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.03)",
              color: activeWallpaperTab === "wheelie" ? "#38bdf8" : "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <span>🏍️ GTA VI — Lucia & Jason Wheelie</span>
          </button>
        </div>

        {/* Tab 1: Lucia GTA VI */}
        {activeWallpaperTab === "lucia" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px",
            backgroundColor: "rgba(15,23,42,0.4)",
            border: "1px solid rgba(197,160,89,0.2)",
            borderRadius: "20px",
            padding: "36px",
            alignItems: "center"
          }}>
            <div>
              <div style={{
                display: "inline-block",
                backgroundColor: "rgba(197,160,89,0.15)",
                color: "#c5a059",
                border: "1px solid rgba(197,160,89,0.3)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "700",
                marginBottom: "16px"
              }}>
                POPULAR VIRAL WALLPAPER
              </div>
              <h3 style={{ fontSize: "1.9rem", fontWeight: "800", color: "#ffffff", marginBottom: "14px" }}>
                GTA VI: Lucia Intense Editorial Portrait
              </h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "1rem", marginBottom: "20px" }}>
                The viral hyper-realistic portrait of GTA VI's Lucia. Featuring her intense hazel gaze, layered brunette hair, layered diamond necklaces, and atmospheric falling embers. Smoothly looping at 60 FPS in 1080×1920.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Resolution</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9" }}>1080 × 1920 Full HD</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Engine File Size</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9" }}>7.02 MB (Optimized)</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Framerate</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#2dd4bf" }}>60 FPS Native Loop</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Application</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#c5a059" }}>1-Tap Direct Lock Screen</div>
                </div>
              </div>

              <a
                href="/api/download"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#c5a059",
                  color: "#06090e",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  textDecoration: "none"
                }}
              >
                <FiDownload />
                <span>Get App & Set Lucia As Lock Screen</span>
              </a>
            </div>

            {/* Device Lock Screen Preview */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "250px",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: "4px solid #1e293b",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(197,160,89,0.2)",
                  backgroundColor: "#000"
                }}>
                  <img
                    src="/guide/step5_lockscreen_lucia.png"
                    alt="Lucia Lock Screen Live on Device"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
                <div style={{ marginTop: "10px", fontSize: "0.78rem", color: "#c5a059", fontWeight: "600" }}>
                  📸 Real Motorola g64 Lock Screen
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "250px",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: "4px solid #1e293b",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                  backgroundColor: "#000"
                }}>
                  <img
                    src="/guide/lucia_portrait.jpg"
                    alt="Lucia Portrait Source"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
                <div style={{ marginTop: "10px", fontSize: "0.78rem", color: "#94a3b8", fontWeight: "600" }}>
                  ✨ 4K Source Portrait Master
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sabrina Carpenter */}
        {activeWallpaperTab === "sabrina" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px",
            backgroundColor: "rgba(15,23,42,0.4)",
            border: "1px solid rgba(244,63,94,0.25)",
            borderRadius: "20px",
            padding: "36px",
            alignItems: "center"
          }}>
            <div>
              <div style={{
                display: "inline-block",
                backgroundColor: "rgba(244,63,94,0.15)",
                color: "#f43f5e",
                border: "1px solid rgba(244,63,94,0.3)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "700",
                marginBottom: "16px"
              }}>
                VIRAL SENSATION • 60 FPS
              </div>
              <h3 style={{ fontSize: "1.9rem", fontWeight: "800", color: "#ffffff", marginBottom: "14px" }}>
                Sabrina Carpenter: Taste Kiss Scene
              </h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "1rem", marginBottom: "20px" }}>
                The full viral 1080×1920 60fps video wallpaper of Sabrina Carpenter from the acclaimed 'Taste' music video. Seamless looping video with perfect portrait crop on your Android phone lock screen.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Clip Duration</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9" }}>15 Seconds Full Scene</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Master Video</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9" }}>26.22 MB Ultra HD</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Playback</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f43f5e" }}>60 FPS Seamless Loop</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Status</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#2dd4bf" }}>Active in My Wallpapers</div>
                </div>
              </div>

              <a
                href="/api/download"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#f43f5e",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  textDecoration: "none"
                }}
              >
                <FiDownload />
                <span>Download App & Apply Sabrina Wallpaper</span>
              </a>
            </div>

            {/* Device Lock Screen Preview */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "250px",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: "4px solid #1e293b",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(244,63,94,0.2)",
                  backgroundColor: "#000"
                }}>
                  <img
                    src="/guide/step4_lockscreen_sabrina.png"
                    alt="Sabrina Carpenter Lock Screen Live"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
                <div style={{ marginTop: "10px", fontSize: "0.78rem", color: "#f43f5e", fontWeight: "600" }}>
                  📸 Real Lock Screen Live Playback
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "250px",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: "4px solid #1e293b",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                  backgroundColor: "#000"
                }}>
                  <img
                    src="/guide/step1_my_wallpapers.png"
                    alt="Sabrina in My Wallpapers Tab"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
                <div style={{ marginTop: "10px", fontSize: "0.78rem", color: "#94a3b8", fontWeight: "600" }}>
                  📱 VividWake App Manager
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Lucia Wheelie */}
        {activeWallpaperTab === "wheelie" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px",
            backgroundColor: "rgba(15,23,42,0.4)",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: "20px",
            padding: "36px",
            alignItems: "center"
          }}>
            <div>
              <div style={{
                display: "inline-block",
                backgroundColor: "rgba(56,189,248,0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(56,189,248,0.3)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "700",
                marginBottom: "16px"
              }}>
                GTA VI ACTION • 60 FPS
              </div>
              <h3 style={{ fontSize: "1.9rem", fontWeight: "800", color: "#ffffff", marginBottom: "14px" }}>
                Lucia & Jason: Vice City Highway Wheelie
              </h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "1rem", marginBottom: "20px" }}>
                High-speed action sequence featuring Lucia riding pillion on a motorcycle wheelie across the sun-drenched neon streets of Vice City. Optimized for flawless looping.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Scene Type</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9" }}>Cinematic Action</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>File Size</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9" }}>8.16 MB Ultra Compressed</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Audio FX</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#38bdf8" }}>Silent Engine Loop</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Category</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#2dd4bf" }}>Gaming / Vice City</div>
                </div>
              </div>

              <a
                href="/api/download"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#38bdf8",
                  color: "#06090e",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  textDecoration: "none"
                }}
              >
                <FiDownload />
                <span>Download VividWake to Apply</span>
              </a>
            </div>

            {/* Thumbnail Preview */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "260px",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: "4px solid #1e293b",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(56,189,248,0.2)",
                  backgroundColor: "#000"
                }}>
                  <img
                    src="/guide/lucia_wheelie.jpg"
                    alt="Lucia Motorcycle Wheelie"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
                <div style={{ marginTop: "10px", fontSize: "0.78rem", color: "#38bdf8", fontWeight: "600" }}>
                  🏍️ Vice City Wheelie Preview
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Manual Sideload Installation Guide: Chrome & Play Protect Warnings */}
      <section id="install-guide" style={{
        maxWidth: "1240px",
        margin: "60px auto",
        padding: "50px 24px",
        backgroundColor: "rgba(15,23,42,0.45)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Direct Manual Sideload
          </div>
          <h2 style={{ fontSize: "2.3rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
            How To Safely Install On Android
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1rem", maxWidth: "700px", margin: "10px auto 0 auto" }}>
            Because VividWake is released directly to users without Play Store middleman restrictions, Android displays standard security verification dialogs. Follow these 3 simple steps to accept and install:
          </p>
        </div>

        {/* 3 Step Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Step 1: Chrome Warning */}
          <div style={{
            backgroundColor: "rgba(10,14,22,0.8)",
            border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ backgroundColor: "#d97706", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800" }}>
                  STEP 1
                </span>
                <span style={{ color: "#fbbf24", fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FiAlertTriangle /> Chrome Download
                </span>
              </div>

              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
                Tap 'Download anyway'
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "20px" }}>
                When downloading via Chrome or any mobile browser, Android will prompt: <em style={{ color: "#f1f5f9" }}>"File might be harmful. Do you want to download VividWake-v1.0.apk anyway?"</em>
              </p>

              {/* Visual Replica of Chrome Dialog */}
              <div style={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ color: "#fbbf24", fontSize: "1.4rem" }}>⚠️</div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#f1f5f9" }}>File might be harmful</div>
                    <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Do you want to download VividWake-v1.0.apk anyway?</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", padding: "6px 12px" }}>Cancel</span>
                  <span style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    boxShadow: "0 0 10px rgba(2,132,199,0.5)"
                  }}>
                    Download anyway ➔
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: "rgba(251,191,36,0.1)",
              borderLeft: "3px solid #fbbf24",
              padding: "10px 14px",
              borderRadius: "0 8px 8px 0",
              fontSize: "0.8rem",
              color: "#fbbf24"
            }}>
              💡 <strong>Why this happens:</strong> Google flags all direct APK downloads outside Play Store. VividWake is 100% clean and safe.
            </div>
          </div>

          {/* Step 2: Allow Unknown Apps */}
          <div style={{
            backgroundColor: "rgba(10,14,22,0.8)",
            border: "1px solid rgba(56,189,248,0.3)",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ backgroundColor: "#0284c7", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800" }}>
                  STEP 2
                </span>
                <span style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FiSettings /> System Security
                </span>
              </div>

              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
                Enable 'Allow from this source'
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "20px" }}>
                When opening the downloaded file, Android might block it: <em style={{ color: "#f1f5f9" }}>"For your security, your phone is not allowed to install unknown apps from this source."</em>
              </p>

              {/* Visual Replica of Android Settings Dialog */}
              <div style={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "10px" }}>
                  Chrome • Install unknown apps
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: "10px 14px",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#f1f5f9" }}>Allow from this source</div>
                  <div style={{
                    width: "44px",
                    height: "24px",
                    backgroundColor: "#059669",
                    borderRadius: "12px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px"
                  }}>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#ffffff",
                      borderRadius: "50%",
                      marginLeft: "auto",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                    }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: "rgba(56,189,248,0.1)",
              borderLeft: "3px solid #38bdf8",
              padding: "10px 14px",
              borderRadius: "0 8px 8px 0",
              fontSize: "0.8rem",
              color: "#38bdf8"
            }}>
              👉 <strong>Action:</strong> Tap <strong>Settings</strong> ➔ Toggle the switch to <strong>ON</strong> ➔ Press the Back button to resume.
            </div>
          </div>

          {/* Step 3: Google Play Protect */}
          <div style={{
            backgroundColor: "rgba(10,14,22,0.8)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ backgroundColor: "#059669", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800" }}>
                  STEP 3
                </span>
                <span style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FiShield /> Play Protect
                </span>
              </div>

              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
                Tap 'More details' ➔ 'Install anyway'
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "20px" }}>
                Google Play Protect may display: <em style={{ color: "#f1f5f9" }}>"Play Protect doesn't recognize this app's developer"</em> or <em style={{ color: "#f1f5f9" }}>"Blocked by Play Protect"</em>.
              </p>

              {/* Visual Replica of Play Protect Dialog */}
              <div style={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ color: "#2dd4bf", fontSize: "1.3rem" }}>🛡️</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#f1f5f9" }}>Play Protect Alert</div>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "12px" }}>
                  Apps from unrecognized developers can sometimes be unsafe.
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.82rem", color: "#38bdf8", textDecoration: "underline", cursor: "pointer", fontWeight: "600" }}>
                    More details ▾
                  </span>
                  <span style={{
                    fontSize: "0.82rem",
                    fontWeight: "800",
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    boxShadow: "0 0 10px rgba(5,150,105,0.4)"
                  }}>
                    Install anyway
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: "rgba(16,185,129,0.1)",
              borderLeft: "3px solid #10b981",
              padding: "10px 14px",
              borderRadius: "0 8px 8px 0",
              fontSize: "0.8rem",
              color: "#2dd4bf"
            }}>
              ✅ <strong>Done:</strong> Tap <strong>More details</strong>, then click <strong>Install anyway</strong>. App installs immediately!
            </div>
          </div>
        </div>
      </section>

      {/* In-App First Setup & Applying Wallpapers Walkthrough */}
      <section id="inapp-walkthrough" style={{ maxWidth: "1240px", margin: "40px auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            First-Time App Setup
          </div>
          <h2 style={{ fontSize: "2.3rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
            How To Download & Apply Live Wallpapers
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1rem", maxWidth: "680px", margin: "10px auto 0 auto" }}>
            Visual step-by-step walkthrough captured directly from the live app on Motorola g64.
          </p>
        </div>

        {/* 4 In-App Steps with Real Device Screenshots */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "24px" }}>
          {/* In-App Step 1 */}
          <div style={{
            backgroundColor: "rgba(15,23,42,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden"
          }}>
            <div style={{ height: "340px", overflow: "hidden", backgroundColor: "#000", position: "relative" }}>
              <img
                src="/guide/step1_my_wallpapers.png"
                alt="My Wallpapers Tab"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
              <div style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                backgroundColor: "#059669",
                color: "#ffffff",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "800"
              }}>
                STEP 1
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
                Open VividWake & Set Permission
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5" }}>
                Tap the big green <strong>"Apply to Lock Screen"</strong> button. Android's native Live Wallpaper chooser opens. Select <strong>"Home screen and lock screen"</strong>.
              </p>
            </div>
          </div>

          {/* In-App Step 2 */}
          <div style={{
            backgroundColor: "rgba(15,23,42,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden"
          }}>
            <div style={{ height: "340px", overflow: "hidden", backgroundColor: "#000", position: "relative" }}>
              <img
                src="/guide/step2_explore_store_clean.png"
                alt="Explore Store Catalog"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
              <div style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                backgroundColor: "#0284c7",
                color: "#ffffff",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "800"
              }}>
                STEP 2
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
                Browse 'Explore Store' Tab
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5" }}>
                Switch to the <strong>Explore Store</strong> tab to view cloud-synced viral wallpapers like <em>GTA VI Lucia Portrait</em>, <em>Lucia Wheelie</em>, and VIP drops.
              </p>
            </div>
          </div>

          {/* In-App Step 3 */}
          <div style={{
            backgroundColor: "rgba(15,23,42,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "340px",
              backgroundColor: "#090d16",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "24px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                backgroundColor: "#d97706",
                color: "#ffffff",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "800"
              }}>
                STEP 3
              </div>

              {/* Progress UI Card */}
              <div style={{
                width: "100%",
                backgroundColor: "#1e293b",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(45,212,191,0.3)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <FiDownload style={{ color: "#2dd4bf", fontSize: "1.2rem" }} />
                  <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#ffffff" }}>Setting up download...</div>
                </div>
                {/* Animated progress bar */}
                <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                  <div style={{
                    width: "70%",
                    height: "100%",
                    backgroundColor: "#059669",
                    backgroundImage: "linear-gradient(90deg, #059669, #2dd4bf)",
                    borderRadius: "4px"
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8" }}>
                  <span>Fast encrypted vault caching</span>
                  <span style={{ color: "#2dd4bf", fontWeight: "600" }}>Ready in 2s</span>
                </div>
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
                High-Speed Vault Download
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5" }}>
                Tap <strong>Download</strong>. VividWake displays an emerald setup indicator and caches the 4K 60FPS video directly into your phone's hardware-encrypted offline storage.
              </p>
            </div>
          </div>

          {/* In-App Step 4 */}
          <div style={{
            backgroundColor: "rgba(15,23,42,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden"
          }}>
            <div style={{ height: "340px", overflow: "hidden", backgroundColor: "#000", position: "relative" }}>
              <img
                src="/guide/step5_lockscreen_lucia.png"
                alt="Lucia Applied on Lock Screen"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
              <div style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                backgroundColor: "#a855f7",
                color: "#ffffff",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "800"
              }}>
                STEP 4
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
                1-Tap Instant 'Apply'
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5" }}>
                Tap <strong>Apply</strong>! The lock screen and home screen immediately switch to the new video wallpaper. Press your phone's power button to enjoy the cinematic 4K loop!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OEM Specific Setup Instructions */}
      <section style={{ maxWidth: "1240px", margin: "40px auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Device Specific Optimization
          </div>
          <h2 style={{ fontSize: "2.1rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
            Optimized For Every Phone Brand
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Select your phone brand below for exact settings and battery optimization instructions:
          </p>
        </div>

        {/* Brand Selector Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
          {Object.keys(oemGuides).map((key) => {
            const isSel = activeOemTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveOemTab(key)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: isSel ? "1px solid #2dd4bf" : "1px solid rgba(255,255,255,0.08)",
                  backgroundColor: isSel ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.02)",
                  color: isSel ? "#2dd4bf" : "#94a3b8",
                  transition: "all 0.2s"
                }}
              >
                {oemGuides[key].icon} {oemGuides[key].brand.split("(")[0]}
              </button>
            );
          })}
        </div>

        {/* Selected OEM Content */}
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "rgba(15,23,42,0.5)",
          border: "1px solid rgba(45,212,191,0.2)",
          borderRadius: "16px",
          padding: "28px"
        }}>
          <h4 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{oemGuides[activeOemTab].icon}</span>
            <span>{oemGuides[activeOemTab].brand}</span>
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {oemGuides[activeOemTab].steps.map((st, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(45,212,191,0.15)",
                  color: "#2dd4bf",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: "800",
                  flexShrink: 0,
                  marginTop: "2px"
                }}>
                  {idx + 1}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "0.92rem", lineHeight: "1.5" }}>
                  {st}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Comparison: Why VividWake */}
      <section id="tech-specs" style={{
        maxWidth: "1240px",
        margin: "60px auto",
        padding: "50px 24px",
        backgroundColor: "rgba(15,23,42,0.35)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Under The Hood
          </div>
          <h2 style={{ fontSize: "2.3rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
            Why VividWake Beats Traditional Wallpaper Apps
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ textAlign: "left", padding: "16px", color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Feature</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#2dd4bf", fontSize: "1rem", fontWeight: "800" }}>✨ VividWake Engine</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#64748b", fontSize: "0.9rem", fontWeight: "600" }}>Traditional Live Wallpapers</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px", color: "#cbd5e1", fontWeight: "600" }}>Background Battery Drain</td>
                <td style={{ padding: "16px", color: "#10b981", fontWeight: "700" }}>⚡ 0.0% (Decoder & Surface paused)</td>
                <td style={{ padding: "16px", color: "#ef4444" }}>❌ 8% - 15% daily battery drain</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px", color: "#cbd5e1", fontWeight: "600" }}>Wake-Up Lag</td>
                <td style={{ padding: "16px", color: "#10b981", fontWeight: "700" }}>⚡ 0ms (Instant hardware attach)</td>
                <td style={{ padding: "16px", color: "#ef4444" }}>❌ 500ms - 1.2s black screen delay</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px", color: "#cbd5e1", fontWeight: "600" }}>Video Decoder</td>
                <td style={{ padding: "16px", color: "#10b981", fontWeight: "700" }}>⚡ Native MediaCodec + OpenGL ES 3.0</td>
                <td style={{ padding: "16px", color: "#94a3b8" }}>Basic Software / WebViews</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px", color: "#cbd5e1", fontWeight: "600" }}>Privacy & Ad-Trackers</td>
                <td style={{ padding: "16px", color: "#10b981", fontWeight: "700" }}>🛡️ 100% Ad-Free, No Data Mining</td>
                <td style={{ padding: "16px", color: "#ef4444" }}>❌ Filled with interstitial ads</td>
              </tr>
              <tr>
                <td style={{ padding: "16px", color: "#cbd5e1", fontWeight: "600" }}>Offline Mode</td>
                <td style={{ padding: "16px", color: "#10b981", fontWeight: "700" }}>⚡ Encrypted Vault (Plays without Wi-Fi)</td>
                <td style={{ padding: "16px", color: "#94a3b8" }}>Requires internet to stream</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" style={{ maxWidth: "860px", margin: "40px auto 80px auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Got Questions?
          </div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: "rgba(15,23,42,0.45)",
                  border: isOpen ? "1px solid rgba(45,212,191,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "all 0.2s"
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: "100%",
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "1rem",
                    fontWeight: "700",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <FiChevronUp style={{ color: "#2dd4bf" }} /> : <FiChevronDown style={{ color: "#94a3b8" }} />}
                </button>
                {isOpen && (
                  <div style={{ padding: "0 20px 20px 20px", color: "#94a3b8", fontSize: "0.92rem", lineHeight: "1.6" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Floating CTA Banner */}
      <div style={{
        backgroundColor: "rgba(10,14,22,0.95)",
        borderTop: "1px solid rgba(45,212,191,0.25)",
        padding: "24px 20px",
        position: "sticky",
        bottom: 0,
        zIndex: 40,
        backdropFilter: "blur(16px)"
      }}>
        <div style={{
          maxWidth: "1240px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#ffffff" }}>
              Ready to elevate your phone screen?
            </div>
            <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              Download VividWake APK directly • No Play Store required • 100% Free & Safe
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a
              href="/api/download"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#059669",
                backgroundImage: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontWeight: "800",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(16,185,129,0.4)"
              }}
            >
              <FiDownload style={{ fontSize: "1.1rem" }} />
              <span>Download VividWake APK (19.7 MB)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        textAlign: "center",
        color: "#64748b",
        fontSize: "0.85rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
          <img src="/logo.png" alt="VividWake" style={{ width: "20px", height: "20px" }} />
          <span style={{ fontWeight: "700", color: "#f1f5f9" }}>VividWake Sideload Distribution</span>
        </div>
        <p>© 2026 VividWake Team. All rights reserved. Sideload edition for Android 9.0 - Android 15.</p>
      </footer>
    </div>
  );
}
