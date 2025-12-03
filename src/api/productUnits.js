import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const ProductUnitsAPI = {
  
  add: async (data) => {
    return apiCall(API_ENDPOINTS.PRODUCT_UNITS.ADD, {
      method: 'POST',
      body: data,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Unit ID is required for update");
    
    return apiCall(API_ENDPOINTS.PRODUCT_UNITS.UPDATE, {
      method: 'POST',
      body: data,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.PRODUCT_UNITS.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.PRODUCT_UNITS.GET_BY_ID(id), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.PRODUCT_UNITS.DELETE(id), { method: 'DELETE' }),
};