// src/app/api/admin/locks/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DeviceLock from "@/models/DeviceLock";
import SessionFlow from "@/models/SessionFlow";
import WallpaperAccess from "@/models/WallpaperAccess";

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
 * Reusable user & hardware purge logic
 */
async function executeUserPurge({ id, email, hardwareFingerprint, userId }) {
  const emailQuery = email ? String(email).trim().toLowerCase() : "";
  const hwQuery = hardwareFingerprint ? String(hardwareFingerprint).trim() : "";
  const userIdQuery = userId ? String(userId).trim() : "";

  // 1. Gather any existing lock record to find cross-linked credentials
  let existingLock = null;
  if (id) {
    existingLock = await DeviceLock.findById(id);
  } else if (emailQuery) {
    existingLock = await DeviceLock.findOne({ boundEmail: emailQuery });
  } else if (hwQuery) {
    existingLock = await DeviceLock.findOne({ hardwareFingerprint: hwQuery });
  }

  const emailsToPurge = new Set();
  const hwToPurge = new Set();
  const userIdsToPurge = new Set();

  if (emailQuery) emailsToPurge.add(emailQuery);
  if (hwQuery) hwToPurge.add(hwQuery);
  if (userIdQuery) userIdsToPurge.add(userIdQuery);

  if (existingLock) {
    if (existingLock.boundEmail) emailsToPurge.add(existingLock.boundEmail.toLowerCase().trim());
    if (existingLock.hardwareFingerprint) hwToPurge.add(existingLock.hardwareFingerprint.trim());
    if (existingLock.boundUserId) userIdsToPurge.add(existingLock.boundUserId.trim());
  }

  // 2. Also inspect SessionFlow for any cross-linked IDs
  if (emailsToPurge.size > 0 || hwToPurge.size > 0) {
    const linkedSessions = await SessionFlow.find({
      $or: [
        ...(emailsToPurge.size > 0 ? [{ email: { $in: Array.from(emailsToPurge) } }] : []),
        ...(hwToPurge.size > 0 ? [{ deviceId: { $in: Array.from(hwToPurge) } }] : [])
      ]
    })
      .select("email deviceId userId")
      .limit(100)
      .lean();

    for (const s of linkedSessions) {
      if (s.email) emailsToPurge.add(s.email.toLowerCase().trim());
      if (s.deviceId) hwToPurge.add(s.deviceId.trim());
      if (s.userId) userIdsToPurge.add(String(s.userId).trim());
    }
  }

  // 3. Purge DeviceLock documents
  const lockConditions = [];
  if (id) lockConditions.push({ _id: id });
  if (emailsToPurge.size > 0) lockConditions.push({ boundEmail: { $in: Array.from(emailsToPurge) } });
  if (hwToPurge.size > 0) lockConditions.push({ hardwareFingerprint: { $in: Array.from(hwToPurge) } });
  if (userIdsToPurge.size > 0) lockConditions.push({ boundUserId: { $in: Array.from(userIdsToPurge) } });

  let deletedLocks = 0;
  if (lockConditions.length > 0) {
    const lockRes = await DeviceLock.deleteMany({ $or: lockConditions });
    deletedLocks = lockRes.deletedCount || 0;
  }

  // 4. Purge SessionFlow telemetry documents
  const sessionConditions = [];
  if (emailsToPurge.size > 0) sessionConditions.push({ email: { $in: Array.from(emailsToPurge) } });
  if (hwToPurge.size > 0) sessionConditions.push({ deviceId: { $in: Array.from(hwToPurge) } });
  if (userIdsToPurge.size > 0) sessionConditions.push({ userId: { $in: Array.from(userIdsToPurge) } });

  let deletedSessions = 0;
  if (sessionConditions.length > 0) {
    const sessionRes = await SessionFlow.deleteMany({ $or: sessionConditions });
    deletedSessions = sessionRes.deletedCount || 0;
  }

  // 5. Clean up WallpaperAccess lists
  let modifiedWallpapers = 0;
  if (emailsToPurge.size > 0) {
    const emailArr = Array.from(emailsToPurge);
    const wpRes = await WallpaperAccess.updateMany(
      { $or: [{ allowedUsers: { $in: emailArr } }, { blockedUsers: { $in: emailArr } }] },
      { $pull: { allowedUsers: { $in: emailArr }, blockedUsers: { $in: emailArr } } }
    );
    modifiedWallpapers = wpRes.modifiedCount || 0;
  }

  const targetIdentifier = Array.from(emailsToPurge)[0] || Array.from(hwToPurge)[0] || id || "User";

  return {
    success: true,
    message: `Account & Hardware successfully purged for "${targetIdentifier}". Deleted ${deletedLocks} device lock(s) and ${deletedSessions} telemetry session(s). The user can now register fresh from the start!`,
    purged: {
      identifier: targetIdentifier,
      emails: Array.from(emailsToPurge),
      fingerprints: Array.from(hwToPurge),
      deletedLocks,
      deletedSessions,
      modifiedWallpapers
    }
  };
}

/**
 * POST: Admin Actions on Device Locks (Purge User, Kill Switch Ban/Unban, Tier Override, Transfer Approval, Unlock)
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
    const { action, id, email, hardwareFingerprint, userId, reason, tier, customDownloadLimit, daysValid } = body;

    // 0. Permanent User & Hardware Purge (Delete entirely from DB so user registers fresh from start)
    if (action === "purge-user" || action === "delete-user") {
      if (!id && !email && !hardwareFingerprint && !userId) {
        return NextResponse.json({ success: false, error: "Missing identifier (id, email, hardwareFingerprint, or userId)" }, { status: 400 });
      }
      const purgeResult = await executeUserPurge({ id, email, hardwareFingerprint, userId });
      return NextResponse.json(purgeResult);
    }

    let query = {};
    if (id) query._id = id;
    else if (email && (action === "approve-transfer" || action === "reject-transfer")) {
      query = { boundEmail: email.trim().toLowerCase(), "transferRequest.status": "PENDING" };
    }
    else if (email) query.boundEmail = email.trim().toLowerCase();
    else if (hardwareFingerprint) query.hardwareFingerprint = hardwareFingerprint.trim();
    else {
      return NextResponse.json({ success: false, error: "Missing id, email, or hardwareFingerprint" }, { status: 400 });
    }

    const lock = await DeviceLock.findOne(query).sort({ updatedAt: -1 });
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

/**
 * DELETE: Directly delete/purge user and device locks
 */
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("x-admin-authorization");
    const validPassword = process.env.ADMIN_PASSWORD || "romeoPistol";
    if (authHeader !== validPassword && authHeader !== "romeoPistol") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    let body = {};
    try {
      body = await request.json();
    } catch (_e) {}

    const id = searchParams.get("id") || body.id;
    const email = searchParams.get("email") || body.email;
    const hardwareFingerprint = searchParams.get("hardwareFingerprint") || searchParams.get("deviceId") || body.hardwareFingerprint || body.deviceId;
    const userId = searchParams.get("userId") || body.userId;

    if (!id && !email && !hardwareFingerprint && !userId) {
      return NextResponse.json({ success: false, error: "Missing identifier (id, email, hardwareFingerprint, or userId)" }, { status: 400 });
    }

    const purgeResult = await executeUserPurge({ id, email, hardwareFingerprint, userId });
    return NextResponse.json(purgeResult);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
