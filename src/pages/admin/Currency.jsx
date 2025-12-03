

// import React, { useState, useEffect } from 'react';
// import { Plus, Search, Edit, Trash2, DollarSign, Loader2, TrendingUp, Globe, AlertTriangle, X } from 'lucide-react';
// import Modal from '../../components/ui/Modal';
// import CurrencyForm from '../../components/forms/CurrencyForm';
// import { CurrenciesAPI } from '../../api/currencies';
// import { API_CONFIG } from '../../api/api-config';

// // Confirmation Modal Component
// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDestructive = true }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100' : 'bg-blue-100'}`}>
//                 <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
          
//           <p className="text-gray-600 mb-6">{message}</p>
          
//           <div className="flex justify-end space-x-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//             >
//               {cancelText}
//             </button>
//             <button
//               onClick={onConfirm}
//               className={`px-4 py-2 text-white rounded-md transition-colors ${
//                 isDestructive 
//                   ? 'bg-red-600 hover:bg-red-700' 
//                   : 'bg-blue-600 hover:bg-blue-700'
//               }`}
//             >
//               {confirmText}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Utility function to extract clean error message
// const extractErrorMessage = (error) => {
//   if (typeof error === 'string') {
//     // Try to extract message from JSON string
//     try {
//       const match = error.match(/"message":"([^"]+)"/);
//       if (match) {
//         return match[1];
//       }
//     } catch (e) {
//       // If parsing fails, return the original string
//     }
//     return error;
//   }
  
//   if (error && typeof error === 'object') {
//     return error.message || error.error || 'An unexpected error occurred';
//   }
  
//   return 'An unexpected error occurred';
// };

// const Currency = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingCurrency, setEditingCurrency] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [retryCount, setRetryCount] = useState(0);
//   const [currencies, setCurrencies] = useState([]);

//   // Confirmation modal state
//   const [confirmationModal, setConfirmationModal] = useState({
//     isOpen: false,
//     currencyId: null,
//     currencyName: '',
//     currencyCode: '',
//     error: null // Add error state for confirmation modal
//   });

//   useEffect(() => {
//     fetchCurrencies();
//   }, []);

//   const fetchCurrencies = async () => {
//     setLoading(true);
//     setError(null);
//     let attempts = 0;

//     while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
//       try {
//         const res = await CurrenciesAPI.getAll();
//         if (res.success) {
//           console.log("Currencies Result: ", res.result);
//           setCurrencies(res.result || []);
//           setLoading(false);
//           return;
//         } else {
//           throw new Error(res.message || 'Failed to fetch currencies');
//         }
//       } catch (err) {
//         attempts += 1;
//         setRetryCount(attempts);
//         if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
//           await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
//         } else {
//           setError(extractErrorMessage(err.message || err));
//           setLoading(false);
//         }
//       }
//     }
//   };

//   const filteredCurrencies = currencies.filter(currency =>
//     currency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     currency.currency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     currency.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleAddCurrency = () => {
//     setEditingCurrency(null);
//     setIsModalOpen(true);
//   };

//   const handleEditCurrency = (currency) => {
//     setEditingCurrency(currency);
//     setIsModalOpen(true);
//   };

//   const handleDeleteCurrency = (currency) => {
//     setConfirmationModal({
//       isOpen: true,
//       currencyId: currency.id,
//       currencyName: currency.name,
//       currencyCode: currency.currency,
//       error: null // Reset error when opening modal
//     });
//   };

//   const confirmDeleteCurrency = async () => {
//     const { currencyId } = confirmationModal;
    
//     try {
//       setLoading(true);
//       // Clear any previous errors in the modal
//       setConfirmationModal(prev => ({ ...prev, error: null }));
      
//       const res = await CurrenciesAPI.delete(currencyId);

