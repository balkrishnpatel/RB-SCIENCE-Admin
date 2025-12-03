
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../api/api-config';

const ProductCategoryForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    icon: null,
    description: '',
    image: null
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [iconError, setIconError] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState(''); // New state for backend errors

  useEffect(() => {
    if (category) {
      console.log("Category Id: ", category.id);
      setFormData(category);
      // Fix: Add BASE_URL prefix for existing images
      setPreviewUrl(category.image ? BASE_URL + category.image : '');
      setIconPreviewUrl(category.icon ? BASE_URL + category.icon : '');
    }
  }, [category]);

  const validateAndSetFile = (file, isIcon = false) => {
    const errorSetter = isIcon ? setIconError : setImageError;
    const fieldPrefix = isIcon ? 'selectedIcon' : 'selectedFile';
    const previewPrefix = isIcon ? 'iconPreviewUrl' : 'previewUrl';
    
    errorSetter('');

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        errorSetter('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      const fileSizeInMB = file.size / (1024 * 1024);
      
      if (isIcon) {
        if (fileSizeInMB > 5) {
          errorSetter('Icon size must not exceed 5 MB');
          return;
        }
      } else {
        if (fileSizeInMB > 5) {
          errorSetter('Image size must not exceed 5 MB');
          return;
        }
      }

      const previewUrl = URL.createObjectURL(file);
      
      if (isIcon) {
        setSelectedIcon(file);
        setIconPreviewUrl(previewUrl);
      } else {
        setSelectedFile(file);
        setPreviewUrl(previewUrl);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file, false);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file, true);
  };

  const removeImage = (isIcon = false) => {
    const inputId = isIcon ? 'icon-upload' : 'image-upload';
    
    if (isIcon) {
      if (iconPreviewUrl && iconPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(iconPreviewUrl);
      }
      setSelectedIcon(null);
      setIconPreviewUrl('');
      setFormData(prev => ({ ...prev, icon: '' }));
      setIconError('');
    } else {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl('');
      setFormData(prev => ({ ...prev, image: '' }));
      setImageError('');
    }
    
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear backend error when user makes changes
    if (backendError) {
      setBackendError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!previewUrl && !category?.image) {
      setImageError('Image is required');
    }

    if (!iconPreviewUrl && !category?.icon) {
      setIconError('Icon is required');
    }
    
    return newErrors;
  };

  // const handleSubmit = async () => {
  //   setIsSubmitting(true);
  //   setBackendError(''); // Clear previous backend errors
    
  //   const formErrors = validateForm();
  //   if (Object.keys(formErrors).length > 0 || imageError || iconError) {
  //     setErrors(formErrors);
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   try {
  //     formData.icon = selectedIcon;
  //     formData.image = selectedFile;
      
  //     // Call parent save function and await the result
  //     await onSave(formData);
      
  //   } 
  //   catch (error) {
  //     // Handle backend errors
  //     console.error('Error saving category:', error);
      
  //     // Check if it's a validation error from backend
  //     if (error.response && error.response.data) {
  //       const errorData = error.response.data;
        
  //       // Handle field-specific errors
  //       if (errorData.errors) {
  //         setErrors(errorData.errors);
  //       } else {
  //         // Handle general error message
  //         setBackendError(errorData.message || 'Failed to save category. Please try again.');
  //       }
  //     } else {
  //       // Handle network or other errors
  //       setBackendError(error.message || 'Failed to save category. Please check your connection and try again.');
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };


//   const handleSubmit = async () => {
//   setIsSubmitting(true);
//   setBackendError(''); // Clear previous backend errors

//   const formErrors = validateForm();
//   if (Object.keys(formErrors).length > 0 || imageError || iconError) {
//     setErrors(formErrors);
//     setIsSubmitting(false);
//     return;
//   }

//   try {
//     formData.icon = selectedIcon;
//     formData.image = selectedFile;

//     // Call parent save function and await the result
//     await onSave(formData);

//   } catch (error) {
//     console.error('Error saving category:', error);

//     let message = 'Something went wrong, please try again';

//     if (error.response?.data?.message) {
//       message = error.response.data.message;
//       console.log(error.response.data.message)   // ✅ backend ka raw message
//     } else if (error.message) {
//       message = error.message;                 // network/axios ka error
//       console.log(error.response.data.message)
//     }

//     setBackendError(message);

//   } finally {
//     setIsSubmitting(false);
//   }
// };

const handleSubmit = async () => {
  setIsSubmitting(true);
  setBackendError(''); // Clear previous backend errors

  const formErrors = validateForm();
  if (Object.keys(formErrors).length > 0 || imageError || iconError) {
    setErrors(formErrors);
    setIsSubmitting(false);
    return;
  }

  try {
    formData.icon = selectedIcon;
    formData.image = selectedFile;

    // Call parent save function and await the result
    await onSave(formData);

  } catch (error) {
    console.error('Error saving category:', error);

    let message = 'Something went wrong, please try again';

    // Check if error.message contains JSON string
    if (error.message && error.message.includes('{')) {
      try {
        // Extract JSON from the error message
        const jsonStart = error.message.indexOf('{');
        const jsonString = error.message.substring(jsonStart);
        const parsedError = JSON.parse(jsonString);
        
        if (parsedError.message) {
          message = parsedError.message;
        }
      } catch (parseError) {
        console.log('Could not parse JSON from error message');
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data) {
      try {
        const parsedData = typeof error.response.data === 'string' 
          ? JSON.parse(error.response.data) 
          : error.response.data;
        
        if (parsedData.message) {
          message = parsedData.message;
        }
      } catch (parseError) {
        console.log('Could not parse error data:', parseError);
      }
    } else if (error.message) {
      message = error.message;
    }

    setBackendError(message);

  } finally {
    setIsSubmitting(false);
  }
};




  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      if (iconPreviewUrl && iconPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(iconPreviewUrl);
      }
    };
  }, []);

  return (


    <div className="space-y-6">
      {/* Backend Error Display - Responsive */}
      {backendError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 self-start">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-1 text-sm text-red-700">
                <p className="break-words">{backendError}</p>
              </div>
            </div>
            
            {/* Close Button */}
            <div className="flex-shrink-0 self-start">
              <button
                type="button"
                onClick={() => setBackendError('')}
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600 transition-colors"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter Name"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Icon Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon * (Max 5 MB)
        </label>
        
        <div className="space-y-3">
          <input
            type="file"
            id="icon-upload"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleIconChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          
          {iconError && (
            <p className="text-red-500 text-sm break-words">{iconError}</p>
          )}
          
          {iconPreviewUrl && (
            <div className="relative inline-block">
              <img
                src={iconPreviewUrl}
                alt="Icon Preview"
                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeImage(true)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: JPEG, PNG, GIF, WebP. Max size: 5 MB
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-vertical ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter category description"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image * (Max 5 MB)
        </label>
        
        <div className="space-y-3">
          <input
            type="file"
            id="image-upload"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          
          {imageError && (
            <p className="text-red-500 text-sm break-words">{imageError}</p>
          )}
          
          {previewUrl && (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Category Preview"
                className="w-full max-w-xs sm:w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeImage(false)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: JPEG, PNG, GIF, WebP. Max size: 5 MB
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>
            {isSubmitting 
              ? 'Saving...' 
              : (category ? 'Update Category' : 'Add Category')
            }
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductCategoryForm;