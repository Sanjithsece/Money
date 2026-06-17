import mongoose from 'mongoose';
import { User, MeetingProposal } from '../models/index.js';
import * as userService from '../services/userService.js';

export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllTransactions = async (_req, res) => {
  try {
    const proposals = await MeetingProposal.find()
      .sort({ createdAt: -1 })
      .populate('proposer')
      .populate('receiver')
      .populate('exchangeRequest')
      .populate('location');

    return res.status(200).json(proposals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getStats = async (_req, res) => {
  try {
    const [totalUsers, totalTransactions] = await Promise.all([
      User.countDocuments(),
      MeetingProposal.countDocuments(),
    ]);

    return res.status(200).json({ totalUsers, totalTransactions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const proposals = await MeetingProposal.find({ proposerId: user._id })
      .sort({ createdAt: -1 })
      .populate('receiver')
      .populate('exchangeRequest')
      .populate('location');

    return res.status(200).json({ user, proposals });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    return res.status(400).json({ error: `Could not delete user. ${err.message}` });
  }
};