//       if (res.success) {
//         setCurrencies((prev) => prev.filter((c) => c.id !== currencyId));
//         // Close modal on success
//         closeConfirmationModal();
//       } else {
//         throw new Error(res.message || "Failed to delete currency");
//       }
//     } catch (error) {
//       // Show error in the confirmation modal instead of main page
//       setConfirmationModal(prev => ({
//         ...prev,
//         error: extractErrorMessage(error.message || error)
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const closeConfirmationModal = () => {
//     setConfirmationModal({
//       isOpen: false,
//       currencyId: null,
//       currencyName: '',
//       currencyCode: '',
//       error: null
//     });
//   };

//   const handleSaveCurrency = async (currencyData) => {
//     try {
//       setLoading(true);

//       if (editingCurrency) {
//         currencyData.id = editingCurrency.id;
//         const res = await CurrenciesAPI.update(currencyData);

//         if (res.success) {
//           setCurrencies((prev) =>         
//             prev.map((c) =>
//               c.id === editingCurrency.id ? { ...c, ...res.result } : c
//             )
//           );
//           setIsModalOpen(false);
//           setEditingCurrency(null);
//         } else {
//           throw new Error(res.message || "Failed to update currency");
//         }
//       } else {
//         console.log("Currency Data: ", currencyData);
//         const res = await CurrenciesAPI.add(currencyData);

//         if (res.success) {
//           setCurrencies((prev) => [...prev, res.result]);
//           setIsModalOpen(false);
//           setEditingCurrency(null);
//         } else {
//           throw new Error(res.message || "Failed to add currency");
//         }
//       }
//     } catch (error) {
//       // This error will be handled by the CurrencyForm component
//       throw new Error(extractErrorMessage(error.message || error));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Currency Management</h1>
//           <p className="text-gray-600 mt-1">Manage exchange rates and currencies</p>
//         </div>
//         <button
//           onClick={handleAddCurrency}
//           className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Add Currency</span>
//         </button>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="relative max-w-md">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search className="h-5 w-5 text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Search currencies..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//           />
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading && !error && (
//         <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
//           <div className="flex items-center gap-3">
//             <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
//             <div>
//               <h3 className="font-semibold text-blue-800">Loading Currencies</h3>
//               <p className="text-blue-700">Fetching the latest currency data...</p>
//               {retryCount > 0 && (
//                 <p className="text-blue-600 text-sm mt-1">
//                   Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Error State - Only show on main page, not during modal operations */}
//       {error && !loading && !isModalOpen && !confirmationModal.isOpen && (
//         <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
//           <h3 className="font-semibold text-red-800">Something went wrong</h3>
//           <p className="text-red-700">{error}</p>
//           <button
//             onClick={fetchCurrencies}
//             className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       )}

//       {/* Currencies Grid */}
//       {!loading && !error && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredCurrencies.map(currency => (
//             <div key={currency.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                       {currency.flag || currency.symbol || currency.currency?.charAt(0) || '?'}
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-900">{currency.name}</h3>
//                       <p className="text-sm text-gray-500">{currency.currency}</p>
//                     </div>
//                   </div>
//                   <div className="flex space-x-1">
//                     <button
//                       onClick={() => handleEditCurrency(currency)}
//                       className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
//                     >
//                       <Edit className="w-4 h-4 text-gray-600" />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteCurrency(currency)}
//                       className="p-1 bg-gray-100 rounded-full hover:bg-red-50 transition-colors"
//                     >
//                       <Trash2 className="w-4 h-4 text-red-600" />
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-500">Symbol:</span>
//                     <span className="font-medium text-gray-900">{currency.symbol}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-500">Rate:</span>
//                     <span className="font-medium text-green-600">{currency.rate}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Empty State */}
//       {!loading && !error && filteredCurrencies.length === 0 && (
//         <div className="text-center py-12">
//           <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
//           <h3 className="mt-2 text-sm font-medium text-gray-900">No currencies found</h3>
//           <p className="mt-1 text-sm text-gray-500">
//             {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first currency.'}
//           </p>
//           {!searchTerm && (
//             <div className="mt-6">
//               <button
//                 onClick={handleAddCurrency}
//                 className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
//               >
//                 Add Currency
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Currency Form Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title={editingCurrency ? 'Edit Currency' : 'Add New Currency'}
//       >
//         <CurrencyForm
//           currency={editingCurrency}
//           onSave={handleSaveCurrency}
//           onCancel={() => setIsModalOpen(false)}
//         />
//       </Modal>

//       {/* Enhanced Confirmation Modal with Error Display */}
//       {confirmationModal.isOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 rounded-full bg-red-100">
//                     <AlertTriangle className="w-5 h-5 text-red-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900">Delete Currency</h3>
//                 </div>
//                 <button
//                   onClick={closeConfirmationModal}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
              
//               <p className="text-gray-600 mb-4">
//                 Are you sure you want to delete "{confirmationModal.currencyName}" ({confirmationModal.currencyCode})? 
//                 This action cannot be undone and may affect products or transactions that use this currency.
//               </p>

//               {/* Error display in modal */}
//               {confirmationModal.error && (
//                 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//                   <p className="text-red-600 text-sm">{confirmationModal.error}</p>
//                 </div>
//               )}
              
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={closeConfirmationModal}
//                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmDeleteCurrency}
//                   disabled={loading}
//                   className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
//                 >
//                   {loading && (
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   )}
//                   <span>{loading ? 'Deleting...' : 'Delete Currency'}</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Currency;





