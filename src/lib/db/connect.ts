import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function dbConnect(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error(
      "[db] connection failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function pingMongo(): Promise<boolean> {
  try {
    const conn = await dbConnect();
    if (!conn) return false;
    const state = conn.connection.readyState;
    return state === 1;
  } catch {
    return false;
  }
}
