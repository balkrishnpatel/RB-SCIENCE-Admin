
  

import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import BlogCategoryForm from '../../components/forms/BlogCategoryForm';
import { BlogCategoriesAPI } from '../../api/blogCategories';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Grid3X3, Loader2, AlertTriangle } from 'lucide-react';
import { API_CONFIG } from '../../api/api-config';

const BlogCategory = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Color schemes for cards
  const cardColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-green-500 to-emerald-600',
    'from-indigo-500 to-purple-600',
    'from-teal-500 to-cyan-600'
  ];

  const getCardColor = (index) => {
    return cardColors[index % cardColors.length];
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await BlogCategoriesAPI.getAll();
        if (res.success) {
          console.log("Result : ", res.result);
          setCategories(res.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error(res.message || 'Failed to fetch blog categories');
        }
      } catch (err) {
        attempts += 1;
        setRetryCount(attempts);
        if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
        } else {
          setError('Unable to fetch blog categories. Please try again later.');
          setLoading(false);
        }
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    console.log(category)
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      const res = await BlogCategoriesAPI.delete(categoryToDelete.id);

      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } else {
        throw new Error(res.message || "Failed to delete blog category");
      }
    } catch (error) {
      setError(error.message || "Something went wrong while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel deletion
  const cancelDeleteCategory = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  
const handleSaveCategory = async (categoryData) => {
  try {
    setLoading(true);

    if (editingCategory) {
      categoryData.id = editingCategory.id;
      const res = await BlogCategoriesAPI.update(categoryData);

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
        // Throw error so BlogCategoryForm can catch it
        const error = new Error(res.message || "Failed to update category");
        error.response = { data: { message: res.message, errors: res.errors } };
        throw error;
      }
    } else {
      console.log("CategoryData: ", categoryData);
      const res = await BlogCategoriesAPI.add(categoryData);

      if (res.success) {
        setCategories((prev) => [...prev, res.result]);
        
        // Close modal on success
        setIsModalOpen(false);
        setEditingCategory(null);
      } else {
        // Throw error so BlogCategoryForm can catch it
        const error = new Error(res.message || "Failed to add category");
        error.response = { data: { message: res.message, errors: res.errors } };
        throw error;
      }
    }
  } catch (error) {
    // Re-throw the error so BlogCategoryForm can handle it
    throw error;
  } finally {
    setLoading(false);
  }
};

  const handleViewBlogs = (category) => {
    // Navigate to blogs page with category filter
    navigate('/admin/blogs', { 
      state: { selectedCategory: category.name } 
    });
  };

  const handleViewCategoryDetail = (category) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Categories</h1>
          <p className="text-gray-600 mt-1">Manage your blog categories</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Add Blog Category</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search blog categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-white transition-all duration-200"
          />
        </div>
      </div>

      {loading && !error && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Blog Categories</h3>
              <p className="text-blue-700">Fetching the latest blog categories...</p>
              {retryCount > 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
          <h3 className="font-semibold text-red-800">Something went wrong</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-3 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category, index) => (
            <div key={category.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div 
                className={`relative bg-gradient-to-br ${getCardColor(index)} p-6 cursor-pointer`}
                onClick={() => handleViewCategoryDetail(category)}
              >
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category);
                    }}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-md hover:bg-white/30 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category);
                    }}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-md hover:bg-red-500/80 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="text-white text-center">
                  <div className="text-4xl mb-3 filter drop-shadow-lg">📝</div>
                  <h3 className="font-bold text-xl mb-1">{category.name}</h3>
                  <div className="w-12 h-1 bg-white/40 rounded-full mx-auto"></div>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-white/80 text-xs text-center">Click to view details</div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 px-3 py-1 rounded-full font-medium border border-violet-200">
                    {category.category}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                    category.isActive 
                      ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200' 
                      : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleViewBlogs(category)}
                  className={`w-full bg-gradient-to-r ${getCardColor(index)} text-white py-3 px-4 rounded-xl text-sm font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
                >
                  View Blogs
                </button>
              </div>
            </div>
          ))}
        </div>
      )} 

      {/* Empty State */}
      {!loading && !error && filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No blog categories found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search term' : 'Get started by creating your first blog category'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddCategory}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Your First Category
            </button>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Blog Category' : 'Add New Blog Category'}
      >
        <BlogCategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteCategory}
        title="Confirm Deletion"
      >
        {categoryToDelete && (
          <div className="space-y-6">
            {/* Warning Icon and Message */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Blog Category
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete the category "<span className="font-semibold">{categoryToDelete.name}</span>"? 
                This action cannot be undone and may affect associated blogs.
              </p>
            </div>

            {/* Category Info Card */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📝</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{categoryToDelete.name}</h4>
                  <p className="text-sm text-gray-500">Category: {categoryToDelete.category}</p>
                  <p className="text-sm text-gray-500">
                    Status: {categoryToDelete.isActive ? 'Active' : 'Inactive'}
                  </p>
                  {categoryToDelete.createdAt && (
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(categoryToDelete.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Deleting this category may affect existing blog posts that are assigned to it. 
                    Consider deactivating the category instead if you want to preserve the data.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={cancelDeleteCategory}
                disabled={isDeleting}
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={confirmDeleteCategory}
                disabled={isDeleting}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Category Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Category Details"
      >
        {selectedCategory && (
          <div className="space-y-6">
            {/* Header */}
            <div className={`bg-gradient-to-br ${getCardColor(categories.findIndex(c => c.id === selectedCategory.id))} rounded-xl p-6 text-white text-center`}>
              <div className="text-5xl mb-4 filter drop-shadow-lg">📝</div>
              <h2 className="text-2xl font-bold mb-2">{selectedCategory.name}</h2>
              <div className="w-16 h-1 bg-white/40 rounded-full mx-auto"></div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
                <p className="text-gray-900 font-medium">{selectedCategory.name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Type</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border border-violet-200">
                  {selectedCategory.category}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  selectedCategory.isActive 
                    ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200' 
                    : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200'
                }`}>
                  {selectedCategory.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category ID</label>
                <p className="text-gray-900 font-mono text-sm">{selectedCategory.id}</p>
              </div>

              {selectedCategory.createdAt && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Created Date</label>
                  <p className="text-gray-900 text-sm">{formatDate(selectedCategory.createdAt)}</p>
                </div>
              )}

              {selectedCategory.updatedAt && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Updated</label>
                  <p className="text-gray-900 text-sm">{formatDate(selectedCategory.updatedAt)}</p>
                </div>
              )}

              {selectedCategory.description && (
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900 leading-relaxed">{selectedCategory.description}</p>
                </div>
              )}

              {selectedCategory.blogCount !== undefined && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Blogs</label>
                  <p className="text-2xl font-bold text-blue-600">{selectedCategory.blogCount}</p>
                </div>
              )}

              {selectedCategory.tags && selectedCategory.tags.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditCategory(selectedCategory);
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Category</span>
              </button>
              
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleViewBlogs(selectedCategory);
                }}
                className={`flex-1 bg-gradient-to-r ${getCardColor(categories.findIndex(c => c.id === selectedCategory.id))} text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2`}
              >
                <Eye className="w-4 h-4" />
                <span>View Blogs</span>
              </button>
              
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleDeleteCategory(selectedCategory);
                }}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BlogCategory;