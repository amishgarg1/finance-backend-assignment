const User = require('../models/User');

const getAllUsers = async () => {
  return await User.find({});
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const createUser = async (userData) => {
  const userExists = await User.findOne({ email: userData.email });
  if (userExists) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }
  
  return await User.create(userData);
};

const updateUser = async (id, updateData) => {
  // Prevent password update through this route
  if (updateData.password) {
    delete updateData.password;
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
};
