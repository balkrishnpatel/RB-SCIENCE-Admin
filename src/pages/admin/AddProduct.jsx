import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProductForm from '../../components/forms/ProductForm';
import { ProductsAPI } from '../../api/products';
import { ProductCategoriesAPI } from '../../api/productCategories';
import { ProductUnitsAPI } from '../../api/productUnits';
import { API_CONFIG } from '../../api/api-config';   

const AddProduct = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  const editingProduct = location.state?.editingProduct;

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchRequiredData();
  }, []);
 
  // Helper function to extract clean error message
  const getErrorMessage = (error) => {
    // If it's already a string, return it
    if (typeof error === 'string') {
      return error;
    }
    
    // If it's an error object with message property
    if (error?.message) {
      // Check if the message is a JSON string that needs parsing
      if (typeof error.message === 'string' && error.message.includes('{"success":')) {
        try {
          const parsed = JSON.parse(error.message);
          return parsed.message || 'An error occurred';
        } catch (e) {
          return error.message;
        }
      }
      return error.message;
    }
    
    // If it's a response object from API
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Fallback
    return 'An unexpected error occurred';
  };

  const fetchRequiredData = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const [categoriesRes, unitsRes] = await Promise.all([
         ProductCategoriesAPI.getAll(),
          ProductUnitsAPI.getAll()
        ]);

        if (categoriesRes.success && unitsRes.success) {
          setCategories(categoriesRes.result || []);
          setUnits(unitsRes.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error('Failed to fetch required data');
        }
      } catch (err) {
        attempts += 1;
        setRetryCount(attempts);
        if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
        } else {
          setError(getErrorMessage(err));
          setLoading(false);
        }
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      if (editingProduct) {
        productData.id = editingProduct.id;
        const res = await ProductsAPI.update(productData);

        if (res.success) {
          navigate('/admin/products');
        } else {
          // Extract clean message from API response
          const errorMessage = res.message || "Failed to update product";
          setError(errorMessage);
        }
      } else {
        console.log("Product Data:", productData);
        const res = await ProductsAPI.add(productData);

        if (res.success) {
          navigate('/admin/products');
        } else {
          // Extract clean message from API response
          const errorMessage = res.message || "Failed to add product";
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      
      let errorMessage = 'Failed to save product. Please try again.';
      
      // Handle different error formats (same pattern as BlogCategoryForm)
      if (error.message) {
        const errorMsg = error.message;
        
        // Case 1: HTTP error format like "HTTP 400: {...}"
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
        const responseData = error.response.data;
        
        // Handle general error message
        if (responseData.message) {
          errorMessage = responseData.message;
        }
      }
      
      // Set the final error message
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </button>
        </div>

        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Required Data</h3>
              <p className="text-blue-700">Fetching categories and units...</p>
              {retryCount > 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </button>
        </div>

        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="font-semibold text-red-800">Something went wrong</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchRequiredData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {editingProduct ? 'Update product information' : 'Create a new product in your inventory'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Product Form */}
      <div className="bg-white rounded-lg shadow-md">
        <ProductForm 
          product={editingProduct}
          categories={categories}
          units={units}
          onSave={handleSaveProduct}
          onCancel={handleCancel}
          isSubmitting={loading}
        />
      </div>
    </div>
  );
};

export default AddProduct;




