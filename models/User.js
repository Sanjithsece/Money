import mongoose from 'mongoose';
import { isValidSeceEmail, normalizeEmail } from '../utils/emailValidator.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: isValidSeceEmail,
        message: 'Only valid @sece.ac.in email addresses are allowed.',
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    profilePictureUrl: {
      type: String,
      default: '',
    },
    upiQrCodeUrl: {
      type: String,
      default: '',
    },
    averageRating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    role: {
      type: String,
      enum: ['ROLE_USER', 'ROLE_ADMIN'],
      default: 'ROLE_USER',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: {
      type: String,
      select: false,
    },
    verificationTokenExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.verificationTokenHash;
        delete ret.verificationTokenExpiresAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

userSchema.pre('validate', function normalizeUser(next) {
  if (this.email) this.email = normalizeEmail(this.email);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
