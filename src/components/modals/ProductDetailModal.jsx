import React, { useState } from 'react';
import { X, Edit, Trash2, Star, Package, Tag, Info } from 'lucide-react';

const ProductDetailModal = ({ isOpen, onClose, product, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  if (!isOpen || !product) return null;

  const handleEdit = () => {
    setEditData(product);
    setIsEditing(true);
  };
     
  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);   
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(product.id);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? 'Edit Product' : 'Product Details'}
              </h3>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="text-purple-600 hover:text-purple-800 transition-colors p-2"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Image */}
              <div>
                <img
                  src={isEditing ? editData.images?.[0] : product.images[0]}
                  alt={isEditing ? editData.name : product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {isEditing && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="images"
                      value={editData.images?.[0] || ''}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        images: [e.target.value]
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}
              </div>


              

              {/* Product Details */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editData.name || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="text"
                          name="price"
                          value={editData.price || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Price
                        </label>
                        <input
                          type="text"
                          name="originalPrice"
                          value={editData.originalPrice || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <input
                          type="text"
                          name="unit"
                          value={editData.unit || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Count
                        </label>
                        <input
                          type="number"
                          name="stockCount"
                          value={editData.stockCount || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="inStock"
                          checked={editData.inStock || false}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">In Stock</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                      <p className="text-purple-600 font-medium">{product.categoryName}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-gray-500">({product.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-3xl font-bold text-purple-600">₹{parseInt(product.price).toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-xl text-gray-500 line-through">₹{parseInt(product.originalPrice).toLocaleString()}</span>
                      )}
                      <span className="text-gray-600">/{product.unit}</span>
                      {product.discount && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                          {product.discount} OFF
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <span className="text-gray-600">Stock: {product.stockCount}</span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{product.description}</p>
                    </div>

                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {product.features.map((feature, index) => (
                            <li key={index} className="text-gray-600">{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {product.benefits && product.benefits.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Benefits</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {product.benefits.map((benefit, index) => (
                            <li key={index} className="text-gray-600">{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;