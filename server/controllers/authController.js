const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { sendTokenResponse, clearTokenCookie } = require('../utils/jwtUtils');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, gender, bloodGroup } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email address already exists.');
    }

    // Role safety: Normal public registrations can register as 'patient' or 'doctor'
    // 'admin' role cannot be self-assigned publicly unless there are no admins in the DB yet
    let assignedRole = role || 'patient';
    if (assignedRole === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0 && (!req.user || req.user.role !== 'admin')) {
        assignedRole = 'patient';
      }
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: assignedRole,
      phone: phone || '',
      gender: gender || '',
      bloodGroup: bloodGroup || '',
    });

    return sendTokenResponse(user, 201, res, 'Registration successful. Welcome to Doctors Cares!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    return sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  clearTokenCookie(res);
  return successResponse(res, 200, 'Logged out successfully.');
};

/**
 * @desc    Get currently logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete user.passwordHash;

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({
        $or: [{ user: user._id }, { email: user.email }],
      }).populate('department', 'name slug');
    }

    return successResponse(res, 200, 'User profile fetched successfully', {
      user,
      doctorProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update personal profile
 * @route   PATCH /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'gender', 'dateOfBirth', 'bloodGroup', 'address', 'avatar'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    return successResponse(res, 200, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Please provide both current and new password.');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long.');
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return errorResponse(res, 400, 'Current password is incorrect.');
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    return successResponse(res, 200, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
