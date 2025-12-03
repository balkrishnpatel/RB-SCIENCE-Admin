import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Search, ArrowLeft, X } from 'lucide-react';
import { CollaborativeProjectsAPI } from '../../api/collaborativeProjects';
import { BASE_URL } from '../../api/api-config';

const CollaborativeProject = () => {
  // View State: 'list' | 'add' | 'edit'
  const [view, setView] = useState('list');
  const [editingProject, setEditingProject] = useState(null);

  // List View States
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, projectId: null, projectTitle: '' });

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    university: '',
    isActive: true,
    image: null
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [imageError, setImageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await CollaborativeProjectsAPI.getAll();
      
      if (response.success) {
        setProjects(response.result || []);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load collaborative projects');
    } finally {
      setLoading(false);
    }
  };

  // Navigation Functions
  const handleAddProject = () => {
    resetForm();
    setView('add');
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      university: project.university || '',
      isActive: project.isActive !== undefined ? project.isActive : true,
      image: null
    });

    if (project.image) {
      setPreviewUrl(`${BASE_URL}${project.image}`);
    }

    setView('edit');
  };

  const handleBackToList = () => {
    resetForm();
    setView('list');
    setEditingProject(null);
  };

  // Form Functions
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      university: '',
      isActive: true,
      image: null
    });
    setSelectedImage(null);
    setPreviewUrl('');
    setFormErrors({});
    setImageError('');
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
    setFormData(prev => ({ ...prev, image: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.university.trim()) {
      newErrors.university = 'University name is required';
    }

    if (!editingProject && !selectedImage) {
      setImageError('Project image is required');
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const formValidationErrors = validateForm();
    if (Object.keys(formValidationErrors).length > 0 || imageError) {
      setFormErrors(formValidationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const projectData = {
        ...formData,
        image: selectedImage
      };

      if (editingProject) {
        projectData.id = editingProject._id || editingProject.id;
        const res = await CollaborativeProjectsAPI.update(projectData);

        if (res.success) {
          await fetchProjects();
          handleBackToList();
        } else {
          setError(res.message || "Failed to update project");
        }
      } else {
        const res = await CollaborativeProjectsAPI.add(projectData);

        if (res.success) {
          await fetchProjects();
          handleBackToList();
        } else {
          setError(res.message || "Failed to add project");
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      
      let errorMessage = 'Failed to save project. Please try again.';
      
      if (error.message) {
        const errorMsg = error.message;
        
        if (errorMsg.includes('HTTP') && errorMsg.includes('{')) {
          try {
            const jsonStart = errorMsg.indexOf('{');
            const jsonString = errorMsg.substring(jsonStart);
            const parsedError = JSON.parse(jsonString);
            
            if (parsedError.message) {
              errorMessage = parsedError.message;
            }
          } catch (parseError) {
            errorMessage = errorMsg;
          }
        } else if (errorMsg.startsWith('{') && errorMsg.endsWith('}')) {
          try {
            const parsedError = JSON.parse(errorMsg);
            if (parsedError.message) {
              errorMessage = parsedError.message;
            }
          } catch (parseError) {
            errorMessage = errorMsg;
          }
        } else {
          errorMessage = errorMsg;
        }
      } else if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Functions
  const handleDeleteClick = (project) => {
    setDeleteModal({
      show: true,
      projectId: project._id || project.id,
      projectTitle: project.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await CollaborativeProjectsAPI.delete(deleteModal.projectId);
      
      if (response.success) {
        setProjects(projects.filter(p => 
          (p._id || p.id) !== deleteModal.projectId
        ));
        setDeleteModal({ show: false, projectId: null, projectTitle: '' });
      } else {
        alert('Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, projectId: null, projectTitle: '' });
  };

  // Filter projects
  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ==================== RENDER LIST VIEW ====================
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
            onClick={fetchProjects}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collaborative Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage university collaboration projects
            </p>
          </div>
          <button
            onClick={handleAddProject}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Project</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, university, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No projects found matching your search' : 'No collaborative projects yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddProject}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id || project.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Project Image */}
                {project.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`${BASE_URL}${project.image}`}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Project Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {project.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-sm text-purple-600 font-medium mb-2">
                    {project.university}
                  </p>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {project.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(project)}
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

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Project
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "<strong>{deleteModal.projectTitle}</strong>"? 
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

  // ==================== RENDER ADD/EDIT FORM VIEW ====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBackToList}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Projects</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {view === 'edit' ? 'Edit Collaborative Project' : 'Add New Collaborative Project'}
          </h1>
          <p className="text-gray-600 mt-1">
            {view === 'edit' ? 'Update project information' : 'Create a new collaborative project'}
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

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="max-w-full mx-auto p-6 space-y-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      formErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter project title"
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
                    placeholder="Enter detailed project description"
                  />
                  {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University *
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      formErrors.university ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter university name"
                  />
                  {formErrors.university && <p className="text-red-500 text-sm mt-1">{formErrors.university}</p>}
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Project</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Active projects will be displayed on the website
                  </p>
                </div>
              </div>
            </div>

            {/* Project Image */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Image *
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
                      alt="Project preview"
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
                    : (view === 'edit' ? 'Update Project' : 'Add Project')
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

export default CollaborativeProject;