// src/models/DeviceLock.js
import mongoose from "mongoose";

const deviceLockSchema = new mongoose.Schema(
  {
    hardwareFingerprint: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    boundEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true
    },
    boundUserId: {
      type: String,
      default: null,
      trim: true
    },
    deviceBrand: {
      type: String,
      default: "Unknown"
    },
    deviceModel: {
      type: String,
      default: "Unknown"
    },
    deviceManufacturer: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["ACTIVE", "UNLOCKED", "BYPASS"],
      default: "ACTIVE"
    },
    firstBoundAt: {
      type: Date,
      default: Date.now
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

deviceLockSchema.index({ hardwareFingerprint: 1, boundEmail: 1 });

const DeviceLock = mongoose.models.DeviceLock || mongoose.model("DeviceLock", deviceLockSchema);

export default DeviceLock;
