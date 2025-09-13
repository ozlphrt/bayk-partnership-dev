import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

// Get partner profile
export const getPartnerProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const partner = await prisma.partner.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
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
        where: { isActive: true },
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
  });

  if (!partner) {
    throw createError('Partner profile not found', 404);
  }

  res.json({
    success: true,
    data: partner,
  });
});

// Update partner profile
export const updatePartnerProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const {
    businessName,
    businessType,
    description,
    address,
    city,
    state,
    zipCode,
    country,
    phone,
    website,
    contactEmail,
  } = req.body;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const partner = await prisma.partner.findUnique({
    where: { userId },
  });

  if (!partner) {
    throw createError('Partner profile not found', 404);
  }

  const updatedPartner = await prisma.partner.update({
    where: { userId },
    data: {
      businessName,
      businessType,
      description,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      website,
      contactEmail,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  logger.info('Partner profile updated', {
    partnerId: partner.id,
    userId,
  });

  res.json({
    success: true,
    data: updatedPartner,
    message: 'Partner profile updated successfully',
  });
});

// Verify member QR code
export const verifyMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { qrCode } = req.body;
  const partnerId = req.user?.partnerProfile?.id;

  if (!partnerId) {
    throw createError('Partner profile not found', 404);
  }

  if (!qrCode) {
    throw createError('QR code is required', 400);
  }

  // Parse and verify QR code
  const { parseQRCodeString, verifyQRCodeData, isQRCodeExpired } = await import('../utils/qrcode');
  const qrData = parseQRCodeString(qrCode);

  if (!qrData) {
    throw createError('Invalid QR code format', 400);
  }

  if (isQRCodeExpired(qrData)) {
    throw createError('QR code has expired', 400);
  }

  if (!verifyQRCodeData(qrData)) {
    throw createError('Invalid QR code signature', 400);
  }

  // Find member and verify they exist and are active
  const member = await prisma.member.findUnique({
    where: { id: qrData.memberId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      },
    },
  });

  if (!member || !member.isActive || !member.user.isActive) {
    throw createError('Member not found or inactive', 404);
  }

  // Find active partnership agreement
  const agreement = await prisma.partnershipAgreement.findFirst({
    where: {
      partnerId,
      isActive: true,
      startDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!agreement) {
    throw createError('No active partnership agreement found', 404);
  }

  // Log verification event
  logger.info('Member verified by partner', {
    memberId: member.id,
    partnerId,
    agreementId: agreement.id,
    membershipId: member.membershipId,
  });

  res.json({
    success: true,
    data: {
      isValid: true,
      memberId: member.id,
      membershipId: member.membershipId,
      memberName: `${member.user.firstName} ${member.user.lastName}`,
      membershipType: member.membershipType,
      agreementId: agreement.id,
      discountType: agreement.discountType,
      discountValue: agreement.discountValue,
      description: agreement.description,
    },
    message: 'Member verified successfully',
  });
});

