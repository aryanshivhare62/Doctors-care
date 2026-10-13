const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get all medical departments with doctor counts
 * @route   GET /api/v1/departments
 * @access  Public
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });

    // Aggregate doctor count per department
    const doctorCounts = await Doctor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    doctorCounts.forEach((dc) => {
      countMap[dc._id.toString()] = dc.count;
    });

    const departmentsWithCounts = departments.map((dept) => {
      const deptObj = dept.toObject();
      deptObj.doctorCount = countMap[dept._id.toString()] || 0;
      return deptObj;
    });

    return successResponse(res, 200, 'Departments fetched successfully', departmentsWithCounts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single department by ID or slug with associated doctors
 * @route   GET /api/v1/departments/:id
 * @access  Public
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let department;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      department = await Department.findById(id);
    } else {
      department = await Department.findOne({ slug: id, isActive: true });
    }

    if (!department) {
      return errorResponse(res, 404, 'Department not found.');
    }

    // Get associated doctors
    const doctors = await Doctor.find({
      department: department._id,
      isActive: true,
    }).sort({ rating: -1 });

    const deptData = department.toObject();
    deptData.doctors = doctors;
    deptData.doctorCount = doctors.length;

    return successResponse(res, 200, 'Department details fetched successfully', deptData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create department
 * @route   POST /api/v1/departments
 * @access  Private (Admin only)
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, image, icon, headDoctor, services } = req.body;

    const existing = await Department.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return errorResponse(res, 400, 'Department with this name already exists.');
    }

    const department = await Department.create({
      name,
      description,
      image,
      icon,
      headDoctor,
      services,
    });

    return successResponse(res, 201, 'Department created successfully', department);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department
 * @route   PATCH /api/v1/departments/:id
 * @access  Private (Admin only)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!department) {
      return errorResponse(res, 404, 'Department not found.');
    }

    return successResponse(res, 200, 'Department updated successfully', department);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Deactivate department
 * @route   DELETE /api/v1/departments/:id
 * @access  Private (Admin only)
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return errorResponse(res, 404, 'Department not found.');
    }

    department.isActive = false;
    await department.save();

    return successResponse(res, 200, 'Department deactivated successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
