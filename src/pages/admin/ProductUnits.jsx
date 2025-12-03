

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Ruler, Filter, Loader2, AlertTriangle, X } from 'lucide-react';
import ProductUnitModal from '../../components/modals/ProductUnitModal';
import { ProductUnitsAPI } from '../../api/productUnits';
import { API_CONFIG } from '../../api/api-config';

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

// Error Message Extractor Function
const extractErrorMessage = (error) => {
  if (!error) return 'Something went wrong';
  
  let errorMessage = error.message || error.toString();
  
  // Try to extract JSON message from error string
  try {
    if (errorMessage.includes('{')) {
      const jsonStart = errorMessage.indexOf('{');
      const jsonPart = errorMessage.substring(jsonStart);
      const parsedError = JSON.parse(jsonPart);
      return parsedError.message || errorMessage;
    }
  } catch (parseError) {
    // If JSON parsing fails, return original message
  }
  
  return errorMessage;
};

const ProductUnits = () => {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    unitId: null,
    unitName: ''
  });

  const unitTypes = ['all', 'weight', 'volume', 'count', 'length', 'area', 'other'];

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await ProductUnitsAPI.getAll();
        if (res.success) {
          console.log("Units Result: ", res.result);
          setUnits(res.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error(res.message || 'Failed to fetch units');
        }
      } catch (err) {
        attempts += 1;
        setRetryCount(attempts);
        if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
        } else {
          setError('Unable to fetch units. Please try again later.');
          setLoading(false);
        }
      }
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || unit.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddUnit = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleDeleteUnit = (unit) => {
    setConfirmationModal({
      isOpen: true,
      unitId: unit.id,
      unitName: unit.name
    });
  };

  const confirmDeleteUnit = async () => {
    const { unitId } = confirmationModal;
    
    try {
      setLoading(true);
      const res = await ProductUnitsAPI.delete(unitId);

      if (res.success) {
        setUnits((prev) => prev.filter((u) => u.id !== unitId));
      } else {
        throw new Error(res.message || "Failed to delete unit");
      }
    } catch (error) {
      // Extract and show only the meaningful error message
      const cleanErrorMessage = extractErrorMessage(error);
      setError(cleanErrorMessage);
    } finally {
      setLoading(false);
      // Close the confirmation modal
      setConfirmationModal({
        isOpen: false,
        unitId: null,
        unitName: ''
      });
    }
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      unitId: null,
      unitName: ''
    });
  };

  const handleSaveUnit = async (unitData) => {
    try {
      setLoading(true);

      if (editingUnit) {
        unitData.id = editingUnit.id;
        const res = await ProductUnitsAPI.update(unitData);

        if (res.success) {
          setUnits((prev) =>
            prev.map((u) =>
              u.id === editingUnit.id ? { ...u, ...res.result } : u
            )
          );
          setIsModalOpen(false);
          setEditingUnit(null);
        } else {
          throw new Error(res.message || "Failed to update unit");
        }
      } else {
        console.log("Unit Data: ", unitData);
        const res = await ProductUnitsAPI.add(unitData);

        if (res.success) {
          setUnits((prev) => [...prev, res.result]);
          setIsModalOpen(false);
          setEditingUnit(null);
        } else {
          throw new Error(res.message || "Failed to add unit");
        }
      }
    } catch (error) {
      // Re-throw error so it can be caught in ProductUnitModal
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      weight: 'bg-blue-100 text-blue-800',
      volume: 'bg-green-100 text-green-800',
      count: 'bg-yellow-100 text-yellow-800',
      length: 'bg-purple-100 text-purple-800',
      area: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Units</h1>
          <p className="text-gray-600 mt-1">Manage measurement units for your products</p>
        </div>
        <button
          onClick={handleAddUnit}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Unit</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">{units.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Ruler className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Weight Units</p>
              <p className="text-2xl font-bold text-gray-900">
                {units.filter(u => u.type === 'weight').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Ruler className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Volume Units</p>
              <p className="text-2xl font-bold text-gray-900">
                {units.filter(u => u.type === 'volume').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Ruler className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Count Units</p>
              <p className="text-2xl font-bold text-gray-900">
                {units.filter(u => u.type === 'count').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Ruler className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Type:</span>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              {unitTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && !error && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Units</h3>
              <p className="text-blue-700">Fetching the latest product units...</p>
              {retryCount > 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchUnits}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Units Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredUnits.length === 0 ? (
            <div className="p-12 text-center">
              <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
              <p className="text-gray-600 mb-4">
                There are no units matching your search criteria.
              </p>
              <button
                onClick={handleAddUnit}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Add First Unit
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.map(unit => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{unit.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded font-mono">
                          {unit.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm px-2 py-1 rounded-full ${getTypeColor(unit.type)}`}>
                          {unit.type.charAt(0).toUpperCase() + unit.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {unit.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(unit.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditUnit(unit)}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Unit Modal */}
      <ProductUnitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
        }}
        onSave={handleSaveUnit}
        unit={editingUnit}
        existingUnits={units}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmDeleteUnit}
        title="Delete Product Unit"
        message={`Are you sure you want to delete "${confirmationModal.unitName}"? This action cannot be undone and may affect products that use this unit.`}
        confirmText="Delete Unit"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default ProductUnits;