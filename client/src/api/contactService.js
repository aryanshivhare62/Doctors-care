import axiosClient from './axiosClient';

export const contactService = {
  submitContact: (data) => axiosClient.post('/contact', data),
  getAllMessages: (params = {}) => axiosClient.get('/contact', { params }),
  updateMessageStatus: (id, status) => axiosClient.patch(`/contact/${id}`, { status }),
};
