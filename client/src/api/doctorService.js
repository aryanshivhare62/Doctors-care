import axiosClient from './axiosClient';

export const doctorService = {
  getDoctors: (params = {}) => axiosClient.get('/doctors', { params }),
  getFeaturedDoctors: () => axiosClient.get('/doctors/featured'),
  getDoctorById: (id) => axiosClient.get(`/doctors/${id}`),
  getDoctorAvailability: (id, date) => axiosClient.get(`/doctors/${id}/availability`, { params: { date } }),
  createDoctor: (data) => axiosClient.post('/doctors', data),
  updateDoctor: (id, data) => axiosClient.patch(`/doctors/${id}`, data),
  deleteDoctor: (id) => axiosClient.delete(`/doctors/${id}`),
};
