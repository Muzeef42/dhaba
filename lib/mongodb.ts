import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dhaba";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.mongoose ?? {
  conn: null,
  promise: null,
};
globalForMongoose.mongoose = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m)
      .catch((err) => {
        console.warn(
          "MongoDB not connected (chat will still work locally):",
          err instanceof Error ? err.message : err
        );
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}