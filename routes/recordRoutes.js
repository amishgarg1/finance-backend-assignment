const express = require('express');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getRecords)
  .post(authorize('analyst', 'admin'), createRecord);

router.route('/:id')
  .get(getRecord)
  .put(authorize('analyst', 'admin'), updateRecord)
  .delete(authorize('analyst', 'admin'), deleteRecord);

module.exports = router;
