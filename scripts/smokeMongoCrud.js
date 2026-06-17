import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import '../config/env.js';
import { connectMongoDB } from '../config/mongodb.js';
import { User, ExchangeRequest, MeetingProposal, Notification } from '../models/index.js';
import * as exchangeRequestService from '../services/exchangeRequestService.js';
import * as meetingService from '../services/meetingService.js';

const cleanup = async (emails) => {
  const users = await User.find({ email: { $in: emails } });
  const ids = users.map((user) => user._id);

  await Promise.all([
    MeetingProposal.deleteMany({ $or: [{ proposerId: { $in: ids } }, { receiverId: { $in: ids } }] }),
    ExchangeRequest.deleteMany({ userId: { $in: ids } }),
    Notification.deleteMany({ userId: { $in: ids } }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);
};

const run = async () => {
  const emails = ['smoke.owner@sece.ac.in', 'smoke.proposer@sece.ac.in'];

  try {
    await connectMongoDB();
    await cleanup(emails);

    const passwordHash = await bcrypt.hash('SmokeTest123', 12);
    const [owner, proposer] = await User.create([
      { fullName: 'Smoke Owner', email: emails[0], passwordHash, isVerified: true },
      { fullName: 'Smoke Proposer', email: emails[1], passwordHash, isVerified: true },
    ]);

    const request = await exchangeRequestService.createRequest({
      userId: owner.id,
      amount: 250,
      haveType: 'CASH',
      needType: 'UPI',
      locationHint: 'Library',
    });

    const proposal = await meetingService.createProposal({
      requestId: request.id,
      proposerId: proposer.id,
      receiverId: owner.id,
      meetingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    await meetingService.acceptProposal(proposal.id);

    const unreadCount = await Notification.countDocuments({ userId: proposer._id, isRead: false });
    await Notification.updateMany({ userId: proposer._id }, { $set: { isRead: true } });
    const markedCount = await Notification.countDocuments({ userId: proposer._id, isRead: false });

    console.log(JSON.stringify({
      usersCreated: 2,
      requestCreated: Boolean(request.id),
      proposalCreated: Boolean(proposal.id),
      unreadNotificationsBeforeMark: unreadCount,
      unreadNotificationsAfterMark: markedCount,
    }, null, 2));
  } finally {
    await cleanup(emails);
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
