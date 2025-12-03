

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, Loader2, Star, Clock, User, Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import { BlogsAPI, BlogCategoriesAPI } from '../../api/blogs';
import { API_CONFIG, BASE_URL } from '../../api/api-config';
import BlogViewModal from '../../components/modals/BlogViewModal';

const Blogs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [blogs, setBlogs] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Blog view modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    blogId: null,
    blogTitle: ''
  });

  useEffect(() => {
    fetchBlogs();
    fetchBlogCategories();
    
    // Handle category filter from navigation state
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location.state]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await BlogsAPI.getAll();
        if (res.success) {
          console.log("Blogs Result: ", res.result);
          setBlogs(res.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error(res.message || 'Failed to fetch blogs');
        }
      } catch (err) {
        attempts += 1;
        setRetryCount(attempts);
        if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
        } else {
          setError('Unable to fetch blogs. Please try again later.');
          setLoading(false);
        }
      }
    }
  };

  const fetchBlogCategories = async () => {
    try {
      const res = await BlogCategoriesAPI.getAll();
      if (res.success) {
        setBlogCategories(res.result || []);
      }
    } catch (err) {
      console.error('Failed to fetch blog categories:', err);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Updated category matching logic
    const matchesCategory = !selectedCategory || 
                           blog.categoryId === selectedCategory || 
                           blog.categoryId?.id === selectedCategory ||
                           blog.categoryId?.name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddBlog = () => {
    navigate('/admin/add-blog');
  };

  const handleEditBlog = (blog) => {
    navigate(`/admin/add-blog/${blog.id}`, { state: { blog } });
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setViewModalOpen(true);
  };

  // Modified delete handler - opens modal instead of confirm
  const handleDeleteBlog = (blog) => {
    setDeleteModal({
      isOpen: true,
      blogId: blog.id,
      blogTitle: blog.title
    });
  };

  // Confirm delete function
  const confirmDeleteBlog = async () => {
    if (!deleteModal.blogId) return;

    try {
      setLoading(true);
      const res = await BlogsAPI.delete(deleteModal.blogId);

      if (res.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== deleteModal.blogId));
        // Close modal on success
        setDeleteModal({ isOpen: false, blogId: null, blogTitle: '' });
      } else {
        throw new Error(res.message || "Failed to delete blog");
      }
    } catch (error) {
      setError(error.message || "Something went wrong while deleting.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete function
  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, blogId: null, blogTitle: '' });
  };

  const getCategoryName = (categoryId) => {  
    // Handle different category data structures
    if (typeof categoryId === 'string') {
      return categoryId || 'Unknown';
    }
    if (typeof categoryId === 'object' && categoryId !== null) {
      return categoryId.name || 'Unknown';
    }
    return 'Unknown';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Clear category filter
  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">Manage your blog posts and content</p>
        </div>
        <button
          onClick={handleAddBlog}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Blog</span>
        </button>
      </div>

      {/* Stats Cards - Updated to show filtered results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {selectedCategory ? `${selectedCategory} Blogs` : 'Total Blogs'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{filteredBlogs.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Featured Blogs</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBlogs.filter(b => b.featured).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Blogs</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBlogs.filter(b => b.isActive).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBlogs.reduce((sum, b) => sum + (b.views || 0), 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Categories</option>
            {blogCategories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && !error && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Blogs</h3>
              <p className="text-blue-700">Fetching the latest blog posts...</p>
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
            onClick={fetchBlogs}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Blogs Grid - Updated Layout */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={BASE_URL + blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={() => handleEditBlog(blog)}
                    className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog)}
                    className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Featured Badge */}
                {blog.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3" fill="currentColor" />
                      Featured
                    </span>
                  </div> 
                )}

                {/* Category Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {getCategoryName(blog.categoryId)}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    blog.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {blog.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                {/* Title */}
                <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 hover:text-purple-600 transition-colors duration-200">
                  {blog.title}
                </h3>
                
                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <img
                      src={BASE_URL + blog.authorImage}
                      alt={blog.author}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-100"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{blog.author}</p>
                    <p className="text-xs text-gray-500">{blog.authorRole}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{blog.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{blog.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{blog.comments || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="text-xs text-gray-400 px-2 py-1">
                        +{blog.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* View Blog Button */}
                <button 
                  onClick={() => handleViewBlog(blog)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  View Blog
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No blogs found */}
      {/* No blogs found */}
      {!loading && !error && filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No blog posts found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filters' 
              : 'Get started by creating your first blog post'
            }
          </p>
          {searchTerm || selectedCategory ? (
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleAddBlog} // You'll need to implement this function
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Your First Blog Post
            </button>
          )}
        </div>
      )}
      {/* {!loading && !error && filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory ? 'Try adjusting your search or filters.' : 'Get started by creating your first blog post.'}
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={clearFilters}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )} */}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Blog</h3>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Are you sure you want to delete this blog post? This action cannot be undone.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    "{deleteModal.blogTitle}"
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBlog}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog View Modal */}
      <BlogViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        blog={selectedBlog} 
        onEdit={handleEditBlog}
        onDelete={handleDeleteBlog}
        getCategoryName={getCategoryName}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Blogs;

