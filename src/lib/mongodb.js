// src/lib/mongodb.js
import mongoose from "mongoose";

const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  "mongodb+srv://gagankumar8294_db_user:oQvMSXfMZjYotGT7@cluster0.kfodfcn.mongodb.net/vividwake?retryWrites=true&w=majority";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const url =
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    MONGO_URL;

  if (!url) {
    throw new Error("Please define MONGO_URL or MONGODB_URI in environment variables");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(url, {
        serverSelectionTimeoutMS: 15000
      })
      .then((instance) => instance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
