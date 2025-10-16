import mongoose from "mongoose";
import { env } from "@/env";

const MONGO_URI = env.MONGO_URI || "";

export const DATABASE_NAME = "bills";

if (!MONGO_URI) {
  // In dev we don't throw to avoid crashing builds without env; callers can decide
  console.warn(
    "MONGO_URI is not set. Mongoose connections will fail at runtime.",
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};
const globalAny = global as unknown as { mongoose?: MongooseCache } & Record<
  string,
  unknown
>;
const cached: MongooseCache = globalAny.mongoose ?? {
  conn: null,
  promise: null,
};
if (!globalAny.mongoose) {
  globalAny.mongoose = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: DATABASE_NAME,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      maxPoolSize: 5,
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
