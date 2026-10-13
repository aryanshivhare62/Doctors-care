const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getFeaturedDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createDoctorValidator,
} = require('../middleware/validationMiddleware');

router.get('/', getDoctors);
router.get('/featured', getFeaturedDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

router.post('/', protect, authorizeRoles('admin'), createDoctorValidator, createDoctor);
router.patch('/:id', protect, authorizeRoles('admin', 'doctor'), updateDoctor);
router.delete('/:id', protect, authorizeRoles('admin'), deleteDoctor);

module.exports = router;
