import QRCode from 'qrcode';
import crypto from 'crypto';
import { QRCodeData } from '../types';

const QR_CODE_SECRET = process.env.QR_CODE_SECRET || 'fallback-qr-secret';
const QR_CODE_EXPIRY_HOURS = 24; // QR codes expire after 24 hours

export const generateQRCodeData = (memberId: string, membershipId: string): QRCodeData => {
  const timestamp = Date.now();
  const data = `${memberId}:${membershipId}:${timestamp}`;
  
  // Create HMAC signature for tamper-proof verification
  const signature = crypto
    .createHmac('sha256', QR_CODE_SECRET)
    .update(data)
    .digest('hex');

  return {
    memberId,
    membershipId,
    timestamp,
    signature,
  };
};

export const generateQRCodeImage = async (qrData: QRCodeData): Promise<string> => {
  try {
    const dataString = JSON.stringify(qrData);
    const qrCodeDataURL = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });
    
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code image');
  }
};

export const verifyQRCodeData = (qrData: QRCodeData): boolean => {
  try {
    // Check if QR code is expired (24 hours)
    const now = Date.now();
    const expiryTime = qrData.timestamp + (QR_CODE_EXPIRY_HOURS * 60 * 60 * 1000);
    
    if (now > expiryTime) {
      return false;
    }

    // Verify signature
    const data = `${qrData.memberId}:${qrData.membershipId}:${qrData.timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', QR_CODE_SECRET)
      .update(data)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(qrData.signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    return false;
  }
};

export const parseQRCodeString = (qrString: string): QRCodeData | null => {
  try {
    const qrData = JSON.parse(qrString) as QRCodeData;
    
    // Validate required fields
    if (!qrData.memberId || !qrData.membershipId || !qrData.timestamp || !qrData.signature) {
      return null;
    }

    return qrData;
  } catch (error) {
    return null;
  }
};

export const isQRCodeExpired = (qrData: QRCodeData): boolean => {
  const now = Date.now();
  const expiryTime = qrData.timestamp + (QR_CODE_EXPIRY_HOURS * 60 * 60 * 1000);
  return now > expiryTime;
};

export const getQRCodeExpiryTime = (qrData: QRCodeData): Date => {
  const expiryTime = qrData.timestamp + (QR_CODE_EXPIRY_HOURS * 60 * 60 * 1000);
  return new Date(expiryTime);
};
