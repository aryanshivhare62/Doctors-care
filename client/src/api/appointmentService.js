import axiosClient from './axiosClient';

export const appointmentService = {
  bookAppointment: (data) => axiosClient.post('/appointments', data),
  getMyPatientAppointments: (params = {}) => axiosClient.get('/appointments/my', { params }),
  getMyDoctorAppointments: (params = {}) => axiosClient.get('/appointments/doctor', { params }),
  getAllAppointments: (params = {}) => axiosClient.get('/appointments', { params }),
  getAppointmentById: (id) => axiosClient.get(`/appointments/${id}`),
  updateAppointmentStatus: (id, data) => axiosClient.patch(`/appointments/${id}/status`, data),
  cancelAppointment: (id, cancellationReason) => axiosClient.patch(`/appointments/${id}/cancel`, { cancellationReason }),
};
