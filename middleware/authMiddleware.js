import { verifyToken } from './jwtUtil.js';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyToken(token);
    const user = decoded.id ? await User.findById(decoded.id) : await User.findOne({ email: decoded.sub });

    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'User not found or not verified.' });
    }

    req.user = user;
    req.userId = user.id;
    req.email = user.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ROLE_ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};
