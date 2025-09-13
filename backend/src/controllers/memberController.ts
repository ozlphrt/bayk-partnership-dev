import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

// Get member profile
export const getMemberProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const member = await prisma.member.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  });

  if (!member) {
    throw createError('Member profile not found', 404);
  }

  res.json({
    success: true,
    data: member,
  });
});

// Update member profile
export const updateMemberProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { location } = req.body;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const member = await prisma.member.findUnique({
    where: { userId },
  });

  if (!member) {
    throw createError('Member profile not found', 404);
  }

  const updatedMember = await prisma.member.update({
    where: { userId },
    data: { location },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  });

  logger.info('Member profile updated', {
    memberId: member.id,
    userId,
  });

  res.json({
    success: true,
    data: updatedMember,
    message: 'Member profile updated successfully',
  });
});

// Get member QR code
export const getMemberQRCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const member = await prisma.member.findUnique({
    where: { userId },
  });

  if (!member) {
    throw createError('Member profile not found', 404);
  }

  // Check if QR code is expired or needs regeneration
  const now = new Date();
  const isExpired = member.qrCodeExpiry < now;

  let qrCode = member.qrCode;

  if (isExpired || !qrCode) {
    // Generate new QR code
    const { generateQRCodeData, generateQRCodeImage } = await import('../utils/qrcode');
    const qrData = generateQRCodeData(member.id, member.membershipId);
    qrCode = await generateQRCodeImage(qrData);

    // Update member with new QR code
    await prisma.member.update({
      where: { id: member.id },
      data: {
        qrCode,
        qrCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    logger.info('QR code regenerated', {
      memberId: member.id,
      userId,
    });
  }

  res.json({
    success: true,
    data: {
      qrCode,
      expiry: member.qrCodeExpiry,
    },
  });
});

// Regenerate QR code
export const regenerateQRCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const member = await prisma.member.findUnique({
    where: { userId },
  });

  if (!member) {
    throw createError('Member profile not found', 404);
  }

  // Generate new QR code
  const { generateQRCodeData, generateQRCodeImage } = await import('../utils/qrcode');
  const qrData = generateQRCodeData(member.id, member.membershipId);
  const qrCode = await generateQRCodeImage(qrData);

  // Update member with new QR code
  const updatedMember = await prisma.member.update({
    where: { id: member.id },
    data: {
      qrCode,
      qrCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  logger.info('QR code manually regenerated', {
    memberId: member.id,
    userId,
  });

  res.json({
    success: true,
    data: {
      qrCode,
      expiry: updatedMember.qrCodeExpiry,
    },
    message: 'QR code regenerated successfully',
  });
});

// Get member usage history
export const getUsageHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { page = 1, limit = 20 } = req.query;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const member = await prisma.member.findUnique({
    where: { userId },
  });

  if (!member) {
    throw createError('Member profile not found', 404);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [usageHistory, total] = await Promise.all([
    prisma.usageHistory.findMany({
      where: { memberId: member.id },
      include: {
        partner: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            city: true,
            state: true,
          },
        },
        agreement: {
          select: {
            id: true,
            discountType: true,
            discountValue: true,
            description: true,
          },
        },
      },
      orderBy: { usedAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.usageHistory.count({
      where: { memberId: member.id },
    }),
  ]);

  res.json({
    success: true,
    data: usageHistory,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// Get member statistics
export const getMemberStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const member = await prisma.member.findUnique({
    where: { userId },
  });

  if (!member) {
    throw createError('Member profile not found', 404);
  }

  const [
    totalUsage,
    totalSavings,
    partnerCount,
    recentUsage,
  ] = await Promise.all([
    prisma.usageHistory.count({
      where: { memberId: member.id },
    }),
    prisma.usageHistory.aggregate({
      where: { memberId: member.id },
      _sum: { discountAmount: true },
    }),
    prisma.usageHistory.groupBy({
      by: ['partnerId'],
      where: { memberId: member.id },
    }),
    prisma.usageHistory.findMany({
      where: { memberId: member.id },
      include: {
        partner: {
          select: {
            businessName: true,
            businessType: true,
          },
        },
      },
      orderBy: { usedAt: 'desc' },
      take: 5,
    }),
  ]);

  const stats = {
    totalUsage,
    totalSavings: totalSavings._sum.discountAmount || 0,
    uniquePartners: partnerCount.length,
    recentUsage,
  };

  res.json({
    success: true,
    data: stats,
  });
});

// Get available partners
export const getAvailablePartners = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 20, search, businessType } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    isActive: true,
    isVerified: true,
  };

  if (search) {
    where.OR = [
      { businessName: { contains: search as string, mode: 'insensitive' } },
      { city: { contains: search as string, mode: 'insensitive' } },
      { state: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (businessType && businessType !== 'ALL') {
    where.businessType = businessType;
  }

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      include: {
        agreements: {
          where: { isActive: true },
          select: {
            id: true,
            agreementType: true,
            discountType: true,
            discountValue: true,
            description: true,
            startDate: true,
            endDate: true,
          },
        },
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
            title: true,
            description: true,
            discountType: true,
            discountValue: true,
            startDate: true,
            endDate: true,
            maxUses: true,
            currentUses: true,
          },
        },
      },
      orderBy: { businessName: 'asc' },
      skip,
      take: Number(limit),
    }),
    prisma.partner.count({ where }),
  ]);

  res.json({
    success: true,
    data: partners,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});
