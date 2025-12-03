import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Search, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { ServicesAPI } from '../../api/services';

const Services = () => {
  const [view, setView] = useState('list');
  const [editingService, setEditingService] = useState(null);

  // List States
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, serviceId: null, serviceTitle: '' });

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await ServicesAPI.getAll();
      
      if (response.success) {
        setServices(response.result || []);
      } else {
        setError('Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    resetForm();
    setView('add');
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      is_active: service.is_active !== undefined ? service.is_active : true
    });
    setView('edit');
  };

  const handleBackToList = () => {
    resetForm();
    setView('list');
    setEditingService(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      is_active: true
    });
    setFormErrors({});
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Service title is required';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const formValidationErrors = validateForm();
    if (Object.keys(formValidationErrors).length > 0) {
      setFormErrors(formValidationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const serviceData = { ...formData };

      if (editingService) {
        serviceData.id = editingService._id || editingService.id;
        const res = await ServicesAPI.update(serviceData);

        if (res.success) {
          await fetchServices();
          handleBackToList();
        } else {
          setError(res.message || "Failed to update service");
        }
      } else {
        const res = await ServicesAPI.add(serviceData);

        if (res.success) {
          await fetchServices();
          handleBackToList();
        } else {
          setError(res.message || "Failed to add service");
        }
      }
    } catch (error) {
      console.error('Error saving service:', error);
      setError(error.message || 'Failed to save service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (service) => {
    setDeleteModal({
      show: true,
      serviceId: service._id || service.id,
      serviceTitle: service.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await ServicesAPI.delete(deleteModal.serviceId);
      
      if (response.success) {
        setServices(services.filter(s => 
          (s._id || s.id) !== deleteModal.serviceId
        ));
        setDeleteModal({ show: false, serviceId: null, serviceTitle: '' });
      } else {
        alert('Failed to delete service');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Failed to delete service');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, serviceId: null, serviceTitle: '' });
  };

  const filteredServices = services.filter(service =>
    service.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LIST VIEW
  if (view === 'list') {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchServices}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-1">Manage your services</p>
          </div>
          <button
            onClick={handleAddService}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No services found matching your search' : 'No services yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddService}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Your First Service
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service._id || service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {service.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(service)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Service
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "<strong>{deleteModal.serviceTitle}</strong>"? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // FORM VIEW
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBackToList}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Services</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {view === 'edit' ? 'Edit Service' : 'Add New Service'}
          </h1>
          <p className="text-gray-600 mt-1">
            {view === 'edit' ? 'Update service information' : 'Create a new service'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                formErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter service title"
            />
            {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Active Service</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Active services will be displayed on the website
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleBackToList}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>
                {isSubmitting 
                  ? 'Saving...' 
                  : (view === 'edit' ? 'Update Service' : 'Add Service')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Services;