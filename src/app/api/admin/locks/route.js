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
 * POST: Admin Actions on Device Locks (Unlock, Kill Switch Ban/Unban, Tier Override, Transfer Approval)
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
    const { action, id, email, hardwareFingerprint, reason, tier, customDownloadLimit, daysValid } = body;

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

    // 1. Kill Switch: Ban Device
    if (action === "ban") {
      lock.isBanned = true;
      lock.banReason = reason || "Administrative restriction";
      lock.bannedAt = new Date();
      await lock.save();
      return NextResponse.json({ success: true, message: `Kill switch activated: ${lock.boundEmail} / ${lock.hardwareFingerprint} banned.`, lock });
    }

    // 2. Kill Switch: Unban Device
    if (action === "unban") {
      lock.isBanned = false;
      lock.banReason = "";
      lock.bannedAt = null;
      await lock.save();
      return NextResponse.json({ success: true, message: `Device restored: ${lock.boundEmail} unbanned.`, lock });
    }

    // 3. User Tier Override (Standard, VIP Unlimited, Custom Quota)
    if (action === "set-tier") {
      lock.tier = tier || "STANDARD";
      if (customDownloadLimit !== undefined) {
        lock.customDownloadLimit = customDownloadLimit;
      }
      if (daysValid && daysValid > 0) {
        lock.tierExpiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);
      } else {
        lock.tierExpiresAt = null; // Lifetime
      }
      await lock.save();
      return NextResponse.json({ success: true, message: `Tier updated to ${lock.tier} for ${lock.boundEmail}.`, lock });
    }

    // 4. Rebind Transfer: Approve
    if (action === "approve-transfer") {
      if (!lock.transferRequest || lock.transferRequest.status !== "PENDING") {
        return NextResponse.json({ success: false, error: "No pending transfer request found" }, { status: 400 });
      }
      lock.hardwareFingerprint = lock.transferRequest.newHardwareFingerprint;
      lock.deviceBrand = lock.transferRequest.newDeviceBrand;
      lock.deviceModel = lock.transferRequest.newDeviceModel;
      lock.transferRequest.status = "APPROVED";
      lock.transferRequest.reviewedAt = new Date();
      lock.lastVerifiedAt = new Date();
      lock.notes = `Transfer approved by admin to ${lock.deviceModel} at ${new Date().toISOString()}`;
      await lock.save();
      return NextResponse.json({ success: true, message: `Device transfer approved! Account is now bound to ${lock.deviceModel}.`, lock });
    }

    // 5. Rebind Transfer: Reject
    if (action === "reject-transfer") {
      if (!lock.transferRequest) {
        return NextResponse.json({ success: false, error: "No transfer request found" }, { status: 400 });
      }
      lock.transferRequest.status = "REJECTED";
      lock.transferRequest.reviewedAt = new Date();
      await lock.save();
      return NextResponse.json({ success: true, message: `Device transfer rejected for ${lock.boundEmail}.`, lock });
    }

    // 6. Default: Release 1-to-1 Device Bond
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
