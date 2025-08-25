import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI || "";

const DATABASE_NAME = 'bills'

if (!MONGODB_URI) {
  // In dev we don't throw to avoid crashing builds without env; callers can decide
  console.warn("MONGODB_URI is not set. Mongoose connections will fail at runtime.");
}

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalAny = global as unknown as { mongoose?: MongooseCache } & Record<string, unknown>;
const cached: MongooseCache = globalAny.mongoose || (globalAny.mongoose = { conn: null, promise: null });

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
      serverSelectionTimeoutMS: 5000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn!;
}
