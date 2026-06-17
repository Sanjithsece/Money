import mongoose from 'mongoose';

const meetingProposalSchema = new mongoose.Schema(
  {
    meetingTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PROPOSED', 'ACCEPTED', 'DECLINED'],
      default: 'PROPOSED',
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExchangeRequest',
      required: true,
    },
    proposerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampusLocation',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

meetingProposalSchema.virtual('exchangeRequest', {
  ref: 'ExchangeRequest',
  localField: 'requestId',
  foreignField: '_id',
  justOne: true,
});

meetingProposalSchema.virtual('proposer', {
  ref: 'User',
  localField: 'proposerId',
  foreignField: '_id',
  justOne: true,
});

meetingProposalSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true,
});

meetingProposalSchema.virtual('location', {
  ref: 'CampusLocation',
  localField: 'locationId',
  foreignField: '_id',
  justOne: true,
});

const MeetingProposal = mongoose.model('MeetingProposal', meetingProposalSchema);

export default MeetingProposal;
