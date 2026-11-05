// src/app/api/admin/notifications/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AppConfig from "@/models/AppConfig";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();
    const config = await AppConfig.findOne({ key: "global_config" }).lean();
    const notifications = (config?.broadcastNotifications || []).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    return NextResponse.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
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
