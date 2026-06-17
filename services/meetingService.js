import mongoose from 'mongoose';
import { MeetingProposal, ExchangeRequest, User, CampusLocation } from '../models/index.js';
import { createNotification } from './notificationService.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateProposal = (query) => {
  return query.populate('proposer').populate('receiver').populate('exchangeRequest').populate('location');
};

const resolveLocation = async (locationId) => {
  if (isValidId(locationId)) {
    const location = await CampusLocation.findById(locationId);
    if (location) return location;
  }

  return CampusLocation.findOneAndUpdate(
    { name: 'Main Campus Gate' },
    { $setOnInsert: { name: 'Main Campus Gate', isActive: true } },
    { new: true, upsert: true }
  );
};

export const createProposal = async ({ requestId, proposerId, receiverId, locationId, meetingTime }) => {
  if (![requestId, proposerId, receiverId].every(isValidId)) {
    throw new Error('Invalid request, proposer, or receiver id.');
  }

  const meetingDate = new Date(meetingTime);
  if (Number.isNaN(meetingDate.getTime()) || meetingDate <= new Date()) {
    throw new Error('Meeting time must be a valid future date.');
  }

  if (String(proposerId) === String(receiverId)) {
    throw new Error('You cannot propose a meeting to yourself.');
  }

  const request = await ExchangeRequest.findById(requestId);
  if (!request) throw new Error('Exchange Request not found.');
  if (request.status !== 'OPEN') throw new Error('Only open requests can receive proposals.');

  const proposer = await User.findById(proposerId);
  if (!proposer) throw new Error('Proposer not found.');

  const receiver = await User.findById(receiverId);
  if (!receiver) throw new Error('Receiver not found.');

  const location = await resolveLocation(locationId);

  const existingProposal = await MeetingProposal.findOne({
    requestId,
    proposerId,
    status: 'PROPOSED',
  });
  if (existingProposal) throw new Error('You already have a pending proposal for this request.');

  const proposal = await MeetingProposal.create({
    requestId,
    proposerId,
    receiverId,
    locationId: location._id,
    meetingTime: meetingDate,
    status: 'PROPOSED',
  });

  await createNotification(receiver, `${proposer.fullName} proposed a meeting for your request of ₹${request.amount}.`);

  return populateProposal(MeetingProposal.findById(proposal._id));
};

export const acceptProposal = async (proposalId) => {
  if (!isValidId(proposalId)) throw new Error('Invalid proposal id.');

  const proposal = await populateProposal(MeetingProposal.findById(proposalId));
  if (!proposal) throw new Error('Proposal not found.');
  if (proposal.status !== 'PROPOSED') throw new Error('Only proposed meetings can be accepted.');

  const request = await ExchangeRequest.findById(proposal.requestId);
  if (!request) throw new Error('Exchange request not found.');

  proposal.status = 'ACCEPTED';
  request.status = 'PENDING';

  await Promise.all([
    proposal.save(),
    request.save(),
    MeetingProposal.updateMany(
      { requestId: request._id, _id: { $ne: proposal._id }, status: 'PROPOSED' },
      { $set: { status: 'DECLINED' } }
    ),
  ]);

  await createNotification(
    proposal.proposer,
    `${proposal.receiver.fullName} accepted your proposal for the request of ₹${request.amount}.`
  );

  return populateProposal(MeetingProposal.findById(proposal._id));
};

export const rejectProposal = async (proposalId) => {
  if (!isValidId(proposalId)) throw new Error('Invalid proposal id.');

  const proposal = await MeetingProposal.findById(proposalId);
  if (!proposal) throw new Error('Proposal not found.');

  proposal.status = 'DECLINED';
  await proposal.save();
  return populateProposal(MeetingProposal.findById(proposal._id));
};
