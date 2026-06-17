import mongoose from 'mongoose';

/**
 * Opens the MongoDB connection used by the email verification auth flow.
 * Keep the URI in .env so local, staging, and production can use different DBs.
 */
export const connectMongoDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required for email verification auth.');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || undefined,
  });
  console.log('MongoDB connection established.');
};
