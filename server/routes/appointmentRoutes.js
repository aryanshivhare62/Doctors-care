const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyPatientAppointments,
  getMyDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  bookAppointmentValidator,
  updateAppointmentStatusValidator,
} = require('../middleware/validationMiddleware');

// Book appointment (authenticated patient, doctor, or admin)
router.post('/', protect, bookAppointmentValidator, bookAppointment);

// Patient's own appointments
router.get('/my', protect, getMyPatientAppointments);

// Doctor's assigned appointments
router.get('/doctor', protect, authorizeRoles('doctor', 'admin'), getMyDoctorAppointments);

// Admin view all appointments
router.get('/', protect, authorizeRoles('admin'), getAllAppointments);

// Single appointment view
router.get('/:id', protect, getAppointmentById);

// Update status (confirmed, completed, etc.)
router.patch('/:id/status', protect, authorizeRoles('doctor', 'admin'), updateAppointmentStatusValidator, updateAppointmentStatus);

// Cancel appointment
router.patch('/:id/cancel', protect, cancelAppointment);

module.exports = router;
