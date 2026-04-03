const Transaction = require('../models/Transaction')

// build a filter object from query params
const buildFilter = ({ type, category, startDate, endDate }) => {
  const filter = {}

  if (type) filter.type = type
  if (category) filter.category = new RegExp(category, 'i')  // case-insensitive match

  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = new Date(startDate)
    if (endDate) filter.date.$lte = new Date(endDate)
  }

  return filter
}

const fetchTransactions = async (query) => {
  const { page = 1, limit = 10, sortBy = 'date', order = 'desc', ...rest } = query
  const filter = buildFilter(rest)

  const skip = (Number(page) - 1) * Number(limit)
  const sortOrder = order === 'asc' ? 1 : -1

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email role'),
    Transaction.countDocuments(filter)
  ])

  return {
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    transactions
  }
}

const fetchTransactionById = async (id) => {
  const tx = await Transaction.findById(id).populate('createdBy', 'name email role')
  if (!tx) {
    const err = new Error('Transaction not found')
    err.status = 404
    throw err
  }
  return tx
}

const createTransaction = async (data, userId) => {
  return Transaction.create({ ...data, createdBy: userId })
}

const updateTransaction = async (id, data) => {
  // don't allow changing createdBy or isDeleted through this route
  const { createdBy, isDeleted, ...safeData } = data

  const tx = await Transaction.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true
  })

  if (!tx) {
    const err = new Error('Transaction not found')
    err.status = 404
    throw err
  }

  return tx
}

const softDeleteTransaction = async (id) => {
  // bypass the pre-find hook by using findOneAndUpdate with isDeleted check
  const tx = await Transaction.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  )

  if (!tx) {
    const err = new Error('Transaction not found or already deleted')
    err.status = 404
    throw err
  }

  return tx
}

module.exports = {
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  softDeleteTransaction
}