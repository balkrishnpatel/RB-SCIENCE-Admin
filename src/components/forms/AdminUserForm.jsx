import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

const AdminUserForm = ({
  mode = 'add',
  user = null,
  onSubmit,
  onCancel,
  loading = false,
  error = '',
  success = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
    }
  }, [mode, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (mode === 'add') {
      if (!formData.password) {
        errors.password = 'Temporary password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    } else if (mode === 'edit' && formData.password) {
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      id: user?._id || user?.id,
      name: formData.name,
      email: formData.email
    };

    if (mode === 'add' || (mode === 'edit' && formData.password)) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      password: ''
    });
    setValidationErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'add' ? 'Add New Admin User' : 'Edit Admin User'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'add'
                ? 'Create a new admin user with temporary password'
                : 'Update admin user information'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              <p className="font-medium">Success</p>
              <p>{success}</p>
            </div>
          )}

          {/* {mode === 'edit' && user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Editing: <strong>{user.name}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                User ID: {user._id || user.id}
              </p>
            </div>
          )} */}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter admin name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {validationErrors.name && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'add' ? 'Temporary Password' : 'New Password'}
              {mode === 'add' && <span className="text-red-500"> *</span>}
              {mode === 'edit' && <span className="text-gray-500"> (optional)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={mode === 'add' ? "Enter temporary password" : "Leave blank to keep current password"}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {validationErrors.password ? (
              <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                {mode === 'add'
                  ? 'Must be at least 6 characters. User will be prompted to change on first login.'
                  : 'Must be at least 6 characters if provided. Leave blank to keep current password.'}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>

            {mode === 'add' && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                disabled={loading}
              >
                Reset
              </button>
            )}

            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </span>
              ) : (
                mode === 'add' ? 'Add Admin User' : 'Update Admin User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserForm;


























































// import React, { useState, useEffect } from 'react';
// import { Eye, EyeOff, X } from 'lucide-react';

// const AdminUserForm = ({ 
//   mode = 'add', // 'add' or 'edit'
//   user = null,
//   onSubmit,
//   onCancel,
//   loading = false,
//   error = '',
//   success = ''
// }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: ''
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [validationErrors, setValidationErrors] = useState({});

//   // Populate form when editing
//   useEffect(() => {
//     if (mode === 'edit' && user) {
//       setFormData({
//         name: user.name || '',
//         email: user.email || '',
//         password: '' // Password not populated for security
//       });
//     }
//   }, [mode, user]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear validation error for this field
//     if (validationErrors[name]) {
//       setValidationErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const errors = {};

//     // Name validation
//     if (!formData.name.trim()) {
//       errors.name = 'Name is required';
//     } else if (formData.name.trim().length < 2) {
//       errors.name = 'Name must be at least 2 characters';
//     }

//     // Email validation
//     if (!formData.email.trim()) {
//       errors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       errors.email = 'Invalid email format';
//     }

//     // Password validation (only for add mode)
//     if (mode === 'add') {
//       if (!formData.password) {
//         errors.password = 'Temporary password is required';
//       } else if (formData.password.length < 6) {
//         errors.password = 'Password must be at least 6 characters';
//       }
//     }

//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     // Prepare data based on mode
//     const submitData = mode === 'add' 
//       ? formData 
//       : { 
//           id: user._id || user.id,
//           name: formData.name, 
//           email: formData.email 
//         };

//     onSubmit(submitData);
//   };

//   const handleReset = () => {
//     setFormData({
//       name: '',
//       email: '',
//       password: ''
//     });
//     setValidationErrors({});
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//         {/* Modal Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {mode === 'add' ? 'Add New Admin User' : 'Edit Admin User'}
//             </h2>
//             <p className="text-sm text-gray-500 mt-1">
//               {mode === 'add' 
//                 ? 'Create a new admin user with temporary password' 
//                 : 'Update admin user information'}
//             </p>
//           </div>
//           <button
//             onClick={onCancel}
//             className="text-gray-400 hover:text-gray-600 focus:outline-none"
//             disabled={loading}
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Modal Body */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           {/* Error Message */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
//               <p className="font-medium">Error</p>
//               <p>{error}</p>
//             </div>
//           )}

//           {/* Success Message */}
//           {success && (
//             <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
//               <p className="font-medium">Success</p>
//               <p>{success}</p>
//             </div>
//           )}

//           {/* Current User Info (Edit Mode) */}
//           {mode === 'edit' && user && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//               <p className="text-sm text-blue-800">
//                 Editing: <strong>{user.name}</strong>
//               </p>
//               <p className="text-xs text-blue-600 mt-1">
//                 User ID: {user._id || user.id}
//               </p>
//             </div>
//           )}

//           {/* Name Field */}
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//               Full Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               placeholder="Enter admin name"
//               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                 validationErrors.name ? 'border-red-500' : 'border-gray-300'
//               }`}
//               disabled={loading}
//             />
//             {validationErrors.name && (
//               <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
//             )}
//           </div>

//           {/* Email Field */}
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               placeholder="admin@example.com"
//               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                 validationErrors.email ? 'border-red-500' : 'border-gray-300'
//               }`}
//               disabled={loading}
//             />
//             {validationErrors.email && (
//               <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
//             )}
//           </div>

//           {/* Password Field (Only in Add Mode) */}
//           {mode === 'add' && (
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Temporary Password <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   placeholder="Enter temporary password"
//                   className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                     validationErrors.password ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
//                   disabled={loading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//               {validationErrors.password ? (
//                 <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
//               ) : (
//                 <p className="mt-1 text-xs text-gray-500">
//                   Must be at least 6 characters. User will be prompted to change on first login.
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Password Note (Edit Mode) */}
//           {mode === 'edit' && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//               <p className="text-sm text-yellow-800">
//                 <strong>Note:</strong> To change the password, use the "Change Password" option from the admin users list.
//               </p>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={onCancel}
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
//               disabled={loading}
//             >
//               Cancel
//             </button>
            
//             {mode === 'add' && (
//               <button
//                 type="button"
//                 onClick={handleReset}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
//                 disabled={loading}
//               >
//                 Reset
//               </button>
//             )}
            
//             <button
//               type="submit"
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               disabled={loading}
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   {mode === 'add' ? 'Adding...' : 'Updating...'}
//                 </span>
//               ) : (
//                 mode === 'add' ? 'Add Admin User' : 'Update Admin User'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdminUserForm;