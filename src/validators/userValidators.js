const { body, param } = require('express-validator')

const changeRoleRules = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['viewer', 'analyst', 'admin']).withMessage('Role must be viewer, analyst, or admin'),

  param('id').isMongoId().withMessage('Invalid user ID')
]

const toggleActiveRules = [
  param('id').isMongoId().withMessage('Invalid user ID')
]

module.exports = { changeRoleRules, toggleActiveRules }