const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const appointmentService = require('../services/appointmentService');

/**
 * @desc    Book a new appointment
 * @route   POST /api/v1/appointments
 * @access  Private (Patient, Doctor, Admin)
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { doctor: doctorId, appointmentDate, timeSlot, reason, patientNotes } = req.body;
    const patientId = req.user._id;

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return errorResponse(res, 404, 'Doctor not found or currently inactive.');
    }

    // Verify date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) {
      return errorResponse(res, 400, 'Cannot book an appointment for a past date.');
    }

    // Verify day of week schedule
    const dayOfWeek = appointmentService.getDayOfWeek(appointmentDate);
    const daySchedule = doctor.availability.find(
      (item) => item.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
      return errorResponse(
        res,
        400,
        `Doctor is not available on ${dayOfWeek}s. Please pick another date.`
      );
    }

    // Verify slot is offered by the doctor
    const slotExists = daySchedule.slots.some(
      (s) => `${s.startTime} - ${s.endTime}` === timeSlot
    );
    if (!slotExists) {
      return errorResponse(
        res,
        400,
        `The requested slot "${timeSlot}" is not on Dr. ${doctor.name}'s schedule for ${dayOfWeek}.`
      );
    }

    // Check slot availability
    const isAvailable = await appointmentService.isSlotAvailable(doctorId, appointmentDate, timeSlot);
    if (!isAvailable) {
      return errorResponse(
        res,
        409,
        `The time slot "${timeSlot}" on ${appointmentDate} is already booked. Please choose another slot.`
      );
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      department: doctor.department,
      appointmentDate,
      timeSlot,
      reason,
      patientNotes: patientNotes || '',
      status: 'pending',
    });

    await appointment.populate([
      { path: 'doctor', select: 'name specialty avatar consultationFee location' },
      { path: 'department', select: 'name slug icon' },
      { path: 'patient', select: 'name email phone' },
    ]);

    return successResponse(
      res,
      201,
      'Appointment successfully requested! You can track its status in your dashboard.',
      appointment
    );
  } catch (error) {
    // Catch unique index conflict race condition
    if (error.code === 11000) {
      return errorResponse(
        res,
        409,
        'This appointment slot was just reserved by another patient. Please select an alternate slot.'
      );
    }
    next(error);
  }
};

/**
 * @desc    Get appointments for the logged-in patient
 * @route   GET /api/v1/appointments/my
 * @access  Private (Patient)
 */
const getMyPatientAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { patient: req.user._id };

    if (status) {
      query.status = status;
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageLimit;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialty avatar consultationFee location phone email')
      .populate('department', 'name slug icon')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    return successResponse(res, 200, 'Patient appointments fetched', appointments, {
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
 * @desc    Get appointments assigned to logged-in doctor
 * @route   GET /api/v1/appointments/doctor
 * @access  Private (Doctor)
 */
const getMyDoctorAppointments = async (req, res, next) => {
  try {
    // Find doctor record linked to this user
    const doctor = await Doctor.findOne({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    });

    if (!doctor) {
      return errorResponse(res, 404, 'No doctor profile linked to this user account.');
    }

    const { status, date, page = 1, limit = 10 } = req.query;
    const query = { doctor: doctor._id };

    if (status) {
      query.status = status;
    }
    if (date) {
      query.appointmentDate = date;
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageLimit;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone gender bloodGroup dateOfBirth avatar')
      .populate('department', 'name slug')
      .sort({ appointmentDate: 1, timeSlot: 1 })
      .skip(skip)
      .limit(pageLimit);

    return successResponse(res, 200, 'Doctor appointments fetched', appointments, {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageLimit),
      limit: pageLimit,
      doctorId: doctor._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments (Admin)
 * @route   GET /api/v1/appointments
 * @access  Private (Admin)
 */
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, doctor, date, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (date) query.appointmentDate = date;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageLimit;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialty avatar consultationFee')
      .populate('patient', 'name email phone')
      .populate('department', 'name')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    return successResponse(res, 200, 'All appointments fetched', appointments, {
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
 * @desc    Get single appointment by ID
 * @route   GET /api/v1/appointments/:id
 * @access  Private (Patient owner, assigned Doctor, or Admin)
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor')
      .populate('patient', '-passwordHash')
      .populate('department');

    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found.');
    }

    // Authorization check
    const isOwner = appointment.patient._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isAssignedDoctor =
      req.user.role === 'doctor' &&
      appointment.doctor &&
      (appointment.doctor.email === req.user.email ||
        (appointment.doctor.user && appointment.doctor.user.toString() === req.user._id.toString()));

    if (!isOwner && !isAdmin && !isAssignedDoctor) {
      return errorResponse(res, 403, 'You are not authorized to view this appointment.');
    }

    return successResponse(res, 200, 'Appointment details fetched', appointment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment status (confirmed, completed, etc.)
 * @route   PATCH /api/v1/appointments/:id/status
 * @access  Private (Doctor or Admin)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, doctorNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('doctor');

    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found.');
    }

    // Role check: Admin or the assigned doctor
    const isAdmin = req.user.role === 'admin';
    const isAssignedDoctor =
      req.user.role === 'doctor' &&
      appointment.doctor &&
      (appointment.doctor.email === req.user.email ||
        (appointment.doctor.user && appointment.doctor.user.toString() === req.user._id.toString()));

    if (!isAdmin && !isAssignedDoctor) {
      return errorResponse(res, 403, 'Only the assigned doctor or an administrator can update status.');
    }

    appointment.status = status;
    if (doctorNotes !== undefined) {
      appointment.doctorNotes = doctorNotes;
    }

    await appointment.save();

    return successResponse(res, 200, `Appointment status updated to '${status}'.`, appointment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an appointment
 * @route   PATCH /api/v1/appointments/:id/cancel
 * @access  Private (Patient owner, assigned Doctor, or Admin)
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('doctor');

    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found.');
    }

    if (appointment.status === 'cancelled') {
      return errorResponse(res, 400, 'This appointment is already cancelled.');
    }

    if (appointment.status === 'completed') {
      return errorResponse(res, 400, 'Completed appointments cannot be cancelled.');
    }

    // Permissions check
    const isOwner = appointment.patient.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isAssignedDoctor =
      req.user.role === 'doctor' &&
      appointment.doctor &&
      (appointment.doctor.email === req.user.email ||
        (appointment.doctor.user && appointment.doctor.user.toString() === req.user._id.toString()));

    if (!isOwner && !isAdmin && !isAssignedDoctor) {
      return errorResponse(res, 403, 'You are not authorized to cancel this appointment.');
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || 'Cancelled by user';
    appointment.cancelledBy = req.user._id;

    await appointment.save();

    return successResponse(res, 200, 'Appointment has been cancelled successfully.', appointment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyPatientAppointments,
  getMyDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};
