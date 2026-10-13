import axiosClient from './axiosClient';

export const dashboardService = {
  getAdminStats: () => axiosClient.get('/dashboard/admin'),
  getDoctorStats: () => axiosClient.get('/dashboard/doctor'),
  getPatientStats: () => axiosClient.get('/dashboard/patient'),
};
