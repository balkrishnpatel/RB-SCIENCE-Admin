import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Clock, Save, Loader2 } from 'lucide-react';
import { ContactInfoAPI } from '../../api/contactInfo';
import { API_CONFIG } from '../../api/api-config';

const ContactInfo = () => {
  const [contactData, setContactData] = useState(null);
  const [currentData, setCurrentData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);   
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdditionalMobileFields, setShowAdditionalMobileFields] = useState(false);
  const [additionalMobileNumbers, setAdditionalMobileNumbers] = useState([]);
  const [additionalEmails, setAdditionalEmails] = useState([]);
const [addressObj, setAddressObj] = useState({});

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchContactInfo();
  }, []);

  // Helper function to extract clean error message
  const getErrorMessage = (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.message) {
      const errorMsg = error.message;
      
      if (errorMsg.includes('HTTP') && errorMsg.includes('{')) {
        try {
          const jsonStart = errorMsg.indexOf('{');
          const jsonString = errorMsg.substring(jsonStart);
          const parsedError = JSON.parse(jsonString);
          
          if (parsedError.message) {
            errorMessage = parsedError.message;
          }
        } catch (parseError) {
          console.log('Could not parse JSON from HTTP error message');
          errorMessage = errorMsg;
        }
      } else if (errorMsg.startsWith('{') && errorMsg.endsWith('}')) {
        try {
          const parsedError = JSON.parse(errorMsg);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          }
        } catch (parseError) {
          console.log('Could not parse direct JSON error message');
          errorMessage = errorMsg;
        }
      } else {
        errorMessage = errorMsg;
      }
    } else if (error.response && error.response.data) {
      const responseData = error.response.data;
      
      if (responseData.message) {
        errorMessage = responseData.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return errorMessage;
  };

  const fetchContactInfo = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await ContactInfoAPI.getAll();
        if (res.success) {
          console.log("Contact Info Result: ", res.result);
          const data = res.result && res.result.length > 0 ? res.result[0] : null;
          setContactData(data);
          setCurrentData(data || getDefaultContactData());
          
          // Set additional fields if data exists
          if (data) {
            const phoneNumbers = data.phoneNumbers || [];
            if (phoneNumbers.length > 0) {
              setShowAdditionalMobileFields(true);
              setAdditionalMobileNumbers(phoneNumbers);
            }

            setAddressObj(parseAddressForDisplay(data.officeAddress));

            const emails = data.emails || [];
            const mainEmails = [data.infoEmail, data.salesEmail, data.supportEmail].filter(Boolean);
            const additionalEmailsList = emails.filter(email => !mainEmails.includes(email));
            if (additionalEmailsList.length > 0) {
              setAdditionalEmails(additionalEmailsList);
            }
          }
          
          setLoading(false);
          return;
        } else {
          throw new Error(res.message || 'Failed to fetch contact information');
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

  const getDefaultContactData = () => ({
    mobileNumber: '',
    // tollFreeNumber: '',
    infoEmail: '',
    salesEmail: '',
    supportEmail: '',
    officeAddress: [],
    phoneNumbers: [],
    emails: [],
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
    // country: 'India',
    isActive: true
  });

  const hasContactData = () => {
    return contactData && Object.keys(contactData).length > 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    
    // Initialize additional fields for editing
    if (contactData) {
      const phoneNumbers = contactData.phoneNumbers || [];
      if (phoneNumbers.length > 2) {
        setShowAdditionalMobileFields(true);
        setAdditionalMobileNumbers(phoneNumbers.slice(2));
      }
      
      const emails = contactData.emails || [];
      const mainEmails = [contactData.infoEmail, contactData.salesEmail, contactData.supportEmail].filter(Boolean);
      const additionalEmailsList = emails.filter(email => !mainEmails.includes(email));
      setAdditionalEmails(additionalEmailsList);
    }
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setCurrentData(getDefaultContactData());
    setShowAdditionalMobileFields(false);
    setAdditionalMobileNumbers([]);
    setAdditionalEmails([]);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentData(contactData || getDefaultContactData());    
    setError(null);
  };

  const handleChange = (field, value) => {
    setCurrentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to add additional mobile number field
  const addAdditionalMobileField = () => {
    setShowAdditionalMobileFields(true);
    setAdditionalMobileNumbers(prev => [...prev, '']);
  };

  // Function to update additional mobile number
  const updateAdditionalMobileNumber = (index, value) => {
    setAdditionalMobileNumbers(prev => 
      prev.map((mobile, i) => i === index ? value : mobile)
    );
  };

  // Function to remove additional mobile number
  const removeAdditionalMobileNumber = (index) => {
    setAdditionalMobileNumbers(prev => {
      const newNumbers = prev.filter((_, i) => i !== index);
      if (newNumbers.length === 0) {
        setShowAdditionalMobileFields(false);
      }
      return newNumbers;
    });
  };

  // Function to add additional email field
  const addAdditionalEmailField = () => {
    setAdditionalEmails(prev => [...prev, '']);
  };

  // Function to update additional email
  const updateAdditionalEmail = (index, value) => {
    setAdditionalEmails(prev => 
      prev.map((email, i) => i === index ? value : email)
    );
  };

  // Function to remove additional email
  const removeAdditionalEmail = (index) => {
    setAdditionalEmails(prev => prev.filter((_, i) => i !== index));
  };

  const handleArrayChange = (arrayName, index, value) => {
    setCurrentData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (arrayName, defaultValue = 'Monday: 9:00 AM - 6:00 PM') => {
    setCurrentData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), defaultValue]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setCurrentData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  // Function to parse address array into structured format for display
  const parseAddressForDisplay = (addressArray) => {
    if (!addressArray || addressArray.length === 0) return {};
    
    return {
      street: addressArray[0] || '',
      landmark: addressArray[1] || '',
      city: addressArray[2] || '',
      postalCode: addressArray[3] || '',
      state: addressArray[4] || '',
      country: addressArray[5] || 'India'
    };
  };

//Format Example:-
// Street Address,
// Landmark, City, Postal code
// State, Country


  // Function to convert structured address back to array for database
  const convertAddressToArray = (addressObj) => {
    const addressArray = [];
    if (addressObj.street) addressArray.push(addressObj.street);
    if (addressObj.landmark) addressArray.push(addressObj.landmark);
    if (addressObj.city) addressArray.push(addressObj.city);
    if (addressObj.postalCode) addressArray.push(addressObj.postalCode);
    if (addressObj.state) addressArray.push(addressObj.state);
    if (addressObj.country) addressArray.push(addressObj.country);
    return addressArray;
  };

  // Function to format address for display in the specified format
  const formatAddressDisplay = (addressObj) => {
    const lines = [];
    
    // Line 1: Street Address with comma
    if (addressObj.street) {
      lines.push(`${addressObj.street}`,);
    }
    
    // Line 2: Landmark, City PostalCode
    const secondLineParts = [];
    if (addressObj.landmark) {
      secondLineParts.push(addressObj.landmark);
    }
    
    // Combine city and postal code with space
    if (addressObj.city && addressObj.postalCode) {
      secondLineParts.push(`${addressObj.city} ${addressObj.postalCode}`);
    } else if (addressObj.city) {
      secondLineParts.push(addressObj.city);
    } else if (addressObj.postalCode) {
      secondLineParts.push(addressObj.postalCode);
    }
    
    if (secondLineParts.length > 0) {
      lines.push(secondLineParts.join(', '));
    }
    
    // Line 3: State, Country
    const thirdLineParts = [];
    if (addressObj.state) thirdLineParts.push(addressObj.state);
    if (addressObj.country) thirdLineParts.push(addressObj.country);
    
    if (thirdLineParts.length > 0) {
      lines.push(thirdLineParts.join(', '));
    }
    
    if (lines.length === 0) return 'Not provided';
    
    // Join lines with newline characters for the desired format
    return lines.join('\n');
  };

  // Function to group business hours by same timing
  const groupBusinessHours = (hours) => {
    if (!hours || hours.length === 0) return [];

    const dayMap = {
      'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed', 
      'thursday': 'Thu', 'friday': 'Fri', 'saturday': 'Sat', 'sunday': 'Sun'
    };

    const shortDayMap = {
      'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed', 
      'thursday': 'Thu', 'friday': 'Fri', 'saturday': 'Sat', 'sunday': 'Sun'
    };

    const dayTimePairs = hours.map(hourString => {
      const parts = hourString.split(':');
      if (parts.length < 2) return null;
      
      const day = parts[0].trim().toLowerCase();
      const time = parts.slice(1).join(':').trim();
      
      return { day, time, original: hourString };
    }).filter(Boolean);

    const timeGroups = {};
    dayTimePairs.forEach(({ day, time, original }) => {
      if (!timeGroups[time]) {
        timeGroups[time] = [];
      }
      timeGroups[time].push({ day, original });
    });

    const grouped = [];
    Object.entries(timeGroups).forEach(([time, days]) => {
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const sortedDays = days.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

      if (days.length === 1) {
        const dayName = dayMap[sortedDays[0].day] || sortedDays[0].day;
        grouped.push({
          display: `${dayName}: ${time}`,
          displayTime: time,
          time: time,
          days: [sortedDays[0].day],
          isOpen: !time.toLowerCase().includes('closed')
        });
      } else {
        const consecutiveGroups = [];
        let currentGroup = [sortedDays[0]];

        for (let i = 1; i < sortedDays.length; i++) {
          const currentIndex = dayOrder.indexOf(sortedDays[i].day);
          const prevIndex = dayOrder.indexOf(currentGroup[currentGroup.length - 1].day);

          if (currentIndex === prevIndex + 1) {
            currentGroup.push(sortedDays[i]);
          } else {
            consecutiveGroups.push(currentGroup);
            currentGroup = [sortedDays[i]];
          }
        }
        consecutiveGroups.push(currentGroup);

        consecutiveGroups.forEach(group => {
          if (group.length === 1) {
            const dayName = dayMap[group[0].day];
            grouped.push({
              display: dayName,
              displayTime: time,
              time: time,
              days: [group[0].day],
              isOpen: !time.toLowerCase().includes('closed')
            });
          } else if (group.length === 2) {
            const day1 = shortDayMap[group[0].day];
            const day2 = shortDayMap[group[1].day];
            grouped.push({
              display: `${day1} & ${day2}`,
              displayTime: time,
              time: time,
              days: group.map(d => d.day),
              isOpen: !time.toLowerCase().includes('closed')
            });
          } else {
            const firstDay = shortDayMap[group[0].day];
            const lastDay = shortDayMap[group[group.length - 1].day];
            grouped.push({
              display: `${firstDay} - ${lastDay}`,
              displayTime: time,
              time: time,
              days: group.map(d => d.day),
              isOpen: !time.toLowerCase().includes('closed')
            });
          }
        });
      }
    });

    return grouped;
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowDeleteModal(false);
      
      const res = await ContactInfoAPI.delete(contactData.id);
      
      if (res.success) {
        setContactData(null);
        setCurrentData(getDefaultContactData());
        setIsEditing(false);
        setAddressObj({});
        setShowAdditionalMobileFields(false);
        setAdditionalMobileNumbers([]);
        setAdditionalEmails([]);
      } else {
        throw new Error(res.message || 'Failed to delete contact information');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const DeleteConfirmModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this contact information? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!currentData.mobileNumber?.trim()) {
        setError('Mobile number is required');
        setLoading(false);
        return;
      }

      if (!currentData.infoEmail?.trim()) {
        setError('Info email is required');
        setLoading(false);
        return;
      }

      // Prepare phone numbers array
      const phoneNumbers = [];
      additionalMobileNumbers.forEach(mobile => {
        if (mobile?.trim()) phoneNumbers.push(mobile.trim());
      });


      const emails = [];
      if (currentData.infoEmail?.trim()) emails.push(currentData.infoEmail.trim());
      if (currentData.salesEmail?.trim()) emails.push(currentData.salesEmail.trim());
      if (currentData.supportEmail?.trim()) emails.push(currentData.supportEmail.trim());
      
      additionalEmails.forEach(email => {
        if (email?.trim()) emails.push(email.trim());
      });

    
    
    
      const officeAddress = convertAddressToArray(addressObj);

      // Console log payloads
      console.log('=== MOBILE NUMBERS PAYLOAD ===');
      console.log('Phone Numbers Array:', phoneNumbers);
      console.log('Format: [Primary Mobile, Toll Free, Additional Mobile 1, Additional Mobile 2, ...]');
      
      console.log('=== EMAIL ADDRESSES PAYLOAD ===');
      console.log('Emails Array:', emails);
      console.log('Format: [Info Email, Sales Email, Support Email, Additional Email 1, Additional Email 2, ...]');
      
      console.log('=== ADDRESS PAYLOAD ===');
      console.log('Address Array:', officeAddress);
      console.log('Format: [Street, Landmark, City, Postal Code, State, Country]');
      console.log('Formatted Address:', formatAddressDisplay(addressObj));

      // Clean the data before sending
      const cleanedData = {
        ...currentData,
        officeAddress: officeAddress,
        phoneNumbers: phoneNumbers,
        emails: emails,
        latitude: parseFloat(currentData.latitude) || 0,
        longitude: parseFloat(currentData.longitude) || 0
      };
      console.log("Cleaned Data : ",cleanedData);

      console.log('=== COMPLETE PAYLOAD ===');
      console.log('Final Data to Send:', cleanedData);


      let res;
      if (contactData && contactData.id) {
        cleanedData.id = contactData.id;
        res = await ContactInfoAPI.update(cleanedData);
      } else {
        res = await ContactInfoAPI.add(cleanedData);
      }

      if (res.success) {
        setContactData(res.result);
        setCurrentData(res.result);
        setIsEditing(false);
        
  
      } else {
        throw new Error(res.message || 'Failed to save contact information');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchContactInfo();
  };

  const EmptyStateDisplay = () => (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="p-6 bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Phone className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contact Information</h3>
        <p className="text-gray-600 mb-6">Get started by adding your business contact details.</p>
      </div>
    </div>
  );

  // Parse address for structured display
//  const addressObj = parseAddressForDisplay(currentData.officeAddress);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Information</h1>
              <p className="mt-2 text-gray-600">Manage your business contact details and hours</p>
            </div>

            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <>
                  {hasContactData() ? (
                    <>
                      <button
                        onClick={handleEdit}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddNew}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Contact
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="text-red-400">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    {retryCount > 0 && (
                      <p className="mt-1">Retry attempt: {retryCount}</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <span className="text-sm font-medium">Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !isEditing && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading contact information...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {!hasContactData() && !isEditing ? (
              <EmptyStateDisplay />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phone Numbers - Updated Design */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Phone Numbers</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Mobile Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={currentData.mobileNumber || ''}
                          onChange={(e) => handleChange('mobileNumber', e.target.value)}
                          placeholder="+91 XXXXXXXXXX"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{currentData.mobileNumber || 'Not provided'}</p>
                        
                      )}
                    </div>

                    {/* Add Additional Mobile Button */}
                    {isEditing && !showAdditionalMobileFields && (
                      <button
                        onClick={addAdditionalMobileField}
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Additional Mobile Number</span>
                      </button>
                    )}

                    {/* Additional Mobile Numbers */}
                    {(showAdditionalMobileFields || additionalMobileNumbers.length > 0) && (
                      <div className="space-y-3 border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700">Additional Mobile Numbers</h3>

                        {additionalMobileNumbers.map((mobile, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <input
                                  type="tel"
                                  value={mobile}
                                  onChange={(e) => updateAdditionalMobileNumber(index, e.target.value)}
                                  placeholder="+91 XXXXXXXXXX"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button
                                  onClick={() => removeAdditionalMobileNumber(index)}
                                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <p className="text-gray-900 font-medium">
                                {mobile || 'Not provided'}
                              </p>
                            )}
                          </div>
                        ))}

                        {isEditing && (
                          <button
                            onClick={addAdditionalMobileField}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Another Mobile Number</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Addresses - Updated Design with Combined Fields */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Email Addresses</h2>
                  </div>

                  <div className="space-y-4">
                    {/* General Information Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        General Information Email *
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={currentData.infoEmail || ''}
                          onChange={(e) => handleChange('infoEmail', e.target.value)}
                          placeholder="info@company.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{currentData.infoEmail || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Sales Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sales Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={currentData.salesEmail || ''}
                          onChange={(e) => handleChange('salesEmail', e.target.value)}
                          placeholder="sales@company.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{currentData.salesEmail || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Support Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={currentData.supportEmail || ''}
                          onChange={(e) => handleChange('supportEmail', e.target.value)}
                          placeholder="support@company.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{currentData.supportEmail || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Add Additional Email Button */}
                    {isEditing && (
                      <button
                        onClick={addAdditionalEmailField}
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Additional Email Address</span>
                      </button>
                    )}

                    {/* Additional Emails */}
                    {additionalEmails.length > 0 && (
                      <div className="space-y-3 border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700">Additional Email Addresses</h3>
                        {additionalEmails.map((email, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => updateAdditionalEmail(index, e.target.value)}
                                  placeholder="additional@company.com"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button
                                  onClick={() => removeAdditionalEmail(index)}
                                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-lg w-full">
                                <p className="text-gray-900 font-medium">{email}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Address - Updated Design with Country */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Address</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={addressObj.street || ''}
                          onChange={(e) => {
                            const newAddressObj = { ...addressObj, street: e.target.value };
                              
  setAddressObj(newAddressObj); // update input state
  handleChange("officeAddress", newAddressObj); // update parent state
                          }}
                          placeholder="Enter street address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{addressObj.street || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Landmark */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={addressObj.landmark || ''}
                          onChange={(e) => {
                            const newAddressObj = { ...addressObj, landmark: e.target.value };
                            
  setAddressObj(newAddressObj); // update input state
  handleChange("officeAddress", newAddressObj); // up
                          }}
                          placeholder="Enter landmark"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{addressObj.landmark || 'Not provided'}</p>
                      )}
                    </div>

                    {/* City, Postal Code, State, Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={addressObj.city || ''}
                            onChange={(e) => {
                              const newAddressObj = { ...addressObj, city: e.target.value };
                             setAddressObj(newAddressObj); // update input state
  handleChange("officeAddress", newAddressObj); // update parent state

                            }}


   


                            placeholder="Enter city"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{addressObj.city || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code *
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={addressObj.postalCode || ''}
                            onChange={(e) => {
                              const newAddressObj = { ...addressObj, postalCode: e.target.value };
            setAddressObj(newAddressObj); // update input state
  handleChange("officeAddress", newAddressObj); // update parent state

                            }}
                      

                            placeholder="Enter postal code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{addressObj.postalCode || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={addressObj.state || ''}
                            onChange={(e) => {
                              const newAddressObj = { ...addressObj, state: e.target.value };
                 setAddressObj(newAddressObj); // update input state
  handleChange("officeAddress", newAddressObj); // update parent state
                            }}

   

                            placeholder="Enter state"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{addressObj.state || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={addressObj.country }
                            onChange={(e) => {
                              const newAddressObj = { ...addressObj, country: e.target.value };
                                                
  setAddressObj(newAddressObj); // update input state
  handleChange("officeAddress", newAddressObj); // update parent state
                            }}



                  

                            placeholder="Enter country"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{addressObj.country || 'India'}</p>
                        )}
                      </div>
                    </div>

                    {/* Formatted Address Display */}
                    {/* {!isEditing && (
                      <div className="border-t pt-4 mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Formatted Address</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="text-gray-900 font-medium whitespace-pre-line text-sm">
                            {formatAddressDisplay(addressObj)}
                          </pre>
                        </div>
                      </div>
                    )} */}
                    
                    {/* Location Coordinates */}
                    <div className="border-t pt-4 mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Location Coordinates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Latitude
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="any"
                              value={currentData.latitude || ''}
                              onChange={(e) => handleChange('latitude', e.target.value)}
                              placeholder="Enter latitude e.g.: 54.3343"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          ) : (
                            <p className="text-gray-900 font-medium">{currentData.latitude || 'Not provided'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Longitude
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="any"
                              value={currentData.longitude || ''}
                              onChange={(e) => handleChange('longitude', e.target.value)}
                              placeholder="Enter longitude e.g.: 54.3343"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          ) : (
                            <p className="text-gray-900 font-medium">{currentData.longitude || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Hours - Updated with grouping */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Business Hours</h2>
                    {isEditing && (
                      <button
                        onClick={() => addArrayItem('businessHours')}
                        className="ml-auto text-purple-600 hover:text-purple-800 transition-colors flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Add Hour</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {isEditing ? (
                      (currentData.businessHours || []).map((hours, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="text"
                            value={hours}
                            onChange={(e) => handleArrayChange('businessHours', index, e.target.value)}
                            placeholder="Monday: 9:00 AM - 6:00 PM"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <button
                            onClick={() => removeArrayItem('businessHours', index)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      groupBusinessHours(currentData.businessHours).map((group, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${group.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-gray-900 font-medium">{group.display}</span>
                          </div>
                          <span className={`text-sm font-medium ${group.isOpen ? 'text-gray-700' : 'text-red-600'}`}>
                            {group.displayTime}
                          </span>
                        </div>
                      ))
                    )}
                    
                    {(!currentData.businessHours || currentData.businessHours.length === 0) && !isEditing && (
                      <p className="text-gray-500 italic text-center py-4">No business hours configured</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <div className={`w-5 h-5 rounded-full ${currentData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Status</h2>
                        <p className="text-sm text-gray-600">Contact information visibility</p>
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={currentData.isActive || false}
                          onChange={(e) => handleChange('isActive', e.target.checked)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                      </label>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        currentData.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currentData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <DeleteConfirmModal />
    </div>
  );
};

export default ContactInfo;

