
import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const TrainingApplicationsAPI = {
  add: async (data) => {
    // ✅ CORRECT - Just pass data object, let fetchHelper handle stringifying
    return apiCall(API_ENDPOINTS.TRAINING_APPLICATIONS.ADD, {
      method: 'POST',
      body: data,  // ✅ Pass object directly
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Application ID is required for update");

    // ✅ CORRECT
    return apiCall(API_ENDPOINTS.TRAINING_APPLICATIONS.UPDATE, {
      method: 'POST',
      body: data,  // ✅ Pass object directly
    });
  },

  updateStatus: async (data) => {
    if (!data.id) throw new Error("Application ID is required for status update");
    if (!data.status) throw new Error("Status is required");

    // ✅ CORRECT
    return apiCall(API_ENDPOINTS.TRAINING_APPLICATIONS.UPDATE_STATUS, {
      method: 'POST',
      body: data,  // ✅ Pass object directly
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.TRAINING_APPLICATIONS.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.TRAINING_APPLICATIONS.GET_BY_ID(id), { method: 'GET' }),

  getByProgram: (programId) =>
    apiCall(API_ENDPOINTS.TRAINING_APPLICATIONS.GET_BY_PROGRAM(programId), { method: 'GET' }),

  getByStatus: (status) =>
    apiCall(API_ENDPOINTS.TRAINING_APPLICATIONS.GET_BY_STATUS(status), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.TRAINING_APPLICATIONS.DELETE(id), { method: 'DELETE' }),
};