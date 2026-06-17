import mongoose from 'mongoose';
import { ExchangeRequest, User } from '../models/index.js';

const populateRequest = (query) => {
  return query
    .populate('user')
    .populate({
      path: 'meetingProposals',
      populate: [{ path: 'proposer' }, { path: 'receiver' }, { path: 'location' }],
    });
};

export const createRequest = async ({ userId, amount, haveType, needType, locationHint }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user id.');

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  if (!['CASH', 'UPI'].includes(haveType) || !['CASH', 'UPI'].includes(needType)) {
    throw new Error('haveType and needType must be CASH or UPI.');
  }

  if (haveType === needType) {
    throw new Error('haveType and needType must be different.');
  }

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found.');

  const request = await ExchangeRequest.create({
    userId,
    amount: numericAmount,
    haveType,
    needType,
    locationHint,
    status: 'OPEN',
  });

  return populateRequest(ExchangeRequest.findById(request._id));
};

export const getAllOpenRequests = async () => {
  return populateRequest(ExchangeRequest.find({ status: 'OPEN' }).sort({ createdAt: -1 }));
};

export const getRequestsForUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user id.');

  return populateRequest(ExchangeRequest.find({ userId }).sort({ createdAt: -1 }));
};
