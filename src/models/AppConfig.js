// src/models/AppConfig.js
import mongoose from "mongoose";

const appConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global_config",
      unique: true
    },
    // Multi-tier Version Gate
    minSupportedVersionCode: {
      type: Number,
      default: 1
    },
    minSupportedVersionName: {
      type: String,
      default: "1.0.0"
    },
    latestVersionCode: {
      type: Number,
      default: 1
    },
    latestVersionName: {
      type: String,
      default: "1.0.0"
    },
    forceUpdateEnabled: {
      type: Boolean,
      default: false
    },
    updateTitle: {
      type: String,
      default: "Critical Security & Performance Update"
    },
    updateMessage: {
      type: String,
      default: "A newer version of VividWake is required to ensure secure lock screen rendering and prevent service disruption."
    },
    updateDownloadUrl: {
      type: String,
      default: "https://github.com/gagankumar8294/vividwake/releases"
    },
    // Push Notifications History
    broadcastNotifications: [
      {
        title: { type: String, required: true },
        body: { type: String, required: true },
        wallpaperId: { type: String, default: "" },
        target: { type: String, enum: ["ALL", "VIP", "CUSTOM"], default: "ALL" },
        targetEmail: { type: String, default: "" },
        deliveryType: { type: String, enum: ["both", "system", "in_app"], default: "both" },
        sentAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
    collection: "app_configs"
  }
);

export default mongoose.models.AppConfig || mongoose.model("AppConfig", appConfigSchema);
