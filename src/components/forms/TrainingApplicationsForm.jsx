import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, GraduationCap, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { TrainingApplicationsAPI } from '../../api/trainingApplicationsAPI';

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

const TrainingApplicationsForm = ({ isOpen, onClose, editingApplication, onSuccess, programs }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
    education_level: '',
    preferred_program_id: '',
    reason: ''
  });

//   useEffect(() => {
//     if (editingApplication) {
//       setFormData({
//         fullname: editingApplication.fullname || '',
//         email: editingApplication.email || '',
//         phoneNumber: editingApplication.phoneNumber || '',
//         education_level: editingApplication.education_level || '',
//         preferred_program_id: editingApplication.preferred_program_id || '',
//         reason: editingApplication.reason || ''
//       });
//     } else {
//       // Reset form for new application
//       setFormData({
//         fullname: '',
//         email: '',
//         phoneNumber: '',
//         education_level: '',
//         preferred_program_id: '',
//         reason: ''
//       });
//     }
//   }, [editingApplication, isOpen]);

useEffect(() => {
  if (isOpen) {
    if (editingApplication) {
      console.log('📝 Editing Application:', editingApplication);
      
      // ✅ Extract ID from object if it's an object
      let programId = editingApplication.preferred_program_id;
      
      // If it's an object, get the ID
      if (typeof programId === 'object' && programId !== null) {
        programId = programId._id || programId.id || '';
      }
      
      console.log('📋 Extracted Program ID:', programId);
      
      setFormData({
        fullname: editingApplication.fullname || '',
        email: editingApplication.email || '',
        phoneNumber: editingApplication.phoneNumber || '',
        education_level: editingApplication.education_level || '',
        preferred_program_id: String(programId || ''),  // ✅ Use extracted ID
        reason: editingApplication.reason || ''
      });
    } else {
      // Reset for new application
      setFormData({
        fullname: '',
        email: '',
        phoneNumber: '',
        education_level: '',
        preferred_program_id: '',
        reason: ''
      });
    }
  }
}, [editingApplication, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!formData.fullname || !formData.email || !formData.phoneNumber || 
        !formData.education_level || !formData.preferred_program_id || !formData.reason) {
      setError('Please fill all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);

      if (editingApplication) {
        const applicationData = { ...formData, id: editingApplication.id };
        const res = await TrainingApplicationsAPI.update(applicationData);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          throw new Error(res.message || 'Failed to update application');
        }
      } else {
        const res = await TrainingApplicationsAPI.add(formData);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          throw new Error(res.message || 'Failed to submit application');
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
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {editingApplication ? 'Update Application' : 'New Training Application'}
          </h2>
          <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <ErrorAlert error={error} onClose={() => setError(null)} />

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="Priya Patel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                    placeholder="priya.patel@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                    placeholder="9876543210"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Education Level *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                    placeholder="Bachelor's in Computer Science"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Program Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Program Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Program *</label>
                <select
                  name="preferred_program_id"
                  value={formData.preferred_program_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a program</option>
                  {programs && programs.filter(p => p.isActive).map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title} - {program.screen_name === 'internship' ? 'Internship' : 'Full-Time'} ({program.weeks})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Application *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="I am passionate about web development and want to build a career in this field. This training program aligns perfectly with my career goals..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Explain why you want to join this training program and how it aligns with your career goals.
                </p>
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
            <span>{loading ? 'Submitting...' : (editingApplication ? 'Update Application' : 'Submit Application')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingApplicationsForm;