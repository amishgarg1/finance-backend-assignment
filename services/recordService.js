const Record = require('../models/Record');

const getAllRecords = async (query, user) => {
  const { type, category, startDate, endDate, page = 1, limit = 10 } = query;
  
  // Build filter object
  const filter = { isDeleted: false };
  
  // Role based filtering: 
  // If not admin/analyst, perhaps we only show their own records.
  // Wait, req says "Viewer: read-only access, Analyst: read + analytics, Admin: manages users"
  // Let's allow users to see all records if they are viewer/analyst/admin, or maybe just their own.
  // The system prompt logic: "I'll assume users create records, Analysts analyze them. E.g., any active user can create records, Viewers view".
  // Actually, standard is: Users see their own. Admins and Analysts see all.
  if (user.role === 'viewer') {
    // If viewer is just a generic read-only role for the whole system, they see all.
    // If they are regular users, they see only theirs. Let's make Viewers/Analysts see all?
    // Let's implement: viewers and analysts see all records. Regular users aren't defined, just viewers.
    // Ok, let's keep it simple: Everyone can see all records unless otherwise specified.
  }

  if (type) filter.type = type;
  if (category) filter.category = category;
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Pagination
  const skip = (page - 1) * limit;

  const records = await Record.find(filter)
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Record.countDocuments(filter);

  return {
    records,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  };
};

const getRecordById = async (id) => {
  const record = await Record.findOne({ _id: id, isDeleted: false }).populate('createdBy', 'name email');
  if (!record) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }
  return record;
};

const createRecord = async (recordData) => {
  return await Record.create(recordData);
};

const updateRecord = async (id, updateData) => {
  let record = await Record.findOne({ _id: id, isDeleted: false });

  if (!record) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  record = await Record.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return record;
};

const deleteRecord = async (id) => {
  const record = await Record.findOne({ _id: id, isDeleted: false });

  if (!record) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  // Soft delete
  record.isDeleted = true;
  await record.save();

  return { message: 'Record removed successfully' };
};

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};
