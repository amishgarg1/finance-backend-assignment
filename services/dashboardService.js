const Record = require('../models/Record');

const getSummary = async () => {
  const summary = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpense: 1,
        netBalance: { $subtract: ['$totalIncome', '$totalExpense'] },
      },
    },
  ]);

  return summary.length > 0 ? summary[0] : { totalIncome: 0, totalExpense: 0, netBalance: 0 };
};

const getCategoryTotals = async () => {
  return await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        type: '$_id.type',
        category: '$_id.category',
        totalAmount: 1,
      },
    },
    { $sort: { type: 1, totalAmount: -1 } },
  ]);
};

const getMonthlyTrends = async () => {
  return await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        income: 1,
        expense: 1,
        net: { $subtract: ['$income', '$expense'] },
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
};
