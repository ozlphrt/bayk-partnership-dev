import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'sailclub-api',
    audience: 'sailclub-app',
  });
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'sailclub-api',
    audience: 'sailclub-app',
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'sailclub-api',
      audience: 'sailclub-app',
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'sailclub-api',
      audience: 'sailclub-app',
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const generateTokenPair = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  return {
    token: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};
