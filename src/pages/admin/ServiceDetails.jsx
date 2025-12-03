import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Search, ArrowLeft, X } from 'lucide-react';
import { ServiceDetailsAPI, ServiceCategoriesAPI } from '../../api/services';
import { BASE_URL } from '../../api/api-config';

const ServiceDetails = () => {
  const [view, setView] = useState('list');
  const [editingDetail, setEditingDetail] = useState(null);

  // List States
  const [details, setDetails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, detailId: null, detailTitle: '' });

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_category_id: '',
    featured: [''],
    long_description: [{ label: '', description: '' }]
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [imageError, setImageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDetails();
    fetchCategories();
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await ServiceDetailsAPI.getAll();
      
      if (response.success) {
        setDetails(response.result || []);
      } else {
        setError('Failed to fetch service details');
      }
    } catch (err) {
      console.error('Error fetching details:', err);
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await ServiceCategoriesAPI.getAll();
      if (response.success) {
        setCategories(response.result || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddDetail = () => {
    resetForm();
    setView('add');
  };

//   const handleEditDetail = (detail) => {
//     setEditingDetail(detail);
//     setFormData({
//       title: detail.title || '',
//       description: detail.description || '',
//       service_category_id: detail.service_category_id || '',
//       featured: detail.featured && detail.featured.length > 0 ? detail.featured : [''],
//       long_description: detail.long_description && detail.long_description.length > 0 
//         ? detail.long_description 
//         : [{ label: '', description: '' }]
//     });

//     if (detail.image_url) {
//       setPreviewUrl(`${BASE_URL}${detail.image_url}`);
//     }

//     setView('edit');
//   };

const handleEditDetail = (detail) => {
  setEditingDetail(detail);
  
  // Extract category ID properly
  let categoryId = '';
  if (typeof detail.service_category_id === 'object' && detail.service_category_id !== null) {
    categoryId = detail.service_category_id._id || detail.service_category_id.id || '';
  } else {
    categoryId = detail.service_category_id || '';
  }
  
  setFormData({
    title: detail.title || '',
    description: detail.description || '',
    service_category_id: categoryId,
    featured: detail.featured && detail.featured.length > 0 ? detail.featured : [''],
    long_description: detail.long_description && detail.long_description.length > 0 
      ? detail.long_description 
      : [{ label: '', description: '' }]
  });

  if (detail.image_url) {
    setPreviewUrl(`${BASE_URL}${detail.image_url}`);
  }

  setView('edit');
};

  const handleBackToList = () => {
    resetForm();
    setView('list');
    setEditingDetail(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      service_category_id: '',
      featured: [''],
      long_description: [{ label: '', description: '' }]
    });
    setSelectedImage(null);
    setPreviewUrl('');
    setFormErrors({});
    setImageError('');
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Featured Items Management
  const handleFeaturedChange = (index, value) => {
    const newFeatured = [...formData.featured];
    newFeatured[index] = value;
    setFormData(prev => ({ ...prev, featured: newFeatured }));
  };

  const addFeaturedItem = () => {
    setFormData(prev => ({
      ...prev,
      featured: [...prev.featured, '']
    }));
  };

  const removeFeaturedItem = (index) => {
    if (formData.featured.length > 1) {
      const newFeatured = formData.featured.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, featured: newFeatured }));
    }
  };

  // Long Description Management
  const handleLongDescriptionChange = (index, field, value) => {
    const newLongDesc = [...formData.long_description];
    newLongDesc[index][field] = value;
    setFormData(prev => ({ ...prev, long_description: newLongDesc }));
  };

  const addLongDescriptionItem = () => {
    setFormData(prev => ({
      ...prev,
      long_description: [...prev.long_description, { label: '', description: '' }]
    }));
  };

  const removeLongDescriptionItem = (index) => {
    if (formData.long_description.length > 1) {
      const newLongDesc = formData.long_description.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, long_description: newLongDesc }));
    }
  };

  // Image Handling
  const validateAndSetImage = (file) => {
    setImageError('');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      setImageError('Image size must not exceed 5 MB');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const removeImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(null);
    setPreviewUrl('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.service_category_id) {
      newErrors.service_category_id = 'Please select a category';
    }

    // Validate featured items
    const validFeatured = formData.featured.filter(item => item.trim());
    if (validFeatured.length === 0) {
      newErrors.featured = 'At least one featured item is required';
    }

    // Validate long description
    const validLongDesc = formData.long_description.filter(
      item => item.label.trim() && item.description.trim()
    );
    if (validLongDesc.length === 0) {
      newErrors.long_description = 'At least one complete long description entry is required';
    }

    // Image validation - only required for new details
    if (!editingDetail && !selectedImage) {
      setImageError('Service image is required');
    }

    return newErrors;
  };

