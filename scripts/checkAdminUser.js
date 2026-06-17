import mongoose from 'mongoose';
import '../config/env.js';
import { connectMongoDB } from '../config/mongodb.js';
import { User } from '../models/index.js';

const checkAdminUser = async () => {
  try {
    await connectMongoDB();
    const users = await User.find().select('fullName email role isVerified createdAt').sort({ createdAt: 1 });
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Failed to inspect users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

checkAdminUser();
