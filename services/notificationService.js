import { Notification } from '../models/index.js';

export const createNotification = async (user, message) => {
  return Notification.create({ userId: user._id || user.id, message });
};
