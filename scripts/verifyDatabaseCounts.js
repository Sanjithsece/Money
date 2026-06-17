import mongoose from 'mongoose';
import '../config/env.js';
import { connectMongoDB } from '../config/mongodb.js';
import { User, ExchangeRequest, MeetingProposal, Notification, CampusLocation } from '../models/index.js';

const verifyDatabaseCounts = async () => {
  try {
    await connectMongoDB();

    const rows = [
      { collection: 'users', count: await User.countDocuments() },
      { collection: 'exchange_requests', count: await ExchangeRequest.countDocuments() },
      { collection: 'meeting_proposals', count: await MeetingProposal.countDocuments() },
      { collection: 'notifications', count: await Notification.countDocuments() },
      { collection: 'campus_locations', count: await CampusLocation.countDocuments() },
    ];

    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Failed to verify database counts:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

verifyDatabaseCounts();
