import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateQRCodeData, generateQRCodeImage } from '../src/utils/qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create demo member
  const memberUser = await prisma.user.create({
    data: {
      email: 'member@sailclub.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Sailor',
      phone: '+1-555-0123',
      role: 'MEMBER',
    },
  });

  const member = await prisma.member.create({
    data: {
      userId: memberUser.id,
      membershipId: 'SC123456',
      membershipType: 'PREMIUM',
      duesStatus: 'CURRENT',
      duesAmount: 0,
      qrCode: '',
      qrCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      location: 'San Francisco, CA',
    },
  });

  // Generate QR code for member
  const qrData = generateQRCodeData(member.id, member.membershipId);
  const qrCodeImage = await generateQRCodeImage(qrData);
  
  await prisma.member.update({
    where: { id: member.id },
    data: { qrCode: qrCodeImage },
  });

  // Create demo partner
  const partnerUser = await prisma.user.create({
    data: {
      email: 'partner@sailclub.com',
      password: hashedPassword,
      firstName: 'Marina',
      lastName: 'Resort',
      phone: '+1-555-0456',
      role: 'PARTNER',
    },
  });

  const partner = await prisma.partner.create({
    data: {
      userId: partnerUser.id,
      businessName: 'Marina Bay Resort',
      businessType: 'HOTEL',
      description: 'Luxury waterfront resort with marina access',
      address: '123 Harbor Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'US',
      phone: '+1-555-0456',
      website: 'https://marinabayresort.com',
      contactEmail: 'partner@sailclub.com',
      isActive: true,
      isVerified: true,
    },
  });

  // Create demo admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@sailclub.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0789',
      role: 'ADMIN',
    },
  });

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
      adminType: 'ADMIN',
      permissions: [
        'READ_MEMBERS',
        'WRITE_MEMBERS',
        'READ_PARTNERS',
        'WRITE_PARTNERS',
        'READ_AGREEMENTS',
        'WRITE_AGREEMENTS',
        'READ_TRANSACTIONS',
        'READ_ANALYTICS',
      ],
    },
  });

  // Create partnership agreement
  const agreement = await prisma.partnershipAgreement.create({
    data: {
      partnerId: partner.id,
      agreementType: 'STANDARD',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      description: '15% discount on room rates for club members',
      terms: 'Valid for standard rooms only. Blackout dates may apply.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
    },
  });

  // Create some demo usage history
  await prisma.usageHistory.create({
    data: {
      memberId: member.id,
      partnerId: partner.id,
      agreementId: agreement.id,
      discountAmount: 45.00,
      originalAmount: 300.00,
      finalAmount: 255.00,
      description: 'Weekend stay at Marina Bay Resort',
      usedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
  });

  await prisma.usageHistory.create({
    data: {
      memberId: member.id,
      partnerId: partner.id,
      agreementId: agreement.id,
      discountAmount: 30.00,
      originalAmount: 200.00,
      finalAmount: 170.00,
      description: 'Dinner at resort restaurant',
      usedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  // Create demo transactions
  await prisma.transaction.create({
    data: {
      memberId: member.id,
      partnerId: partner.id,
      agreementId: agreement.id,
      transactionType: 'DISCOUNT_APPLICATION',
      amount: 300.00,
      discountAmount: 45.00,
      finalAmount: 255.00,
      description: 'Weekend stay at Marina Bay Resort',
      status: 'APPROVED',
      processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.transaction.create({
    data: {
      memberId: member.id,
      partnerId: partner.id,
      agreementId: agreement.id,
      transactionType: 'DISCOUNT_APPLICATION',
      amount: 200.00,
      discountAmount: 30.00,
      finalAmount: 170.00,
      description: 'Dinner at resort restaurant',
      status: 'APPROVED',
      processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Create additional demo partners
  const restaurantPartner = await prisma.partner.create({
    data: {
      userId: (await prisma.user.create({
        data: {
          email: 'restaurant@sailclub.com',
          password: hashedPassword,
          firstName: 'Harbor',
          lastName: 'Restaurant',
          role: 'PARTNER',
        },
      })).id,
      businessName: 'Harbor View Restaurant',
      businessType: 'RESTAURANT',
      description: 'Fine dining with panoramic harbor views',
      address: '456 Waterfront Blvd',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'US',
      phone: '+1-555-0987',
      website: 'https://harborviewrestaurant.com',
      contactEmail: 'restaurant@sailclub.com',
      isActive: true,
      isVerified: true,
    },
  });

  const equipmentPartner = await prisma.partner.create({
    data: {
      userId: (await prisma.user.create({
        data: {
          email: 'equipment@sailclub.com',
          password: hashedPassword,
          firstName: 'Sail',
          lastName: 'Equipment Co',
          role: 'PARTNER',
        },
      })).id,
      businessName: 'Sail Equipment Co',
      businessType: 'SAILING_EQUIPMENT',
      description: 'Premium sailing equipment and gear',
      address: '789 Marina Way',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94111',
      country: 'US',
      phone: '+1-555-0654',
      website: 'https://sailequipmentco.com',
      contactEmail: 'equipment@sailclub.com',
      isActive: true,
      isVerified: true,
    },
  });

  // Create agreements for additional partners
  await prisma.partnershipAgreement.create({
    data: {
      partnerId: restaurantPartner.id,
      agreementType: 'STANDARD',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      description: '10% discount on all meals',
      terms: 'Valid for dine-in only. Not applicable to alcohol.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.partnershipAgreement.create({
    data: {
      partnerId: equipmentPartner.id,
      agreementType: 'PREMIUM',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      description: '20% discount on all sailing equipment',
      terms: 'Valid for full-price items only. Excludes sale items.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📋 Demo Accounts Created:');
  console.log('👤 Member: member@sailclub.com / password123');
  console.log('🏢 Partner: partner@sailclub.com / password123');
  console.log('👨‍💼 Admin: admin@sailclub.com / password123');
  console.log('\n🎯 Additional Partners:');
  console.log('🍽️  Restaurant: restaurant@sailclub.com / password123');
  console.log('⛵ Equipment: equipment@sailclub.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
