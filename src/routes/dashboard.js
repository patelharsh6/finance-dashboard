const router = require('express').Router()
const {
  getSummary,
  getCategoryBreakdown,
  getTrends
} = require('../controllers/dashboardController')
const { protect } = require('../middleware/auth')
const { requireLevel } = require('../middleware/roles')

// dashboard is analyst+ only — viewers have no business here
router.use(protect, requireLevel('analyst'))

router.get('/summary', getSummary)
router.get('/categories', getCategoryBreakdown)
router.get('/trends', getTrends)

module.exports = router