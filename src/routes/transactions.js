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
const validate = require('../middleware/validate')
const { createRules, updateRules, filterRules, mongoIdRule } = require('../validators/transactionValidators')

router.use(protect)

router.get('/', requireLevel('viewer'), filterRules, validate, getTransactions)
router.get('/:id', requireLevel('viewer'), mongoIdRule, validate, getTransactionById)
router.post('/', requireLevel('analyst'), createRules, validate, createTransaction)
router.put('/:id', requireLevel('analyst'), [...mongoIdRule, ...updateRules], validate, updateTransaction)
router.delete('/:id', allowRoles('admin'), mongoIdRule, validate, deleteTransaction)

module.exports = router