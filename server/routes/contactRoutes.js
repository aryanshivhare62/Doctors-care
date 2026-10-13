const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getAllContactMessages,
  updateMessageStatus,
} = require('../controllers/contactController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { contactValidator } = require('../middleware/validationMiddleware');

router.post('/', contactValidator, submitContactMessage);
router.get('/', protect, authorizeRoles('admin'), getAllContactMessages);
router.patch('/:id', protect, authorizeRoles('admin'), updateMessageStatus);

module.exports = router;
