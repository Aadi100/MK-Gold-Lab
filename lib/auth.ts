import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const EXPIRES_IN = '15m'; // token expiry, client inactivity handles 5min logout

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as any;
  } catch (e) {
    return null;
  }
}
