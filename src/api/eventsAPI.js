import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const EventsAPI = {
  add: async (data) => {
    const formData = new FormData();
    
    // Basic fields
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle);
    formData.append('registration_link', data.registration_link);
    formData.append('year', data.year);
    formData.append('email', data.email);
    formData.append('event_type', data.event_type);
    formData.append('abstract_deadline', data.abstract_deadline);
    formData.append('featured_event', data.featured_event);
    
    // JSON fields - need to be stringified
    formData.append('location', JSON.stringify(data.location));
    formData.append('awards', JSON.stringify(data.awards));
    formData.append('registration_fees', JSON.stringify(data.registration_fees));
    formData.append('schedule', JSON.stringify(data.schedule));
    formData.append('venue', JSON.stringify(data.venue));
    formData.append('payment_details', JSON.stringify(data.payment_details));
    formData.append('important_dates', JSON.stringify(data.important_dates));
    formData.append('guests', JSON.stringify(data.guests));
    formData.append('about', JSON.stringify(data.about));
    
    // Optional brochure label
    if (data.brochure_label) {
      formData.append('brochure_label', data.brochure_label);
    }
    
    // Brochure file
    if (data.brochure instanceof File) {
      formData.append('brochure', data.brochure);
    }

    return apiCall(API_ENDPOINTS.EVENTS.ADD, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Event ID is required for update");

    const formData = new FormData();
    
    formData.append('id', data.id);
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle);
    formData.append('registration_link', data.registration_link);
    formData.append('year', data.year);
    formData.append('email', data.email);
    formData.append('event_type', data.event_type);
    formData.append('abstract_deadline', data.abstract_deadline);
    formData.append('featured_event', data.featured_event);
    
    // JSON fields
    formData.append('location', JSON.stringify(data.location));
    formData.append('awards', JSON.stringify(data.awards));
    formData.append('registration_fees', JSON.stringify(data.registration_fees));
    formData.append('schedule', JSON.stringify(data.schedule));
    formData.append('venue', JSON.stringify(data.venue));
    formData.append('payment_details', JSON.stringify(data.payment_details));
    formData.append('important_dates', JSON.stringify(data.important_dates));
    formData.append('guests', JSON.stringify(data.guests));
    formData.append('about', JSON.stringify(data.about));
    
    if (data.brochure_label) {
      formData.append('brochure_label', data.brochure_label);
    }
    
    if (data.brochure instanceof File) {
      formData.append('brochure', data.brochure);
    }

    return apiCall(API_ENDPOINTS.EVENTS.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.EVENTS.GET_ALL, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.EVENTS.GET_BY_ID(id), { method: 'GET' }),

  getFeatured: () =>
    apiCall(API_ENDPOINTS.EVENTS.GET_FEATURED, { method: 'GET' }),

  getByYear: (year) =>
    apiCall(API_ENDPOINTS.EVENTS.GET_BY_YEAR(year), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.EVENTS.DELETE(id), { method: 'DELETE' }),
};