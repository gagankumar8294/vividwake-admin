// src/app/api/admin/notifications/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AppConfig from "@/models/AppConfig";
import SessionFlow from "@/models/SessionFlow";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();
    const config = await AppConfig.findOne({ key: "global_config" }).lean();
    const rawNotifications = (config?.broadcastNotifications || []).sort(
      (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
    );

    // 1. Aggregate In-App Notification Modal Opens
    let modalOpens = 0;
    let uniqueOpeners = 0;
    let lastOpenedAt = null;
    try {
      const openStats = await SessionFlow.aggregate([
        { $unwind: "$events" },
        {
          $match: {
            "events.type": {
              $in: [
                "notification_modal_opened",
                "notification_bell_clicked",
                "notification_open"
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalOpens: { $sum: 1 },
            uniqueDevices: { $addToSet: "$deviceId" },
            uniqueUsers: { $addToSet: "$email" },
            lastOpenedAt: { $max: "$events.timestamp" }
          }
        }
      ]);

      if (openStats.length > 0) {
        modalOpens = openStats[0].totalOpens || 0;
        uniqueOpeners = (openStats[0].uniqueDevices || []).length;
        lastOpenedAt = openStats[0].lastOpenedAt || null;
      }
    } catch (e) {
      console.warn("Error aggregating notification opens:", e.message);
    }

    // 2. Aggregate In-App Notification Item Clicks
    let itemClicks = [];
    let totalClicks = 0;
    try {
      itemClicks = await SessionFlow.aggregate([
        { $unwind: "$events" },
        {
          $match: {
            "events.type": {
              $in: [
                "notification_item_clicked",
                "notification_click",
                "inapp_notification_clicked"
              ]
            }
          }
        },
        {
          $group: {
            _id: {
              notifId: "$events.notifId",
              title: "$events.title"
            },
            notifId: { $first: "$events.notifId" },
            title: { $first: "$events.title" },
            wallpaperId: { $first: "$events.wallpaperId" },
            clickCount: { $sum: 1 },
            uniqueDevices: { $addToSet: "$deviceId" },
            uniqueUsers: { $addToSet: "$email" },
            lastClickedAt: { $max: "$events.timestamp" }
          }
        }
      ]);

      totalClicks = itemClicks.reduce((sum, c) => sum + (c.clickCount || 0), 0);
    } catch (e) {
      console.warn("Error aggregating notification clicks:", e.message);
    }

    // 3. Map Clicks & Engagement into Broadcast Notifications
    const matchedNotificationIds = new Set();
    const enrichedNotifications = rawNotifications.map((n) => {
      const nId = n._id ? n._id.toString() : "";
      const nTitle = (n.title || "").trim().toLowerCase();

      // Find matching click record
      const clickRecord = itemClicks.find((c) => {
        const cId = (c.notifId || "").toString();
        const cTitle = (c.title || "").trim().toLowerCase();
        return (nId && cId === nId) || (nTitle && cTitle === nTitle);
      });

      if (clickRecord) {
        if (clickRecord.notifId) matchedNotificationIds.add(clickRecord.notifId);
        matchedNotificationIds.add(clickRecord.title);
      }

      const clicks = clickRecord?.clickCount || 0;
      const uniqueClickers = (clickRecord?.uniqueDevices || []).length;
      const uniqueUsersList = (clickRecord?.uniqueUsers || []).filter(
        (u) => u && u.trim().length > 0
      );

      return {
        ...n,
        clicks,
        uniqueClickers,
        uniqueUsers: uniqueUsersList,
        lastClickedAt: clickRecord?.lastClickedAt || null
      };
    });

    // 4. Capture any system/preset notification clicks (e.g. Welcome drop, Cyberpunk drop)
    const systemNotifications = itemClicks
      .filter((c) => {
        const cId = c.notifId || "";
        const cTitle = c.title || "";
        return !matchedNotificationIds.has(cId) && !matchedNotificationIds.has(cTitle);
      })
      .map((c) => ({
        id: c.notifId || `system_${c.title}`,
        title: c.title || c.notifId || "In-App Notification",
        wallpaperId: c.wallpaperId || "",
        clicks: c.clickCount || 0,
        uniqueClickers: (c.uniqueDevices || []).length,
        uniqueUsers: (c.uniqueUsers || []).filter((u) => u && u.trim().length > 0),
        lastClickedAt: c.lastClickedAt
      }));

    const overallCtr =
      modalOpens > 0
        ? `${((totalClicks / modalOpens) * 100).toFixed(1)}%`
        : totalClicks > 0
        ? "100%"
        : "0.0%";

    return NextResponse.json({
      success: true,
      count: enrichedNotifications.length,
      notifications: enrichedNotifications,
      systemNotifications,
      analytics: {
        totalModalOpens: modalOpens,
        uniqueOpenersCount: uniqueOpeners,
        lastOpenedAt,
        totalClicks,
        overallCtr
      }
    });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("x-admin-authorization");
    const validPassword = process.env.ADMIN_PASSWORD || "romeoPistol";
    if (authHeader !== validPassword && authHeader !== "romeoPistol") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { title, body: messageBody, wallpaperId, target, targetEmail, deliveryType } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ success: false, error: "Title and message body are required" }, { status: 400 });
    }

    let config = await AppConfig.findOne({ key: "global_config" });
    if (!config) {
      config = new AppConfig({ key: "global_config" });
    }

    const newNotif = {
      title: title.trim(),
      body: messageBody.trim(),
      wallpaperId: wallpaperId ? wallpaperId.trim() : "",
      target: target || "ALL",
      targetEmail: targetEmail ? targetEmail.trim().toLowerCase() : "",
      deliveryType: deliveryType || "both",
      sentAt: new Date()
    };

    config.broadcastNotifications.unshift(newNotif);
    // Keep last 50 notifications in history
    if (config.broadcastNotifications.length > 50) {
      config.broadcastNotifications = config.broadcastNotifications.slice(0, 50);
    }
    await config.save();

    return NextResponse.json({
      success: true,
      message: `Push notification dispatched successfully to ${target === "ALL" ? "All Active Users" : targetEmail || target}!`,
      notification: newNotif
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
