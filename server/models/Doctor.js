const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true, // e.g. "09:00 AM"
    },
    endTime: {
      type: String,
      required: true, // e.g. "09:30 AM"
    },
  },
  { _id: false }
);

const dayAvailabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    slots: [timeSlotSchema],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Doctor email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
      index: true,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      hospital: { type: String, default: 'Doctors Cares Main Campus' },
      address: { type: String, default: '100 Medical Center Blvd' },
      city: { type: String, default: 'Metro City' },
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    availability: [dayAvailabilitySchema],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search by doctor name, specialty, or bio
doctorSchema.index({
  name: 'text',
  specialty: 'text',
  'location.city': 'text',
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
