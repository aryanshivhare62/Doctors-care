import axiosClient from './axiosClient';

export const authService = {
  register: (userData) => axiosClient.post('/auth/register', userData),
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  logout: () => axiosClient.post('/auth/logout'),
  getMe: () => axiosClient.get('/auth/me'),
  updateProfile: (profileData) => axiosClient.patch('/auth/profile', profileData),
  changePassword: (passwords) => axiosClient.patch('/auth/change-password', passwords),
};
