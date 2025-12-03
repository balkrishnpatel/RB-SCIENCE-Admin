import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../api/api-config';
import { useAuth } from '../../contexts/AuthContext';
import AdminUserForm from '../../components/forms/AdminUserForm';
import AdminUserModal from '../../components/modals/AdminUserModal';
import {
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Search,
  RefreshCw
} from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(''); 

  // Add this useEffect to log currentUser changes
  useEffect(() => {
    console.log('=== Current User from Auth Context ===');
    console.log('currentUser:', currentUser);
    console.log('currentUser type:', typeof currentUser);
    console.log('currentUser keys:', currentUser ? Object.keys(currentUser) : 'null');
    
    // Also check localStorage directly
    const storedUser = localStorage.getItem('adminUser');
    console.log('Stored user in localStorage:', storedUser);
    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(storedUser);
        console.log('Parsed stored user:', parsed);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, [currentUser]);

  const fetchAdminUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.GET_ALL);
      const data = await response.json();
      console.log('Fetched admin users:', data);
      
      if (response.ok) {
        // Ensure we always set an array
        const users = data.result || data;
        setAdminUsers(Array.isArray(users) ? users : []);
      } else {
        setError('Failed to fetch admin users');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError('Failed to fetch admin users. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleAddAdmin = async (formData) => {
    setFormError('');
    setFormSuccess('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.ADD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setFormSuccess('Admin user added successfully!');
        fetchAdminUsers();
        setTimeout(() => {
          setShowAddForm(false);
          setFormSuccess('');
          setSuccess('Admin user added successfully!');
          setTimeout(() => setSuccess(''), 3000);
        }, 1500);
      } else {
        setFormError(data.message || 'Failed to add admin user');
      }
    } catch (err) {
      console.error('Error adding admin:', err);
      setFormError('Failed to add admin user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async (formData) => {
    setFormError('');
    setFormSuccess('');
    setLoading(true);

    try {
      console.log('=== Updating Admin ===');
      console.log('Original form data:', formData);
      
      // Ensure the ID is in the request body
      const userId = formData._id || formData.id;
      console.log('User ID for update:', userId);
      
      if (!userId) {
        setFormError('User ID is missing');
        setLoading(false);
        return;
      }
      
      // Prepare request body with ID
      const requestBody = {
        ...formData,
        //_id: userId,  // Ensure _id is included
        id: userId    // Also include id for compatibility
      };
      
      console.log('Update endpoint:', API_ENDPOINTS.ADMIN.UPDATE);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(API_ENDPOINTS.ADMIN.UPDATE, {
        method: 'POST',  // ← Changed from PUT to POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Update response:', data);
      console.log('Response status:', response.status);

      if (response.ok) {
        setFormSuccess('Admin user updated successfully!');
        fetchAdminUsers();
        setTimeout(() => {
          setShowEditForm(false);
          setFormSuccess('');
          setSelectedUser(null);
          setSuccess('Admin user updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
        }, 1500);
      } else {
        setFormError(data.message || 'Failed to update admin user');
      }
    } catch (err) {
      console.error('Error updating admin:', err);
      setFormError('Failed to update admin user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.DELETE(id), {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Admin user deleted successfully!');
        fetchAdminUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete admin user');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
      setError('Failed to delete admin user. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = async (user) => {
    console.log('=== Opening Edit Form ===');
    console.log('User to edit:', user);
    console.log('User ID (_id):', user._id);
    console.log('User ID (id):', user.id);
    console.log('User email:', user.email);
    
    console.log('Current User:', currentUser);
    console.log('Current User ID (_id):', currentUser?._id);
    console.log('Current User ID (id):', currentUser?.id);
    console.log('Current User email:', currentUser?.email);
    
    // Check if currentUser exists
    if (!currentUser) {
      console.error('currentUser is null or undefined!');
      setError('Authentication error. Please log in again.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Get user ID (handle both _id and id)
    const userToEditId = user._id || user.id;
    const currentUserId = currentUser._id || currentUser.id;
    
    console.log('Comparing IDs:');
    console.log('User to edit ID:', userToEditId, typeof userToEditId);
    console.log('Current user ID:', currentUserId, typeof currentUserId);
    
    // Compare IDs (handle both string and ObjectId comparisons)
    const idMatch = String(currentUserId) === String(userToEditId);
    const emailMatch = currentUser.email === user.email;
    
    console.log('ID Match:', idMatch);
    console.log('Email Match:', emailMatch);
    
    const isCurrentUser = idMatch || emailMatch;
    
    console.log('Is Current User:', isCurrentUser);

    if (!isCurrentUser) {
      console.warn('Permission denied: Not the current user');
      setError('You can only edit your own profile');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const userId = user._id || user.id;
      console.log('Fetching user details for ID:', userId);
      
      const response = await fetch(API_ENDPOINTS.ADMIN.GET_BY_ID(userId));
      const data = await response.json();
      
      console.log('Fetched user details:', data);

      if (response.ok) {
        const userData = data.data || data.result || data;
        console.log('Setting selected user:', userData);
        setSelectedUser(userData);
        setShowEditForm(true);
        setFormError('');
        setFormSuccess('');
      } else {
        console.error('Failed to fetch user details:', data);
        setError('Failed to fetch user details');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch user details');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openViewModal = async (user) => {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.GET_BY_ID(user._id || user.id));
      const data = await response.json();

      if (response.ok) {
        setSelectedUser(data.result || data.data || data);
        setShowViewModal(true);
      } else {
        setError('Failed to fetch user details');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch user details');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredUsers = adminUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admin users and their permissions</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setFormError('');
            setFormSuccess('');
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Admin
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Debug Info Card - Remove this after debugging */}
      {/* {currentUser && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
          <strong>Current User:</strong> {currentUser.name} ({currentUser.email})
          <br />
          <strong>ID:</strong> {currentUser._id || currentUser.id || 'N/A'}
        </div>
      )} */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={fetchAdminUsers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No admin users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openViewModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditForm(user)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                              handleDeleteAdmin(user._id || user.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <AdminUserForm
          mode="add"
          onSubmit={handleAddAdmin}
          onCancel={() => setShowAddForm(false)}
          loading={loading}
          error={formError}
          success={formSuccess}
        />
      )}

      {showEditForm && selectedUser && (
        <AdminUserForm
          mode="edit"
          user={selectedUser}
          onSubmit={handleUpdateAdmin}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedUser(null);
          }}
          loading={loading}
          error={formError}
          success={formSuccess}
        />
      )}

      {showViewModal && selectedUser && (
        <AdminUserModal
          user={selectedUser}
          onClose={() => {
            setShowViewModal(false);
            setSelectedUser(null);
          }}
          onEdit={openEditForm}
          onDelete={handleDeleteAdmin}
        />
      )}
    </div>
  );
};

export default AdminUsers;