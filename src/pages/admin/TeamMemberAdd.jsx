


import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, X, Eye, Users, UserCheck, UserX, Search, Filter, Loader2, AlertTriangle } from 'lucide-react';
import { TeamMembersAPI } from '../../api/teamMembers';
import { API_CONFIG, BASE_URL } from '../../api/api-config';

// Error Alert Component for inline errors
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
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDestructive = false, loading = false, error = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
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

          {/* Error Alert */}
          <ErrorAlert error={error} />

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 ${
                isDestructive
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                  : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
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

const TeamMemberAdd = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [confirmModalError, setConfirmModalError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef(null);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: '',
    loading: false
  });
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    image: null,
    isActive: true,
    ourExperts: true,   
    ourAdvisory: false    
  });

  // Helper function to extract error message
  const getErrorMessage = (error) => {
    // If it's already a string, check if it contains JSON
    if (typeof error === 'string') {
      // Check if the string contains JSON (like "HTTP 400: {...}")
      const jsonMatch = error.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const parsedError = JSON.parse(jsonMatch[0]);
          return parsedError.message || error;
        } catch (e) {
          // If parsing fails, return the original string
          return error;
        }
      }
      return error;
    }
    
    // Handle object errors
    if (error?.message) {
      // Check if message is a JSON string
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
    
    // Handle API response errors
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Handle direct API error objects
    if (error?.result === null && error?.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await TeamMembersAPI.getAll();
        if (res.success) {
          console.log("Team Members Result: ", res.result);
          setTeamMembers(res.result || []);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const openViewModal = (member) => {
    setViewingMember(member);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingMember(null);
  };

  const openModal = (member = null) => {
    setModalError(null); // Clear modal error when opening
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        description: member.description,
        image: null,
        isActive: member.isActive,
        ourExperts: member.ourExperts || false,    
        ourAdvisory: member.ourAdvisory || false   
      });
      setPreviewImage(BASE_URL + member.image);
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: '',
        description: '',
        image: null,
        isActive: true,
        ourExperts: true,    
        ourAdvisory: false    
      });
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setModalError(null);
    setFormData({
      name: '',
      role: '',
      description: '',
      image: null,
      isActive: true,
      ourExperts: true,    
      ourAdvisory: false
    });
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setModalError(null); // Clear previous errors

    if (!formData.name || !formData.role || !formData.description) {
      setModalError('Please fill all required fields');
      return;
    }

    if (!editingMember && !formData.image) {
      setModalError('Please upload an image');
      return;
    }
    if (!formData.ourExperts && !formData.ourAdvisory) {
    setModalError('Please select member type (Our Experts or Our Advisory)');
    return;
  }

    try {
      setLoading(true);

      if (editingMember) {
        const memberData = {
          id: editingMember.id,
          name: formData.name,
          role: formData.role,
          description: formData.description,
          isActive: formData.isActive,
          ourExperts: formData.ourExperts,
          ourAdvisory: formData.ourAdvisory
        };

        if (formData.image instanceof File) {
          memberData.image = formData.image;
          
        }

        const res = await TeamMembersAPI.update(memberData);

        if (res.success) {
          setTeamMembers((prev) =>
            prev.map((m) =>
              m.id === editingMember.id ? { ...m, ...res.result } : m
            )
          );
          closeModal();
        } else {
          throw new Error(getErrorMessage(res));
        }
      } else {
        console.log("Team Member Data: ", formData);
      console.log("ourExperts:", formData.ourExperts);
      console.log("ourAdvisory:", formData.ourAdvisory);
      
        const res = await TeamMembersAPI.add(formData);

        if (res.success) {
          setTeamMembers((prev) => [...prev, res.result]);
          closeModal();
        } else {
          throw new Error(getErrorMessage(res));
        }
      }
    } catch (error) {
      setModalError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = (id, memberName) => {
    setConfirmModalError(null); // Clear previous errors
    setConfirmModal({
      isOpen: true,
      memberId: id,
      memberName,
      loading: false
    });
  };

  const confirmDeleteMember = async () => {
    const { memberId } = confirmModal;
    setConfirmModalError(null); // Clear previous errors

    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      const res = await TeamMembersAPI.delete(memberId);

      if (res.success) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
        cancelDeleteMember(); // Close modal on success
      } else {
        throw new Error(getErrorMessage(res));
      }
    } catch (error) {
      setConfirmModalError(getErrorMessage(error));
    } finally {
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDeleteMember = () => {
    setConfirmModal({
      isOpen: false,
      memberId: null,
      memberName: '',
      loading: false
    });
    setConfirmModalError(null);
  };

  // Filter team members based on search and status
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Active' && member.isActive) ||
                         (statusFilter === 'Inactive' && !member.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your team members</p>
        </div>
        <button
          onClick={() => openModal()}
          disabled={loading}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.isActive).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Inactive Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => !m.isActive).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredMembers.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
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
              <h3 className="font-semibold text-blue-800">Loading Team Members</h3>
              <p className="text-blue-700">Fetching team member data...</p>
              {retryCount > 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Level Error Alert */}
      <ErrorAlert 
        error={error} 
        onClose={() => setError(null)}
      />

      {/* Retry Button for Page Errors */}
      {error && !loading && (
        <div className="text-center">
          <button
            onClick={fetchTeamMembers}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Team Members Grid */}
      {!loading && !error && (
        <>
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600 mb-4">
                {teamMembers.length === 0 
                  ? "Get started by adding your first team member."
                  : "No members match your search criteria."
                }
              </p>
              <button
                onClick={() => openModal()}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Add Member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="relative">
                    <div className="aspect-square overflow-hidden bg-gray-100 cursor-pointer" onClick={() => openViewModal(member)}>
                      <img
                        src={BASE_URL + member.image}
                        alt={member.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => openViewModal(member)}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deleteMember(member.id, member.name)}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
                      member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-purple-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {member.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Since {new Date(member.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => openViewModal(member)}
                        className="text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Member Details Modal */}
      {isViewModalOpen && viewingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Team Member Details</h2>
              <button
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={BASE_URL + viewingMember.image}
                      alt={viewingMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      viewingMember.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingMember.isActive ? 'Active Member' : 'Inactive Member'}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {viewingMember.name}
                    </h3>
                    <p className="text-xl text-purple-600 font-medium mb-4">
                      {viewingMember.role}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">About</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {viewingMember.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Member Since
                      </h5>
                      <p className="text-gray-900 font-medium">
                        {new Date(viewingMember.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Status
                      </h5>
                      <p className="text-gray-900 font-medium">
                        {viewingMember.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        closeViewModal();
                        openModal(viewingMember);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit Member
                    </button>
                    <button
                      onClick={() => {
                        closeViewModal();
                        deleteMember(viewingMember.id, viewingMember.name);
                      }}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete Member
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMember ? 'Update Team Member' : 'Add New Team Member'}
              </h2>
              <button
                onClick={closeModal}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Modal Error Alert */}
              <ErrorAlert 
                error={modalError} 
                onClose={() => setModalError(null)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo *
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={loading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 inline-flex items-center gap-2 ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload size={16} />
                        Choose Image
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG or GIF (1MB to 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="Enter member name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role/Position *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="e.g: Developer, Designer, Manager"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="Tell us about this team member..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Member is active
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2 space-y-3 border-t pt-4 mt-2">
  <p className="text-sm font-medium text-gray-700 mb-2">Member Type</p>
  
  <label className="flex items-center gap-2">
    <input
      type="radio"
      name="memberType"
      checked={formData.ourExperts === true}
      onChange={() => setFormData(prev => ({ 
        ...prev, 
        ourExperts: true, 
        ourAdvisory: false 
      }))}
      disabled={loading}
      className="w-4 h-4 text-purple-600"
    />
    <span className="text-sm font-medium text-gray-700">Our Experts</span>
  </label>
  
  <label className="flex items-center gap-2">
    <input
      type="radio"
      name="memberType"
      checked={formData.ourAdvisory === true}
      onChange={() => setFormData(prev => ({ 
        ...prev, 
        ourExperts: false, 
        ourAdvisory: true 
      }))}
      disabled={loading}
      className="w-4 h-4 text-purple-600"
    />
    <span className="text-sm font-medium text-gray-700">Our Advisory</span>
  </label>
</div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>
                    {loading 
                      ? 'Saving...' 
                      : (editingMember ? 'Update' : 'Save')
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={cancelDeleteMember}
        onConfirm={confirmDeleteMember}
        title="Delete Team Member"
        message={`Are you sure you want to delete "${confirmModal.memberName}" from the team? This action cannot be undone and will permanently remove all their information.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={confirmModal.loading}
        error={confirmModalError}
      />
    </div>
  );
};

export default TeamMemberAdd;