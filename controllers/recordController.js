const recordService = require('../services/recordService');

const getRecords = async (req, res, next) => {
  try {
    const result = await recordService.getAllRecords(req.query, req.user);
    res.status(200).json({
      success: true,
      count: result.records.length,
      pagination: result.pagination,
      data: result.records,
    });
  } catch (error) {
    next(error);
  }
};

const getRecord = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const createRecord = async (req, res, next) => {
  try {
    // Inject createdBy into body
    req.body.createdBy = req.user.id;
    const record = await recordService.createRecord(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};
