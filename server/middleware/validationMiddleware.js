const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to check validation results from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return errorResponse(res, 400, 'Validation failed. Please check the input fields.', formattedErrors);
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Role must be patient, doctor, or admin'),
  body('phone')
    .optional()
    .trim(),
  validate,
];

/**
 * Validation rules for user login
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

/**
 * Validation rules for profile updates
 */
const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim(),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say', ''])
    .withMessage('Invalid gender value'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''])
    .withMessage('Invalid blood group'),
  validate,
];

/**
 * Validation rules for creating a doctor
 */
const createDoctorValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Doctor name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Doctor email is required')
    .isEmail()
    .withMessage('Valid email is required'),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isMongoId()
    .withMessage('Invalid department ID'),
  body('specialty')
    .trim()
    .notEmpty()
    .withMessage('Specialty is required'),
  body('experienceYears')
    .notEmpty()
    .withMessage('Years of experience is required')
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  body('consultationFee')
    .notEmpty()
    .withMessage('Consultation fee is required')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  validate,
];

/**
 * Validation rules for department creation/update
 */
const departmentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Department description is required'),
  validate,
];

/**
 * Validation rules for booking an appointment
 */
const bookAppointmentValidator = [
  body('doctor')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid Doctor ID'),
  body('appointmentDate')
    .notEmpty()
    .withMessage('Appointment date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Appointment date must be in YYYY-MM-DD format'),
  body('timeSlot')
    .trim()
    .notEmpty()
    .withMessage('Time slot is required'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason for appointment is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  validate,
];

/**
 * Validation rules for updating appointment status
 */
const updateAppointmentStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Status must be pending, confirmed, completed, or cancelled'),
  validate,
];

/**
 * Validation rules for contact message
 */
const contactValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Subject must be between 2 and 150 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  updateProfileValidator,
  createDoctorValidator,
  departmentValidator,
  bookAppointmentValidator,
  updateAppointmentStatusValidator,
  contactValidator,
};
