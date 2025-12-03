import React from 'react';
import {
  X,
  Mail,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Key,
  Edit,
  Trash2
} from 'lucide-react';

const AdminUserModal = ({
  user,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (user.isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
        <XCircle className="w-4 h-4 mr-1" />
        Inactive
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Admin User Details</h2>
              <p className="text-sm text-gray-500">View and manage admin information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
            {getStatusBadge()}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Full Name
                  </label>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.email || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Account Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    User ID
                  </label>
                  <p className="text-xs font-mono text-gray-900 break-all">
                    {user._id || user.id || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Role
                  </label>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.role || 'Administrator'}
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Activity Timeline
            </h3>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Account Created
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {user.updatedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {user.lastLogin && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Last Login
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(user.lastLogin)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {user.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">Notes</h3>
              <p className="text-sm text-yellow-700">{user.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                onEdit(user);
                onClose();
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Information
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
                  onDelete(user._id || user.id);
                  onClose();
                }
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserModal;


























































// import React from 'react';
// import { 
//   X, 
//   Mail, 
//   User, 
//   Calendar, 
//   Clock, 
//   CheckCircle, 
//   XCircle,
//   Shield,
//   Key
// } from 'lucide-react';

// const AdminUserModal = ({ 
//   user, 
//   onClose,
//   onEdit,
//   onChangePassword,
//   onToggleStatus,
//   onDelete
// }) => {
//   if (!user) return null;

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusBadge = () => {
//     if (user.isActive) {
//       return (
//         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
//           <CheckCircle className="w-4 h-4 mr-1" />
//           Active
//         </span>
//       );
//     }
//     return (
//       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
//         <XCircle className="w-4 h-4 mr-1" />
//         Inactive
//       </span>
//     );
//   };

//   return (
//     <div style={{marginTop: "0"}} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Modal Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
//           <div className="flex items-center space-x-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//               <Shield className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">Admin User Details</h2>
//               <p className="text-sm text-gray-500">View and manage admin information</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Modal Body */}
//         <div className="p-6 space-y-6">
//           {/* Status Badge */}
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
//             {getStatusBadge()}
//           </div>

//           {/* Basic Information */}
//           <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//             <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
//               Basic Information
//             </h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Name */}
//               <div className="flex items-start space-x-3">
//                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <User className="w-5 h-5 text-blue-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <label className="block text-xs font-medium text-gray-500 mb-1">
//                     Full Name
//                   </label>
//                   <p className="text-sm font-semibold text-gray-900 truncate">
//                     {user.name || 'N/A'}
//                   </p>
//                 </div>
//               </div>

//               {/* Email */}
//               <div className="flex items-start space-x-3">
//                 <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Mail className="w-5 h-5 text-purple-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <label className="block text-xs font-medium text-gray-500 mb-1">
//                     Email Address
//                   </label>
//                   <p className="text-sm font-semibold text-gray-900 truncate">
//                     {user.email || 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Account Details */}
//           <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//             <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
//               Account Details
//             </h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* User ID */}
//               <div className="flex items-start space-x-3">
//                 <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Key className="w-5 h-5 text-gray-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <label className="block text-xs font-medium text-gray-500 mb-1">
//                     User ID
//                   </label>
//                   <p className="text-xs font-mono text-gray-900 break-all">
//                     {user._id || user.id || 'N/A'}
//                   </p>
//                 </div>
//               </div>

//               {/* Role */}
//               <div className="flex items-start space-x-3">
//                 <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Shield className="w-5 h-5 text-indigo-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <label className="block text-xs font-medium text-gray-500 mb-1">
//                     Role
//                   </label>
//                   <p className="text-sm font-semibold text-gray-900">
//                     {user.role || 'Administrator'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Timestamps */}
//           <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//             <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
//               Activity Timeline
//             </h3>
            
//             <div className="space-y-3">
//               {/* Created At */}
//               <div className="flex items-start space-x-3">
//                 <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Calendar className="w-5 h-5 text-green-600" />
//                 </div>
//                 <div className="flex-1">
//                   <label className="block text-xs font-medium text-gray-500 mb-1">
//                     Account Created
//                   </label>
//                   <p className="text-sm text-gray-900">
//                     {formatDate(user.createdAt)}
//                   </p>
//                 </div>
//               </div>

//               {/* Updated At */}
//               {user.updatedAt && (
//                 <div className="flex items-start space-x-3">
//                   <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <Clock className="w-5 h-5 text-yellow-600" />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-xs font-medium text-gray-500 mb-1">
//                       Last Updated
//                     </label>
//                     <p className="text-sm text-gray-900">
//                       {formatDate(user.updatedAt)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Last Login */}
//               {user.lastLogin && (
//                 <div className="flex items-start space-x-3">
//                   <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <Clock className="w-5 h-5 text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-xs font-medium text-gray-500 mb-1">
//                       Last Login
//                     </label>
//                     <p className="text-sm text-gray-900">
//                       {formatDate(user.lastLogin)}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Additional Info */}
//           {user.notes && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <h3 className="text-sm font-semibold text-yellow-800 mb-2">Notes</h3>
//               <p className="text-sm text-yellow-700">{user.notes}</p>
//             </div>
//           )}
//         </div>

//         {/* Modal Footer - Action Buttons */}
//         <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-3">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <button
//               onClick={() => {
//                 onEdit(user);
//                 onClose();
//               }}
//               className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//             >
//               <User className="w-4 h-4 mr-2" />
//               Edit Information
//             </button>
            
//             <button
//               onClick={() => {
//                 onChangePassword(user);
//                 onClose();
//               }}
//               className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//             >
//               <Key className="w-4 h-4 mr-2" />
//               Change Password
//             </button>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <button
//               onClick={() => {
//                 onToggleStatus(user._id || user.id, user.isActive);
//                 onClose();
//               }}
//               className={`inline-flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
//                 user.isActive
//                   ? 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500'
//                   : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
//               }`}
//             >
//               {user.isActive ? (
//                 <>
//                   <XCircle className="w-4 h-4 mr-2" />
//                   Deactivate Account
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle className="w-4 h-4 mr-2" />
//                   Activate Account
//                 </>
//               )}
//             </button>
            
//             <button
//               onClick={() => {
//                 if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
//                   onDelete(user._id || user.id);
//                   onClose();
//                 }
//               }}
//               className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
//             >
//               <X className="w-4 h-4 mr-2" />
//               Delete User
//             </button>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminUserModal;