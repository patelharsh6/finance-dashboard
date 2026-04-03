const {
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  softDeleteTransaction
} = require('../services/transactionService')

const getTransactions = async (req, res, next) => {
  try {
    const result = await fetchTransactions(req.query)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

const getTransactionById = async (req, res, next) => {
  try {
    const tx = await fetchTransactionById(req.params.id)
    res.status(200).json(tx)
  } catch (err) {
    next(err)
  }
}

const createTransactionHandler = async (req, res, next) => {
  try {
    const tx = await createTransaction(req.body, req.user._id)
    res.status(201).json(tx)
  } catch (err) {
    next(err)
  }
}

const updateTransactionHandler = async (req, res, next) => {
  try {
    const tx = await updateTransaction(req.params.id, req.body)
    res.status(200).json(tx)
  } catch (err) {
    next(err)
  }
}

const deleteTransaction = async (req, res, next) => {
  try {
    await softDeleteTransaction(req.params.id)
    res.status(200).json({ message: 'Transaction deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction: createTransactionHandler,
  updateTransaction: updateTransactionHandler,
  deleteTransaction
}