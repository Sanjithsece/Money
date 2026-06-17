import jwt from 'jsonwebtoken';

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }
  return process.env.JWT_SECRET;
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.email,
      id: user.id || user._id?.toString(),
      roles: [user.role],
      isVerified: user.isVerified,
    },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '10h' }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};
