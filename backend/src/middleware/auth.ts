import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    const payload = verifyAccessToken(token);
    
    // Fetch user with profile data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberProfile: true,
        partnerProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

export const requireMember = requireRole(['MEMBER']);
export const requirePartner = requireRole(['PARTNER']);
export const requireAdmin = requireRole(['ADMIN']);
export const requireAdminOrPartner = requireRole(['ADMIN', 'PARTNER']);

export const requireProfile = (profileType: 'member' | 'partner' | 'admin') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const profileMap = {
      member: req.user.memberProfile,
      partner: req.user.partnerProfile,
      admin: req.user.adminProfile,
    };

    if (!profileMap[profileType]) {
      return res.status(403).json({
        success: false,
        error: `${profileType} profile required`,
      });
    }

    next();
  };
};

export const requireMemberProfile = requireProfile('member');
export const requirePartnerProfile = requireProfile('partner');
export const requireAdminProfile = requireProfile('admin');

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          memberProfile: true,
          partnerProfile: true,
          adminProfile: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};
