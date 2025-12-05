import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Search, Filter, Loader2, AlertTriangle, Star, X } from 'lucide-react';
import { SuccessStoriesAPI } from '../../api/successStoriesAPI';
import { API_CONFIG, BASE_URL } from '../../api/api-config';
import SuccessStoriesForm from '../../components/forms/SuccessStoriesForm';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDestructive = false, loading = false, error = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isDestructive && (
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ErrorAlert error={error} />

          <div className="mb-6">
            <p className="text-gray-600">{message}</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                isDestructive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessStoriesManagement = () => {
  const [stories, setStories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [viewingStory, setViewingStory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    storyId: null,
    storyName: '',
    loading: false,
    error: null
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      const jsonMatch = error.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const parsedError = JSON.parse(jsonMatch[0]);
          return parsedError.message || error;
        } catch (e) {
          return error;
        }
      }
      return error;
    }
    
    if (error?.message) {
      if (typeof error.message === 'string' && error.message.includes('{')) {
        const jsonMatch = error.message.match(/\{.*\}/);
        if (jsonMatch) {
          try {
            const parsedError = JSON.parse(jsonMatch[0]);
            return parsedError.message || error.message;
          } catch (e) {
            return error.message;
          }
        }
      }
      return error.message;
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.result === null && error?.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };

  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await SuccessStoriesAPI.getAll();
        if (res.success) {
          setStories(res.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error(getErrorMessage(res));
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

  const openForm = (story = null) => {
    setEditingStory(story);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStory(null);
  };

  const handleFormSuccess = () => {
    fetchStories();
    closeForm();
  };

  const openViewModal = (story) => {
    setViewingStory(story);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingStory(null);
  };

  const deleteStory = (id, storyName) => {
    setConfirmModal({
      isOpen: true,
      storyId: id,
      storyName,
      loading: false,
      error: null
    });
  };

  const confirmDeleteStory = async () => {
    const { storyId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, error: null, loading: true }));

    try {
      const res = await SuccessStoriesAPI.delete(storyId);

      if (res.success) {
        setStories((prev) => prev.filter((s) => s.id !== storyId));
        cancelDeleteStory();
      } else {
        throw new Error(getErrorMessage(res));
      }
    } catch (error) {
      setConfirmModal(prev => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDeleteStory = () => {
    setConfirmModal({
      isOpen: false,
      storyId: null,
      storyName: '',
      loading: false,
      error: null
    });
  };

  // Filter stories
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = activeFilter === 'All' || 
                         (activeFilter === 'Active' && story.isActive) ||
                         (activeFilter === 'Inactive' && !story.isActive);
    return matchesSearch && matchesActive;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Success Stories Management</h1>
          <p className="text-gray-600 mt-1">Manage testimonials and success stories</p>
        </div>
        <button
          onClick={() => openForm()}
          disabled={loading}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Story</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Stories</p>
              <p className="text-2xl font-bold text-gray-900">{stories.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Stories</p>
              <p className="text-2xl font-bold text-gray-900">
                {stories.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredStories.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {loading && !error && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Success Stories</h3>
              <p className="text-blue-700">Fetching data...</p>
              {retryCount > 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <ErrorAlert error={error} onClose={() => setError(null)} />

      {error && !loading && (
        <div className="text-center">
          <button
            onClick={fetchStories}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stories Grid */}
      {!loading && !error && (
        <>
          {filteredStories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
              <p className="text-gray-600 mb-4">
                {stories.length === 0 
                  ? "Get started by adding your first success story."
                  : "No stories match your search criteria."
                }
              </p>
              <button
                onClick={() => openForm()}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Add Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {story.image && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img 
                        src={BASE_URL + story.image} 
                        alt={story.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{story.name}</h3>
                        <p className="text-purple-600 text-sm font-medium">{story.position}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        story.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {story.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {story.description}
                    </p>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => openViewModal(story)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => openForm(story)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteStory(story.id, story.name)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Story Modal */}
      {isViewModalOpen && viewingStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">Success Story Details</h2>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {viewingStory.image && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={BASE_URL + viewingStory.image} 
                    alt={viewingStory.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                  viewingStory.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {viewingStory.isActive ? 'Active' : 'Inactive'}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewingStory.name}</h3>
                <p className="text-xl text-purple-600 font-medium mb-4">{viewingStory.position}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Testimonial</h4>
                <p className="text-gray-600 leading-relaxed">{viewingStory.description}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    closeViewModal();
                    openForm(viewingStory);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Story
                </button>
                <button
                  onClick={() => {
                    closeViewModal();
                    deleteStory(viewingStory.id, viewingStory.name);
                  }}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <SuccessStoriesForm
        isOpen={isFormOpen}
        onClose={closeForm}
        editingStory={editingStory}
        onSuccess={handleFormSuccess}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={cancelDeleteStory}
        onConfirm={confirmDeleteStory}
        title="Delete Success Story"
        message={`Are you sure you want to delete "${confirmModal.storyName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={confirmModal.loading}
        error={confirmModal.error}
      />
    </div>
  );
};

export default SuccessStoriesManagement;