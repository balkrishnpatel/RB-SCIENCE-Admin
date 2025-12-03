import { API_ENDPOINTS } from './api-config';
import { apiCall } from './fetchHelper';

export const TeamMembersAPI = {
  add: async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('role', data.role);
    formData.append('description', data.description);
    formData.append('isActive', data.isActive);
    formData.append('ourExperts', data.ourExperts || false);
    formData.append('ourAdvisory', data.ourAdvisory || false);
    //  formData.append('ourExperts', String(data.ourExperts));
    // formData.append('ourAdvisory', String(data.ourAdvisory));

    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.TEAM_MEMBERS.ADD, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  update: async (data) => {
    if (!data.id) throw new Error("Team Member ID is required for update");

    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('name', data.name);
    formData.append('role', data.role);
    formData.append('description', data.description);
    formData.append('isActive', data.isActive);
    formData.append('ourExperts', data.ourExperts);
    formData.append('ourAdvisory', data.ourAdvisory);
    //  formData.append('ourExperts', String(data.ourExperts));
    // formData.append('ourAdvisory', String(data.ourAdvisory));


    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    return apiCall(API_ENDPOINTS.TEAM_MEMBERS.UPDATE, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getAll: () =>
    apiCall(API_ENDPOINTS.TEAM_MEMBERS.GET_ALL, { method: 'GET' }),

  getActive: () =>
    apiCall(API_ENDPOINTS.TEAM_MEMBERS.GET_ACTIVE, { method: 'GET' }),

  getById: (id) =>
    apiCall(API_ENDPOINTS.TEAM_MEMBERS.GET_BY_ID(id), { method: 'GET' }),

  delete: (id) =>
    apiCall(API_ENDPOINTS.TEAM_MEMBERS.DELETE(id), { method: 'DELETE' }),
};