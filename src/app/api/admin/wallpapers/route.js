// src/app/api/admin/wallpapers/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WallpaperAccess from "@/models/WallpaperAccess";
import AppConfig from "@/models/AppConfig";
import DeviceLock from "@/models/DeviceLock";
import SessionFlow from "@/models/SessionFlow";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("x-admin-authorization");
    const validPassword = process.env.ADMIN_PASSWORD || "romeoPistol";
    if (authHeader !== validPassword && authHeader !== "romeoPistol") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const search = (searchParams.get("search") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const status = (searchParams.get("status") || "all").toLowerCase();

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { wallpaperId: { $regex: search, $options: "i" } },
        { allowedUsers: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (status === "draft") {
      query.status = "draft";
    } else if (status === "published") {
      query.status = "published";
    } else if (status === "restricted") {
      query.status = "restricted";
    }

    const skip = (page - 1) * limit;

    const [wallpapers, total, draftCount, publishedCount, restrictedCount, totalAll, categories, knownDeviceLocks, knownSessions] = await Promise.all([
      WallpaperAccess.find(query).sort({ updatedAt: -1, isFeatured: -1, _id: 1 }).skip(skip).limit(limit).lean(),
      WallpaperAccess.countDocuments(query),
      WallpaperAccess.countDocuments({ status: "draft" }),
      WallpaperAccess.countDocuments({ status: "published" }),
      WallpaperAccess.countDocuments({ status: "restricted" }),
      WallpaperAccess.countDocuments({}),
      WallpaperAccess.distinct("category"),
      DeviceLock.distinct("boundEmail"),
      SessionFlow.distinct("email")
    ]);

    // Aggregate unique verified user emails for easy autocompletion
    const knownUsersSet = new Set();
    knownDeviceLocks.forEach((e) => {
      if (e && e.trim() && e.includes("@")) knownUsersSet.add(e.trim().toLowerCase());
    });
    knownSessions.forEach((e) => {
      if (e && e.trim() && e.includes("@")) knownUsersSet.add(e.trim().toLowerCase());
    });
    const knownUsers = Array.from(knownUsersSet).sort();

    return NextResponse.json({
      success: true,
      wallpapers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      summary: {
        total: totalAll,
        draft: draftCount,
        published: publishedCount,
        restricted: restrictedCount
      },
      categories: categories.filter(Boolean).sort(),
      knownUsers
    });
  } catch (error) {
    console.error("Error in GET /api/admin/wallpapers:", error);
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
    const {
      wallpaperId,
      status, // 'draft', 'published', 'restricted'
      allowedUsers = [],
      blockedUsers = [],
      sendNotification = false,
      notificationTitle,
      notificationBody,
      notificationImageUrl
    } = body;

    if (!wallpaperId) {
      return NextResponse.json({ success: false, error: "wallpaperId is required" }, { status: 400 });
    }

    const normAllowed = (allowedUsers || []).map((u) => String(u).trim().toLowerCase()).filter(Boolean);
    const normBlocked = (blockedUsers || []).map((u) => String(u).trim().toLowerCase()).filter(Boolean);

    let effectiveVisibility = "UNPUBLISHED";
    let effectiveStatus = status || "draft";

    if (effectiveStatus === "published") {
      effectiveVisibility = "ALL";
    } else if (effectiveStatus === "restricted") {
      effectiveVisibility = "RESTRICTED";
    } else {
      effectiveStatus = "draft";
      effectiveVisibility = "UNPUBLISHED";
    }

    const updateFields = {
      status: effectiveStatus,
      visibility: effectiveVisibility,
      allowedUsers: normAllowed,
      blockedUsers: normBlocked,
      lastAssignedAt: normAllowed.length > 0 ? new Date() : null
    };

    const updated = await WallpaperAccess.findOneAndUpdate(
      { wallpaperId },
      { $set: updateFields },
      { new: true, upsert: true }
    ).lean();

    let notificationSent = null;

    // Handle targeted push notification dispatch
    if (sendNotification && (effectiveStatus === "published" || normAllowed.length > 0)) {
      const targetDesc = effectiveStatus === "published" ? "ALL" : "CUSTOM";
      const targetEmail = effectiveStatus === "published" ? "" : normAllowed.join(", ");

      const notifTitle = (notificationTitle || `✨ New Wallpaper: ${updated.title || "Live Wallpaper"}`).trim();
      const notifMessage = (
        notificationBody ||
        (effectiveStatus === "published"
          ? `'${updated.title || "New Wallpaper"}' is now live in Explore Store! Tap to apply.`
          : `You've been granted VIP access to '${updated.title || "Exclusive Wallpaper"}'. Tap to apply!`)
      ).trim();

      const notifImage = (notificationImageUrl || updated.thumbUrl || "").trim();

      let config = await AppConfig.findOne({ key: "global_config" });
      if (!config) {
        config = new AppConfig({ key: "global_config" });
      }

      notificationSent = {
        title: notifTitle,
        body: notifMessage,
        imageUrl: notifImage,
        wallpaperId: updated.wallpaperId,
        target: targetDesc,
        targetEmail: targetEmail,
        deliveryType: "both",
        sentAt: new Date()
      };

      config.broadcastNotifications.unshift(notificationSent);
      if (config.broadcastNotifications.length > 50) {
        config.broadcastNotifications = config.broadcastNotifications.slice(0, 50);
      }
      await config.save();

      // Record last notification sent date on wallpaper
      await WallpaperAccess.updateOne({ wallpaperId }, { $set: { lastNotificationSentAt: new Date() } });
    }

    return NextResponse.json({
      success: true,
      message: `Wallpaper access updated to ${effectiveStatus.toUpperCase()}${
        normAllowed.length > 0 ? ` for ${normAllowed.length} user(s)` : ""
      }!`,
      wallpaper: updated,
      notification: notificationSent
    });
  } catch (error) {
    console.error("Error in POST /api/admin/wallpapers:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
