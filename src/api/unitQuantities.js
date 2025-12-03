import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const UnitQuantitiesAPI = {
  add: async (data) => {
    return apiCall(API_ENDPOINTS.UNIT_QUANTITIES.ADD, {
      method: 'POST',
      body: data,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Unit Quantity ID is required for update");
    
    return apiCall(API_ENDPOINTS.UNIT_QUANTITIES.UPDATE, {
      method: 'POST',
      body: data,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.UNIT_QUANTITIES.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.UNIT_QUANTITIES.GET_BY_ID(id), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.UNIT_QUANTITIES.DELETE(id), { method: 'DELETE' }),
};