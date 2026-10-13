const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const appointmentService = require('../services/appointmentService');

/**
 * @desc    Get all doctors with filtering, search, and pagination
 * @route   GET /api/v1/doctors
 * @access  Public
 */
const getDoctors = async (req, res, next) => {
  try {
    const {
      q,
      department,
      specialty,
      city,
      minRating,
      maxFee,
      isFeatured,
      sortBy,
      page = 1,
      limit = 8,
    } = req.query;

    const query = { isActive: true };

    // Search query
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { name: searchRegex },
        { specialty: searchRegex },
        { bio: searchRegex },
        { 'location.city': searchRegex },
        { 'location.hospital': searchRegex },
      ];
    }

    // Filter by department (ID or slug)
    if (department) {
      if (department.match(/^[0-9a-fA-F]{24}$/)) {
        query.department = department;
      } else {
        const deptDoc = await Department.findOne({ slug: department });
        if (deptDoc) {
          query.department = deptDoc._id;
        }
      }
    }

    // Filter by specialty
    if (specialty) {
      query.specialty = new RegExp(`^${specialty}$`, 'i');
    }

    // Filter by city
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    // Filter by rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by consultation fee
    if (maxFee) {
      query.consultationFee = { $lte: parseFloat(maxFee) };
    }

    // Featured only
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOptions = { isFeatured: -1, rating: -1, createdAt: -1 };
    if (sortBy === 'fee_asc') {
      sortOptions = { consultationFee: 1 };
    } else if (sortBy === 'fee_desc') {
      sortOptions = { consultationFee: -1 };
    } else if (sortBy === 'experience_desc') {
      sortOptions = { experienceYears: -1 };
    } else if (sortBy === 'rating_desc') {
      sortOptions = { rating: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageLimit;

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('department', 'name slug icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    return successResponse(
      res,
      200,
      'Doctors fetched successfully',
      doctors,
      {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageLimit),
        limit: pageLimit,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/v1/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      'department',
      'name slug description image icon'
    );

    if (!doctor || !doctor.isActive) {
      return errorResponse(res, 404, 'Doctor not found or profile is inactive.');
    }

    return successResponse(res, 200, 'Doctor profile fetched successfully', doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor available slots for a given date
 * @route   GET /api/v1/doctors/:id/availability?date=YYYY-MM-DD
 * @access  Public
 */
const getDoctorAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return errorResponse(res, 400, 'Valid date query parameter required in YYYY-MM-DD format.');
    }

    const availabilityData = await appointmentService.getDoctorAvailableSlots(
      req.params.id,
      date
    );

    return successResponse(res, 200, 'Doctor availability slots fetched successfully', availabilityData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured doctors for home page
 * @route   GET /api/v1/doctors/featured
 * @access  Public
 */
const getFeaturedDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isActive: true, isFeatured: true })
      .populate('department', 'name slug icon')
      .limit(6)
      .sort({ rating: -1 });

    return successResponse(res, 200, 'Featured doctors fetched successfully', doctors);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new doctor profile
 * @route   POST /api/v1/doctors
 * @access  Private (Admin only)
 */
const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    await doctor.populate('department', 'name slug');

    return successResponse(res, 201, 'Doctor profile created successfully', doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor profile
 * @route   PATCH /api/v1/doctors/:id
 * @access  Private (Admin or linked Doctor)
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor not found.');
    }

    // Role check: Admin can update any doctor; Doctor user can only update their own profile
    if (
      req.user.role !== 'admin' &&
      (!doctor.user || doctor.user.toString() !== req.user._id.toString())
    ) {
      return errorResponse(res, 403, 'You are not authorized to update this doctor profile.');
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('department', 'name slug');

    return successResponse(res, 200, 'Doctor profile updated successfully', updatedDoctor);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Deactivate doctor profile
 * @route   DELETE /api/v1/doctors/:id
 * @access  Private (Admin only)
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor not found.');
    }

    // Soft delete by setting isActive to false
    doctor.isActive = false;
    await doctor.save();

    return successResponse(res, 200, 'Doctor profile deactivated successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getFeaturedDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
