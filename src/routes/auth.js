const router = require('express').Router()
const { register, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { registerRules, loginRules } = require('../validators/authValidators')

router.post('/register', registerRules, validate, register)
router.post('/login', loginRules, validate, login)
router.get('/me', protect, getMe)

module.exports = router