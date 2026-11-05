// src/app/api/admin/config/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AppConfig from "@/models/AppConfig";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();
    let config = await AppConfig.findOne({ key: "global_config" }).lean();
    if (!config) {
      config = await AppConfig.create({ key: "global_config" });
    }
    return NextResponse.json({ success: true, config });
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

    let config = await AppConfig.findOne({ key: "global_config" });
    if (!config) {
      config = new AppConfig({ key: "global_config" });
    }

    if (body.minSupportedVersionCode !== undefined) config.minSupportedVersionCode = Number(body.minSupportedVersionCode);
    if (body.minSupportedVersionName !== undefined) config.minSupportedVersionName = String(body.minSupportedVersionName);
    if (body.latestVersionCode !== undefined) config.latestVersionCode = Number(body.latestVersionCode);
    if (body.latestVersionName !== undefined) config.latestVersionName = String(body.latestVersionName);
    if (body.forceUpdateEnabled !== undefined) config.forceUpdateEnabled = Boolean(body.forceUpdateEnabled);
    if (body.updateTitle !== undefined) config.updateTitle = String(body.updateTitle);
    if (body.updateMessage !== undefined) config.updateMessage = String(body.updateMessage);
    if (body.updateDownloadUrl !== undefined) config.updateDownloadUrl = String(body.updateDownloadUrl);

    await config.save();
    return NextResponse.json({ success: true, message: "System version configuration updated.", config });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
