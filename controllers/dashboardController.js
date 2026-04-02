const dashboardService = require('../services/dashboardService');

const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

const getCategoryTotals = async (req, res, next) => {
  try {
    const totals = await dashboardService.getCategoryTotals();
    res.status(200).json({ success: true, data: totals });
  } catch (error) {
    next(error);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await dashboardService.getMonthlyTrends();
    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getCategoryTotals,
  getMonthlyTrends,
};
