const express = require('express');
const {
  getDashboardSummary,
  getCategoryTotals,
  getMonthlyTrends,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Ensure only analysts and admins can access dashboards
router.use(protect);
router.use(authorize('analyst', 'admin'));

router.get('/summary', getDashboardSummary);
router.get('/category-totals', getCategoryTotals);
router.get('/monthly-trends', getMonthlyTrends);

module.exports = router;
