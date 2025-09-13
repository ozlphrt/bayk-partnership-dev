import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types';

// Validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors,
    });
  }
  
  next();
};

// Common validation rules
export const emailValidation = (field: string = 'email'): ValidationChain => {
  return body(field)
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase();
};

export const passwordValidation = (field: string = 'password'): ValidationChain => {
  return body(field)
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');
};

export const nameValidation = (field: string): ValidationChain => {
  return body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`);
};

export const phoneValidation = (field: string = 'phone'): ValidationChain => {
  return body(field)
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number');
};

export const urlValidation = (field: string = 'website'): ValidationChain => {
  return body(field)
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL');
};

// Authentication validation
export const loginValidation = [
  emailValidation('email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest,
];

export const registerValidation = [
  emailValidation('email'),
  passwordValidation('password'),
  nameValidation('firstName'),
  nameValidation('lastName'),
  phoneValidation('phone'),
  body('role')
    .isIn(['MEMBER', 'PARTNER', 'ADMIN'])
    .withMessage('Role must be MEMBER, PARTNER, or ADMIN'),
  validateRequest,
];

// Member validation
export const memberProfileValidation = [
  nameValidation('firstName'),
  nameValidation('lastName'),
  phoneValidation('phone'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  validateRequest,
];

// Partner validation
export const partnerProfileValidation = [
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('businessType')
    .isIn(['HOTEL', 'RESTAURANT', 'GYM', 'SAILING_EQUIPMENT', 'MARINA', 'TRAVEL', 'INSURANCE', 'OTHER'])
    .withMessage('Invalid business type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('zipCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Zip code must be between 5 and 10 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  phoneValidation('phone'),
  urlValidation('website'),
  emailValidation('contactEmail'),
  validateRequest,
];

// Partnership agreement validation
export const partnershipAgreementValidation = [
  body('agreementType')
    .isIn(['STANDARD', 'PREMIUM', 'CUSTOM'])
    .withMessage('Invalid agreement type'),
  body('discountType')
    .isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_ITEM', 'SPECIAL_OFFER'])
    .withMessage('Invalid discount type'),
  body('discountValue')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('terms')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Terms must be less than 1000 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  validateRequest,
];

// Transaction validation
export const transactionValidation = [
  body('memberId')
    .isUUID()
    .withMessage('Member ID must be a valid UUID'),
  body('agreementId')
    .isUUID()
    .withMessage('Agreement ID must be a valid UUID'),
  body('originalAmount')
    .isFloat({ min: 0 })
    .withMessage('Original amount must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters'),
  validateRequest,
];

// QR Code validation
export const qrCodeValidation = [
  body('qrCode')
    .notEmpty()
    .withMessage('QR code is required')
    .isString()
    .withMessage('QR code must be a string'),
  validateRequest,
];

// Pagination validation
export const paginationValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest,
];

// ID parameter validation
export const idParamValidation = [
  body('id')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
  validateRequest,
];
