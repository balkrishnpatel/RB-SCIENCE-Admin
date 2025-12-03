import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const BlogsAPI = {

  add: async (data) => {
    const formData = new FormData();
    
    // Basic fields
    formData.append('name', data.name);
    formData.append('title', data.title);
    formData.append('excerpt', data.excerpt);
    formData.append('author', data.author);
    formData.append('authorRole', data.authorRole);
    formData.append('readTime', data.readTime);
    formData.append('categoryId', data.categoryId);
    formData.append('views', data.views || '0');
    formData.append('likes', data.likes || '0');
    formData.append('comments', data.comments || '0');
    formData.append('isActive', data.isActive ? 'true' : 'false');
    formData.append('featured', data.featured ? 'true' : 'false');

    // Handle content array
    if (data.content && Array.isArray(data.content)) {
      data.content.forEach((item, index) => {
        formData.append(`content[${index}][heading]`, item.heading);
        formData.append(`content[${index}][para]`, item.para);
      });
    }

    // Handle tags array
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }

    // Handle file uploads
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    if (data.authorImage instanceof File) {
      formData.append('authorImage', data.authorImage);
    }

    return apiCall(API_ENDPOINTS.BLOGS.ADD, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Blog ID is required for update");

    const formData = new FormData();
    
    formData.append('id', data.id);
    formData.append('name', data.name);
    formData.append('title', data.title);
    formData.append('excerpt', data.excerpt);
    formData.append('author', data.author);
    formData.append('authorRole', data.authorRole);
    formData.append('readTime', data.readTime);
    formData.append('categoryId', data.categoryId);
    formData.append('views', data.views || '0');
    formData.append('likes', data.likes || '0');
    formData.append('comments', data.comments || '0');
    formData.append('isActive', data.isActive ? 'true' : 'false');
    formData.append('featured', data.featured ? 'true' : 'false');

    // Handle content array
    if (data.content && Array.isArray(data.content)) {
      data.content.forEach((item, index) => {
        formData.append(`content[${index}][heading]`, item.heading);
        formData.append(`content[${index}][para]`, item.para);
      });
    }

    // Handle tags array
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }

    // Handle file uploads
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    if (data.authorImage instanceof File) {
      formData.append('authorImage', data.authorImage);
    }

    return apiCall(API_ENDPOINTS.BLOGS.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.BLOGS.GET_ALL, { method: 'GET' }),

  getFeatured: () =>
    apiCall(API_ENDPOINTS.BLOGS.GET_FEATURED, { method: 'GET' }),

  getAllActive: () =>
    apiCall(API_ENDPOINTS.BLOGS.GET_ALL_ACTIVE, { method: 'GET' }),

  getByCategory: (categoryId) =>
    apiCall(API_ENDPOINTS.BLOGS.GET_BY_CATEGORY(categoryId), { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.BLOGS.GET_BY_ID(id), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.BLOGS.DELETE(id), { method: 'DELETE' }),
};

// Fixed: Changed BLOGS_CATEGORIES to BLOG_CATEGORIES to match your api-config.js
export const BlogCategoriesAPI = {
  getAll: () =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.GET_BY_ID(id), { method: 'GET' }),

  add: (data) =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.ADD, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }),

  update: (data) =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.UPDATE, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.DELETE(id), { method: 'DELETE' }),
};