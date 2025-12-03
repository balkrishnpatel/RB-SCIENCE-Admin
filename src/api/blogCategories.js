
import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const BlogCategoriesAPI = {

  add: async (data) => {
    return apiCall(API_ENDPOINTS.BLOG_CATEGORIES.ADD, {
      method: 'POST',
      body: { name: data.name }
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Blog Category ID is required for update");

    return apiCall(API_ENDPOINTS.BLOG_CATEGORIES.UPDATE, {
      method: 'POST',
      body: { id: data.id, name: data.name }
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.GET_BY_ID(id), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.DELETE(id), { method: 'DELETE' }),
};