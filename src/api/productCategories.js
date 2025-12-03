import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';


export const ProductCategoriesAPI = {

  add: async (data) => {
    
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);

    if (data.icon instanceof File) {
      console.log("Yes icon is present"); 
      formData.append('icon', data.icon);
    }
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.PRODUCTS_CATEGORIES.ADD, {
      method: 'POST',
      body:formData,
      isFormData: true,
    });
  },

  
  update: async (data) => {
     if (!data.id) throw new Error("Category ID is required for update");

    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('title', data.title);
    formData.append('description', data.description);

    if (data.icon instanceof File) {
      formData.append('icon', data.icon);
    }
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.PRODUCTS_CATEGORIES.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  
  getAll: () =>
    apiCall(API_ENDPOINTS.PRODUCTS_CATEGORIES.GET_ALL, { method: 'GET' }),

  
  getById: (id) =>
    apiCall(API_ENDPOINTS.PRODUCTS_CATEGORIES.GET_BY_ID(id), { method: 'GET' }),

  
  delete: (id) =>
    apiCall(API_ENDPOINTS.PRODUCTS_CATEGORIES.DELETE(id), { method: 'DELETE' }),
};
