import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/api-config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted, checking auth status...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      console.log('=== Checking Auth Status ===');
      
      const storedUser = localStorage.getItem('adminUser');
      const token = localStorage.getItem('adminToken');
      
      console.log('Raw storedUser from localStorage:', storedUser);
      console.log('Raw token from localStorage:', token);
      console.log('storedUser type:', typeof storedUser);
      console.log('token type:', typeof token);
      
      // Check if values exist and are not the string "undefined" or "null"
      // Token is optional - we can work with just user data
      if (storedUser && 
          storedUser !== 'undefined' && 
          storedUser !== 'null') {
        
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Successfully parsed user:', parsedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          // Clear invalid data
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminToken');
        }
      } else {
        console.log('No valid user data found in localStorage');
        // Clear any invalid data
        if (storedUser === 'undefined' || storedUser === 'null') {
          localStorage.removeItem('adminUser');
        }
        if (token === 'undefined' || token === 'null') {
          localStorage.removeItem('adminToken');
        }
      }
    } catch (error) {
      console.error('Error in checkAuthStatus:', error);
      // Clear invalid data
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
      console.log('Auth check complete');
    }
  };

  const login = async (email, password) => {
    console.log('=== Login Attempt ===');
    console.log('Email:', email);
    setIsLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        // Handle different possible response structures
        const userData = data.data || data.result || data.user;
        const token = data.token || 'no-token'; // Use placeholder if no token
        
        console.log('Extracted userData:', userData);
        console.log('Extracted token:', token);
        
        if (!userData) {
          console.error('No user data in response!');
          setIsLoading(false);
          return false;
        }
        
        // Warning if no token but continue anyway
        if (token === 'no-token') {
          console.warn('⚠️ No token in response! This should be fixed in the backend.');
        }
        
        // Set state first
        setUser(userData);
        setIsAuthenticated(true);
        
        // Then save to localStorage
        try {
          const userString = JSON.stringify(userData);
          console.log('Saving to localStorage - user:', userString);
          console.log('Saving to localStorage - token:', token);
          
          localStorage.setItem('adminUser', userString);
          localStorage.setItem('adminToken', token);
          
          // Verify it was saved
          const savedUser = localStorage.getItem('adminUser');
          const savedToken = localStorage.getItem('adminToken');
          console.log('Verification - saved user:', savedUser);
          console.log('Verification - saved token:', savedToken);
          
          if (savedUser === 'undefined' || !savedUser) {
            console.error('localStorage save failed for user!');
          }
          if (savedToken === 'undefined' || !savedToken) {
            console.error('localStorage save failed for token!');
          }
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
        }
        
        setIsLoading(false);
        console.log('Login successful');
        return true;
      } else {
        console.log('Login failed:', data.message || 'Unknown error');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('=== Logout ===');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    console.log('Logout complete');
  };

  const sendResetOTP = async (email) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.REQUEST_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setIsLoading(false);
      return response.ok && data.success;
    } catch (error) {
      console.error('Send OTP error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const verifyOTPAndResetPassword = async (email, otp, newPassword) => {
    setIsLoading(true);
    
    try {
      const verifyResponse = await fetch(API_ENDPOINTS.ADMIN.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        setIsLoading(false);
        return false;
      }

      const resetResponse = await fetch(API_ENDPOINTS.ADMIN.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const resetData = await resetResponse.json();
      setIsLoading(false);
      return resetResponse.ok && resetData.success;
    } catch (error) {
      console.error('Reset password error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const updateUser = (updatedUser) => {
    console.log('=== Updating User ===');
    console.log('Updated user data:', updatedUser);
    
    if (!updatedUser) {
      console.error('Cannot update user with null/undefined data');
      return;
    }
    
    setUser(updatedUser);
    
    try {
      const userString = JSON.stringify(updatedUser);
      localStorage.setItem('adminUser', userString);
      console.log('User updated in state and localStorage');
    } catch (error) {
      console.error('Error updating user in localStorage:', error);
    }
  };

  // Log state changes
  useEffect(() => {
    console.log('=== Auth State Changed ===');
    console.log('user:', user);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isLoading:', isLoading);
  }, [user, isAuthenticated, isLoading]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    sendResetOTP,
    verifyOTPAndResetPassword,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


























































// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { API_ENDPOINTS } from '../api/api-config';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = () => {
//     try {
//       const storedUser = localStorage.getItem('adminUser');
//       const token = localStorage.getItem('adminToken');
      
//       // Check if values exist and are not the string "undefined"
//       if (storedUser && storedUser !== 'undefined' && token && token !== 'undefined') {
//         setUser(JSON.parse(storedUser));
//         setIsAuthenticated(true);
//       }
//     } catch (error) {
//       console.error('Error checking auth status:', error);
//       // Clear invalid data
//       localStorage.removeItem('adminUser');
//       localStorage.removeItem('adminToken');
//     }
//     setIsLoading(false);
//   };

//   const login = async (email, password) => {
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(API_ENDPOINTS.ADMIN.LOGIN, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         const userData = data.data || data.user;
//         const token = data.token;
        
//         setUser(userData);
//         console.log('userData:', userData);
//         setIsAuthenticated(true);
//         localStorage.setItem('adminUser', JSON.stringify(userData));
//         localStorage.setItem('adminToken', token);
//         setIsLoading(false);
//         return true;
//       } else {
//         setIsLoading(false);
//         return false;
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       setIsLoading(false);
//       return false;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//     localStorage.removeItem('adminUser');
//     localStorage.removeItem('adminToken');
//   };

//   const sendResetOTP = async (email) => {
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(API_ENDPOINTS.ADMIN.REQUEST_OTP, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();
//       setIsLoading(false);
//       return response.ok && data.success;
//     } catch (error) {
//       console.error('Send OTP error:', error);
//       setIsLoading(false);
//       return false;
//     }
//   };

//   const verifyOTPAndResetPassword = async (email, otp, newPassword) => {
//     setIsLoading(true);
    
//     try {
//       const verifyResponse = await fetch(API_ENDPOINTS.ADMIN.VERIFY_OTP, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, otp }),
//       });

//       const verifyData = await verifyResponse.json();

//       if (!verifyResponse.ok || !verifyData.success) {
//         setIsLoading(false);
//         return false;
//       }

//       const resetResponse = await fetch(API_ENDPOINTS.ADMIN.CHANGE_PASSWORD, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, otp, newPassword }),
//       });

//       const resetData = await resetResponse.json();
//       setIsLoading(false);
//       return resetResponse.ok && resetData.success;
//     } catch (error) {
//       console.error('Reset password error:', error);
//       setIsLoading(false);
//       return false;
//     }
//   };

//   const updateUser = (updatedUser) => {
//     setUser(updatedUser);
//     localStorage.setItem('adminUser', JSON.stringify(updatedUser));
//   };

//   const value = {
//     user,
//     isAuthenticated,
//     isLoading,
//     login,
//     logout,
//     sendResetOTP,
//     verifyOTPAndResetPassword,
//     updateUser,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };










































// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { API_ENDPOINTS } from '../api/api-config';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = () => {
//     const storedUser = localStorage.getItem('adminUser');
//     const token = localStorage.getItem('adminToken');
    
//     if (storedUser && token) {
//       setUser(JSON.parse(storedUser));
//       setIsAuthenticated(true);
//     }
//     setIsLoading(false);
//   };

//   const login = async (email, password) => {
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(API_ENDPOINTS.ADMIN.LOGIN, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         const userData = data.data || data.user;
//         const token = data.token;
        
//         setUser(userData);
//         setIsAuthenticated(true);
//         localStorage.setItem('adminUser', JSON.stringify(userData));
//         localStorage.setItem('adminToken', token);
//         setIsLoading(false);
//         return true;
//       } else {
//         setIsLoading(false);
//         return false;
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       setIsLoading(false);
//       return false;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//     localStorage.removeItem('adminUser');
//     localStorage.removeItem('adminToken');
//   };

//   const sendResetOTP = async (email) => {
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(API_ENDPOINTS.ADMIN.REQUEST_OTP, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();
//       setIsLoading(false);
//       return response.ok && data.success;
//     } catch (error) {
//       console.error('Send OTP error:', error);
//       setIsLoading(false);
//       return false;
//     }
//   };

//   const verifyOTPAndResetPassword = async (email, otp, newPassword) => {
//     setIsLoading(true);
    
//     try {
//       const verifyResponse = await fetch(API_ENDPOINTS.ADMIN.VERIFY_OTP, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, otp }),
//       });

//       const verifyData = await verifyResponse.json();

//       if (!verifyResponse.ok || !verifyData.success) {
//         setIsLoading(false);
//         return false;
//       }

//       const resetResponse = await fetch(API_ENDPOINTS.ADMIN.CHANGE_PASSWORD, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, otp, newPassword }),
//       });

//       const resetData = await resetResponse.json();
//       setIsLoading(false);
//       return resetResponse.ok && resetData.success;
//     } catch (error) {
//       console.error('Reset password error:', error);
//       setIsLoading(false);
//       return false;
//     }
//   };

//   const updateUser = (updatedUser) => {
//     setUser(updatedUser);
//     localStorage.setItem('adminUser', JSON.stringify(updatedUser));
//   };

//   const value = {
//     user,
//     isAuthenticated,
//     isLoading,
//     login,
//     logout,
//     sendResetOTP,
//     verifyOTPAndResetPassword,
//     updateUser,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };





































// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is logged in on app start
//     const storedUser = localStorage.getItem('adminUser');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     setIsLoading(true);
    
//     // Simulate API call delay
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // For demo purposes, accept any email with password "admin123"
//     if (password === 'admin123') {
//       const userData = {
//         id: '1',
//         email: email,
//         name: email.split('@')[0]
//       };
      
//       setUser(userData);
//       localStorage.setItem('adminUser', JSON.stringify(userData));
//       setIsLoading(false);
//       return true;
//     }
    
//     setIsLoading(false);
//     return false;
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('adminUser');
//   };

//   const sendResetOTP = async (email) => {
//     setIsLoading(true);
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     // For demo, always return true
//     setIsLoading(false);
//     return true;
//   };

//   const verifyOTPAndResetPassword = async (email, otp, newPassword) => {
//     setIsLoading(true);
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // For demo, accept OTP "123456"
//     if (otp === '123456') {
//       setIsLoading(false);
//       return true;
//     }
    
//     setIsLoading(false);
//     return false;
//   };

//   const value = {
//     user,
//     isAuthenticated: !!user,
//     login,
//     logout,
//     sendResetOTP,
//     verifyOTPAndResetPassword,
//     isLoading
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };