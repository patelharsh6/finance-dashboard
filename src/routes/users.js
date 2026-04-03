const router = require('express').Router()
const { getUsers, toggleActive, changeRole } = require('../controllers/userController')
const { protect } = require('../middleware/auth')
const { allowRoles } = require('../middleware/roles')

// all user management is admin-only
router.use(protect, allowRoles('admin'))

router.get('/', getUsers)
router.patch('/:id/toggle-active', toggleActive)
router.patch('/:id/role', changeRole)

module.exports = router