
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Search, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { ServiceCategoriesAPI, ServicesAPI } from '../../api/services';

const ServiceCategories = () => {
  const [view, setView] = useState('list');
  const [editingCategory, setEditingCategory] = useState(null);

  // List States
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, categoryId: null, categoryTitle: '' });

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_id: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await ServiceCategoriesAPI.getAll();
      
      if (response.success) {
        setCategories(response.result || []);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load service categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await ServicesAPI.getAll(); // ✅ Changed from getActive to getAll
      console.log('Services Response:', response); // Debug log
      if (response.success) {
        setServices(response.result || []);
      } else {
        console.error('Failed to fetch services:', response.message);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleAddCategory = () => {
    resetForm();
    setView('add');
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    
    // ✅ Ensure service_id is properly formatted
    const serviceId = category.service_id?._id || category.service_id?.id || category.service_id || '';
    
    setFormData({
      title: category.title || '',
      description: category.description || '',
      service_id: String(serviceId), // ✅ Convert to string
      is_active: category.is_active !== undefined ? category.is_active : true
    });
    setView('edit');
  };

  const handleBackToList = () => {
    resetForm();
    setView('list');
    setEditingCategory(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      service_id: '',
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
      newErrors.title = 'Category title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.service_id) {
      newErrors.service_id = 'Please select a service';
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

      // ✅ Ensure all IDs are strings
      const categoryData = {
        title: formData.title,
        description: formData.description,
        service_id: String(formData.service_id), // ✅ Convert to string
        is_active: formData.is_active
      };

      console.log('Submitting category data:', categoryData); // Debug log

      if (editingCategory) {
        categoryData.id = String(editingCategory._id || editingCategory.id); // ✅ Convert to string
        console.log('Update with ID:', categoryData.id); // Debug log
        
        const res = await ServiceCategoriesAPI.update(categoryData);

        if (res.success) {
          await fetchCategories();
          handleBackToList();
        } else {
          setError(res.message || "Failed to update category");
        }
      } else {
        const res = await ServiceCategoriesAPI.add(categoryData);

        if (res.success) {
          await fetchCategories();
          handleBackToList();
        } else {
          setError(res.message || "Failed to add category");
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.message || 'Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteModal({
      show: true,
      categoryId: category._id || category.id,
      categoryTitle: category.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await ServiceCategoriesAPI.delete(deleteModal.categoryId);
      
      if (response.success) {
        setCategories(categories.filter(c => 
          (c._id || c.id) !== deleteModal.categoryId
        ));
        setDeleteModal({ show: false, categoryId: null, categoryTitle: '' });
      } else {
        alert('Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, categoryId: null, categoryTitle: '' });
  };

  const filteredCategories = categories.filter(category =>
    category.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceName = (serviceId) => {
    // Handle if serviceId is an object
    const actualServiceId = serviceId?._id || serviceId?.id || serviceId;
    const service = services.find(s => {
      const sId = s._id || s.id;
      return String(sId) === String(actualServiceId);
    });
    return service ? service.title : 'Unknown Service';
  };

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
            onClick={fetchCategories}
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
            <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
            <p className="text-gray-600 mt-1">Manage your service categories</p>
          </div>
          <button
            onClick={handleAddCategory}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No categories found matching your search' : 'No service categories yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddCategory}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Your First Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category._id || category.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {category.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      category.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-purple-600 font-medium mb-2">
                  {getServiceName(category.service_id)}
                </p>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {category.description}
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Category
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "<strong>{deleteModal.categoryTitle}</strong>"? 
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
          <span>Back to Categories</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {view === 'edit' ? 'Edit Service Category' : 'Add New Service Category'}
          </h1>
          <p className="text-gray-600 mt-1">
            {view === 'edit' ? 'Update category information' : 'Create a new service category'}
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
              Select Service *
            </label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                formErrors.service_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service._id || service.id} value={service._id || service.id}>
                  {service.title}
                </option>
              ))}
            </select>
            {formErrors.service_id && <p className="text-red-500 text-sm mt-1">{formErrors.service_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                formErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter category title"
            />
            {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                formErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter category description"
            />
            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
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
              <span className="text-sm font-medium text-gray-700">Active Category</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Active categories will be displayed on the website
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
                  : (view === 'edit' ? 'Update Category' : 'Add Category')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceCategories;