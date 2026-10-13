const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { departmentValidator } = require('../middleware/validationMiddleware');

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

router.post('/', protect, authorizeRoles('admin'), departmentValidator, createDepartment);
router.patch('/:id', protect, authorizeRoles('admin'), updateDepartment);
router.delete('/:id', protect, authorizeRoles('admin'), deleteDepartment);

module.exports = router;
