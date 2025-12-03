import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../api/api-config';
import { Mail, Lock, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import logo from '../../../public/Euryfox-logo.png'


const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const { sendResetOTP, verifyOTPAndResetPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (message) {
      setMessage('');
    }
  };

  const validateEmail = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswords = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    const success = await sendResetOTP(formData.email);

    if (success) {
      setStep(2);
      setMessage('OTP sent successfully to your email!');
    } else {
      setMessage('Failed to send OTP. Please check your email and try again.');
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!validateOTP()) return;

    // Verify OTP with the backend
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // OTP verified successfully, move to password reset step
        setStep(3);
        setMessage('OTP verified successfully! Please enter your new password.');
      } else {
        // OTP verification failed
        setMessage(data.message || 'Invalid OTP. Please check and try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setMessage('Failed to verify OTP. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    // Since OTP is already verified in step 2, just reset the password
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('Failed to reset password. Please try again.');
    }
  };

  const getPageTitle = () => {
    if (step === 1) return 'Forgot Password';
    if (step === 2) return 'Verify OTP';
    return 'Reset Password';
  };

  const getPageDescription = () => {
    if (step === 1) return 'Enter your email to receive a reset code';
    if (step === 2) return 'Enter the OTP sent to your email';
    return 'Enter your new password';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center h-16 px-2 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          
          <a href="/" className="flex items-center space-x-3 sm:space-x-4 group min-w-0 flex-shrink">
            <img src={logo} alt="Eury Fox Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-transform duration-300 group-hover:scale-105"/>

            <div style={{marginLeft: "1px"}} className="min-w-0">
              <h1 className="font-serif font-black text-lg  bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500  bg-clip-text text-transparent transition-colors duration-300 truncate">
                Eury Fox Global
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans hidden xs:block">
                Empowering Global Trade
              </p>
            </div>
          </a>
        </div>
      </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {getPageTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getPageDescription()}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          {message && (
            <div className={`border rounded-lg p-3 mb-6 ${
              message.includes('success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {message.includes('success') && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
                <p className={`text-sm ${
                  message.includes('success') ? 'text-green-600' : 'text-red-600'
                }`}>{message}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Send Otp'
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={handleOTPSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className={`block w-full px-3 py-3 border ${
                    errors.otp ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 text-center text-lg tracking-widest`}
                  placeholder="123456"
                />
                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
              </div> */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={formData.otp[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^\d*$/.test(value)) return;
                        
                        const newOtp = formData.otp.split('');
                        newOtp[index] = value;
                        setFormData(prev => ({ ...prev, otp: newOtp.join('') }));
                        
                        if (value && index < 5) {
                          document.getElementById(`otp-${index + 1}`)?.focus();
                        }
                        
                        if (errors.otp) {
                          setErrors(prev => ({ ...prev, otp: '' }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      className={`w-12 h-12 text-center text-lg font-semibold border-2 ${
                        errors.otp ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
                    />
                  ))}
                </div>
                {errors.otp && <p className="mt-1 text-sm text-red-600 text-center">{errors.otp}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Verify OTP
              </button>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-6" onSubmit={handlePasswordSubmit}>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
                    placeholder="Enter new password"
                  />
                </div>
                {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
                    placeholder="Confirm new password"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;



























// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { Mail, Lock, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

// const ForgotPassword = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     email: '',
//     otp: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [message, setMessage] = useState('');

//   const { sendResetOTP, verifyOTPAndResetPassword, isLoading } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//     if (message) {
//       setMessage('');
//     }
//   };

//   const validateStep1 = () => {
//     const newErrors = {};

//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateStep2 = () => {
//     const newErrors = {};

//     if (!formData.otp) {
//       newErrors.otp = 'OTP is required';
//     } else if (formData.otp.length !== 6) {
//       newErrors.otp = 'OTP must be 6 digits';
//     }

//     if (!formData.newPassword) {
//       newErrors.newPassword = 'New password is required';
//     } else if (formData.newPassword.length < 6) {
//       newErrors.newPassword = 'Password must be at least 6 characters';
//     }

//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = 'Confirm password is required';
//     } else if (formData.newPassword !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleStep1Submit = async (e) => {
//     e.preventDefault();

//     if (!validateStep1()) return;

//     const success = await sendResetOTP(formData.email);

//     if (success) {
//       setStep(2);
//       setMessage('OTP sent successfully to your email!');
//     } else {
//       setMessage('Failed to send OTP. Please check your email and try again.');
//     }
//   };

//   const handleStep2Submit = async (e) => {
//     e.preventDefault();

//     if (!validateStep2()) return;

//     const success = await verifyOTPAndResetPassword(
//       formData.email,
//       formData.otp,
//       formData.newPassword
//     );

//     if (success) {
//       setMessage('Password reset successful! Redirecting to login...');
//       setTimeout(() => {
//         navigate('/login');
//       }, 2000);
//     } else {
//       setMessage('Invalid OTP or failed to reset password. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 shadow-lg">
//             <Shield className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="mt-6 text-3xl font-bold text-gray-900">
//             {step === 1 ? 'Forgot Password' : 'Reset Password'}
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             {step === 1
//               ? 'Enter your email to receive a reset code'
//               : 'Enter the OTP and your new password'
//             }
//           </p>
//         </div>

//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
//           {step === 1 ? (
//             <form className="space-y-6" onSubmit={handleStep1Submit}>
//               {message && (
//                 <div className={`border rounded-lg p-3 ${
//                   message.includes('success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
//                 }`}>
//                   <p className={`text-sm ${
//                     message.includes('success') ? 'text-green-600' : 'text-red-600'
//                   }`}>{message}</p>
//                 </div>
//               )}

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`block w-full pl-10 pr-3 py-3 border ${
//                       errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                     } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
//                     placeholder="Enter your email"
//                   />
//                 </div>
//                 {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Sending OTP...
//                   </div>
//                 ) : (
//                   'Send Reset Code'
//                 )}
//               </button>
//             </form>
//           ) : (
//             <form className="space-y-6" onSubmit={handleStep2Submit}>
//               {message && (
//                 <div className={`border rounded-lg p-3 ${
//                   message.includes('success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
//                 }`}>
//                   <div className="flex items-center">
//                     {message.includes('success') && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
//                     <p className={`text-sm ${
//                       message.includes('success') ? 'text-green-600' : 'text-red-600'
//                     }`}>{message}</p>
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
//                   Enter OTP
//                 </label>
//                 <input
//                   id="otp"
//                   name="otp"
//                   type="text"
//                   value={formData.otp}
//                   onChange={handleChange}
//                   maxLength={6}
//                   className={`block w-full px-3 py-3 border ${
//                     errors.otp ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                   } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 text-center text-lg tracking-widest`}
//                   placeholder="123456"
//                 />
//                 {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
//               </div>

//               <div>
//                 <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                   New Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="newPassword"
//                     name="newPassword"
//                     type="password"
//                     value={formData.newPassword}
//                     onChange={handleChange}
//                     className={`block w-full pl-10 pr-3 py-3 border ${
//                       errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                     } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
//                     placeholder="Enter new password"
//                   />
//                 </div>
//                 {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
//               </div>

//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     type="password"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className={`block w-full pl-10 pr-3 py-3 border ${
//                       errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                     } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
//                     placeholder="Confirm new password"
//                   />
//                 </div>
//                 {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Resetting Password...
//                   </div>
//                 ) : (
//                   'Reset Password'
//                 )}
//               </button>
//             </form>
//           )}

//           <div className="mt-6 text-center">
//             <Link
//               to="/login"
//               className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
//             >
//               <ArrowLeft className="h-4 w-4 mr-1" />
//               Back to Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;


















































// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { Mail, Lock, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

// const ForgotPassword = () => {
//   const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
//   const [formData, setFormData] = useState({
//     email: '',
//     otp: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [message, setMessage] = useState('');
  
//   const { sendResetOTP, verifyOTPAndResetPassword, isLoading } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear errors when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//     if (message) {
//       setMessage('');
//     }
//   };

//   const validateStep1 = () => {
//     const newErrors = {};
    
//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateStep2 = () => {
//     const newErrors = {};
    
//     if (!formData.otp) {
//       newErrors.otp = 'OTP is required';
//     } else if (formData.otp.length !== 6) {
//       newErrors.otp = 'OTP must be 6 digits';
//     }
    
//     if (!formData.newPassword) {
//       newErrors.newPassword = 'New password is required';
//     } else if (formData.newPassword.length < 6) {
//       newErrors.newPassword = 'Password must be at least 6 characters';
//     }
    
//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = 'Confirm password is required';
//     } else if (formData.newPassword !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleStep1Submit = async (e) => {
//     e.preventDefault();
    
//     if (!validateStep1()) return;
    
//     const success = await sendResetOTP(formData.email);
    
//     if (success) {
//       setStep(2);
//       setMessage('OTP sent successfully to your email!');
//     } else {
//       setMessage('Failed to send OTP. Please try again.');
//     }
//   };

//   const handleStep2Submit = async (e) => {
//     e.preventDefault();
    
//     if (!validateStep2()) return;
    
//     const success = await verifyOTPAndResetPassword(
//       formData.email, 
//       formData.otp, 
//       formData.newPassword
//     );
    
//     if (success) {
//       setMessage('Password reset successful! Redirecting to login...');
//       setTimeout(() => {
//         navigate('/login');
//       }, 2000);
//     } else {
//       setMessage('Invalid OTP. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         {/* Header */}
//         <div className="text-center">
//           <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 shadow-lg">
//             <Shield className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="mt-6 text-3xl font-bold text-gray-900">
//             {step === 1 ? 'Forgot Password' : 'Reset Password'}
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             {step === 1 
//               ? 'Enter your email to receive a reset code'
//               : 'Enter the OTP and your new password'
//             }
//           </p>
//         </div>

//         {/* Form */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
//           {step === 1 ? (
//             <form className="space-y-6" onSubmit={handleStep1Submit}>
//               {message && (
//                 <div className={`border rounded-lg p-3 ${
//                   message.includes('success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
//                 }`}>
//                   <p className={`text-sm ${
//                     message.includes('success') ? 'text-green-600' : 'text-red-600'
//                   }`}>{message}</p>
//                 </div>
//               )}

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`block w-full pl-10 pr-3 py-3 border ${
//                       errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                     } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
//                     placeholder="Enter your email"
//                   />
//                 </div>
//                 {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Sending OTP...
//                   </div>
//                 ) : (
//                   'Send Reset Code'
//                 )}
//               </button>
//             </form>
//           ) : (
//             <form className="space-y-6" onSubmit={handleStep2Submit}>
//               {message && (
//                 <div className={`border rounded-lg p-3 ${
//                   message.includes('success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
//                 }`}>
//                   <div className="flex items-center">
//                     {message.includes('success') && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
//                     <p className={`text-sm ${
//                       message.includes('success') ? 'text-green-600' : 'text-red-600'
//                     }`}>{message}</p>
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
//                   Enter OTP
//                 </label>
//                 <input
//                   id="otp"
//                   name="otp"
//                   type="text"
//                   value={formData.otp}
//                   onChange={handleChange}
//                   maxLength={6}
//                   className={`block w-full px-3 py-3 border ${
//                     errors.otp ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                   } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 text-center text-lg tracking-widest`}
//                   placeholder="123456"
//                 />
//                 {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
//               </div>

//               <div>
//                 <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                   New Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="newPassword"
//                     name="newPassword"
//                     type="password"
//                     value={formData.newPassword}
//                     onChange={handleChange}
//                     className={`block w-full pl-10 pr-3 py-3 border ${
//                       errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                     } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
//                     placeholder="Enter new password"
//                   />
//                 </div>
//                 {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
//               </div>

//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     type="password"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className={`block w-full pl-10 pr-3 py-3 border ${
//                       errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                     } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
//                     placeholder="Confirm new password"
//                   />
//                 </div>
//                 {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Resetting Password...
//                   </div>
//                 ) : (
//                   'Reset Password'
//                 )}
//               </button>

//               {/* Demo Info */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
//                 <p className="text-xs text-blue-600 text-center">
//                   <strong>Demo:</strong> Use OTP "123456" to reset password
//                 </p>
//               </div>
//             </form>
//           )}

//           {/* Back to Login */}
//           <div className="mt-6 text-center">
//             <Link 
//               to="/login" 
//               className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
//             >
//               <ArrowLeft className="h-4 w-4 mr-1" />
//               Back to Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;