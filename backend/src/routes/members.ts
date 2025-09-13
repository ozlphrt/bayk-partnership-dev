import { Router } from 'express';
import {
  getMemberProfile,
  updateMemberProfile,
  getMemberQRCode,
  regenerateQRCode,
  getUsageHistory,
  getMemberStats,
  getAvailablePartners,
} from '../controllers/memberController';
import { authenticateToken, requireMember, requireMemberProfile } from '../middleware/auth';
import { memberProfileValidation, paginationValidation } from '../utils/validation';

const router = Router();

// All member routes require authentication and member role
router.use(authenticateToken);
router.use(requireMember);
router.use(requireMemberProfile);

// Member profile routes
router.get('/profile', getMemberProfile);
router.put('/profile', memberProfileValidation, updateMemberProfile);

// QR Code routes
router.get('/qr-code', getMemberQRCode);
router.post('/qr-code/regenerate', regenerateQRCode);

// Usage and statistics
router.get('/usage-history', paginationValidation, getUsageHistory);
router.get('/stats', getMemberStats);

// Partner directory
router.get('/partners', paginationValidation, getAvailablePartners);

export default router;
