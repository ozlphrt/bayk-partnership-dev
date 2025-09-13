import { Router } from 'express';
import {
  getAdminProfile,
  getSystemStats,
  getAllMembers,
  getAllPartners,
  updateMember,
  updatePartner,
  createPartnershipAgreement,
  getPartnershipAgreements,
  updatePartnershipAgreement,
  getSystemTransactions,
} from '../controllers/adminController';
import { authenticateToken, requireAdmin, requireAdminProfile } from '../middleware/auth';
import {
  partnershipAgreementValidation,
  paginationValidation,
} from '../utils/validation';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);
router.use(requireAdminProfile);

// Admin profile
router.get('/profile', getAdminProfile);

// System statistics
router.get('/stats', getSystemStats);

// Member management
router.get('/members', paginationValidation, getAllMembers);
router.put('/members/:id', updateMember);

// Partner management
router.get('/partners', paginationValidation, getAllPartners);
router.put('/partners/:id', updatePartner);

// Partnership agreements
router.get('/agreements', paginationValidation, getPartnershipAgreements);
router.post('/agreements', partnershipAgreementValidation, createPartnershipAgreement);
router.put('/agreements/:id', updatePartnershipAgreement);

// System transactions
router.get('/transactions', paginationValidation, getSystemTransactions);

export default router;
