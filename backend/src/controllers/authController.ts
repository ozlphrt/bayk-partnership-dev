import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateTokenPair } from '../utils/jwt';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types';

const prisma = new PrismaClient();

// Generate unique membership ID
const generateMembershipId = (): string => {
  const prefix = 'SC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Register new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, role }: RegisterRequest = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user with profile based on role
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      ...(role === 'MEMBER' && {
        memberProfile: {
          create: {
            membershipId: generateMembershipId(),
            membershipType: 'STANDARD',
            duesStatus: 'CURRENT',
            duesAmount: 0,
            qrCode: '', // Will be generated after user creation
            qrCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        },
      }),
      ...(role === 'PARTNER' && {
        partnerProfile: {
          create: {
            businessName: '', // Will be filled in profile setup
            businessType: 'OTHER',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            contactEmail: email,
            isVerified: false,
          },
        },
      }),
      ...(role === 'ADMIN' && {
        adminProfile: {
          create: {
            adminType: 'STAFF',
            permissions: ['READ_MEMBERS', 'READ_PARTNERS'],
          },
        },
      }),
    },
    include: {
      memberProfile: true,
      partnerProfile: true,
      adminProfile: true,
    },
  });

  // Generate QR code for members
  if (role === 'MEMBER' && user.memberProfile) {
    const { generateQRCodeData, generateQRCodeImage } = await import('../utils/qrcode');
    const qrData = generateQRCodeData(user.id, user.memberProfile.membershipId);
    const qrCodeImage = await generateQRCodeImage(qrData);

    await prisma.member.update({
      where: { id: user.memberProfile.id },
      data: { qrCode: qrCodeImage },
    });
  }

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const response: AuthResponse = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    },
    token: tokens.token,
    refreshToken: tokens.refreshToken,
  };

  logger.info('User registered successfully', {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    success: true,
    data: response,
    message: 'User registered successfully',
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Find user with profile
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberProfile: true,
      partnerProfile: true,
      adminProfile: true,
    },
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('Account is deactivated', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const response: AuthResponse = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    },
    token: tokens.token,
    refreshToken: tokens.refreshToken,
  };

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    success: true,
    data: response,
    message: 'Login successful',
  });
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token required', 400);
  }

  const { verifyRefreshToken } = await import('../utils/jwt');
  const payload = verifyRefreshToken(refreshToken);

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.isActive) {
    throw createError('User not found or inactive', 401);
  }

  // Generate new tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    success: true,
    data: {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    },
    message: 'Token refreshed successfully',
  });
});

// Logout user
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // In a more sophisticated implementation, you might want to:
  // 1. Add the token to a blacklist
  // 2. Store logout events in the database
  // 3. Notify other services about the logout

  logger.info('User logged out', {
    userId: req.user?.id,
    email: req.user?.email,
  });

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw createError('User not found', 404);
  }

  // Remove sensitive data
  const { password, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword,
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { firstName, lastName, phone } = req.body;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phone,
    },
    include: {
      memberProfile: true,
      partnerProfile: true,
      adminProfile: true,
    },
  });

  // Remove sensitive data
  const { password, ...userWithoutPassword } = updatedUser;

  logger.info('User profile updated', {
    userId,
    email: updatedUser.email,
  });

  res.json({
    success: true,
    data: userWithoutPassword,
    message: 'Profile updated successfully',
  });
});
