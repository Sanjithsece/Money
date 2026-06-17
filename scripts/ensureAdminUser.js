import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import '../config/env.js';
import { connectMongoDB } from '../config/mongodb.js';
import { User } from '../models/index.js';
import { isValidSeceEmail, normalizeEmail } from '../utils/emailValidator.js';

const ensureAdminUser = async () => {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME;

  if (!adminEmail || !adminPassword || !adminName || !isValidSeceEmail(adminEmail)) {
    console.error('Missing valid ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_NAME in .env');
    process.exit(1);
  }

  try {
    await connectMongoDB();
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          fullName: adminName,
          email: adminEmail,
          passwordHash,
          role: 'ROLE_ADMIN',
          isVerified: true,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`Admin user ready: ${adminEmail}`);
  } catch (error) {
    console.error('Failed to ensure admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

ensureAdminUser();
