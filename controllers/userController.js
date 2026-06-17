// controllers/userController.js
import * as userService from '../services/userService.js';
import { generateToken } from '../middleware/jwtUtil.js';

export const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    const safeUser = userService.buildSafeUser(user);
    const token = generateToken(user);

    return res.status(201).json({
      ...safeUser,
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = userService.parseLoginPayload(req.body);

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const user = await userService.findByEmail(email, true);
    if (!user) return res.status(401).json({ error: 'Incorrect email or password.' });

    const valid = await userService.validatePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect email or password.' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const token = generateToken(user);
    const safeUser = userService.buildSafeUser(user);

    return res.status(200).json({
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(401).json({ error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const safeUser = userService.buildSafeUser(req.user);
    return res.status(200).json(safeUser);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
