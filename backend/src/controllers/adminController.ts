import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

// Get admin profile
export const getAdminProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not found', 404);
  }

  const admin = await prisma.admin.findUnique({
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
    },
  });

  if (!admin) {
    throw createError('Admin profile not found', 404);
  }

  res.json({
    success: true,
    data: admin,
  });
});

// Get system statistics
export const getSystemStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const [
    totalMembers,
    totalPartners,
    totalTransactions,
    totalSavings,
    activeMembers,
    activePartners,
    monthlyGrowth,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.partner.count(),
    prisma.transaction.count(),
    prisma.usageHistory.aggregate({
      _sum: { discountAmount: true },
    }),
    prisma.member.count({
      where: { isActive: true },
    }),
    prisma.partner.count({
      where: { isActive: true, isVerified: true },
    }),
    // Monthly growth data for the last 12 months
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(CASE WHEN "role" = 'MEMBER' THEN 1 END) as members,
        COUNT(CASE WHEN "role" = 'PARTNER' THEN 1 END) as partners,
        COUNT(CASE WHEN "transactionType" = 'DISCOUNT_APPLICATION' THEN 1 END) as transactions,
        COALESCE(SUM("discountAmount"), 0) as savings
      FROM (
        SELECT "createdAt", "role", NULL as "transactionType", NULL as "discountAmount"
        FROM "users"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        UNION ALL
        SELECT "createdAt", NULL as "role", "transactionType", "discountAmount"
        FROM "transactions"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      ) combined
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
  ]);

  const stats = {
    totalMembers,
    totalPartners,
    totalTransactions,
    totalSavings: totalSavings._sum.discountAmount || 0,
    activeMembers,
    activePartners,
    monthlyGrowth: monthlyGrowth as any[],
  };

  res.json({
    success: true,
    data: stats,
  });
});

// Get all members
export const getAllMembers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 20, search, membershipType, duesStatus } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (search) {
    where.OR = [
      { membershipId: { contains: search as string, mode: 'insensitive' } },
      { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
      { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
      { user: { email: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  if (membershipType) {
    where.membershipType = membershipType;
  }

  if (duesStatus) {
    where.duesStatus = duesStatus;
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            usageHistory: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.member.count({ where }),
  ]);

  res.json({
    success: true,
    data: members,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// Get all partners
export const getAllPartners = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 20, search, businessType, isVerified } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (search) {
    where.OR = [
      { businessName: { contains: search as string, mode: 'insensitive' } },
      { city: { contains: search as string, mode: 'insensitive' } },
      { state: { contains: search as string, mode: 'insensitive' } },
      { user: { email: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  if (businessType) {
    where.businessType = businessType;
  }

  if (isVerified !== undefined) {
    where.isVerified = isVerified === 'true';
  }

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            agreements: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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

// Update member
export const updateMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    membershipType,
    duesStatus,
    duesAmount,
    duesDueDate,
    isActive,
  } = req.body;

  const member = await prisma.member.findUnique({
    where: { id },
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

  if (!member) {
    throw createError('Member not found', 404);
  }

  const updatedMember = await prisma.member.update({
    where: { id },
    data: {
      membershipType,
      duesStatus,
      duesAmount,
      duesDueDate: duesDueDate ? new Date(duesDueDate) : null,
      isActive,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
        },
      },
    },
  });

  logger.info('Member updated by admin', {
    memberId: id,
    adminId: req.user?.id,
    changes: { membershipType, duesStatus, duesAmount, duesDueDate, isActive },
  });

  res.json({
    success: true,
    data: updatedMember,
    message: 'Member updated successfully',
  });
});

// Update partner
export const updatePartner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
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
    isActive,
    isVerified,
  } = req.body;

  const partner = await prisma.partner.findUnique({
    where: { id },
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

  if (!partner) {
    throw createError('Partner not found', 404);
  }

  const updatedPartner = await prisma.partner.update({
    where: { id },
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
      isActive,
      isVerified,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      },
    },
  });

  logger.info('Partner updated by admin', {
    partnerId: id,
    adminId: req.user?.id,
    changes: {
      businessName,
      businessType,
      isActive,
      isVerified,
    },
  });

  res.json({
    success: true,
    data: updatedPartner,
    message: 'Partner updated successfully',
  });
});

// Create partnership agreement
export const createPartnershipAgreement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    partnerId,
    agreementType,
    discountType,
    discountValue,
    description,
    terms,
    startDate,
    endDate,
  } = req.body;

  // Verify partner exists
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  });

  if (!partner) {
    throw createError('Partner not found', 404);
  }

  const agreement = await prisma.partnershipAgreement.create({
    data: {
      partnerId,
      agreementType,
      discountType,
      discountValue,
      description,
      terms,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  logger.info('Partnership agreement created', {
    agreementId: agreement.id,
    partnerId,
    adminId: req.user?.id,
    agreementType,
    discountType,
    discountValue,
  });

  res.status(201).json({
    success: true,
    data: agreement,
    message: 'Partnership agreement created successfully',
  });
});

// Get partnership agreements
export const getPartnershipAgreements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 20, partnerId, isActive } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (partnerId) {
    where.partnerId = partnerId;
  }
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [agreements, total] = await Promise.all([
    prisma.partnershipAgreement.findMany({
      where,
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
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.partnershipAgreement.count({ where }),
  ]);

  res.json({
    success: true,
    data: agreements,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// Update partnership agreement
export const updatePartnershipAgreement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    agreementType,
    discountType,
    discountValue,
    description,
    terms,
    startDate,
    endDate,
    isActive,
  } = req.body;

  const agreement = await prisma.partnershipAgreement.findUnique({
    where: { id },
  });

  if (!agreement) {
    throw createError('Partnership agreement not found', 404);
  }

  const updatedAgreement = await prisma.partnershipAgreement.update({
    where: { id },
    data: {
      agreementType,
      discountType,
      discountValue,
      description,
      terms,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isActive,
    },
    include: {
      partner: {
        select: {
          id: true,
          businessName: true,
          businessType: true,
        },
      },
    },
  });

  logger.info('Partnership agreement updated', {
    agreementId: id,
    adminId: req.user?.id,
    changes: {
      agreementType,
      discountType,
      discountValue,
      isActive,
    },
  });

  res.json({
    success: true,
    data: updatedAgreement,
    message: 'Partnership agreement updated successfully',
  });
});

// Get system transactions
export const getSystemTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 20, status, transactionType, startDate, endDate } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (transactionType) {
    where.transactionType = transactionType;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
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
        partner: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
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
