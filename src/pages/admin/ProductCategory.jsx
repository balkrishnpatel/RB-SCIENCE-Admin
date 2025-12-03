import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import ProductCategoryForm from '../../components/forms/ProductCategoryForm';

import { ProductCategoriesAPI } from '../../api/productCategories';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Grid3X3, Loader2, X, AlertTriangle } from 'lucide-react';
import { API_CONFIG, BASE_URL } from '../../api/api-config';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {type === 'danger' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
            }`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCategory = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [categories, setCategories] = useState([]);

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await ProductCategoriesAPI.getAll();
        if (res.success) {
          console.log("Result : ", res.result);
          setCategories(res.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error(res.message || 'Failed to fetch categories');
        }
      } catch (err) {
        attempts += 1;
        setRetryCount(attempts);
        if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
        } else {
          setError('Unable to fetch categories. Please try again later.');
          setLoading(false);
        }
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Modified to show confirmation modal instead of alert
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsConfirmModalOpen(true);
  };

  // Handle the actual deletion after confirmation
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setLoading(true);
      const res = await ProductCategoriesAPI.delete(categoryToDelete.id);

      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      } else {
        throw new Error(res.message || "Failed to delete category");
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      let message = "Something went wrong while deleting.";
      
      if (error.message) {
        const errorMsg = error.message;
        
        // Handle HTTP error format like "HTTP 409: {...}"
        if (errorMsg.includes('HTTP') && errorMsg.includes('{')) {
          try {
            const jsonStart = errorMsg.indexOf('{');
            const jsonString = errorMsg.substring(jsonStart);
            const parsedError = JSON.parse(jsonString);
            
            if (parsedError.message) {
              message = parsedError.message;
            }
          } catch (parseError) {
            console.log('Could not parse JSON from HTTP error message');
            message = errorMsg;
          }
        } else {
          message = errorMsg;
        }
      }
      
      setError(message);
    } finally {
      setLoading(false);
      setIsConfirmModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Handle modal close
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      setLoading(true);

      if (editingCategory) {
        categoryData.id = editingCategory.id;
        const res = await ProductCategoriesAPI.update(categoryData);

        if (res.success) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id ? { ...c, ...res.result } : c
            )
          );
          
          // Close modal on success
          setIsModalOpen(false);
          setEditingCategory(null);
        } else {
          // Only throw the message, not the full response
          const error = new Error(res.message || "Failed to update category");
          throw error;
        }
      } else {
        console.log("CategoryData: ", categoryData);
        const res = await ProductCategoriesAPI.add(categoryData);

        if (res.success) {
          setCategories((prev) => [...prev, res.result]);
          
          // Close modal on success
          setIsModalOpen(false);
          setEditingCategory(null);
        } else {
          // Only throw the message, not the full response
          const error = new Error(res.message || "Failed to add category");
          throw error;
        }
      }
    } catch (error) {
      // Re-throw the error so ProductCategoryForm can handle it
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleViewProducts = (category) => {
    // Navigate to products page with category filter
    navigate('/admin/products', { 
      state: { selectedCategory: category.title } 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-gray-600 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product Category</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Grid3X3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && !error && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Categories</h3>
              <p className="text-blue-700">Fetching the latest product categories...</p>
              {retryCount > 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="font-semibold text-red-800">Something went wrong</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative">
                <img
                  src={BASE_URL + category.image}
                  alt={category.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-white rounded-full p-2 shadow-md">
                  <span className="text-xl">
                    <img
                      src={BASE_URL + category.icon}
                      className="w-5 h-5 object-cover"
                      alt={category.title + " icon"}
                    />
                  </span> 
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{category.title}</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {category.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                <button 
                  onClick={() => {handleViewProducts(category)
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
                >
                  View Products
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product category'}
          </p>
          <button
            onClick={handleAddCategory}
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
          >
            Add Category
          </button>
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Product Category'}
      >
        <ProductCategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.title}"? This action cannot be undone and may affect associated products.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ProductCategory;
