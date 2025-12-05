import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const TrainingProgramsAPI = {
  add: async (data) => {
    const formData = new FormData();
    
    // Basic fields
    formData.append('title', data.title);
    formData.append('screen_name', data.screen_name);
    formData.append('description', data.description);
    formData.append('weeks', data.weeks);
    formData.append('fees', data.fees);
    formData.append('isActive', data.isActive);
    
    // Features as JSON array string
    formData.append('features', JSON.stringify(data.features));
    
    // Image file
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.TRAINING_PROGRAMS.ADD, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Program ID is required for update");

    const formData = new FormData();
    
    formData.append('id', data.id);
    formData.append('title', data.title);
    formData.append('screen_name', data.screen_name);
    formData.append('description', data.description);
    formData.append('weeks', data.weeks);
    formData.append('fees', data.fees);
    formData.append('isActive', data.isActive);
    
    // Features as JSON array string
    formData.append('features', JSON.stringify(data.features));
    
    // Image file (only if new image uploaded)
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.TRAINING_PROGRAMS.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.TRAINING_PROGRAMS.GET_ALL, { method: 'GET' }),

  getActive: () =>
    apiCall(API_ENDPOINTS.TRAINING_PROGRAMS.GET_ACTIVE, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.TRAINING_PROGRAMS.GET_BY_ID(id), { method: 'GET' }),

  getByScreen: (screenName) =>
    apiCall(API_ENDPOINTS.TRAINING_PROGRAMS.GET_BY_SCREEN(screenName), { method: 'GET' }),

  getByScreenActive: (screenName) =>
    apiCall(API_ENDPOINTS.TRAINING_PROGRAMS.GET_BY_SCREEN_ACTIVE(screenName), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.TRAINING_PROGRAMS.DELETE(id), { method: 'DELETE' }),
};