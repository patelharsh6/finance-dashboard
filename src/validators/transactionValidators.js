const { body, query, param } = require('express-validator')

const createRules = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 50 }).withMessage('Category too long'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),

  body('notes')
    .optional()
    .isLength({ max: 300 }).withMessage('Notes cannot exceed 300 characters')
]

// for updates most fields are optional — you might only update notes or amount
const updateRules = [
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),

  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category too long'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),

  body('notes')
    .optional()
    .isLength({ max: 300 }).withMessage('Notes cannot exceed 300 characters')
]

const filterRules = [
  query('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type filter must be income or expense'),

  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate must be a valid date'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
]

const mongoIdRule = [
  param('id').isMongoId().withMessage('Invalid transaction ID')
]

module.exports = { createRules, updateRules, filterRules, mongoIdRule }