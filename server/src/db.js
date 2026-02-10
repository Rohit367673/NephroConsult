import mongoose from 'mongoose';

const env = (await import('./config.js')).env;

export let dbReady = false;

export async function connectDB() {
  if (!env.MONGO_URI) {
    console.error('[DB] MONGO_URI not set. Please configure server/.env with your MongoDB connection string.');
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    dbReady = false;
    return false;
  }
  try {
    await mongoose.connect(env.MONGO_URI, { autoIndex: true });
    console.log('[DB] Connected to MongoDB');
    dbReady = true;
    return true;
  } catch (err) {
    console.error('[DB] Mongo connection error:', err.message);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    dbReady = false;
    return false;
  }
}
