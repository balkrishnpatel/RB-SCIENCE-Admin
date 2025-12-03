
import React, { useState, useEffect } from 'react';
import { ProductUnitsAPI } from '../../api/productUnits';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const UnitQuantitiesModal = ({ unitQuantity, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    unitId: '',
    quantities: [
      {
        value: '',
        label: '',
        multiplier: 1
      }
    ]
  });

  const [productUnits, setProductUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchProductUnits();
  }, []);

  useEffect(() => {
    if (unitQuantity) {
      console.log("Unit Quantity ID: ", unitQuantity.id);
      setFormData({
        unitId: unitQuantity.unitId?.id || unitQuantity.unitId || '',
        quantities: unitQuantity.quantities || [
          {
            value: '',
            label: '',
            multiplier: 1
          }
        ]
      });
    }
  }, [unitQuantity]);

  const fetchProductUnits = async () => {
    setLoading(true);
    try {
      const res = await ProductUnitsAPI.getAll();
      if (res.success) {
        setProductUnits(res.result || []);
      } else {
        console.error('Failed to fetch product units:', res.message);
      }
    } catch (error) {
      console.error('Error fetching product units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = (e) => {
    setFormData(prev => ({
      ...prev,
      unitId: e.target.value
    }));
    
    if (errors.unitId) {
      setErrors({ ...errors, unitId: '' });
    }
  };

  const handleQuantityChange = (index, field, value) => {
    const newQuantities = [...formData.quantities];
    newQuantities[index] = {
      ...newQuantities[index],
      [field]: field === 'multiplier' ? parseFloat(value) || 0 : value
    };
    
    setFormData(prev => ({
      ...prev,
      quantities: newQuantities
    }));

    if (errors[`quantity_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`quantity_${index}`];
      setErrors(newErrors);
    }
  };

  const addQuantity = () => {
    setFormData(prev => ({
      ...prev,
      quantities: [
        ...prev.quantities,
        {
          value: '',
          label: '',
          multiplier: 1
        }
      ]
    }));
  };

  const removeQuantity = (index) => {
    if (formData.quantities.length > 1) {
      setFormData(prev => ({
        ...prev,
        quantities: prev.quantities.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.unitId) {
      newErrors.unitId = 'Product unit is required';
    }
    
    formData.quantities.forEach((quantity, index) => {
      if (!quantity.value.trim()) {
        newErrors[`quantity_${index}`] = 'Value is required';
      }
      if (!quantity.label.trim()) {
        newErrors[`quantity_${index}`] = 'Label is required';
      }
      if (!quantity.multiplier || quantity.multiplier <= 0) {
        newErrors[`quantity_${index}`] = 'Multiplier must be greater than 0';
      }
    });
    
    return newErrors;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(''); // Clear previous submit errors
    
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
      console.error('Error saving unit quantity:', error);
      setSubmitError(error.message || 'Failed to save unit quantity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedUnitName = () => {
    const selectedUnit = productUnits.find(unit => unit.id === formData.unitId);
    return selectedUnit ? selectedUnit.name : '';
  };

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      {/* Product Unit Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Unit *
        </label>
        {loading ? (
          <div className="flex items-center space-x-2 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading units...</span>
          </div>
        ) : (
          <select
            value={formData.unitId}
            onChange={handleUnitChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.unitId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a product unit</option>
            {productUnits.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} {unit.symbol}
              </option>
            ))}
          </select>
        )}
        {errors.unitId && <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>}
      </div>

      {/* Quantities Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Quantities * {getSelectedUnitName() && `(for ${getSelectedUnitName()})`}
          </label>
          <button
            type="button"
            onClick={addQuantity}
            className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Quantity</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.quantities.map((quantity, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">Quantity {index + 1}</h4>
                {formData.quantities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuantity(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={quantity.value}
                    onChange={(e) => handleQuantityChange(index, 'value', e.target.value)}
                    placeholder="e.g., 250g"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      errors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={quantity.label}
                    onChange={(e) => handleQuantityChange(index, 'label', e.target.value)}
                    placeholder="e.g., 250 grams"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      errors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Multiplier *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quantity.multiplier}
                    onChange={(e) => handleQuantityChange(index, 'multiplier', e.target.value)}
                    placeholder="e.g., 0.25"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      errors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {errors[`quantity_${index}`] && (
                <p className="text-red-500 text-sm mt-2">{errors[`quantity_${index}`]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{submitError}</p>
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
              : (unitQuantity ? 'Update Unit Quantity' : 'Add Unit Quantity')
            }
          </span>
        </button>
      </div>
    </div>
  );
};

export default UnitQuantitiesModal;































