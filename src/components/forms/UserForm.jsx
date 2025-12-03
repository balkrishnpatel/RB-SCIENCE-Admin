import React, { useState, useEffect } from 'react';

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    mobileNumber: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        emailAddress: user.emailAddress || '',
        mobileNumber: user.mobileNumber || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear submit error when user modifies any field
    if (errors.submit) {
      setErrors({ ...errors, submit: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Email is invalid';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clear previous errors
    setErrors({});
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave(formData);
      // If we reach here, the save was successful and the modal should close
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Extract only the message from error response
      let errorMessage = 'Failed to save user. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.fullName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter full name"
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          name="emailAddress"
          value={formData.emailAddress}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.emailAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="euryfox@gmail.com"
        />
        {errors.emailAddress && <p className="text-red-500 text-sm mt-1">{errors.emailAddress}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Number *
        </label>
        <input
          type="tel"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="9988123456"
        />
        {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter address"
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      {/* Submit Error - Show API errors like "Address cannot exceed 200 characters" */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>
            {isSubmitting 
              ? 'Saving...' 
              : (user ? 'Update User' : 'Add User')
            }
          </span>
        </button>
      </div>
    </form>
  );
};

export default UserForm;






































// import React, { useState, useEffect } from 'react';

// const UserForm = ({ user, onSave, onCancel }) => {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     emailAddress: '',
//     mobileNumber: '',
//     address: ''
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         fullName: user.fullName || '',
//         emailAddress: user.emailAddress || '',
//         mobileNumber: user.mobileNumber || '',
//         address: user.address || ''
//       });
//     }
//   }, [user]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear errors when user starts typing
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: '' });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.fullName.trim()) {
//       newErrors.fullName = 'Full name is required';
//     }
    
//     if (!formData.emailAddress.trim()) {
//       newErrors.emailAddress = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
//       newErrors.emailAddress = 'Email is invalid';
//     }
    
//     if (!formData.mobileNumber.trim()) {
//       newErrors.mobileNumber = 'Mobile number is required';
//     } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
//       newErrors.mobileNumber = 'Mobile number must be 10 digits';
//     }
    
//     if (!formData.address.trim()) {
//       newErrors.address = 'Address is required';
//     }
    
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     const formErrors = validateForm();
//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       await onSave(formData);
//     } catch (error) {
//       console.error('Error saving user:', error);
//       setErrors({ submit: 'Failed to save user. Please try again.' });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Full Name *
//         </label>
//         <input
//           type="text"
//           name="fullName"
//           value={formData.fullName}
//           onChange={handleChange}
//           required
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//             errors.fullName ? 'border-red-500' : 'border-gray-300'
//           }`}
//           placeholder="Enter full name"
//         />
//         {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Email Address *
//         </label>
//         <input
//           type="email"
//           name="emailAddress"
//           value={formData.emailAddress}
//           onChange={handleChange}
//           required
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//             errors.emailAddress ? 'border-red-500' : 'border-gray-300'
//           }`}
//           placeholder="euryfox@gmail.com"
//         />
//         {errors.emailAddress && <p className="text-red-500 text-sm mt-1">{errors.emailAddress}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Mobile Number *
//         </label>
//         <input
//           type="tel"
//           name="mobileNumber"
//           value={formData.mobileNumber}
//           onChange={handleChange}
//           required
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//             errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
//           }`}
//           placeholder="9988123456"
//         />
//         {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Address *
//         </label>
//         <textarea
//           name="address"
//           value={formData.address}
//           onChange={handleChange}
//           rows={3}
//           required
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//             errors.address ? 'border-red-500' : 'border-gray-300'
//           }`}
//           placeholder="Enter address"
//         />
//         {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
//       </div>

//       {/* Submit Error */}
//       {errors.submit && (
//         <div className="bg-red-50 border border-red-200 rounded-md p-3">
//           <p className="text-red-600 text-sm">{errors.submit}</p>
//         </div>
//       )}

//       <div className="flex justify-end space-x-3 pt-4">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//           disabled={isSubmitting}
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
//         >
//           {isSubmitting && (
//             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//           )}
//           <span>
//             {isSubmitting 
//               ? 'Saving...' 
//               : (user ? 'Update User' : 'Add User')
//             }
//           </span>
//         </button>
//       </div>
//     </form>
//   );
// };

// export default UserForm;