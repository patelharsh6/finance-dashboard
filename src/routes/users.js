const router = require('express').Router()
const { getUsers, toggleActive, changeRole } = require('../controllers/userController')
const { protect } = require('../middleware/auth')
const { allowRoles } = require('../middleware/roles')
const validate = require('../middleware/validate')
const { changeRoleRules, toggleActiveRules } = require('../validators/userValidators')

router.use(protect, allowRoles('admin'))

router.get('/', getUsers)
router.patch('/:id/toggle-active', toggleActiveRules, validate, toggleActive)
router.patch('/:id/role', changeRoleRules, validate, changeRole)

module.exports = router