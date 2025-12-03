import React, { useState, useEffect } from 'react';

const BlogCategoryForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      console.log("Blog Category ID: ", category.id);
      setFormData({ name: category.name });
    }
  }, [category]);

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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("✅ Sending this to backend:", {
        name: formData.name,
      });

      // 🔹 Call parent save with data - this might throw an error
      await onSave(formData);
      
      // If we reach here, the save was successful
      // The parent component will handle closing the modal
      
    } catch (error) {
      console.error('Error saving blog category:', error);
      
      let errorMessage = 'Failed to save blog category. Please try again.';
      
      // Handle different error formats
      if (error.message) {
        const errorMsg = error.message;
        
        // Case 1: HTTP error format like "HTTP 500: {...}"
        if (errorMsg.includes('HTTP') && errorMsg.includes('{')) {
          try {
            const jsonStart = errorMsg.indexOf('{');
            const jsonString = errorMsg.substring(jsonStart);
            const parsedError = JSON.parse(jsonString);
            
            if (parsedError.message) {
              errorMessage = parsedError.message;
            }
          } catch (parseError) {
            console.log('Could not parse JSON from HTTP error message');
            errorMessage = errorMsg;
          }
        }
        // Case 2: Direct JSON string
        else if (errorMsg.startsWith('{') && errorMsg.endsWith('}')) {
          try {
            const parsedError = JSON.parse(errorMsg);
            if (parsedError.message) {
              errorMessage = parsedError.message;
            }
          } catch (parseError) {
            console.log('Could not parse direct JSON error message');
            errorMessage = errorMsg;
          }
        }
        // Case 3: Simple message
        else {
          errorMessage = errorMsg;
        }
      }
      // Handle backend validation errors (axios response format)
      else if (error.response && error.response.data) {
        const backendErrors = {};
        const responseData = error.response.data;
        
        // Handle validation errors from backend
        if (responseData.errors && typeof responseData.errors === 'object') {
          Object.keys(responseData.errors).forEach(field => {
            if (Array.isArray(responseData.errors[field])) {
              backendErrors[field] = responseData.errors[field][0]; // Take first error message
            } else {
              backendErrors[field] = responseData.errors[field];
            }
          });
        }
        
        // Handle general error message
        if (responseData.message && Object.keys(backendErrors).length === 0) {
          backendErrors.submit = responseData.message;
        }
        
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Set the final error message
      setErrors({ submit: errorMessage });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter category name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
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

export default BlogCategoryForm;






















