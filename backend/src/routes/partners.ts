import { Router } from 'express';
import {
  getPartnerProfile,
  updatePartnerProfile,
  verifyMember,
  applyDiscount,
  getPartnerAnalytics,
  getPartnerTransactions,
} from '../controllers/partnerController';
import { authenticateToken, requirePartner, requirePartnerProfile } from '../middleware/auth';
import {
  partnerProfileValidation,
  qrCodeValidation,
  transactionValidation,
  paginationValidation,
} from '../utils/validation';

const router = Router();

// All partner routes require authentication and partner role
router.use(authenticateToken);
router.use(requirePartner);
router.use(requirePartnerProfile);

// Partner profile routes
router.get('/profile', getPartnerProfile);
router.put('/profile', partnerProfileValidation, updatePartnerProfile);

// Member verification and discount application
router.post('/verify-member', qrCodeValidation, verifyMember);
router.post('/apply-discount', transactionValidation, applyDiscount);

// Analytics and transactions
router.get('/analytics', getPartnerAnalytics);
router.get('/transactions', paginationValidation, getPartnerTransactions);

export default router;
