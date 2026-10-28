// src/app/api/analytics/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SessionFlow from "@/models/SessionFlow";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("x-admin-authorization");
    const authQuery = searchParams.get("auth");

    // 🔒 Auth verification
    const validPassword = process.env.ADMIN_PASSWORD || "romeoPistol";
    if (authHeader !== validPassword && authQuery !== validPassword) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid Admin Password" },
        { status: 401 }
      );
    }

    await connectDB();

    const dateFilter = searchParams.get("date"); // YYYY-MM-DD
    const typeFilter = searchParams.get("type") || "all"; // all, auth, anon, errors
    const searchParam = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "recent";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const skip = (page - 1) * limit;

    let query = {};

    // 1. Filter by specific date
    if (dateFilter) {
      const startOfDay = new Date(`${dateFilter}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateFilter}T23:59:59.999Z`);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // 2. Filter by user type or error presence
    if (typeFilter === "auth") {
      query.userId = { $ne: null };
    } else if (typeFilter === "anon") {
      query.userId = null;
    } else if (typeFilter === "errors") {
      query["events.status"] = "FAILED";
    }

    // 3. Search by User, Device, Session, or Action
    if (searchParam.trim()) {
      const q = searchParam.trim();
      query.$or = [
        { email: { $regex: q, $options: "i" } },
        { userName: { $regex: q, $options: "i" } },
        { deviceBrand: { $regex: q, $options: "i" } },
        { deviceModel: { $regex: q, $options: "i" } },
        { deviceId: { $regex: q, $options: "i" } },
        { sessionId: { $regex: q, $options: "i" } },
        { "events.target": { $regex: q, $options: "i" } },
        { "events.action": { $regex: q, $options: "i" } }
      ];
    }

    // 4. Sorting logic
    let sortObj = { updatedAt: -1 };
    if (sortBy === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (sortBy === "duration") {
      sortObj = { totalDuration: -1 };
    }

    // 5. Query sessions
    const sessions = await SessionFlow.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalRecords = await SessionFlow.countDocuments(query);

    // 6. Calculate Aggregate Overview KPIs
    const totalSessions = await SessionFlow.countDocuments();
    const uniqueDevices = await SessionFlow.distinct("deviceId");
    const authUsers = await SessionFlow.distinct("userId", { userId: { $ne: null } });

    const stats = await SessionFlow.aggregate([
      { $unwind: "$events" },
      {
        $group: {
          _id: "$events.type",
          count: { $sum: 1 }
        }
      }
    ]);

    const eventCounts = {};
    for (const item of stats) {
      eventCounts[item._id] = item.count;
    }

    return NextResponse.json({
      success: true,
      sessions,
      overview: {
        totalSessions,
        uniqueDevicesCount: uniqueDevices.length,
        authenticatedUsersCount: authUsers.length,
        metrics: {
          totalPreviews: eventCounts["preview_stream_start"] || 0,
          totalDownloadsStarted: eventCounts["download_start"] || 0,
          totalDownloadsCompleted: eventCounts["download_success"] || 0,
          totalAppliedToLockScreen: eventCounts["apply_wallpaper"] || 0,
          totalDeletedStorage: eventCounts["delete_local_storage"] || 0
        }
      },
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit) || 1
      }
    });
  } catch (error) {
    console.error("API analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
