import jwt from 'jsonwebtoken';

/**
 * Sign a JWT for the given user id and set it as an HttpOnly cookie.
 * Returns the token string as well (handy for clients that prefer headers).
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const days = Number(process.env.JWT_COOKIE_EXPIRES_IN || 7);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
