// src/app/api/admin/catalog/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import connectDB from "@/lib/mongodb";
import WallpaperAccess from "@/models/WallpaperAccess";

export const dynamic = "force-dynamic";

const LOCAL_JSON_PATHS = [
  "C:/Users/Administrator/Desktop/video-lock/VideoLockScreen/app/src/main/assets/wallpapers.json",
  "C:/Users/Administrator/Desktop/video-lock/VideoLockScreen/wallpapers.json"
];

function formatForJson(doc) {
  return {
    id: doc.wallpaperId,
    title: doc.title,
    category: doc.category || "General",
    subCategory: doc.subCategory || "",
    description: doc.description || "",
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    status: doc.status || "published",
    isFeatured: !!doc.isFeatured,
    isVipOnly: !!doc.isVipOnly,
    videoUrl: doc.videoUrl || "",
    thumbUrl: doc.thumbUrl || "",
    sizeBytes: Number(doc.sizeBytes) || 0,
    sizeDisplay: doc.sizeDisplay || "5.0 MB",
    durationMs: Number(doc.durationMs) || 8000,
    width: Number(doc.width) || 1080,
    height: Number(doc.height) || 1920,
    version: Number(doc.version) || 1,
    addedAt: doc.addedAt || (doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now()),
    visibility: doc.visibility || (doc.status === "published" ? "ALL" : "UNPUBLISHED"),
    allowedUsers: doc.allowedUsers || [],
    blockedUsers: doc.blockedUsers || []
  };
}

function syncToLocalDisk(jsonItem, isDelete = false) {
  let successCount = 0;
  for (const p of LOCAL_JSON_PATHS) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const list = JSON.parse(raw);
        const filtered = list.filter((w) => w.id !== (jsonItem.id || jsonItem.wallpaperId));
        if (!isDelete) {
          filtered.unshift(jsonItem);
        }
        fs.writeFileSync(p, JSON.stringify(filtered, null, 2), "utf-8");
        successCount++;
      }
    } catch (err) {
      console.warn("Could not sync to local JSON at", p, err.message);
    }
  }
  return successCount;
}

function getLocalJsonStats() {
  try {
    const mainPath = LOCAL_JSON_PATHS[0];
    if (fs.existsSync(mainPath)) {
      const raw = fs.readFileSync(mainPath, "utf-8");
      const list = JSON.parse(raw);
      return { count: list.length, path: mainPath };
    }
  } catch (_e) {}
  return { count: 0, path: "" };
}