//   const handleSubmit = async () => {
//     const formValidationErrors = validateForm();
//     if (Object.keys(formValidationErrors).length > 0 || imageError) {
//       setFormErrors(formValidationErrors);
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       setError(null);

//       // Clean data
//       const cleanFeatured = formData.featured.filter(item => item.trim());
//       const cleanLongDesc = formData.long_description.filter(
//         item => item.label.trim() && item.description.trim()
//       );

//       const detailData = {
//         title: formData.title,
//         description: formData.description,
//         service_category_id: formData.service_category_id,
//         featured: cleanFeatured,
//         long_description: cleanLongDesc,
//         image_url: selectedImage
//       };

//       if (editingDetail) {
//         detailData.id = editingDetail._id || editingDetail.id;
//         const res = await ServiceDetailsAPI.update(detailData);

//         if (res.success) {
//           await fetchDetails();
//           handleBackToList();
//         } else {
//           setError(res.message || "Failed to update service detail");
//         }
//       } else {
//         const res = await ServiceDetailsAPI.add(detailData);

//         if (res.success) {
//           await fetchDetails();
//           handleBackToList();
//         } else {
//           setError(res.message || "Failed to add service detail");
//         }
//       }
//     } catch (error) {
//       console.error('Error saving detail:', error);
//       setError(error.message || 'Failed to save service detail. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

