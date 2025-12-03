
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import { UnitQuantitiesAPI } from '../../api/unitQuantities';    
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, Loader2, AlertTriangle, X } from 'lucide-react';
import { API_CONFIG } from '../../api/api-config';
import UnitQuantitiesModal from '../../components/modals/UnitQuantityModal';

// View Details Modal Component
const ViewUnitQuantityModal = ({ isOpen, onClose, unitQuantity }) => {
  if (!isOpen || !unitQuantity) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {unitQuantity.unitId?.name || 'Unknown Unit'}
              </h3>
              <p className="text-sm text-gray-500">Unit Quantity Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            
          </button>
        </div>

        {/* Unit Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Unit Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Unit Name:</span>
              <p className="font-medium text-gray-900">{unitQuantity.unitId?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Total Quantities:</span>
              <p className="font-medium text-gray-900">{unitQuantity.quantities?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Quantities List */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Available Quantities</h4>
          {unitQuantity.quantities && unitQuantity.quantities.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {unitQuantity.quantities.map((quantity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{quantity.value}</p>
                      {quantity.label && (
                        <p className="text-sm text-gray-500">{quantity.label}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{quantity.multiplier}x</p>
                    <p className="text-xs text-gray-500">Multiplier</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No quantities available</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, unitQuantityName, loading }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center p-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Delete Unit Quantity
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete the unit quantity for "{unitQuantityName}"? 
          This action cannot be undone and will remove all associated quantities.
        </p>
        
        <div className="flex space-x-4 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

const UnitQuantities = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnitQuantity, setEditingUnitQuantity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [unitQuantities, setUnitQuantities] = useState([]);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    unitQuantity: null,
    loading: false
  });

  // View modal state
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    unitQuantity: null
  });

  useEffect(() => {
    fetchUnitQuantities();
  }, []);

  const fetchUnitQuantities = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await UnitQuantitiesAPI.getAll();
        if (res.success) {
          console.log("Result: ", res.result);
          setUnitQuantities(res.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error(res.message || 'Failed to fetch unit quantities');
        }
      } catch (err) {
        attempts += 1;
        setRetryCount(attempts);
        if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
        } else {
          const errorMessage = err.message.includes('HTTP') && err.message.includes('{')
            ? JSON.parse(err.message.split(': ')[1])?.message || 'Unable to fetch unit quantities'
            : err.message || 'Unable to fetch unit quantities. Please try again later.';
          setError(errorMessage);
          setLoading(false);
        }
      }
    }
  };

  const filteredUnitQuantities = unitQuantities.filter(unitQuantity => {
    if (!unitQuantity.unitId || !unitQuantity.unitId.name) return false;
    return unitQuantity.unitId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           unitQuantity.quantities.some(q => 
             q.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
             q.label.toLowerCase().includes(searchTerm.toLowerCase())
           );
  });

  const handleAddUnitQuantity = () => {
    setEditingUnitQuantity(null);
    setIsModalOpen(true);
  };

  const handleEditUnitQuantity = (unitQuantity) => {
    setEditingUnitQuantity(unitQuantity);
    setIsModalOpen(true);
  };

  // Open view modal
  const handleViewUnitQuantity = (unitQuantity) => {
    setViewModal({
      isOpen: true,
      unitQuantity: unitQuantity
    });
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setViewModal({
      isOpen: false,
      unitQuantity: null
    });
  };

  // Open delete confirmation modal
  const handleDeleteUnitQuantity = (unitQuantity) => {
    setDeleteModal({
      isOpen: true,
      unitQuantity: unitQuantity,
      loading: false
    });
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      unitQuantity: null,
      loading: false
    });
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    const unitQuantityToDelete = deleteModal.unitQuantity;
    if (!unitQuantityToDelete) return;

    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      
      const res = await UnitQuantitiesAPI.delete(unitQuantityToDelete.id);

      if (res.success) {
        setUnitQuantities((prev) => prev.filter((uq) => uq.id !== unitQuantityToDelete.id));
        handleCloseDeleteModal();
      } else {
        throw new Error(res.message || "Failed to delete unit quantity");
      }
    } catch (error) {
      const errorMessage = error.message.includes('HTTP') && error.message.includes('{')
        ? JSON.parse(error.message.split(': ')[1])?.message || 'Something went wrong while deleting.'
        : error.message || "Something went wrong while deleting.";
      setError(errorMessage);
      handleCloseDeleteModal();
    }
  };

  // Save (Add or Update) Unit Quantity
  const handleSaveUnitQuantity = async (unitQuantityData) => {
    try {
      setLoading(true);
      setError(null);

      if (editingUnitQuantity) {
        unitQuantityData.id = editingUnitQuantity.id;
        const res = await UnitQuantitiesAPI.update(unitQuantityData);

        if (res.success) {
          // Instead of directly updating with res.result, refetch to ensure proper population
          await fetchUnitQuantities();
          
          setIsModalOpen(false);
          setEditingUnitQuantity(null);
        } else {
          throw new Error(res.message || "Failed to update unit quantity");
        }
      } else {
        console.log("UnitQuantityData: ", unitQuantityData);
        const res = await UnitQuantitiesAPI.add(unitQuantityData);

        if (res.success) {
          // Instead of just adding res.result, refetch all data to ensure proper population
          // or add the new item and then refetch to get the populated version
          setUnitQuantities((prev) => [...prev, res.result]);
          
          // Refetch to get the properly populated data
          fetchUnitQuantities();
          
          setIsModalOpen(false);
          setEditingUnitQuantity(null);
        } else {
          throw new Error(res.message || "Failed to add unit quantity");
        }
      }
    } catch (error) {
      const errorMessage = error.message.includes('HTTP') && error.message.includes('{')
        ? JSON.parse(error.message.split(': ')[1])?.message || 'Something went wrong while saving.'
        : error.message || "Something went wrong while saving.";
      
      // Pass error to form instead of setting page error
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuantities = () => {
    return unitQuantities.reduce((total, uq) => total + (uq.quantities?.length || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unit Quantities</h1>
          <p className="text-gray-600 mt-1">Manage unit quantities for your products</p>
        </div>
        <button
          onClick={handleAddUnitQuantity}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Unit Quantity</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Unit Quantities</p>
              <p className="text-2xl font-bold text-gray-900">{unitQuantities.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Quantities</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalQuantities()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Units</p>
              <p className="text-2xl font-bold text-gray-900">{unitQuantities.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Quantities</p>
              <p className="text-2xl font-bold text-gray-900">
                {unitQuantities.length > 0 ? Math.round(getTotalQuantities() / unitQuantities.length) : 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <span className="text-2xl">⚖️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search unit quantities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {loading && !error && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Unit Quantities</h3>
              <p className="text-blue-700">Fetching the latest unit quantities...</p>
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
          <h3 className="font-semibold text-red-800">Something went wrong</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchUnitQuantities}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUnitQuantities.map(unitQuantity => (
            <div key={unitQuantity.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Package className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">
                      {unitQuantity.unitId?.name || 'Unknown Unit'}
                    </h3>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditUnitQuantity(unitQuantity)}
                      className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteUnitQuantity(unitQuantity)}
                      className="p-1 bg-gray-100 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Quantities:</span> {unitQuantity.quantities?.length || 0}
                  </p>
                  <div className="space-y-1">
                    {unitQuantity.quantities?.slice(0, 3).map((quantity, index) => (
                      <div key={index} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                        <span>{quantity.value}</span>
                        <span>{quantity.multiplier}x</span>
                      </div>
                    ))}
                    {unitQuantity.quantities?.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{unitQuantity.quantities.length - 3} more
                      </p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleViewUnitQuantity(unitQuantity)}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unit Quantity Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUnitQuantity ? 'Edit Unit Quantity' : 'Add New Unit Quantity'}
      >
        <UnitQuantitiesModal
          unitQuantity={editingUnitQuantity}
          onSave={handleSaveUnitQuantity}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* View Unit Quantity Modal */}
      <ViewUnitQuantityModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        unitQuantity={viewModal.unitQuantity}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        unitQuantityName={deleteModal.unitQuantity?.unitId?.name || 'Unknown Unit'}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default UnitQuantities;