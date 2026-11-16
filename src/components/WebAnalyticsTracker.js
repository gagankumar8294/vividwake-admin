"use client";

import { useEffect, useRef } from "react";

/**
 * Smart Low-API-Call SessionFlow Web Analytics Tracker
 * 
 * - Measures which sections user views and exact dwell time (seconds spent reading each section)
 * - Tracks button clicks, download triggers, accordion interactions, and tab switches
 * - Batches all telemetry in-memory to minimize server requests (1 to 2 API calls per session)
 * - Safely flushes batched events on page leave (visibilitychange & beforeunload)
 */
export default function WebAnalyticsTracker() {
  const sessionStartTime = useRef(0);
  const pendingQueue = useRef([]);
  const activeSections = useRef(new Map()); // sectionId -> enterTimestamp

  useEffect(() => {
    if (typeof window === "undefined") return;

    sessionStartTime.current = Date.now();

    // 1. Persistent deviceId & tab-scoped sessionId
    let deviceId = localStorage.getItem("vividwake_device_id");
    if (!deviceId) {
      deviceId = "vw_dev_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
      localStorage.setItem("vividwake_device_id", deviceId);
    }

    let sessionId = sessionStorage.getItem("vividwake_session_id");
    if (!sessionId) {
      sessionId = "vw_sess_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
      sessionStorage.setItem("vividwake_session_id", sessionId);
    }

    const currentDomain = window.location.hostname.replace(/^www\./, "") || "vividwake.gksky.in";
    const syncEndpoint = "/api/analytics/sync";

    // Batch flush helper
    const flushQueue = (forced = false) => {
      if (pendingQueue.current.length === 0) return;
      if (!forced && pendingQueue.current.length < 5) return;

      const eventsToSend = [...pendingQueue.current];
      pendingQueue.current = [];

      const payload = JSON.stringify({
        sessionId,
        deviceId,
        domain: currentDomain,
        userAgent: navigator.userAgent,
        referrer: document.referrer || "",
        events: eventsToSend,
      });

      if (navigator.sendBeacon) {
        try {
          const blob = new Blob([payload], { type: "application/json" });
          if (navigator.sendBeacon(syncEndpoint, blob)) return;
        } catch {
          // fallback to fetch
        }
      }

      fetch(syncEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // non-blocking
      });
    };

    // 2. Initial Page Landing Event (sent immediately once on render)
    const initialEvent = {
      type: "nav",
      action: "page_view",
      target: window.location.pathname || "/",
      title: document.title || "VividWake Live Wallpapers",
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
    };
    pendingQueue.current.push(initialEvent);
    flushQueue(true); // Send initial visit

    // 3. Section Dwell Time Tracking (IntersectionObserver)
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        entries.forEach((entry) => {
          const targetEl = entry.target;
          const sectionName =
            targetEl.getAttribute("data-section") ||
            targetEl.getAttribute("id") ||
            targetEl.tagName.toLowerCase() + (targetEl.className ? `.${targetEl.className.split(" ")[0]}` : "");

          if (entry.isIntersecting) {
            // User entered section
            if (!activeSections.current.has(sectionName)) {
              activeSections.current.set(sectionName, now);
            }
          } else {
            // User scrolled away from section -> record dwell time
            if (activeSections.current.has(sectionName)) {
              const enteredAt = activeSections.current.get(sectionName);
              const dwellSec = Math.max(1, Math.round((now - enteredAt) / 1000));
              activeSections.current.delete(sectionName);

              // Only record meaningful attention (>= 2 seconds)
              if (dwellSec >= 2) {
                pendingQueue.current.push({
                  type: "section_dwell",
                  action: "view_section",
                  target: sectionName,
                  dwellSec,
                  durationSec: `${dwellSec}s`,
                  durationMs: dwellSec * 1000,
                  timestamp: new Date().toISOString(),
                });
                flushQueue();
              }
            }
          }
        });
      },
      { threshold: 0.35 }
    );

    // Observe all key sections and cards
    const elementsToObserve = document.querySelectorAll(
      "section, header, footer, main, [data-section], #wallpapers, #download, #guide, #install, #faq, .grid, .card"
    );
    elementsToObserve.forEach((el) => sectionObserver.observe(el));

    // 4. Click Telemetry: Track buttons, APK downloads, tabs, accordion clicks
    const handleClick = (e) => {
      const btn = e.target.closest("a, button, [role='button'], input[type='submit']");
      if (!btn) return;

      const label =
        btn.getAttribute("aria-label") ||
        btn.getAttribute("title") ||
        btn.innerText?.trim()?.slice(0, 50) ||
        btn.getAttribute("href") ||
        "Action Click";

      const href = btn.getAttribute("href") || "";
      const isApkDownload = href.endsWith(".apk") || /download/i.test(label);

      pendingQueue.current.push({
        type: isApkDownload ? "download_click" : "click",
        action: isApkDownload ? "download_apk" : "button_click",
        target: label,
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        meta: { href, path: window.location.pathname },
      });

      // If downloading APK, flush immediately so conversion is never missed
      if (isApkDownload) {
        flushQueue(true);
      } else {
        flushQueue();
      }
    };

    window.addEventListener("click", handleClick, { passive: true });

    // 5. On Page Leave / Visibility Change -> Flush remaining batched events
    const handleLeave = () => {
      // Finalize all active section dwell times
      const now = Date.now();
      activeSections.current.forEach((enteredAt, sectionName) => {
        const dwellSec = Math.max(1, Math.round((now - enteredAt) / 1000));
        if (dwellSec >= 2) {
          pendingQueue.current.push({
            type: "section_dwell",
            action: "view_section",
            target: sectionName,
            dwellSec,
            durationSec: `${dwellSec}s`,
            durationMs: dwellSec * 1000,
            timestamp: new Date().toISOString(),
          });
        }
      });
      activeSections.current.clear();
      flushQueue(true);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        handleLeave();
      }
    });
    window.addEventListener("pagehide", handleLeave);
    window.addEventListener("beforeunload", handleLeave);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("pagehide", handleLeave);
      window.removeEventListener("beforeunload", handleLeave);
      sectionObserver.disconnect();
      handleLeave();
    };
  }, []);

  return null;
}
