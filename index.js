import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

import './config/env.js';
import { connectMongoDB } from './config/mongodb.js';
import { User, CampusLocation } from './models/index.js';
import apiRoutes from './routes/index.js';
import { isValidSeceEmail, normalizeEmail } from './utils/emailValidator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed.`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', apiRoutes);

const initializeData = async () => {
  await CampusLocation.findOneAndUpdate(
    { name: 'Main Campus Gate' },
    { $setOnInsert: { name: 'Main Campus Gate', isActive: true } },
    { upsert: true, new: true }
  );

  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME;

  if (adminEmail && adminPassword && adminName && isValidSeceEmail(adminEmail)) {
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
  }
};

const start = async () => {
  try {
    await connectMongoDB();
    await initializeData();

    const server = app.listen(PORT, () => {
      console.log(`MoneyBridge server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing process or change PORT.`);
        process.exit(1);
      }

      console.error('Server failed to start:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
