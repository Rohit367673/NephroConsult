import mongoose from 'mongoose';

const env = (await import('./config.js')).env;

export async function connectDB() {
  if (!env.MONGO_URI) {
    console.error('[DB] MONGO_URI not set. Please configure server/.env with your MongoDB connection string.');
    process.exit(1);
  }
  try {
    await mongoose.connect(env.MONGO_URI, { autoIndex: true });
    console.log('[DB] Connected to MongoDB');
  } catch (err) {
    console.error('[DB] Mongo connection error:', err.message);
    process.exit(1);
  }
}
