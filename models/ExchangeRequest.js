import mongoose from 'mongoose';

const exchangeRequestSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than zero.'],
    },
    haveType: {
      type: String,
      enum: ['CASH', 'UPI'],
      required: true,
    },
    needType: {
      type: String,
      enum: ['CASH', 'UPI'],
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'PENDING', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
    },
    locationHint: {
      type: String,
      trim: true,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

exchangeRequestSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

exchangeRequestSchema.virtual('meetingProposals', {
  ref: 'MeetingProposal',
  localField: '_id',
  foreignField: 'requestId',
});

const ExchangeRequest = mongoose.model('ExchangeRequest', exchangeRequestSchema);

export default ExchangeRequest;
