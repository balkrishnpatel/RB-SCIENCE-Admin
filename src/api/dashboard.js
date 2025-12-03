
import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';
export const DashboardAPI = {
  getProductCategories: () =>
    apiCall(API_ENDPOINTS.PRODUCTS_CATEGORIES.GET_ALL, { method: 'GET' }),
  getProducts: () =>
    apiCall(API_ENDPOINTS.PRODUCTS.GET_ALL, { method: 'GET' }),
  getBlogCategories: () =>
    apiCall(API_ENDPOINTS.BLOG_CATEGORIES.GET_ALL, { method: 'GET' }),
  getBlogs: () =>
    apiCall(API_ENDPOINTS.BLOGS.GET_ALL, { method: 'GET' }),
 getTeamMembers: () =>
    apiCall(API_ENDPOINTS.TEAM_MEMBERS.GET_ALL, { method: 'GET' }),
 getCurrencies: () =>
    apiCall(API_ENDPOINTS.CURRENCIES.GET_ALL, { method: 'GET' }),
};