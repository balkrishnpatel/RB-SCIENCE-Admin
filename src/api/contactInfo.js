
import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const ContactInfoAPI = {

  add: async (data) => {
    // Remove any MongoDB-specific fields that might cause issues
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.__v;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;

    return apiCall(API_ENDPOINTS.CONTACT_INFO.ADD, {
      method: 'POST',
      body: cleanData,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Contact Info ID is required for update");

    
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.__v;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;

    return apiCall(API_ENDPOINTS.CONTACT_INFO.UPDATE, {
      method: 'POST',
      body: cleanData,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.CONTACT_INFO.GET_ALL, { method: 'GET' }),

  getActive: () =>
    apiCall(API_ENDPOINTS.CONTACT_INFO.GET_ACTIVE, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.CONTACT_INFO.GET_BY_ID(id), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.CONTACT_INFO.DELETE(id), { method: 'DELETE' }),
};