const handleSubmit = async () => {
  const formValidationErrors = validateForm();
  if (Object.keys(formValidationErrors).length > 0 || imageError) {
    setFormErrors(formValidationErrors);
    return;
  }

  try {
    setIsSubmitting(true);
    setError(null);

    // Clean data
    const cleanFeatured = formData.featured.filter(item => item.trim());
    const cleanLongDesc = formData.long_description.filter(
      item => item.label.trim() && item.description.trim()
    );

    const detailData = {
      title: formData.title,
      description: formData.description,
      service_category_id: formData.service_category_id,
      featured: cleanFeatured,
      long_description: cleanLongDesc,
    };

    // Only add image_url if a new image is selected
    if (selectedImage) {
      detailData.image_url = selectedImage;
    }

    if (editingDetail) {
      detailData.id = editingDetail._id || editingDetail.id;
      
      console.log('Sending update data:', detailData); // Debug
      
      const res = await ServiceDetailsAPI.update(detailData);

      console.log('Update response:', res); // Debug

      if (res.success) {
        await fetchDetails();
        handleBackToList();
      } else {
        setError(res.message || "Failed to update service detail");
      }
    } else {
      // For new detail, image is required
      if (!selectedImage) {
        setImageError('Service image is required');
        setIsSubmitting(false);
        return;
      }
      
      detailData.image_url = selectedImage;
      const res = await ServiceDetailsAPI.add(detailData);

      if (res.success) {
        await fetchDetails();
        handleBackToList();
      } else {
        setError(res.message || "Failed to add service detail");
      }
    }
  } catch (error) {
    console.error('Error saving detail:', error);
    setError(error.message || 'Failed to save service detail. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  const handleDeleteClick = (detail) => {
    setDeleteModal({
      show: true,
      detailId: detail._id || detail.id,
      detailTitle: detail.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await ServiceDetailsAPI.delete(deleteModal.detailId);
      
      if (response.success) {
        setDetails(details.filter(d => 
          (d._id || d.id) !== deleteModal.detailId
        ));
        setDeleteModal({ show: false, detailId: null, detailTitle: '' });
      } else {
        alert('Failed to delete service detail');
      }
    } catch (err) {
      console.error('Error deleting detail:', err);
      alert('Failed to delete service detail');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, detailId: null, detailTitle: '' });
  };

  const filteredDetails = details.filter(detail =>
    detail.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

//   const getCategoryName = (categoryId) => {
//     const category = categories.find(c => (c._id || c.id) === categoryId);
//     return category ? category.title : 'Unknown Category';
//   };

const getCategoryName = (categoryId) => {
  console.log('Finding category for ID:', categoryId);
  console.log('Available categories:', categories);
  
  const category = categories.find(c => 
    String(c._id || c.id) === String(categoryId)
  );
  
  console.log('Found category:', category);
  return category ? category.title : 'Unknown Category';
};

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
            onClick={fetchDetails}
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
            <h1 className="text-3xl font-bold text-gray-900">Service Details</h1>
            <p className="text-gray-600 mt-1">Manage detailed service information</p>
          </div>
          <button
            onClick={handleAddDetail}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Service Detail</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search service details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {filteredDetails.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No service details found matching your search' : 'No service details yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddDetail}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Your First Service Detail
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDetails.map((detail) => (
              <div
                key={detail._id || detail.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {detail.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`${BASE_URL}${detail.image_url}`}
                      alt={detail.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {detail.title}
                  </h3>

                  <p className="text-sm text-purple-600 font-medium mb-2">
                   
                     {getCategoryName(detail.service_category_id?._id || detail.service_category_id)}

                  </p>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {detail.description}
                  </p>

                  {detail.featured && detail.featured.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Featured:</p>
                      <div className="flex flex-wrap gap-1">
                        {detail.featured.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {item}
                          </span>
                        ))}
                        {detail.featured.length > 3 && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{detail.featured.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditDetail(detail)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(detail)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Service Detail
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "<strong>{deleteModal.detailTitle}</strong>"? 
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
          <span>Back to Service Details</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {view === 'edit' ? 'Edit Service Detail' : 'Add New Service Detail'}
          </h1>
          <p className="text-gray-600 mt-1">
            {view === 'edit' ? 'Update service detail information' : 'Create a new service detail'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="max-w-full mx-auto p-6 space-y-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Category *
                  </label>
                  <select
                    name="service_category_id"
                    value={formData.service_category_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      formErrors.service_category_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id || category.id} value={category._id || category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  {formErrors.service_category_id && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.service_category_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter description"
                  />
                  {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>
              </div>
            </div>

            {/* Featured Items */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Items *</h3>
              <div className="space-y-3">
                {formData.featured.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleFeaturedChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder={`Featured item ${index + 1}`}
                    />
                    {formData.featured.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeaturedItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeaturedItem}
                  className="text-purple-600 text-sm hover:text-purple-700"
                >
                  + Add Featured Item
                </button>
                {formErrors.featured && <p className="text-red-500 text-sm">{formErrors.featured}</p>}
              </div>
            </div>

            {/* Long Description */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Long Description *</h3>
              <div className="space-y-4">
                {formData.long_description.map((item, index) => (
                  <div key={index} className="border border-gray-300 rounded-md p-4 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Section {index + 1}</span>
                      {formData.long_description.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLongDescriptionItem(index)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleLongDescriptionChange(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Label (e.g., What's Included)"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => handleLongDescriptionChange(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Description"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLongDescriptionItem}
                  className="text-purple-600 text-sm hover:text-purple-700"
                >
                  + Add Description Section
                </button>
                {formErrors.long_description && (
                  <p className="text-red-500 text-sm">{formErrors.long_description}</p>
                )}
              </div>
            </div>

            {/* Service Image */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Service Image *
                <span className="text-sm text-gray-500 ml-2">(Max 5 MB)</span>
              </h3>
              
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                
                {imageError && (
                  <p className="text-red-500 text-sm">{imageError}</p>
                )}
                
                {previewUrl && (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Service preview"
                      className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Supported formats: JPEG, PNG, GIF, WebP. Max size: 5 MB
                </p>
              </div>
            </div>

            {/* Action Buttons */}
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
                    : (view === 'edit' ? 'Update Service Detail' : 'Add Service Detail')
                  }
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;