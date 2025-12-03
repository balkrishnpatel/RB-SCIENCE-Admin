

import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const ServicesAPI = {
  // Add new service
  add: async (data) => {
    return apiCall(API_ENDPOINTS.SERVICES.ADD, {
      method: 'POST',
      body: data, // ✅ No JSON.stringify - fetchHelper will handle it
    });
  },

  // Update existing service
  update: async (data) => {
    if (!data.id) throw new Error("Service ID is required for update");
    
    return apiCall(API_ENDPOINTS.SERVICES.UPDATE, {
      method: 'POST',
      body: data, // ✅ No JSON.stringify - fetchHelper will handle it
    });
  },

  // Get all services
  getAll: () =>
    apiCall(API_ENDPOINTS.SERVICES.GET_ALL, { method: 'GET' }),

  // Get active services only
  getActive: () =>
    apiCall(API_ENDPOINTS.SERVICES.GET_ACTIVE, { method: 'GET' }),

  // Get service by ID
  getById: (id) =>
    apiCall(API_ENDPOINTS.SERVICES.GET_BY_ID(id), { method: 'GET' }),

  // Delete service
  delete: (id) =>
    apiCall(API_ENDPOINTS.SERVICES.DELETE(id), { method: 'DELETE' }),
};

export const ServiceCategoriesAPI = {
  // Add new service category
  add: async (data) => {
    return apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.ADD, {
      method: 'POST',
      body: data, // ✅ No JSON.stringify
    });
  },

  // Update existing service category
  update: async (data) => {
    if (!data.id) throw new Error("Category ID is required for update");
    
    return apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.UPDATE, {
      method: 'POST',
      body: data, // ✅ No JSON.stringify
    });
  },

  // Get all service categories
  getAll: () =>
    apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.GET_ALL, { method: 'GET' }),

  // Get service category by ID
  getById: (id) =>
    apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.GET_BY_ID(id), { method: 'GET' }),

  // Get categories by service ID
  getByService: (serviceId) =>
    apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.GET_BY_SERVICE(serviceId), { method: 'GET' }),

  // Get active categories by service ID
  getByServiceActive: (serviceId) =>
    apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.GET_BY_SERVICE_ACTIVE(serviceId), { method: 'GET' }),

  // Delete service category
  delete: (id) =>
    apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.DELETE(id), { method: 'DELETE' }),
};

export const ServiceDetailsAPI = {
  // Add new service detail
  add: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('service_category_id', data.service_category_id);
    
    // Handle featured array
    if (Array.isArray(data.featured)) {
      formData.append('featured', JSON.stringify(data.featured));
    } else if (typeof data.featured === 'string') {
      formData.append('featured', data.featured);
    }
    
    // Handle long_description array
    if (Array.isArray(data.long_description)) {
      formData.append('long_description', JSON.stringify(data.long_description));
    } else if (typeof data.long_description === 'string') {
      formData.append('long_description', data.long_description);
    }
    
    // Handle image file
    if (data.image_url instanceof File) {
      formData.append('image_url', data.image_url);
    }

    return apiCall(API_ENDPOINTS.SERVICE_DETAILS.ADD, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  // Update existing service detail
  update: async (data) => {
    if (!data.id) throw new Error("Service Detail ID is required for update");

    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('service_category_id', data.service_category_id);
    
    // Handle featured array
    if (Array.isArray(data.featured)) {
      formData.append('featured', JSON.stringify(data.featured));
    } else if (typeof data.featured === 'string') {
      formData.append('featured', data.featured);
    }
    
    // Handle long_description array
    if (Array.isArray(data.long_description)) {
      formData.append('long_description', JSON.stringify(data.long_description));
    } else if (typeof data.long_description === 'string') {
      formData.append('long_description', data.long_description);
    }
    
    // Handle image file (optional on update)
    if (data.image_url instanceof File) {
      formData.append('image_url', data.image_url);
    }

    return apiCall(API_ENDPOINTS.SERVICE_DETAILS.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  // Get all service details
  getAll: () =>
    apiCall(API_ENDPOINTS.SERVICE_DETAILS.GET_ALL, { method: 'GET' }),

  // Get service detail by ID
  getById: (id) =>
    apiCall(API_ENDPOINTS.SERVICE_DETAILS.GET_BY_ID(id), { method: 'GET' }),

  // Get service details by category ID
  getByCategory: (categoryId) =>
    apiCall(API_ENDPOINTS.SERVICE_DETAILS.GET_BY_CATEGORY(categoryId), { method: 'GET' }),

  // Delete service detail
  delete: (id) =>
    apiCall(API_ENDPOINTS.SERVICE_DETAILS.DELETE(id), { method: 'DELETE' }),
};