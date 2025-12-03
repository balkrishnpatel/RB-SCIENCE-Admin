import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const CurrenciesAPI = {
  add: async (data) => {
    return apiCall(API_ENDPOINTS.CURRENCIES.ADD, {
      method: 'POST',
      body: data,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Currency ID is required for update");
    
    return apiCall(API_ENDPOINTS.CURRENCIES.UPDATE, {
      method: 'POST',
      body: data,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.CURRENCIES.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.CURRENCIES.GET_BY_ID(id), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.CURRENCIES.DELETE(id), { method: 'DELETE' }),
};