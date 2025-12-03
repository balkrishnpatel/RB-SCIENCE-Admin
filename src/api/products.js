import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const ProductsAPI = {

  add: async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price);
    formData.append('originalPrice', data.originalPrice);
    formData.append('unitId', data.unitId);
    formData.append('categoryId', data.categoryId);
    formData.append('rating', data.rating);
    formData.append('reviews', data.reviews);
    formData.append('inStock', data.inStock);
    formData.append('stockCount', data.stockCount);
    formData.append('discount', data.discount);
    formData.append('description', data.description);
    formData.append('longDescription', data.longDescription);
    
    // Handle Thomps fields
    formData.append('thomps', data.thomps);
    formData.append('bestSellingProducts', data.bestSellingProducts);
    formData.append('signatureFlavorsProducts', data.signatureFlavorsProducts);

    // Handle features array
    if (data.features && Array.isArray(data.features)) {
      data.features.forEach((feature, index) => {
        formData.append(`features[${index}]`, feature);
      });
    }

    // Handle specifications object
    if (data.specifications) {
      Object.keys(data.specifications).forEach(key => {
        formData.append(`specifications[${key}]`, data.specifications[key]);
      });
    }

    // Handle benefits array
    if (data.benefits && Array.isArray(data.benefits)) {
      data.benefits.forEach((benefit, index) => {
        formData.append(`benefits[${index}]`, benefit);
      });
    }

    // Handle images
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    return apiCall(API_ENDPOINTS.PRODUCTS.ADD, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Product ID is required for update");

    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('name', data.name);
    formData.append('price', data.price);
    formData.append('originalPrice', data.originalPrice);
    formData.append('unitId', data.unitId);
    formData.append('categoryId', data.categoryId);
    formData.append('rating', data.rating);
    formData.append('reviews', data.reviews);
    formData.append('inStock', data.inStock);
    formData.append('stockCount', data.stockCount);
    formData.append('discount', data.discount);
    formData.append('description', data.description);
    formData.append('longDescription', data.longDescription);
    
    // Handle Thomps fields
    formData.append('thomps', data.thomps);
    formData.append('bestSellingProducts', data.bestSellingProducts);
    formData.append('signatureFlavorsProducts', data.signatureFlavorsProducts);

    // Handle features array
    if (data.features && Array.isArray(data.features)) {
      data.features.forEach((feature, index) => {
        formData.append(`features[${index}]`, feature);
      });
    }

    // Handle specifications object
    if (data.specifications) {
      Object.keys(data.specifications).forEach(key => {
        formData.append(`specifications[${key}]`, data.specifications[key]);
      });
    }

    // Handle benefits array
    if (data.benefits && Array.isArray(data.benefits)) {
      data.benefits.forEach((benefit, index) => {
        formData.append(`benefits[${index}]`, benefit);
      });
    }

    // Handle images
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    return apiCall(API_ENDPOINTS.PRODUCTS.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.PRODUCTS.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id), { method: 'GET' }),

  getByCategory: (categoryId) =>
    apiCall(API_ENDPOINTS.PRODUCTS.GET_BY_CATEGORY(categoryId), { method: 'GET' }),

  getAllWithCategories: () =>
    apiCall(API_ENDPOINTS.PRODUCTS.GET_ALL_WITH_CATEGORIES, { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.PRODUCTS.DELETE(id), { method: 'DELETE' }),

  addImages: (data) => {
    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('name', data.name);
    
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    return apiCall(API_ENDPOINTS.PRODUCTS.ADD_IMAGES, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }
};









