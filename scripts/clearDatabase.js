import mongoose from 'mongoose';
import '../config/env.js';
import { connectMongoDB } from '../config/mongodb.js';
import { User, ExchangeRequest, MeetingProposal, Notification, CampusLocation } from '../models/index.js';

const clearDatabase = async () => {
  try {
    await connectMongoDB();
    await Promise.all([
      MeetingProposal.deleteMany({}),
      Notification.deleteMany({}),
      ExchangeRequest.deleteMany({}),
      CampusLocation.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('Wiped MongoDB collections: users, exchange requests, meeting proposals, notifications, campus locations');
  } catch (error) {
    console.error('Failed to clear database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

clearDatabase();
