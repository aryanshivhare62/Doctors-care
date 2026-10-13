import axiosClient from './axiosClient';

export const departmentService = {
  getDepartments: () => axiosClient.get('/departments'),
  getDepartmentById: (id) => axiosClient.get(`/departments/${id}`),
  createDepartment: (data) => axiosClient.post('/departments', data),
  updateDepartment: (id, data) => axiosClient.patch(`/departments/${id}`, data),
  deleteDepartment: (id) => axiosClient.delete(`/departments/${id}`),
};
