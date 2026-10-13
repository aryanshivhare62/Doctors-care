const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Helper to get Day of Week name from YYYY-MM-DD string
const getDayOfWeek = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dateObj.getUTCDay()];
};

/**
 * Get all available slots for a doctor on a specific date
 */
const getDoctorAvailableSlots = async (doctorId, dateString) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const dayOfWeek = getDayOfWeek(dateString);

  // Find schedule for that day of week
  const daySchedule = doctor.availability.find(
    (item) => item.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
  );

  if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
    return {
      dayOfWeek,
      isWorkingDay: false,
      slots: [],
    };
  }

  // Find all active (non-cancelled) bookings for this doctor on this date
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: dateString,
    status: { $ne: 'cancelled' },
  }).select('timeSlot status');

  const bookedSlotSet = new Set(bookedAppointments.map((a) => a.timeSlot));

  const slotsWithStatus = daySchedule.slots.map((s) => {
    const slotLabel = `${s.startTime} - ${s.endTime}`;
    return {
      startTime: s.startTime,
      endTime: s.endTime,
      timeSlot: slotLabel,
      isAvailable: !bookedSlotSet.has(slotLabel),
    };
  });

  return {
    dayOfWeek,
    isWorkingDay: true,
    slots: slotsWithStatus,
  };
};

/**
 * Check if a specific slot is available for booking
 */
const isSlotAvailable = async (doctorId, appointmentDate, timeSlot) => {
  const existing = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    timeSlot,
    status: { $ne: 'cancelled' },
  });

  return !existing;
};

module.exports = {
  getDayOfWeek,
  getDoctorAvailableSlots,
  isSlotAvailable,
};
