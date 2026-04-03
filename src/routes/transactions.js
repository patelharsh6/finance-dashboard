const router = require('express').Router()
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController')
const { protect } = require('../middleware/auth')
const { requireLevel, allowRoles } = require('../middleware/roles')

// all routes require authentication
router.use(protect)

router.get('/', requireLevel('viewer'), getTransactions)            // viewer, analyst, admin
router.get('/:id', requireLevel('viewer'), getTransactionById)     // viewer, analyst, admin
router.post('/', requireLevel('analyst'), createTransaction)       // analyst, admin only
router.put('/:id', requireLevel('analyst'), updateTransaction)     // analyst, admin only
router.delete('/:id', allowRoles('admin'), deleteTransaction)      // admin only

module.exports = router