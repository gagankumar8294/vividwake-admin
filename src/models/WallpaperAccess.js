// src/models/WallpaperAccess.js
import mongoose from "mongoose";

const wallpaperAccessSchema = new mongoose.Schema(
  {
    wallpaperId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "General",
      index: true
    },
    description: {
      type: String,
      default: ""
    },
    thumbUrl: {
      type: String,
      default: ""
    },
    videoUrl: {
      type: String,
      default: ""
    },
    sizeBytes: {
      type: Number,
      default: 0
    },
    sizeDisplay: {
      type: String,
      default: ""
    },
    durationMs: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["draft", "published", "restricted"],
      default: "draft",
      index: true
    },
    visibility: {
      type: String,
      enum: ["UNPUBLISHED", "ALL", "RESTRICTED"],
      default: "UNPUBLISHED",
      index: true
    },
    allowedUsers: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    blockedUsers: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    lastAssignedAt: {
      type: Date,
      default: null
    },
    lastNotificationSentAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "wallpaper_access"
  }
);

export default mongoose.models.WallpaperAccess || mongoose.model("WallpaperAccess", wallpaperAccessSchema);
