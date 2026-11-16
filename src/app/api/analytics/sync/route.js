// src/app/api/analytics/sync/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SessionFlow from "@/models/SessionFlow";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-authorization, x-app-auth",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function parseDevice(ua = "") {
  let deviceType = "desktop";
  let os = "Unknown";
  let browser = "Unknown";

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|android|phone|ipod/i.test(ua)) {
    deviceType = "mobile";
  }

  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";

  return { deviceType, os, browser };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, deviceId, userAgent, events, referrer, domain, userId, email, userName } = body;

    if (!sessionId || !deviceId) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId or deviceId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Determine target domain
    let targetDomain = domain;
    if (!targetDomain) {
      const origin = req.headers.get("origin") || req.headers.get("referer");
      if (origin) {
        try {
          targetDomain = new URL(origin).hostname.replace(/^www\./, "");
        } catch {
          // fallback
        }
      }
    }
    if (!targetDomain) targetDomain = "vividwake.gksky.in";

    // Extract client IP safely
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfIp = req.headers.get("cf-connecting-ip");
    const rawIp = cfIp || (forwarded ? forwarded.split(",")[0].trim() : realIp || "");
    const clientIp = rawIp.replace(/^::ffff:/, "").trim();

    const ua = userAgent || req.headers.get("user-agent") || "";
    const { deviceType, os, browser } = parseDevice(ua);

    await connectDB();

    // Map events
    const cleanEvents = (events || []).map((ev) => ({
      type: ev.type || ev.action || "nav",
      action: ev.action || ev.type || "view",
      target: ev.target || ev.label || ev.title || "",
      status: ev.status || "SUCCESS",
      durationMs: Number(ev.durationMs) || (ev.dwellSec ? ev.dwellSec * 1000 : 0),
      durationSec: ev.durationSec || (ev.dwellSec ? `${ev.dwellSec}s` : ""),
      dwellMs: Number(ev.dwellMs) || (ev.dwellSec ? ev.dwellSec * 1000 : 0),
      timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
      meta: ev.meta || {},
    }));

    // Upsert session
    const updatedSession = await SessionFlow.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          deviceId,
          domain: targetDomain,
          userAgent: ua,
          deviceBrand: os,
          deviceModel: browser,
          deviceType,
          osVersion: os,
          browser,
          ...(email ? { email } : {}),
          ...(userName ? { userName } : {}),
          ...(userId ? { userId } : {}),
          ...(referrer ? { referrer } : {}),
          ...(clientIp ? { ip: clientIp } : {}),
        },
        $push: {
          events: { $each: cleanEvents },
        },
      },
      { new: true, upsert: true }
    );

    // Compute total duration from all events
    if (updatedSession && updatedSession.events && updatedSession.events.length > 0) {
      const firstEvent = updatedSession.events[0];
      const lastEvent = updatedSession.events[updatedSession.events.length - 1];
      const start = new Date(firstEvent.timestamp).getTime();
      const end = new Date(lastEvent.timestamp).getTime();
      const totalDuration = Math.max(0, Math.round((end - start) / 1000));
      updatedSession.totalDuration = totalDuration;
      await updatedSession.save();
    }

    return NextResponse.json(
      { success: true, message: "Sync complete", domain: targetDomain },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("VividWake web analytics sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error during sync" },
      { status: 500, headers: corsHeaders }
    );
  }
}
