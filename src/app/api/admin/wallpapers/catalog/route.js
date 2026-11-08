// src/app/api/admin/wallpapers/catalog/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WallpaperAccess from "@/models/WallpaperAccess";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userEmail = (searchParams.get("email") || "").toLowerCase().trim();
    const userId = (searchParams.get("userId") || "").trim();
    const isAdmin = searchParams.get("isAdmin") === "true";

    let query = {};

    if (isAdmin) {
      // Admin sees everything
      query = {};
    } else {
      // Non-admin sees ONLY:
      // 1. Published wallpapers (unless user is blocked)
      // 2. Restricted wallpapers where user's email or userId is in allowedUsers
      const userFilters = [];

      // Allowed because published and not blocked
      const publishedClause = {
        status: "published"
      };
      if (userEmail) {
        publishedClause.blockedUsers = { $ne: userEmail };
      }
      userFilters.push(publishedClause);

      // Allowed because explicitly assigned to this user
      if (userEmail) {
        userFilters.push({
          status: "restricted",
          allowedUsers: userEmail,
          blockedUsers: { $ne: userEmail }
        });
      }
      if (userId) {
        userFilters.push({
          status: "restricted",
          allowedUsers: userId,
          blockedUsers: { $ne: userId }
        });
      }

      query = { $or: userFilters };
    }

    const wallpapers = await WallpaperAccess.find(query)
      .sort({ updatedAt: -1, isFeatured: -1, _id: 1 })
      .lean();

    // Map to client schema
    const formatted = wallpapers.map((w) => ({
      id: w.wallpaperId,
      title: w.title,
      category: w.category || "General",
      description: w.description || "",
      thumbUrl: w.thumbUrl || "",
      videoUrl: w.videoUrl || "",
      sizeBytes: w.sizeBytes || 0,
      sizeDisplay: w.sizeDisplay || "5.0 MB",
      durationMs: w.durationMs || 5000,
      isFeatured: !!w.isFeatured,
      status: w.status,
      visibility: w.visibility,
      allowedUsers: w.allowedUsers || [],
      blockedUsers: w.blockedUsers || []
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      wallpapers: formatted
    });
  } catch (error) {
    console.error("Error in GET /api/admin/wallpapers/catalog:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
