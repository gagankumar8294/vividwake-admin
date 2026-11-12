import fs from "fs";
import path from "path";

export async function GET() {
  const possiblePaths = [
    path.join(process.cwd(), "public", "vividwake.apk"),
    "C:\\Users\\Administrator\\Desktop\\video-lock\\VideoLockScreen\\app\\build\\outputs\\apk\\debug\\app-debug.apk"
  ];

  let apkPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      apkPath = p;
      break;
    }
  }

  if (!apkPath) {
    return new Response("APK not found", { status: 404 });
  }

  const stat = fs.statSync(apkPath);
  const fileStream = fs.createReadStream(apkPath);

  // Convert Node ReadStream to Web ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="VividWake-v1.0.apk"',
      "Content-Length": stat.size.toString(),
      "Cache-Control": "no-cache"
    }
  });
}
