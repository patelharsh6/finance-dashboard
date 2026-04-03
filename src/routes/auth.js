const router = require('express').Router()
const { register, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)  // any logged-in user can see their own profile

module.exports = router