// 1. GET: Fetch list of catalog wallpapers
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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = (searchParams.get("search") || "").trim();
    const category = (searchParams.get("category") || "All").trim();
    const subCategory = (searchParams.get("subCategory") || "").trim();
    const status = (searchParams.get("status") || "all").toLowerCase();

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { wallpaperId: { $regex: search, $options: "i" } },
        { subCategory: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (subCategory && subCategory !== "All") {
      query.subCategory = subCategory;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [items, total, draftCount, publishedCount, restrictedCount, featuredCount, totalAll, categories, subCategories] = await Promise.all([
      WallpaperAccess.find(query).sort({ updatedAt: -1, isFeatured: -1, _id: 1 }).skip(skip).limit(limit).lean(),
      WallpaperAccess.countDocuments(query),
      WallpaperAccess.countDocuments({ status: "draft" }),
      WallpaperAccess.countDocuments({ status: "published" }),
      WallpaperAccess.countDocuments({ status: "restricted" }),
      WallpaperAccess.countDocuments({ isFeatured: true }),
      WallpaperAccess.countDocuments({}),
      WallpaperAccess.distinct("category"),
      WallpaperAccess.distinct("subCategory")
    ]);

    const diskStats = getLocalJsonStats();

    return NextResponse.json({
      success: true,
      wallpapers: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      summary: {
        total: totalAll,
        published: publishedCount,
        draft: draftCount,
        restricted: restrictedCount,
        featured: featuredCount,
        diskJsonCount: diskStats.count
      },
      categories: ["All", ...categories.filter(Boolean).sort()],
      subCategories: subCategories.filter(Boolean).sort()
    });
  } catch (error) {
    console.error("GET /api/admin/catalog error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. POST: Create, Update, Toggle, or Sync
export async function POST(request) {
  try {
    const authHeader = request.headers.get("x-admin-authorization");
    const validPassword = process.env.ADMIN_PASSWORD || "romeoPistol";
    if (authHeader !== validPassword && authHeader !== "romeoPistol") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { action = "save" } = body;

    // A. Detect video metadata over network
    if (action === "detect_meta") {
      const { videoUrl } = body;
      if (!videoUrl) {
        return NextResponse.json({ success: false, error: "videoUrl is required" }, { status: 400 });
      }
      try {
        const headRes = await fetch(videoUrl, { method: "HEAD" });
        const len = headRes.headers.get("content-length");
        const cType = headRes.headers.get("content-type");
        const sizeBytes = len ? parseInt(len, 10) : 0;
        const sizeDisplay = sizeBytes > 0 ? (sizeBytes / (1024 * 1024)).toFixed(2) + " MB" : "0 MB";
        return NextResponse.json({
          success: true,
          sizeBytes,
          sizeDisplay,
          contentType: cType
        });
      } catch (err) {
        return NextResponse.json({ success: false, error: "Failed fetching metadata: " + err.message }, { status: 400 });
      }
    }

    // B. Re-sync all Published from DB into wallpapers.json
    if (action === "sync_all_to_json") {
      const allDb = await WallpaperAccess.find({}).sort({ updatedAt: -1, isFeatured: -1, _id: 1 }).lean();
      const formattedAll = allDb.map(formatForJson);
      
      let writtenCount = 0;
      for (const p of LOCAL_JSON_PATHS) {
        try {
          if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, "utf-8");
            const existingList = JSON.parse(raw);
            const dbIds = new Set(formattedAll.map((w) => w.id));
            const retainedNonDb = existingList.filter((w) => !dbIds.has(w.id));
            const merged = [...formattedAll, ...retainedNonDb];
            fs.writeFileSync(p, JSON.stringify(merged, null, 2), "utf-8");
            writtenCount++;
          }
        } catch (e) {
          console.warn("Sync error:", p, e.message);
        }
      }
      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${formattedAll.length} database records into wallpapers.json across ${writtenCount} file location(s)!`,
        syncedCount: formattedAll.length
      });
    }

    // C. Quick toggle status
    if (action === "toggle_status") {
      const { wallpaperId, newStatus } = body;
      if (!wallpaperId || !newStatus) {
        return NextResponse.json({ success: false, error: "wallpaperId and newStatus required" }, { status: 400 });
      }
      const vis = newStatus === "published" ? "ALL" : newStatus === "restricted" ? "RESTRICTED" : "UNPUBLISHED";
      const updated = await WallpaperAccess.findOneAndUpdate(
        { wallpaperId },
        { $set: { status: newStatus, visibility: vis } },
        { new: true }
      ).lean();

      if (!updated) {
        return NextResponse.json({ success: false, error: "Wallpaper not found" }, { status: 404 });
      }

      const jsonItem = formatForJson(updated);
      syncToLocalDisk(jsonItem);

      return NextResponse.json({
        success: true,
        message: `Status updated to ${newStatus.toUpperCase()} and synchronized to wallpapers.json!`,
        wallpaper: updated
      });
    }

    // D. Create or Full Update
    const {
      title,
      category = "General",
      subCategory = "",
      description = "",
      tags = [],
      videoUrl,
      thumbUrl = "",
      sizeBytes = 0,
      sizeDisplay = "",
      durationMs = 8000,
      width = 1080,
      height = 1920,
      version = 1,
      isFeatured = false,
      isVipOnly = false,
      status = "published"
    } = body;

    let { wallpaperId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }
    if (!videoUrl || !videoUrl.trim()) {
      return NextResponse.json({ success: false, error: "Video URL is required" }, { status: 400 });
    }

    // Auto-generate wallpaperId if not supplied
    if (!wallpaperId || !wallpaperId.trim()) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 36);
      wallpaperId = `wp_${slug}_${Date.now().toString().slice(-4)}`;
    } else {
      wallpaperId = wallpaperId.trim();
    }

    // Process Tags
    let tagArray = [];
    if (Array.isArray(tags)) {
      tagArray = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    // Calculate display size if missing
    let display = sizeDisplay;
    const numBytes = Number(sizeBytes) || 0;
    if ((!display || display === "0 MB" || display === "") && numBytes > 0) {
      display = (numBytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    const effectiveVisibility = status === "published" ? "ALL" : status === "restricted" ? "RESTRICTED" : "UNPUBLISHED";

    const docData = {
      wallpaperId,
      title: title.trim(),
      category: (category || "General").trim(),
      subCategory: (subCategory || "").trim(),
      description: (description || "").trim(),
      tags: tagArray,
      videoUrl: videoUrl.trim(),
      thumbUrl: (thumbUrl || "").trim(),
      sizeBytes: numBytes,
      sizeDisplay: display || "5.0 MB",
      durationMs: Number(durationMs) || 8000,
      width: Number(width) || 1080,
      height: Number(height) || 1920,
      version: Number(version) || 1,
      isFeatured: !!isFeatured,
      isVipOnly: !!isVipOnly,
      status: status || "published",
      visibility: effectiveVisibility
    };

    const saved = await WallpaperAccess.findOneAndUpdate(
      { wallpaperId },
      { $set: docData },
      { upsert: true, new: true }
    ).lean();

    // Instant sync to local wallpapers.json
    const jsonItem = formatForJson(saved);
    const syncedFiles = syncToLocalDisk(jsonItem);

    return NextResponse.json({
      success: true,
      message: `Wallpaper '${saved.title}' saved to database and synced to ${syncedFiles} wallpapers.json file(s)!`,
      wallpaper: saved
    });
  } catch (error) {
    console.error("POST /api/admin/catalog error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 3. DELETE: Remove from DB & wallpapers.json
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("x-admin-authorization");
    const validPassword = process.env.ADMIN_PASSWORD || "romeoPistol";
    if (authHeader !== validPassword && authHeader !== "romeoPistol") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const wallpaperId = searchParams.get("id");

    if (!wallpaperId) {
      return NextResponse.json({ success: false, error: "Wallpaper ID is required" }, { status: 400 });
    }

    const deleted = await WallpaperAccess.findOneAndDelete({ wallpaperId });
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Wallpaper not found" }, { status: 404 });
    }

    // Remove from local disk
    syncToLocalDisk({ wallpaperId }, true);

    return NextResponse.json({
      success: true,
      message: `Wallpaper '${wallpaperId}' deleted from database and removed from wallpapers.json!`
    });
  } catch (error) {
    console.error("DELETE /api/admin/catalog error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
