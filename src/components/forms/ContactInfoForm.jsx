import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

const ContactInfoForm = ({ contact, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    infoEmail: '',
    salesEmail: '',
    supportEmail: '',
    officeAddress: [''],
    phoneNumbers: [''],
    emails: [''],
    businessHours: [
      'Monday: 9:00 AM - 6:00 PM',
      'Tuesday: 9:00 AM - 6:00 PM',
      'Wednesday: 9:00 AM - 6:00 PM',
      'Thursday: 9:00 AM - 6:00 PM',
      'Friday: 9:00 AM - 6:00 PM',
      'Saturday: 10:00 AM - 4:00 PM',
      'Sunday: Closed'
    ],
    latitude: '',
    longitude: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      console.log("Contact ID: ", contact.id);
      setFormData({
        ...contact,
        officeAddress: contact.officeAddress || [''],
        phoneNumbers: contact.phoneNumbers || [''],
        emails: contact.emails || [''],
        businessHours: contact.businessHours || [
          'Monday: 9:00 AM - 6:00 PM',
          'Tuesday: 9:00 AM - 6:00 PM',
          'Wednesday: 9:00 AM - 6:00 PM',
          'Thursday: 9:00 AM - 6:00 PM',
          'Friday: 9:00 AM - 6:00 PM',
          'Saturday: 10:00 AM - 4:00 PM',
          'Sunday: Closed'
        ]
      });
    }
  }, [contact]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleArrayChange = (index, value, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const removeArrayItem = (index, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.mobileNumber?.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    }
    
    if (!formData.infoEmail?.trim()) {
      newErrors.infoEmail = 'Info email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.infoEmail)) {
      newErrors.infoEmail = 'Please enter a valid email address';
    }

    if (formData.salesEmail && !/\S+@\S+\.\S+/.test(formData.salesEmail)) {
      newErrors.salesEmail = 'Please enter a valid sales email address';
    }

    if (formData.supportEmail && !/\S+@\S+\.\S+/.test(formData.supportEmail)) {
      newErrors.supportEmail = 'Please enter a valid support email address';
    }

    if (!formData.latitude || isNaN(formData.latitude)) {
      newErrors.latitude = 'Valid latitude is required';
    }

    if (!formData.longitude || isNaN(formData.longitude)) {
      newErrors.longitude = 'Valid longitude is required';
    }
    
    return newErrors;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        officeAddress: formData.officeAddress.filter(addr => addr.trim()),
        phoneNumbers: formData.phoneNumbers.filter(phone => phone.trim()),
        emails: formData.emails.filter(email => email.trim()),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      console.log("✅ Sending this to backend:", cleanedData);
      
      onSave(cleanedData);
      
    } catch (error) {
      console.error('Error saving contact information:', error);
      setErrors({ submit: 'Failed to save contact information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderArrayField = (arrayName, label, placeholder) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {formData[arrayName].map((item, index) => (
        <div key={index} className="flex space-x-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleArrayChange(index, e.target.value, arrayName)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder={placeholder}
          />
          {formData[arrayName].length > 1 && (
            <button
              type="button"
              onClick={() => removeArrayItem(index, arrayName)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayItem(arrayName)}
        className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Add {label.slice(0, -1)}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      {/* Mobile Number */}
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
          placeholder="Enter mobile number"
        />
        {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
      </div>

      {/* Primary Emails */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Info Email *
          </label>
          <input
            type="email"
            name="infoEmail"
            value={formData.infoEmail}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.infoEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="info@company.com"
          />
          {errors.infoEmail && <p className="text-red-500 text-sm mt-1">{errors.infoEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sales Email
          </label>
          <input
            type="email"
            name="salesEmail"
            value={formData.salesEmail}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.salesEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="sales@company.com"
          />
          {errors.salesEmail && <p className="text-red-500 text-sm mt-1">{errors.salesEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Support Email
          </label>
          <input
            type="email"
            name="supportEmail"
            value={formData.supportEmail}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.supportEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="support@company.com"
          />
          {errors.supportEmail && <p className="text-red-500 text-sm mt-1">{errors.supportEmail}</p>}
        </div>
      </div>

      {/* Office Address Array */}
      {renderArrayField('officeAddress', 'Office Address', 'Enter address line')}

      {/* Phone Numbers Array */}
      {renderArrayField('phoneNumbers', 'Phone Numbers', 'Enter phone number')}

      {/* Emails Array */}
      {renderArrayField('emails', 'Additional Emails', 'Enter email address')}

      {/* Business Hours Array */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Hours
        </label>
        {formData.businessHours.map((hours, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={hours}
              onChange={(e) => handleArrayChange(index, e.target.value, 'businessHours')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Day: 9:00 AM - 6:00 PM"
            />
            {formData.businessHours.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'businessHours')}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('businessHours')}
          className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Business Hour</span>
        </button>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude *
          </label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.latitude ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="40.7128"
          />
          {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude *
          </label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.longitude ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="-74.0060"
          />
          {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
        </div>
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
      </div>

      {/* Submit Error */}
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
              : (contact ? 'Update Contact' : 'Save Contact')
            }
          </span>
        </button>
      </div>
    </div>
  );
};

export default ContactInfoForm;