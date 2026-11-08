import mongoose from "mongoose";

declare global {
  var __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cache = (globalThis.__mongoose ??= { conn: null, promise: null });

/** Cached Mongoose connection (survives dev hot reloads and warm serverless invocations). */
export async function connectDb(uri = process.env.MONGODB_URI): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 10,
  });
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}

export async function disconnectDb(): Promise<void> {
  if (cache.conn) await cache.conn.disconnect();
  cache.conn = null;
  cache.promise = null;
}
