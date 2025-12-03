import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Calendar, Award, DollarSign, MapPin, Users, Mail, Link as LinkIcon, FileText, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { EventsAPI } from '../../api/eventsAPI';
import { BASE_URL } from '../../api/api-config';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const EventsForm = ({ isOpen, onClose, editingEvent, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [brochurePreview, setBrochurePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    registration_link: '',
    year: new Date().getFullYear(),
    email: '',
    event_type: '',
    abstract_deadline: '',
    featured_event: false,
    brochure_label: 'Download Event Brochure',
    location: { city: '', country: '' },
    venue: { name: '', address: '' },
    about: { description: '', tagline: '' },
    payment_details: {
      phoneNumber: '',
      bank_account: { account: '', ifsc: '', bank: '', branch: '' }
    },
    awards: [],
    registration_fees: {
      early_bird_deadline: '',
      categories: []
    },
    schedule: [],
    important_dates: [],
    guests: [],
    brochure: null
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        ...editingEvent,
        brochure: null
      });
      if (editingEvent.brochure) {
        setBrochurePreview(BASE_URL + editingEvent.brochure);
      }
    }
  }, [editingEvent]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleBankAccountChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      payment_details: {
        ...prev.payment_details,
        bank_account: {
          ...prev.payment_details.bank_account,
          [field]: value
        }
      }
    }));
  };

  const handleBrochureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, brochure: file }));
      const previewUrl = URL.createObjectURL(file);
      setBrochurePreview(previewUrl);
    }
  };

  // Array handlers
  const addAward = () => {
    setFormData(prev => ({
      ...prev,
      awards: [...prev.awards, { icon: '🏆', title: '', criteria: '' }]
    }));
  };

  const updateAward = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.map((award, i) => 
        i === index ? { ...award, [field]: value } : award
      )
    }));
  };

  const removeAward = (index) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }));
  };

  const addRegistrationCategory = () => {
    setFormData(prev => ({
      ...prev,
      registration_fees: {
        ...prev.registration_fees,
        categories: [...prev.registration_fees.categories, 
          { type: '', early_bird: 0, regular: 0, icon: '🎓' }
        ]
      }
    }));
  };

  const updateRegistrationCategory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      registration_fees: {
        ...prev.registration_fees,
        categories: prev.registration_fees.categories.map((cat, i) => 
          i === index ? { ...cat, [field]: value } : cat
        )
      }
    }));
  };

  const removeRegistrationCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      registration_fees: {
        ...prev.registration_fees,
        categories: prev.registration_fees.categories.filter((_, i) => i !== index)
      }
    }));
  };

  const addScheduleItem = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', activity: '', icon: '📝' }]
    }));
  };

  const updateScheduleItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeScheduleItem = (index) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const addImportantDate = () => {
    setFormData(prev => ({
      ...prev,
      important_dates: [...prev.important_dates, { label: '', date: '' }]
    }));
  };

  const updateImportantDate = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      important_dates: prev.important_dates.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeImportantDate = (index) => {
    setFormData(prev => ({
      ...prev,
      important_dates: prev.important_dates.filter((_, i) => i !== index)
    }));
  };

  const addGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { type: '', name: '', designation: '', organization: '', icon: '👤' }]
    }));
  };

  const updateGuest = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((guest, i) => 
        i === index ? { ...guest, [field]: value } : guest
      )
    }));
  };

  const removeGuest = (index) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!formData.title || !formData.subtitle || !formData.email) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      if (editingEvent) {
        const eventData = { ...formData, id: editingEvent.id };
        const res = await EventsAPI.update(eventData);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          throw new Error(res.message || 'Failed to update event');
        }
      } else {
        const res = await EventsAPI.add(formData);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          throw new Error(res.message || 'Failed to create event');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {editingEvent ? 'Update Event' : 'Add New Event'}
          </h2>
          <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <ErrorAlert error={error} onClose={() => setError(null)} />

          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="RB Science Foundation Day 2025"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle *</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="How New Drugs Are Discovered"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                <input
                  type="text"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="Research Conference"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="event@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Link</label>
                <input
                  type="url"
                  name="registration_link"
                  value={formData.registration_link}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Abstract Deadline</label>
                <input
                  type="date"
                  name="abstract_deadline"
                  value={formData.abstract_deadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured_event"
                    checked={formData.featured_event}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Event</span>
                </label>
              </div>
            </div>
          </div>

          {/* Location & Venue */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location & Venue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.location.country}
                  onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                <input
                  type="text"
                  value={formData.venue.name}
                  onChange={(e) => handleNestedChange('venue', 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Address</label>
                <input
                  type="text"
                  value={formData.venue.address}
                  onChange={(e) => handleNestedChange('venue', 'address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">About Event</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={formData.about.tagline}
                  onChange={(e) => handleNestedChange('about', 'tagline', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.about.description}
                  onChange={(e) => handleNestedChange('about', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={formData.payment_details.phoneNumber}
                  onChange={(e) => handleNestedChange('payment_details', 'phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.payment_details.bank_account.account}
                  onChange={(e) => handleBankAccountChange('account', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={formData.payment_details.bank_account.ifsc}
                  onChange={(e) => handleBankAccountChange('ifsc', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={formData.payment_details.bank_account.bank}
                  onChange={(e) => handleBankAccountChange('bank', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <input
                  type="text"
                  value={formData.payment_details.bank_account.branch}
                  onChange={(e) => handleBankAccountChange('branch', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Awards */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Awards
              </h3>
              <button
                type="button"
                onClick={addAward}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Award
              </button>
            </div>
            {formData.awards.map((award, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={award.icon}
                    onChange={(e) => updateAward(index, 'icon', e.target.value)}
                    placeholder="Icon (emoji)"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    value={award.title}
                    onChange={(e) => updateAward(index, 'title', e.target.value)}
                    placeholder="Award Title"
                    className="px-3 py-2 border rounded-md"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={award.criteria}
                      onChange={(e) => updateAward(index, 'criteria', e.target.value)}
                      placeholder="Criteria"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeAward(index)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Registration Fees */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Registration Fees</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Early Bird Deadline</label>
              <input
                type="date"
                value={formData.registration_fees.early_bird_deadline}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  registration_fees: {
                    ...prev.registration_fees,
                    early_bird_deadline: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Fee Categories</h4>
              <button
                type="button"
                onClick={addRegistrationCategory}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
            {formData.registration_fees.categories.map((cat, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input
                    type="text"
                    value={cat.icon}
                    onChange={(e) => updateRegistrationCategory(index, 'icon', e.target.value)}
                    placeholder="Icon"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    value={cat.type}
                    onChange={(e) => updateRegistrationCategory(index, 'type', e.target.value)}
                    placeholder="Category Type"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="number"
                    value={cat.early_bird}
                    onChange={(e) => updateRegistrationCategory(index, 'early_bird', parseInt(e.target.value))}
                    placeholder="Early Bird"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="number"
                    value={cat.regular}
                    onChange={(e) => updateRegistrationCategory(index, 'regular', parseInt(e.target.value))}
                    placeholder="Regular"
                    className="px-3 py-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeRegistrationCategory(index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Schedule */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Schedule
              </h3>
              <button
                type="button"
                onClick={addScheduleItem}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            {formData.schedule.map((item, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={item.icon}
                    onChange={(e) => updateScheduleItem(index, 'icon', e.target.value)}
                    placeholder="Icon"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                    placeholder="Time (e.g., 9:00 AM)"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    value={item.activity}
                    onChange={(e) => updateScheduleItem(index, 'activity', e.target.value)}
                    placeholder="Activity"
                    className="px-3 py-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeScheduleItem(index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Important Dates */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Important Dates
              </h3>
              <button
                type="button"
                onClick={addImportantDate}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Date
              </button>
            </div>
            {formData.important_dates.map((item, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateImportantDate(index, 'label', e.target.value)}
                    placeholder="Label"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => updateImportantDate(index, 'date', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImportantDate(index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Guests */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Guests
              </h3>
              <button
                type="button"
                onClick={addGuest}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Guest
              </button>
            </div>
            {formData.guests.map((guest, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <input
                    type="text"
                    value={guest.icon}
                    onChange={(e) => updateGuest(index, 'icon', e.target.value)}
                    placeholder="Icon"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    value={guest.type}
                    onChange={(e) => updateGuest(index, 'type', e.target.value)}
                    placeholder="Type (Chief Guest, Speaker)"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateGuest(index, 'name', e.target.value)}
                    placeholder="Name"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    value={guest.designation}
                    onChange={(e) => updateGuest(index, 'designation', e.target.value)}
                    placeholder="Designation"
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    value={guest.organization}
                    onChange={(e) => updateGuest(index, 'organization', e.target.value)}
                    placeholder="Organization"
                    className="px-3 py-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Brochure */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Event Brochure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brochure Label</label>
                <input
                  type="text"
                  name="brochure_label"
                  value={formData.brochure_label}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="Download Event Brochure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Brochure (PDF/JPG/PNG)</label>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleBrochureUpload}
                    className="hidden"
                    id="brochure-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="brochure-upload"
                    className={`cursor-pointer bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 inline-flex items-center gap-2 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload size={16} />
                    Choose File
                  </label>
                  {brochurePreview && (
                    <span className="text-sm text-gray-600">File selected ✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsForm;  