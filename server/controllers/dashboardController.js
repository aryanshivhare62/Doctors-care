const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const ContactMessage = require('../models/ContactMessage');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get Admin Dashboard Statistics
 * @route   GET /api/v1/dashboard/admin
 * @access  Private (Admin)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      unreadInquiries,
      recentAppointments,
      recentInquiries,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments({ isActive: true }),
      Department.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      ContactMessage.countDocuments({ status: 'unread' }),
      Appointment.find()
        .populate('patient', 'name email')
        .populate('doctor', 'name specialty avatar')
        .populate('department', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5),
    ]);

    return successResponse(res, 200, 'Admin statistics loaded', {
      counts: {
        totalPatients,
        totalDoctors,
        totalDepartments,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        unreadInquiries,
      },
      recentAppointments,
      recentInquiries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Doctor Dashboard Statistics
 * @route   GET /api/v1/dashboard/doctor
 * @access  Private (Doctor)
 */
const getDoctorStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    });

    if (!doctor) {
      return errorResponse(res, 404, 'Doctor profile not found for current user.');
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalAssigned,
      pendingCount,
      confirmedCount,
      completedCount,
      todayAppointments,
      upcomingAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: doctor._id }),
      Appointment.countDocuments({ doctor: doctor._id, status: 'pending' }),
      Appointment.countDocuments({ doctor: doctor._id, status: 'confirmed' }),
      Appointment.countDocuments({ doctor: doctor._id, status: 'completed' }),
      Appointment.find({ doctor: doctor._id, appointmentDate: todayStr })
        .populate('patient', 'name phone email gender bloodGroup avatar')
        .sort({ timeSlot: 1 }),
      Appointment.find({
        doctor: doctor._id,
        appointmentDate: { $gte: todayStr },
        status: { $in: ['pending', 'confirmed'] },
      })
        .populate('patient', 'name phone email gender bloodGroup avatar')
        .sort({ appointmentDate: 1, timeSlot: 1 })
        .limit(8),
    ]);

    return successResponse(res, 200, 'Doctor statistics loaded', {
      doctor,
      counts: {
        totalAssigned,
        pendingCount,
        confirmedCount,
        completedCount,
        todayCount: todayAppointments.length,
      },
      todayAppointments,
      upcomingAppointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Patient Dashboard Statistics
 * @route   GET /api/v1/dashboard/patient
 * @access  Private (Patient)
 */
const getPatientStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const patientId = req.user._id;

    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      nextAppointment,
    ] = await Promise.all([
      Appointment.countDocuments({ patient: patientId }),
      Appointment.countDocuments({
        patient: patientId,
        appointmentDate: { $gte: todayStr },
        status: { $in: ['pending', 'confirmed'] },
      }),
      Appointment.countDocuments({ patient: patientId, status: 'completed' }),
      Appointment.findOne({
        patient: patientId,
        appointmentDate: { $gte: todayStr },
        status: { $in: ['pending', 'confirmed'] },
      })
        .populate('doctor', 'name specialty avatar consultationFee location')
        .populate('department', 'name')
        .sort({ appointmentDate: 1, timeSlot: 1 }),
    ]);

    return successResponse(res, 200, 'Patient statistics loaded', {
      counts: {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
      },
      nextAppointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getDoctorStats,
  getPatientStats,
};
