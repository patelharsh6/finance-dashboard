const {
  getSummaryStats,
  getCategoryBreakdown,
  getMonthlyTrends
} = require('../services/dashboardService')

const getSummary = async (req, res, next) => {
  try {
    const data = await getSummaryStats()
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

const getCategoryBreakdownHandler = async (req, res, next) => {
  try {
    const data = await getCategoryBreakdown(req.query.type)
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

const getTrends = async (req, res, next) => {
  try {
    const data = await getMonthlyTrends(req.query.year)
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = { getSummary, getCategoryBreakdown: getCategoryBreakdownHandler, getTrends }