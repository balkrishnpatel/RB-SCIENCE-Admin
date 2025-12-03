
// export const BASE_URL = "http://localhost:4000/eury/fox/"; //local API base URL
export const BASE_URL = "http://localhost:4000/rbscience/"; //local API base URL


export const API_ENDPOINTS = {

PRODUCTS_CATEGORIES :{
  ADD: `${BASE_URL}product-categories/add`,
  UPDATE: `${BASE_URL}product-categories/update`,
  GET_ALL: `${BASE_URL}product-categories/getAll`,
  GET_BY_ID: (id) => `${BASE_URL}product-categories/getById/${id}`,
  DELETE: (id) => `${BASE_URL}product-categories/${id}`,
},

PRODUCTS: {
    ADD: `${BASE_URL}products/add`,
    UPDATE: `${BASE_URL}products/update`,
    GET_ALL: `${BASE_URL}products/getAll`,
    GET_BY_ID: (id) => `${BASE_URL}products/getById/${id}`,
    GET_BY_CATEGORY: (id) => `${BASE_URL}products/getByCategory/${id}`,
    DELETE: (id) => `${BASE_URL}products/${id}`,
    ADD_IMAGES: `${BASE_URL}products/addImages`,
    GET_ALL_WITH_CATEGORIES: `${BASE_URL}products/getAllProductsWithCategories`,
  },


BLOG_CATEGORIES: {
  ADD: `${BASE_URL}blogs-category/add`,
  UPDATE: `${BASE_URL}blogs-category/update`,
  GET_ALL: `${BASE_URL}blogs-category/getAll`,
  GET_BY_ID: (id) => `${BASE_URL}blogs-category/getById/${id}`,
  DELETE: (id) => `${BASE_URL}blogs-category/${id}`,
},
BLOGS: {
  ADD: `${BASE_URL}blogs/add`,
  UPDATE: `${BASE_URL}blogs/update`,
  GET_ALL: `${BASE_URL}blogs/getAll`,
  GET_FEATURED: `${BASE_URL}blogs/getFeatured`,
  GET_ALL_ACTIVE: `${BASE_URL}blogs/getAllActive`,
  GET_BY_CATEGORY: (id) => `${BASE_URL}blogs/getByCategory/${id}`,
  GET_BY_ID: (id) => `${BASE_URL}blogs/getById/${id}`,
  DELETE: (id) => `${BASE_URL}blogs/${id}`,
},

  PRODUCT_UNITS: {
    ADD: `${BASE_URL}product-units/add`,
    UPDATE: `${BASE_URL}product-units/update`,
    GET_ALL: `${BASE_URL}product-units/getAll`,
    GET_BY_ID: (id) => `${BASE_URL}product-units/getById/${id}`,
    DELETE: (id) => `${BASE_URL}product-units/${id}`,
  },

  UNIT_QUANTITIES: {
    ADD: `${BASE_URL}unit-quantities/add`,
    UPDATE: `${BASE_URL}unit-quantities/update`,
    GET_ALL: `${BASE_URL}unit-quantities/getAll`,
    GET_BY_ID: (id) => `${BASE_URL}unit-quantities/getbyid/${id}`,
    DELETE: (id) => `${BASE_URL}unit-quantities/${id}`,
  },

CONTACT_INFO: {
  ADD: `${BASE_URL}contact-info/add`,
  UPDATE: `${BASE_URL}contact-info/update`,
  GET_ACTIVE: `${BASE_URL}contact-info/getActive`,
  GET_ALL: `${BASE_URL}contact-info/getAll`,
  GET_BY_ID: (id) => `${BASE_URL}contact-info/getById/${id}`,
  DELETE: (id) => `${BASE_URL}contact-info/${id}`,
},

  TEAM_MEMBERS: {
    ADD: `${BASE_URL}team-members/add`,
    UPDATE: `${BASE_URL}team-members/update`,
    GET_ALL: `${BASE_URL}team-members/getAll`,
    GET_ACTIVE: `${BASE_URL}team-members/getActive`,
    GET_BY_ID: (id) => `${BASE_URL}team-members/getById/${id}`,
    DELETE: (id) => `${BASE_URL}team-members/${id}`,
  },


  COLLABORATIVE_PROJECTS: {
  ADD: `${BASE_URL}collaborative-projects/add`,
  UPDATE: `${BASE_URL}collaborative-projects/update`,
  GET_ALL: `${BASE_URL}collaborative-projects/getAll`,
  GET_ACTIVE: `${BASE_URL}collaborative-projects/getActive`,
  GET_BY_ID: (id) => `${BASE_URL}collaborative-projects/getById/${id}`,
  GET_BY_UNIVERSITY: (university) => `${BASE_URL}collaborative-projects/university/${university}`,
  DELETE: (id) => `${BASE_URL}collaborative-projects/${id}`,
},


SERVICES: {
  ADD: `${BASE_URL}services/add`,
  UPDATE: `${BASE_URL}services/update`,
  GET_ALL: `${BASE_URL}services/getAll`,
  GET_ACTIVE: `${BASE_URL}services/getAct`,
  GET_BY_ID: (id) => `${BASE_URL}services/getById/${id}`,
  DELETE: (id) => `${BASE_URL}services/${id}`,
},

SERVICE_CATEGORIES: {
  ADD: `${BASE_URL}service-categories/add`,
  UPDATE: `${BASE_URL}service-categories/update`,
  GET_ALL: `${BASE_URL}service-categories/getAll`,
  GET_BY_ID: (id) => `${BASE_URL}service-categories/getById/${id}`,
  GET_BY_SERVICE: (id) => `${BASE_URL}service-categories/service/${id}`,
  GET_BY_SERVICE_ACTIVE: (id) => `${BASE_URL}service-categories/service/${id}/active`,
  DELETE: (id) => `${BASE_URL}service-categories/${id}`,
},

SERVICE_DETAILS: {
  ADD: `${BASE_URL}services-details/add`,
  UPDATE: `${BASE_URL}services-details/update`,
  GET_ALL: `${BASE_URL}services-details/getAll`,
  GET_BY_ID: (id) => `${BASE_URL}services-details/getById/${id}`,
  GET_BY_CATEGORY: (id) => `${BASE_URL}services-details/category/${id}`,
  DELETE: (id) => `${BASE_URL}services-details/${id}`,
},


   EVENTS: {
    ADD: `${BASE_URL}events/add`,
    UPDATE: `${BASE_URL}events/update`,
    GET_ALL: `${BASE_URL}events/getAll`,
    GET_BY_ID: (id) => `${BASE_URL}events/getById/${id}`,
    GET_FEATURED: `${BASE_URL}events/getFeatured`,
    GET_BY_YEAR: (year) => `${BASE_URL}events/getByYear/${year}`,
    DELETE: (id) => `${BASE_URL}events/${id}`,
  },


  USERS: {
    ADD: `${BASE_URL}users/add`,
    UPDATE: `${BASE_URL}users/update`,
    GET_ALL: `${BASE_URL}users/getall`,
    GET_BY_ID: (id) => `${BASE_URL}users/getById/${id}`,
    GET_BY_EMAIL: (email) => `${BASE_URL}users/getByEmail/${email}`,
    DELETE: (id) => `${BASE_URL}users/${id}`,
  },
  

  //Authentications
  // Admin User Management (Separate from regular users)
  ADMIN: {
    // Add new admin with name, email, temporary password
    ADD: `${BASE_URL}admin/add`,
    
    // Update admin with name, email, New Password (optional)
    UPDATE: `${BASE_URL}admin/update`,
    
    // Get all admin users 
    GET_ALL: `${BASE_URL}admin/getAll`,
    
    // Get admin by ID
    GET_BY_ID: (id) => `${BASE_URL}admin/getById/${id}`,
    
    // Delete admin by ID
    DELETE: (id) => `${BASE_URL}admin/${id}`,

    // login with email, password
    LOGIN: `${BASE_URL}admin/login`,

    // request-otp with email to get OTP for password reset
    REQUEST_OTP: `${BASE_URL}admin/request-otp`,

    // Verify otp with email and otp
    VERIFY_OTP: `${BASE_URL}admin/verify-otp`,
    
    // Change password (email, otp, newPassword)
    CHANGE_PASSWORD: `${BASE_URL}admin/change-password`,
    
  },

  // Regular User Authentication (if needed separately)
  AUTH: {
    LOGIN: `${BASE_URL}auth/login`,
    REGISTER: `${BASE_URL}auth/register`,
    VERIFY_EMAIL: `${BASE_URL}auth/verify-email`,
    FORGOT_PASSWORD: `${BASE_URL}auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}auth/reset-password`,
  },

  CURRENCIES: {
    ADD: `${BASE_URL}currencies/add`,
    UPDATE: `${BASE_URL}currencies/update`,
    GET_ALL: `${BASE_URL}currencies/getAll`,
    GET_BY_ID: (id) => `${BASE_URL}currencies/getById/${id}`,
    DELETE: (id) => `${BASE_URL}currencies/${id}`,
  },
};

export const API_CONFIG = {
  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Number of retry attempts on failure
  RETRY_ATTEMPTS: 3,

  // Delay between retry attempts in milliseconds
  RETRY_DELAY: 1000,

  // Default headers for all requests
  DEFAULT_HEADERS: { 
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Enable/disable fallback data on API failure
  USE_FALLBACK_DATA: true,

  // Enable/disable request logging
  ENABLE_LOGGING: true,
};
