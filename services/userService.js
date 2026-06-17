import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, ExchangeRequest, MeetingProposal, Notification } from '../models/index.js';
import { isValidSeceEmail, normalizeEmail } from '../utils/emailValidator.js';

const SALT_ROUNDS = 12;

const normalizeTextField = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const normalizePasswordField = (value) => {
  if (value === undefined || value === null) return '';
  return String(value);
};

export const buildSafeUser = (user) => {
  if (!user) return null;
  const plainUser = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const { passwordHash, verificationTokenHash, verificationTokenExpiresAt, __v, ...safeUser } = plainUser;
  return safeUser;
};

export const parseRegistrationPayload = (body = {}) => {
  const fullName = normalizeTextField(
    body.fullName ?? body.full_name ?? body.name ?? body.userName ?? body.username
  );
  const email = normalizeEmail(body.email);
  const phoneNumber = normalizeTextField(
    body.phoneNumber ?? body.phone_number ?? body.phone ?? body.mobileNumber ?? body.mobile_number
  );
  const password = normalizePasswordField(body.password);
  const confirmPassword = body.confirmPassword ?? body.confirm_password;

  return {
    fullName,
    email,
    phoneNumber,
    password,
    confirmPassword: confirmPassword === undefined ? undefined : normalizePasswordField(confirmPassword),
  };
};

export const parseLoginPayload = (body = {}) => {
  const email = normalizeEmail(body.email);
  const phoneNumber = normalizeTextField(
    body.phoneNumber ?? body.phone_number ?? body.phone ?? body.mobileNumber ?? body.mobile_number
  );
  const password = normalizePasswordField(body.password);

  return { email, phoneNumber, password };
};

export const registerUser = async (body) => {
  const { fullName, email, phoneNumber, password, confirmPassword } = parseRegistrationPayload(body);

  if (!fullName || !email || !password) {
    throw new Error('fullName, email, and password are required.');
  }

  if (!isValidSeceEmail(email)) {
    throw new Error('Please use a valid @sece.ac.in email address.');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new Error('Password and confirmPassword do not match.');
  }

  const existing = await User.findOne({ email });
  if (existing) throw new Error('Email address already registered.');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ fullName, email, phoneNumber, passwordHash, isVerified: true });
};

export const findByEmail = async (email, includePassword = false) => {
  const query = User.findOne({ email: normalizeEmail(email) });
  return includePassword ? query.select('+passwordHash') : query;
};

export const findByPhoneNumber = async (phoneNumber) => {
  return User.findOne({ phoneNumber: normalizeTextField(phoneNumber) });
};

export const findById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return User.findById(id);
};

export const updateProfilePicture = async (userIdOrEmail, fileUrl) => {
  const query = mongoose.Types.ObjectId.isValid(userIdOrEmail)
    ? { _id: userIdOrEmail }
    : { email: normalizeEmail(userIdOrEmail) };

  const user = await User.findOne(query);
  if (!user) throw new Error('User not found.');
  user.profilePictureUrl = fileUrl;
  await user.save();
  return user;
};

export const deleteUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user id.');

  const user = await User.findById(userId);
  if (!user) throw new Error(`User not found with id: ${userId}`);

  await Promise.all([
    MeetingProposal.deleteMany({ $or: [{ proposerId: user._id }, { receiverId: user._id }] }),
    ExchangeRequest.deleteMany({ userId: user._id }),
    Notification.deleteMany({ userId: user._id }),
  ]);

  await user.deleteOne();
};

export const validatePassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};
