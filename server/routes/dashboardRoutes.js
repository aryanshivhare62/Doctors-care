const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getDoctorStats,
  getPatientStats,
} = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorizeRoles('admin'), getAdminStats);
router.get('/doctor', protect, authorizeRoles('doctor', 'admin'), getDoctorStats);
router.get('/patient', protect, authorizeRoles('patient', 'admin'), getPatientStats);

module.exports = router;
