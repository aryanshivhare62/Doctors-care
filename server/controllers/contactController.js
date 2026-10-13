const ContactMessage = require('../models/ContactMessage');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Submit a contact inquiry
 * @route   POST /api/v1/contact
 * @access  Public
 */
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    return successResponse(
      res,
      201,
      'Thank you for reaching out! Your message has been received and our team will get back to you shortly.',
      contactMessage
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all contact messages (Admin)
 * @route   GET /api/v1/contact
 * @access  Private (Admin)
 */
const getAllContactMessages = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageLimit;

    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    return successResponse(res, 200, 'Contact messages fetched successfully', messages, {
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
 * @desc    Update contact message status (Admin)
 * @route   PATCH /api/v1/contact/:id
 * @access  Private (Admin)
 */
const updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return errorResponse(res, 404, 'Contact inquiry not found.');
    }

    return successResponse(res, 200, 'Message status updated', message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  updateMessageStatus,
};
