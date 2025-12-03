import { Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';

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

const CurrencyForm = ({ currency, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    flag: '',
    currency: '',
    rate: '',
    symbol: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currency) {
      console.log("Currency ID: ", currency.id);
      setFormData({
        name: currency.name || '',
        flag: currency.flag || '',
        currency: currency.currency || '',
        rate: currency.rate || '',
        symbol: currency.symbol || ''
      });
    }
  }, [currency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear submit error when user makes changes
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.flag.trim()) {
      newErrors.flag = 'Flag is required';
    }
    
    if (!formData.currency.trim()) {
      newErrors.currency = 'Currency is required';
    }
    
    if (!formData.rate.trim()) {
      newErrors.rate = 'Exchange rate is required';
    } else if (isNaN(parseFloat(formData.rate)) || parseFloat(formData.rate) <= 0) {
      newErrors.rate = 'Exchange rate must be a positive number';
    }
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Currency symbol is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({}); // Clear all previous errors
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("✅ Sending this to backend:", formData);
      
      await onSave(formData);
      
    } catch (error) {
      console.error('Error saving currency:', error);
      // Extract clean error message and show in modal
      setErrors({ 
        submit: extractErrorMessage(error.message || error) 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter currency name (e.g., Indian Rupee)"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Flag *
        </label>
        <input
          type="text"
          name="flag"
          value={formData.flag}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.flag ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter flag code (e.g., 🇮🇳)"
        />
        {errors.flag && <p className="text-red-500 text-sm mt-1">{errors.flag}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency *
        </label>
        <input
          type="text"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.currency ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter currency (e.g., INR)"
        />
        {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Exchange Rate * 
          <div className="relative group inline-block">
            {/* Icon */}
            <Info className="w-3 h-3 text-gray-600 cursor-pointer" />
            <span
              className="absolute left-full top-1/2 -translate-y-1/2 ml-2
                        px-2 py-0 text-sm text-white bg-gray-800 rounded-md hidden group-hover:block 
                        transition-opacity duration-300 whitespace-nowrap shadow-lg text-wrap w-[35vw] md:w-[40vw] lg:w-[30vw] xl:w-[20vw]"
            >
              Enter the exchange rate in relation to your base currency. For example, if the selected currency is USD and 1 USD equals 88.17 INR, <b>enter 88.17</b>. Similarly, if the selected currency is EUR and 1 EUR equals 95.50 INR, enter 95.50.
            </span>
          </div>

        </label>
        <input
          type="number"
          name="rate"
          value={formData.rate}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.rate ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter exchange rate (e.g., 83.50)"
        />
        {errors.rate && <p className="text-red-500 text-sm mt-1">{errors.rate}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency Symbol *
        </label>
        <input
          type="text"
          name="symbol"
          value={formData.symbol}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
            errors.symbol ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter currency symbol (e.g., ₹)"
        />
        {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
      </div>

      {/* Submit Error - Shows clean error message in modal */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>
            {isSubmitting 
              ? 'Saving...' 
              : (currency ? 'Update Currency' : 'Add Currency')
            }
          </span>
        </button>
      </div>
    </div>
  );
};

export default CurrencyForm;






