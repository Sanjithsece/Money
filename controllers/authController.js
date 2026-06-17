import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import EmailUser from '../models/EmailUser.js';
import { isValidSeceEmail, normalizeEmail } from '../utils/emailValidator.js';
import { sendVerificationEmail } from '../services/emailService.js';

const SALT_ROUNDS = 12;
const TOKEN_BYTES = 32;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const buildSafeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
});

const signAuthToken = (user) => {
  return jwt.sign(
    {
      sub: user.email,
      id: user._id.toString(),
      roles: [user.role],
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '10h' }
  );
};

export const register = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    if (!isValidSeceEmail(email)) {
      return res.status(400).json({ message: 'Please use a valid @sece.ac.in email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await EmailUser.findOne({ email });
    if (existingUser?.isVerified) {
      return res.status(409).json({ message: 'This email address is already registered.' });
    }

    const verificationToken = crypto.randomBytes(TOKEN_BYTES).toString('hex');
    const verificationTokenHash = hashToken(verificationToken);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user =
      existingUser ||
      new EmailUser({
        fullName,
        email,
      });

    user.fullName = fullName;
    user.passwordHash = passwordHash;
    user.isVerified = false;
    user.verificationTokenHash = verificationTokenHash;
    user.verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    await user.save();
    await sendVerificationEmail({ to: user.email, fullName: user.fullName, token: verificationToken });

    return res.status(201).json({
      message: 'Registration successful. Please check your SECE email to verify your account.',
    });
  } catch (error) {
    console.error('Email registration error:', error);
    return res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const token = String(req.params.token || '').trim();
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await EmailUser.findOne({
      verificationTokenHash: hashToken(token),
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select('+verificationTokenHash +verificationTokenExpiresAt');

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
    }

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Email verification failed. Please try again later.' });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!isValidSeceEmail(email)) {
      return res.status(400).json({ message: 'Please use a valid @sece.ac.in email address.' });
    }

    const user = await EmailUser.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = signAuthToken(user);
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error('Email login error:', error);
    return res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

export const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await EmailUser.findById(payload.id);

    if (!user || !user.isVerified) {
      return res.status(401).json({ message: 'User is not authorized.' });
    }

    return res.status(200).json(buildSafeUser(user));
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
