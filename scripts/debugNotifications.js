import mongoose from 'mongoose';
import '../config/env.js';
import { connectMongoDB } from '../config/mongodb.js';
import { Notification } from '../models/index.js';

const debugNotifications = async () => {
  try {
    await connectMongoDB();
    const rows = await Notification.find().sort({ createdAt: -1 }).limit(20);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

debugNotifications();