import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, DollarSign, Loader2, TrendingUp, Globe, AlertTriangle, X, Eye, Info, Calendar, Hash } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import CurrencyForm from '../../components/forms/CurrencyForm';
import { CurrenciesAPI } from '../../api/currencies';
import { API_CONFIG } from '../../api/api-config';

// Currency View Modal Component
const CurrencyViewModal = ({ isOpen, onClose, currency }) => {
  if (!isOpen || !currency) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {currency.flag || currency.symbol || currency.currency?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currency.name}</h2>
                <p className="text-gray-600">{currency.currency}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

  
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency Code:</span>
                  <span className="font-semibold text-gray-900 bg-white px-2 py-1 rounded border">
                    {currency.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency Name:</span>
                  <span className="font-medium text-gray-900">{currency.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency Rate:</span>
                  <span className="font-medium text-gray-900">{currency.rate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Symbol:</span>
                  <span className="font-bold text-lg text-purple-600">
                    {currency.symbol || 'N/A'}
                  </span>
                </div>
                {currency.flag && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Flag:</span>
                    <span className="text-2xl">{currency.flag}</span>
                  </div>
                )}
              </div>
            </div>
            </div>

   
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100' : 'bg-blue-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function to extract clean error message
const extractErrorMessage = (error) => {
  if (typeof error === 'string') {
    // Try to extract message from JSON string
    try {
      const match = error.match(/"message":"([^"]+)"/);
      if (match) {
        return match[1];
      }
    } catch (e) {
      // If parsing fails, return the original string
    }
    return error;
  }
  
  if (error && typeof error === 'object') {
    return error.message || error.error || 'An unexpected error occurred';
  }
  
  return 'An unexpected error occurred';
};

const Currency = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currencies, setCurrencies] = useState([]);

  // View modal state
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    currency: null
  });

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    currencyId: null,
    currencyName: '',
    currencyCode: '',
    error: null
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await CurrenciesAPI.getAll();
        if (res.success) {
          console.log("Currencies Result: ", res.result);
          setCurrencies(res.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error(res.message || 'Failed to fetch currencies');
        }
      } catch (err) {
        attempts += 1;
        setRetryCount(attempts);
        if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
        } else {
          setError(extractErrorMessage(err.message || err));
          setLoading(false);
        }
      }
    }
  };

  const filteredCurrencies = currencies.filter(currency =>
    currency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.currency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCurrency = () => {
    setEditingCurrency(null);
    setIsModalOpen(true);
  };

  const handleViewCurrency = (currency) => {
    setViewModal({
      isOpen: true,
      currency: currency
    });
  };

  const handleEditCurrency = (currency) => {
    setEditingCurrency(currency);
    setIsModalOpen(true);
  };

  const handleDeleteCurrency = (currency) => {
    setConfirmationModal({
      isOpen: true,
      currencyId: currency.id,
      currencyName: currency.name,
      currencyCode: currency.currency,
      error: null
    });
  };

  const confirmDeleteCurrency = async () => {
    const { currencyId } = confirmationModal;
    
    try {
      setLoading(true);
      setConfirmationModal(prev => ({ ...prev, error: null }));
      
      const res = await CurrenciesAPI.delete(currencyId);

      if (res.success) {
        setCurrencies((prev) => prev.filter((c) => c.id !== currencyId));
        closeConfirmationModal();
      } else {
        throw new Error(res.message || "Failed to delete currency");
      }
    } catch (error) {
      setConfirmationModal(prev => ({
        ...prev,
        error: extractErrorMessage(error.message || error)
      }));
    } finally {
      setLoading(false);
    }
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      currencyId: null,
      currencyName: '',
      currencyCode: '',
      error: null
    });
  };

  const closeViewModal = () => {
    setViewModal({
      isOpen: false,
      currency: null
    });
  };

  const handleSaveCurrency = async (currencyData) => {
    try {
      setLoading(true);

      if (editingCurrency) {
        currencyData.id = editingCurrency.id;
        const res = await CurrenciesAPI.update(currencyData);

        if (res.success) {
          setCurrencies((prev) =>         
            prev.map((c) =>
              c.id === editingCurrency.id ? { ...c, ...res.result } : c
            )
          );
          setIsModalOpen(false);
          setEditingCurrency(null);
        } else {
          throw new Error(res.message || "Failed to update currency");
        }
      } else {
        console.log("Currency Data: ", currencyData);
        const res = await CurrenciesAPI.add(currencyData);

        if (res.success) {
          setCurrencies((prev) => [...prev, res.result]);
          setIsModalOpen(false);
          setEditingCurrency(null);
        } else {
          throw new Error(res.message || "Failed to add currency");
        }
      }
    } catch (error) {
      throw new Error(extractErrorMessage(error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900"> </h1>
          <p className="text-gray-600 mt-1">Manage exchange rates and currencies</p>
        </div>
        <button
          onClick={handleAddCurrency}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Currency</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search currencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && !error && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Currencies</h3>
              <p className="text-blue-700">Fetching the latest currency data...</p>
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
      {error && !loading && !isModalOpen && !confirmationModal.isOpen && !viewModal.isOpen && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="font-semibold text-red-800">Something went wrong</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchCurrencies}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Currencies Grid */}
      {!loading && !error && (
         <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredCurrencies.map(currency => (
            <div key={currency.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="p-3 sm:p-4 lg:p-6">
                {/* Header Section - Responsive */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                      {currency.flag || currency.symbol || currency.currency?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm  truncate" title={currency.name}>
                        {currency.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate" title={currency.currency}>
                        {currency.currency}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Mobile First Design */}
                  <div className="flex space-x-1 sm:space-x-1 flex-shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleViewCurrency(currency)}
                      className="p-1.5 sm:p-1 bg-gray-100 rounded-full hover:bg-blue-50 transition-colors group touch-manipulation"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 group-hover:text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleEditCurrency(currency)}
                      className="p-1.5 sm:p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors touch-manipulation"
                      title="Edit Currency"
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteCurrency(currency)}
                      className="p-1.5 sm:p-1 bg-gray-100 rounded-full hover:bg-red-50 transition-colors touch-manipulation"
                      title="Delete Currency"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                {/* Currency Details - Responsive Layout */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">Symbol:</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base truncate ml-2" title={currency.symbol}>
                      {currency.symbol || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">Rate:</span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base truncate ml-2" title={currency.rate}>
                      {currency.rate ? parseFloat(currency.rate).toLocaleString(undefined, { maximumFractionDigits: 4 }) : 'N/A'}
                    </span>
                  </div>
                  
                  {/* Additional Info for Larger Screens */}
                  
                </div>

                {/* Mobile-Only Quick Actions */}
                <div className="block sm:hidden mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Last updated: {currency.updated_at ? new Date(currency.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}</span>
                    <span className="font-medium text-purple-600">ID: {currency.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCurrencies.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No currencies found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first currency.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={handleAddCurrency}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
              >
                Add Currency
              </button>
            </div>
          )}
        </div>
      )}

      {/* Currency Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCurrency ? 'Edit Currency' : 'Add New Currency'}
      >
        <CurrencyForm
          currency={editingCurrency}
          onSave={handleSaveCurrency}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Currency View Modal */}
      <CurrencyViewModal
        isOpen={viewModal.isOpen}
        onClose={closeViewModal}
        currency={viewModal.currency}
      />

      {/* Enhanced Confirmation Modal with Error Display */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Currency</h3>
                </div>
                <button
                  onClick={closeConfirmationModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{confirmationModal.currencyName}" ({confirmationModal.currencyCode})? 
                This action cannot be undone and may affect products or transactions that use this currency.
              </p>

              {/* Error display in modal */}
              {confirmationModal.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{confirmationModal.error}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConfirmationModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCurrency}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{loading ? 'Deleting...' : 'Delete Currency'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Currency;





































