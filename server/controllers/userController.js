const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get all users with filtering, search, and pagination
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, q, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageLimit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    return successResponse(res, 200, 'Users fetched successfully', users, {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageLimit),
      limit: pageLimit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }
    return successResponse(res, 200, 'User details fetched', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role or status
 * @route   PATCH /api/v1/users/:id
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};

    if (role) {
      if (!['patient', 'doctor', 'admin'].includes(role)) {
        return errorResponse(res, 400, 'Invalid role specification.');
      }
      updates.role = role;
    }

    if (typeof isActive === 'boolean') {
      updates.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    return successResponse(res, 200, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate user account
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot deactivate your own admin account.');
    }

    user.isActive = false;
    await user.save();

    return successResponse(res, 200, 'User account deactivated.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
