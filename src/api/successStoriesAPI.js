import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const SuccessStoriesAPI = {
  add: async (data) => {
    const formData = new FormData();
    
    // Basic fields
    formData.append('name', data.name);
    formData.append('position', data.position);
    formData.append('description', data.description);
    formData.append('isActive', data.isActive);
    
    // Image file
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.SUCCESS_STORIES.ADD, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Success story ID is required for update");

    const formData = new FormData();
    
    formData.append('id', data.id);
    formData.append('name', data.name);
    formData.append('position', data.position);
    formData.append('description', data.description);
    formData.append('isActive', data.isActive);
    
    // Image file (only if new image is uploaded)
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.SUCCESS_STORIES.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.SUCCESS_STORIES.GET_ALL, { method: 'GET' }),

  getActive: () =>
    apiCall(API_ENDPOINTS.SUCCESS_STORIES.GET_ACTIVE, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.SUCCESS_STORIES.GET_BY_ID(id), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.SUCCESS_STORIES.DELETE(id), { method: 'DELETE' }),
};