// Apply discount
export const applyDiscount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { memberId, agreementId, originalAmount, description } = req.body;
  const partnerId = req.user?.partnerProfile?.id;

  if (!partnerId) {
    throw createError('Partner profile not found', 404);
  }

  // Verify member exists and is active
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      user: {
        select: {
          isActive: true,
        },
      },
    },
  });

  if (!member || !member.isActive || !member.user.isActive) {
    throw createError('Member not found or inactive', 404);
  }

  // Verify agreement exists and is active
  const agreement = await prisma.partnershipAgreement.findFirst({
    where: {
      id: agreementId,
      partnerId,
      isActive: true,
      startDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
  });

  if (!agreement) {
    throw createError('Invalid or inactive partnership agreement', 404);
  }

  // Calculate discount
  let discountAmount = 0;
  let finalAmount = originalAmount;

  switch (agreement.discountType) {
    case 'PERCENTAGE':
      discountAmount = originalAmount * (agreement.discountValue / 100);
      finalAmount = originalAmount - discountAmount;
      break;
    case 'FIXED_AMOUNT':
      discountAmount = Math.min(agreement.discountValue, originalAmount);
      finalAmount = originalAmount - discountAmount;
      break;
    case 'FREE_ITEM':
      // For free items, the discount might be the full amount or a specific value
      discountAmount = agreement.discountValue;
      finalAmount = Math.max(0, originalAmount - discountAmount);
      break;
    case 'SPECIAL_OFFER':
      // Special offers might have custom logic
      discountAmount = agreement.discountValue;
      finalAmount = Math.max(0, originalAmount - discountAmount);
      break;
  }

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      memberId,
      partnerId,
      agreementId,
      transactionType: 'DISCOUNT_APPLICATION',
      amount: originalAmount,
      discountAmount,
      finalAmount,
      description,
      status: 'APPROVED',
      processedAt: new Date(),
    },
  });

  // Create usage history record
  await prisma.usageHistory.create({
    data: {
      memberId,
      partnerId,
      agreementId,
      discountAmount,
      originalAmount,
      finalAmount,
      description,
    },
  });

  logger.info('Discount applied successfully', {
    transactionId: transaction.id,
    memberId,
    partnerId,
    agreementId,
    originalAmount,
    discountAmount,
    finalAmount,
  });

  res.json({
    success: true,
    data: {
      transactionId: transaction.id,
      originalAmount,
      discountAmount,
      finalAmount,
      discountType: agreement.discountType,
      discountValue: agreement.discountValue,
    },
    message: 'Discount applied successfully',
  });
});

// Get partner analytics
export const getPartnerAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const partnerId = req.user?.partnerProfile?.id;
  const { period = '30' } = req.query; // days

  if (!partnerId) {
    throw createError('Partner profile not found', 404);
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const [
    totalVerifications,
    totalDiscounts,
    totalSavings,
    monthlyStats,
    topMembers,
  ] = await Promise.all([
    prisma.usageHistory.count({
      where: {
        partnerId,
        usedAt: { gte: startDate },
      },
    }),
    prisma.transaction.count({
      where: {
        partnerId,
        transactionType: 'DISCOUNT_APPLICATION',
        status: 'APPROVED',
        createdAt: { gte: startDate },
      },
    }),
    prisma.usageHistory.aggregate({
      where: {
        partnerId,
        usedAt: { gte: startDate },
      },
      _sum: { discountAmount: true },
    }),
    // Monthly stats for the last 12 months
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "usedAt") as month,
        COUNT(*) as verifications,
        SUM("discountAmount") as savings
      FROM "usage_history"
      WHERE "partnerId" = ${partnerId}
        AND "usedAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "usedAt")
      ORDER BY month DESC
    `,
    // Top members by usage
    prisma.usageHistory.groupBy({
      by: ['memberId'],
      where: {
        partnerId,
        usedAt: { gte: startDate },
      },
      _count: { memberId: true },
      _sum: { discountAmount: true },
      orderBy: {
        _count: { memberId: 'desc' },
      },
      take: 10,
    }),
  ]);

  // Get member names for top members
  const topMemberIds = topMembers.map(m => m.memberId);
  const memberDetails = await prisma.member.findMany({
    where: { id: { in: topMemberIds } },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const topMembersWithNames = topMembers.map(member => {
    const details = memberDetails.find(d => d.id === member.memberId);
    return {
      memberId: member.memberId,
      memberName: details ? `${details.user.firstName} ${details.user.lastName}` : 'Unknown',
      visits: member._count.memberId,
      totalSavings: member._sum.discountAmount || 0,
    };
  });

  const analytics = {
    totalVerifications,
    totalDiscountsApplied: totalDiscounts,
    totalSavings: totalSavings._sum.discountAmount || 0,
    monthlyStats: monthlyStats as any[],
    topMembers: topMembersWithNames,
  };

  res.json({
    success: true,
    data: analytics,
  });
});

// Get partner transactions
export const getPartnerTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const partnerId = req.user?.partnerProfile?.id;
  const { page = 1, limit = 20, status } = req.query;

  if (!partnerId) {
    throw createError('Partner profile not found', 404);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { partnerId };
  if (status) {
    where.status = status;
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        member: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        agreement: {
          select: {
            discountType: true,
            discountValue: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});
