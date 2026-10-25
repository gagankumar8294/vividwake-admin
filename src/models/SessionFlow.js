// src/models/SessionFlow.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    target: { type: String, default: "" },
    dwellMs: { type: Number, default: 0 },
    elapsedSessionMs: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const sessionFlowSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    deviceId: { type: String, required: true, index: true },
    userId: { type: String, default: null, index: true },
    email: { type: String, default: "" },
    deviceBrand: { type: String, default: "" },
    deviceModel: { type: String, default: "" },
    osVersion: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    totalDuration: { type: Number, default: 0 },
    events: [eventSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.models.SessionFlow || mongoose.model("SessionFlow", sessionFlowSchema);
