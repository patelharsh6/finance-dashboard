const Transaction = require('../models/Transaction')

const getSummaryStats = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ])

  const summary = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 }

  result.forEach(({ _id, total, count }) => {
    if (_id === 'income') { summary.income = total; summary.incomeCount = count }
    if (_id === 'expense') { summary.expense = total; summary.expenseCount = count }
  })

  summary.netBalance = summary.income - summary.expense

  return summary
}

const getCategoryBreakdown = async (type) => {
  const match = { isDeleted: false }
  if (type) match.type = type

  return Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        type: { $first: '$type' }
      }
    },
    { $sort: { total: -1 } },
    { $project: { category: '$_id', total: 1, count: 1, type: 1, _id: 0 } }
  ])
}

const getMonthlyTrends = async (year) => {
  const matchYear = year ? Number(year) : new Date().getFullYear()

  return Transaction.aggregate([
    {
      $match: {
        isDeleted: false,
        date: {
          $gte: new Date(`${matchYear}-01-01`),
          $lte: new Date(`${matchYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.month': 1 } },
    {
      $project: {
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
        _id: 0
      }
    }
  ])
}

module.exports = { getSummaryStats, getCategoryBreakdown, getMonthlyTrends }