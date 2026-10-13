const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect, authorizeRoles('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
