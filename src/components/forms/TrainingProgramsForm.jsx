import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, Trash2, FileText, Clock, DollarSign, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { TrainingProgramsAPI } from '../../api/trainingProgramsAPI';
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

const TrainingProgramsForm = ({ isOpen, onClose, editingProgram, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    screen_name: 'internship',
    description: '',
    weeks: '',
    fees: '',
    features: [],
    isActive: true,
    image: null
  });

  useEffect(() => {
    if (editingProgram) {
      setFormData({
        ...editingProgram,
        image: null
      });
      if (editingProgram.image) {
        setImagePreview(BASE_URL + editingProgram.image);
      }
    } else {
      // Reset form for new program
      setFormData({
        title: '',
        screen_name: 'internship',
        description: '',
        weeks: '',
        fees: '',
        features: [],
        isActive: true,
        image: null
      });
      setImagePreview(null);
    }
  }, [editingProgram, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? value : feature
      )
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!formData.title || !formData.description || !formData.weeks || !formData.fees) {
      setError('Please fill all required fields');
      return;
    }

    if (!formData.screen_name || (formData.screen_name !== 'internship' && formData.screen_name !== 'full-time')) {
      setError('Please select a valid program type (internship or full-time)');
      return;
    }

    try {
      setLoading(true);

      if (editingProgram) {
        const programData = { ...formData, id: editingProgram.id };
        const res = await TrainingProgramsAPI.update(programData);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          throw new Error(res.message || 'Failed to update program');
        }
      } else {
        const res = await TrainingProgramsAPI.add(formData);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          throw new Error(res.message || 'Failed to create program');
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
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {editingProgram ? 'Update Training Program' : 'Add New Training Program'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="Full Stack Web Development Training"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Type *</label>
                <select
                  name="screen_name"
                  value={formData.screen_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                <input
                  type="text"
                  name="weeks"
                  value={formData.weeks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="12 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fees *</label>
                <input
                  type="text"
                  name="fees"
                  value={formData.fees}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="₹50000"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Program</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="Comprehensive training program covering modern web development technologies..."
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Program Features
              </h3>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>
            {formData.features.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No features added yet. Click "Add Feature" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="e.g., Live project experience"
                      className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Program Image</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (JPG/PNG)</label>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 inline-flex items-center gap-2 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload size={16} />
                    Choose Image
                  </label>
                  {imagePreview && (
                    <span className="text-sm text-gray-600">Image selected ✓</span>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
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
            <span>{loading ? 'Saving...' : (editingProgram ? 'Update Program' : 'Create Program')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramsForm;