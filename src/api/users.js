import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const UsersAPI = {

  add: async (data) => {
    return apiCall(API_ENDPOINTS.USERS.ADD, {
      method: 'POST',
      body: {
        fullName: data.fullName,
        emailAddress: data.emailAddress,
        mobileNumber: data.mobileNumber,
        address: data.address
      }
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("User ID is required for update");

    return apiCall(API_ENDPOINTS.USERS.UPDATE, {
      method: 'POST',
      body: {
        id: data.id,
        fullName: data.fullName,
        emailAddress: data.emailAddress,
        mobileNumber: data.mobileNumber,
        address: data.address
      }
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.USERS.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.USERS.GET_BY_ID(id), { method: 'GET' }),

  getByEmail: (email) =>
    apiCall(API_ENDPOINTS.USERS.GET_BY_EMAIL(email), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.USERS.DELETE(id), { method: 'DELETE' }),
};