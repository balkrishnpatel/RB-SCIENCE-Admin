import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const CollaborativeProjectsAPI = {
  add: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('university', data.university);
    formData.append('isActive', data.isActive);

    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.COLLABORATIVE_PROJECTS.ADD, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Project ID is required for update");

    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('university', data.university);
    formData.append('isActive', data.isActive);

    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.COLLABORATIVE_PROJECTS.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.COLLABORATIVE_PROJECTS.GET_ALL, { method: 'GET' }),

  getActive: () =>
    apiCall(API_ENDPOINTS.COLLABORATIVE_PROJECTS.GET_ACTIVE, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.COLLABORATIVE_PROJECTS.GET_BY_ID(id), { method: 'GET' }),

  getByUniversity: (university) =>
    apiCall(API_ENDPOINTS.COLLABORATIVE_PROJECTS.GET_BY_UNIVERSITY(university), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.COLLABORATIVE_PROJECTS.DELETE(id), { method: 'DELETE' }),
};