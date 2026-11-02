// src/app/api/admin/locks/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DeviceLock from "@/models/DeviceLock";

export const dynamic = "force-dynamic";

/**
 * GET: Fetch all Device Locks
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("x-admin-authorization");
    const validPassword = process.env.ADMIN_PASSWORD || "romeoPistol";
    if (authHeader !== validPassword && authHeader !== "romeoPistol") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const locks = await DeviceLock.find().sort({ updatedAt: -1 }).limit(100).lean();
    return NextResponse.json({ success: true, count: locks.length, locks });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Unlock / Release a Device or Email Lock
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("x-admin-authorization");
    const validPassword = process.env.ADMIN_PASSWORD || "romeoPistol";
    if (authHeader !== validPassword && authHeader !== "romeoPistol") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { id, email, hardwareFingerprint } = body;

    let query = {};
    if (id) query._id = id;
    else if (email) query.boundEmail = email.trim().toLowerCase();
    else if (hardwareFingerprint) query.hardwareFingerprint = hardwareFingerprint.trim();
    else {
      return NextResponse.json({ success: false, error: "Missing id, email, or hardwareFingerprint" }, { status: 400 });
    }

    const lock = await DeviceLock.findOne(query);
    if (!lock) {
      return NextResponse.json({ success: false, error: "Lock record not found" }, { status: 404 });
    }

    lock.status = "UNLOCKED";
    lock.notes = `Unlocked by admin at ${new Date().toISOString()}`;
    await lock.save();

    return NextResponse.json({
      success: true,
      message: `Released 1-to-1 lock for ${lock.boundEmail}. The device and email are now free to re-bind.`,
      lock
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
