import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Package, Loader2, Star, IndianRupee, X, AlertTriangle, Filter, Award, CheckCircle } from 'lucide-react';
import { ProductsAPI } from '../../api/products';
import { API_CONFIG, BASE_URL } from '../../api/api-config';
import ProductViewModal from '../../components/modals/ProductViewModal';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
if (!isOpen) return null;

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
<div className="bg-white rounded-lg max-w-md w-full shadow-xl">
{/* Header */}
<div className="flex items-center justify-between p-6 border-b border-gray-200">
<div className="flex items-center space-x-3">
{type === 'danger' && (
<div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
<AlertTriangle className="w-5 h-5 text-red-600" />
</div>
)}
<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
</div>
<button
onClick={onClose}
className="text-gray-400 hover:text-gray-500 transition-colors"
>
<X className="w-5 h-5" />
</button>
</div>

    {/* Body */}
    <div className="p-6">
      <p className="text-gray-600">{message}</p>
    </div>

    {/* Footer */}
    <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
      >
        {cancelText || 'Cancel'}
      </button>
      <button
        onClick={onConfirm}
        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
          type === 'danger'
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
        }`}
      >
        {confirmText || 'Confirm'}
      </button>
    </div>
  </div>
</div>
);
};

const Products = () => {
const navigate = useNavigate();
const location = useLocation();

const [products, setProducts] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
const [selectedThompsFilter, setSelectedThompsFilter] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [retryCount, setRetryCount] = useState(0);
const [selectedProduct, setSelectedProduct] = useState(null);
const [isViewModalOpen, setIsViewModalOpen] = useState(false);

// Confirmation modal state
const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
const [productToDelete, setProductToDelete] = useState(null);

useEffect(() => {
fetchProducts();

// Check if we have a selected category from navigation state
if (location.state?.selectedCategory) {
  setSelectedCategoryFilter(location.state.selectedCategory);
}
}, [location.state]);

const fetchProducts = async () => {
setLoading(true);
setError(null);
let attempts = 0;

while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
  try {
    const res = await ProductsAPI.getAll();
    if (res.success) {
      console.log("Products Result:", res.result);
      setProducts(res.result || []);
      setLoading(false);
      return;
    } else {
      throw new Error(res.message || 'Failed to fetch products');
    }
  } catch (err) {
    attempts += 1;
    setRetryCount(attempts);
    if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
    } else {
      setError('Unable to fetch products. Please try again later.');
      setLoading(false);
    }
  }
}
};

// Enhanced filtering logic
const filteredProducts = products.filter(product => {
const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
product.description.toLowerCase().includes(searchTerm.toLowerCase());

const matchesCategory = selectedCategoryFilter === '' || 
                       product.categoryId?.title === selectedCategoryFilter;

const matchesThomps = selectedThompsFilter === '' || 
  (selectedThompsFilter === 'thomps' && product.thomps) ||
  (selectedThompsFilter === 'signature' && product.signatureFlavorsProducts) ||
  (selectedThompsFilter === 'bestseller' && product.bestSellingProducts) ||
  (selectedThompsFilter === 'non-thomps' && !product.thomps);

return matchesSearch && matchesCategory && matchesThomps;
});

// Get unique categories for filter dropdown
const uniqueCategories = [...new Set(products.map(product => product.categoryId?.title).filter(Boolean))];

// Calculate Thomps statistics
const thompsStats = {
thompsEnabled: products.filter(p => p.thomps).length,
signatureProducts: products.filter(p => p.signatureFlavorsProducts).length,
bestSellingProducts: products.filter(p => p.bestSellingProducts).length,
};

const handleAddProduct = () => {
navigate('/admin/add-product');
};

const handleViewProduct = (product) => {
setSelectedProduct(product);
setIsViewModalOpen(true);
};

const handleEditProduct = (product) => {
navigate('/admin/add-product', { state: { editingProduct: product } });
};

// Modified to show confirmation modal instead of alert
const handleDeleteProduct = (product) => {
setProductToDelete(product);
setIsConfirmModalOpen(true);
};

// Handle the actual deletion after confirmation
const confirmDeleteProduct = async () => {
if (!productToDelete) return;

try {
  setLoading(true);
  const res = await ProductsAPI.delete(productToDelete.id);

  if (res.success) {
    setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
  } else {
    throw new Error(res.message || "Failed to delete product");
  }
} catch (error) {
  setError(error.message || "Something went wrong while deleting.");
} finally {
  setLoading(false);
  setIsConfirmModalOpen(false);
  setProductToDelete(null);
}
};

// Handle modal close
const handleCloseConfirmModal = () => {
setIsConfirmModalOpen(false);
setProductToDelete(null);
};

const handleProductUpdate = (updatedProduct) => {
setProducts((prev) =>
prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
);
setIsViewModalOpen(false);
};

const handleProductDelete = (deletedProductId) => {
setProducts((prev) => prev.filter((p) => p.id !== deletedProductId));
setIsViewModalOpen(false);
};

// Clear filters
const clearAllFilters = () => {
setSelectedCategoryFilter('');
setSelectedThompsFilter('');
// Clear navigation state
navigate(location.pathname, { replace: true });
};

const clearCategoryFilter = () => {
setSelectedCategoryFilter('');
// Clear navigation state
navigate(location.pathname, { replace: true });
};

return (
<div className="space-y-6">
{/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
<div>
<h1 className="text-3xl font-bold text-gray-900">Products</h1>
<p className="text-gray-600 mt-1">
Manage your product inventory
{(selectedCategoryFilter || selectedThompsFilter) && (
<span className="ml-2 text-purple-600 font-medium">
- Filtered by: {selectedCategoryFilter} {selectedThompsFilter && `${selectedCategoryFilter ? ', ' : ''}${selectedThompsFilter}`}
</span>
)}
</p>
</div>
<button
onClick={handleAddProduct}
className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
>
<Plus className="w-4 h-4" />
<span>Add Product</span>
</button>
</div>

  {/* Stats Cards - Updated to show filtered stats */}
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-4">
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">
            {(selectedCategoryFilter || selectedThompsFilter) ? 'Filtered' : 'Total Products'}
          </p>
          <p className="text-xl font-bold text-gray-900">{filteredProducts.length}</p>
        </div>
        <div className="p-2 rounded-lg bg-blue-100">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">In Stock</p>
          <p className="text-xl font-bold text-gray-900">
            {filteredProducts.filter(p => p.inStock).length}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-green-100">
          <Eye className="w-4 h-4 text-green-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Out of Stock</p>
          <p className="text-xl font-bold text-gray-900">
            {filteredProducts.filter(p => !p.inStock).length}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-red-100">
          <Package className="w-4 h-4 text-red-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Avg Rating</p>
          <p className="text-xl font-bold text-gray-900">
            {filteredProducts.length > 0 
              ? (filteredProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / filteredProducts.length).toFixed(1)
              : '0.0'
            }
          </p>
        </div>
        <div className="p-2 rounded-lg bg-yellow-100">
          <Star className="w-4 h-4 text-yellow-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Thomps</p>
          <p className="text-xl font-bold text-gray-900">{thompsStats.thompsEnabled}</p>
        </div>
        <div className="p-2 rounded-lg bg-yellow-100">
          <CheckCircle className="w-4 h-4 text-yellow-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Best Sellers</p>
          <p className="text-xl font-bold text-gray-900">{thompsStats.bestSellingProducts}</p>
        </div>
        <div className="p-2 rounded-lg bg-green-100">
          <Award className="w-4 h-4 text-green-600" />
        </div>
      </div>
    </div>
  </div>

  {/* Search and Filter */}
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Category Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="pl-9 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Thomps Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CheckCircle className="h-4 w-4 text-gray-400" />
        </div>
        <select
          value={selectedThompsFilter}
          onChange={(e) => setSelectedThompsFilter(e.target.value)}
          className="pl-9 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none"
        >
          <option value="">All Products</option>
          <option value="thomps">Thomps Enabled</option>
          <option value="signature">Signature Products</option>
          <option value="bestseller">Best Sellers</option>
          <option value="non-thomps">Non-Thomps</option>
        </select>
      </div>

      {/* Clear Filter Button */}
      {(selectedCategoryFilter || selectedThompsFilter) && (
        <button
          onClick={clearAllFilters}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  </div>

  {/* Loading State */}
  {loading && !error && (
    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        <div>
          <h3 className="font-semibold text-blue-800">Loading Products</h3>
          <p className="text-blue-700">Fetching the latest products...</p>
          {retryCount > 0 && (
            <p className="text-blue-600 text-sm mt-1">
              Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
            </p>
          )}
        </div>
      </div>
    </div>
  )}

  {/* Error State */}
  {error && !loading && (
    <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
      <h3 className="font-semibold text-red-800">Something went wrong</h3>
      <p className="text-red-700">{error}</p>
      <button
        onClick={fetchProducts}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  )}

  {/* Products Grid */}
  {!loading && !error && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map(product => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="relative">
            <img
              src={product.images && product.images.length > 0 
                ? `${BASE_URL}${product.images[0]}`
                : 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300'
              }
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2 flex flex-col space-y-1">
              <button
                onClick={() => handleViewProduct(product)}
                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => handleEditProduct(product)}
                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => handleDeleteProduct(product)}
                className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
            
            {/* Stock Status */}
            <div className="absolute top-2 left-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.inStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div> 

            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute bottom-2 left-2">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              </div>
            )}

            {/* Thomps Badges */}
            <div className="absolute bottom-2 right-2 flex flex-col items-end space-y-1">
              {/* {product.thomps && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  Thomps
                </span>
              )} */}
              {product.signatureFlavorsProducts && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Signature
                </span>
              )}
              {product.bestSellingProducts && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Best</span>
                </span>
              )}
            </div>

            
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600">{product.rating || 0}</span>
              </div>
            </div>

            {/* Category Status */}
            <div className="mb-3">
              <span className="bg-gradient-to-r from-blue-500 to-purple-400 text-white text-xs px-2 py-1 rounded-full">
              {/* <span className=" text-xs pe-2 py-0 rounded-full"> */}
                {product?.categoryId?.title || 'No Category'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900 flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  {parseFloat(product.price.replace('₹', '').replace(',', '')).toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice !== product.price && (
                  <span className="text-sm text-gray-500 line-through flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {parseFloat(product.originalPrice.replace('₹', '').replace(',', '')).toFixed(2)}
                  </span>
                )} 
              </div>
              <span className="text-xs text-gray-500">
                Stock: {product.stockCount}
              </span>
            </div>
            
            <button 
              onClick={() => handleViewProduct(product)}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Empty State */}
  {!loading && !error && filteredProducts.length === 0 && (
    <div className="text-center py-12">
      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm || selectedCategoryFilter || selectedThompsFilter
          ? 'Try adjusting your search terms or filters' 
          : 'Get started by adding your first product'
        }
      </p>
      {(searchTerm || selectedCategoryFilter || selectedThompsFilter) ? (
        <button
          onClick={() => {
            setSearchTerm('');
            clearAllFilters();
          }}
          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 mr-3"
        >
          Clear Filters
        </button>
      ) : null}
      <button
        onClick={handleAddProduct}
        className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
      >
        Add Product
      </button>
    </div>
  )}

  {/* Product View Modal */}
  <ProductViewModal
    isOpen={isViewModalOpen}
    onClose={() => setIsViewModalOpen(false)}
    product={selectedProduct}
    onEdit={handleEditProduct}
    onDelete={handleProductDelete}
    onUpdate={handleProductUpdate}
  />

  {/* Confirmation Modal for Delete */}
  <ConfirmationModal
    isOpen={isConfirmModalOpen}
    onClose={handleCloseConfirmModal}
    onConfirm={confirmDeleteProduct}
    title="Delete Product"
    message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
    confirmText="Delete"
    cancelText="Cancel"
    type="danger"
  />
</div>
);
};

export default Products;



















// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Plus, Search, Edit, Trash2, Eye, Package, Loader2, Star, IndianRupee, X, AlertTriangle, Filter, Award, TrendingUp } from 'lucide-react';
// import { ProductsAPI } from '../../api/products';
// import { API_CONFIG, BASE_URL } from '../../api/api-config';
// import ProductViewModal from '../../components/modals/ProductViewModal';

// // Confirmation Modal Component     
// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <div className="flex items-center space-x-3">
//             {type === 'danger' && (
//               <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
//                 <AlertTriangle className="w-5 h-5 text-red-600" />
//               </div>
//             )}
//             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-500 transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-6">
//           <p className="text-gray-600">{message}</p>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
//           >
//             {cancelText || 'Cancel'}
//           </button>
//           <button
//             onClick={onConfirm}
//             className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
//               type === 'danger'
//                 ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
//                 : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
//             }`}
//           >
//             {confirmText || 'Confirm'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Products = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
//   const [selectedThompsFilter, setSelectedThompsFilter] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [retryCount, setRetryCount] = useState(0);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
//   // Confirmation modal state
//   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
//   const [productToDelete, setProductToDelete] = useState(null);

//   useEffect(() => {
//     fetchProducts();
    
//     // Check if we have a selected category from navigation state
//     if (location.state?.selectedCategory) {
//       setSelectedCategoryFilter(location.state.selectedCategory);
//     }
//   }, [location.state]);

//   const fetchProducts = async () => {
//     setLoading(true);
//     setError(null);
//     let attempts = 0;

//     while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
//       try {
//         const res = await ProductsAPI.getAll();
//         if (res.success) {
//           console.log("Products Result:", res.result);
//           setProducts(res.result || []);
//           setLoading(false);
//           return;
//         } else {
//           throw new Error(res.message || 'Failed to fetch products');
//         }
//       } catch (err) {
//         attempts += 1;
//         setRetryCount(attempts);
//         if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
//           await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
//         } else {
//           setError('Unable to fetch products. Please try again later.');
//           setLoading(false);
//         }
//       }
//     }
//   };

//   // Enhanced filtering logic
//   const filteredProducts = products.filter(product => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesCategory = selectedCategoryFilter === '' || 
//                            product.categoryId?.title === selectedCategoryFilter;
    
//     const matchesThomps = selectedThompsFilter === '' ||
//                          (selectedThompsFilter === 'thomps' && product.thomps) ||
//                          (selectedThompsFilter === 'bestSelling' && product.bestSellingProducts) ||
//                          (selectedThompsFilter === 'signature' && product.signatureFlavorsProducts) ||
//                          (selectedThompsFilter === 'nonThomps' && !product.thomps);
    
//     return matchesSearch && matchesCategory && matchesThomps;
//   });

//   // Get unique categories for filter dropdown
//   const uniqueCategories = [...new Set(products.map(product => product.categoryId?.title).filter(Boolean))];

//   const handleAddProduct = () => {
//     navigate('/admin/add-product');
//   };

//   const handleViewProduct = (product) => {
//     setSelectedProduct(product);
//     setIsViewModalOpen(true);
//   }; 

//   const handleEditProduct = (product) => {
//     navigate('/admin/add-product', { state: { editingProduct: product } });
//   };

//   // Modified to show confirmation modal instead of alert
//   const handleDeleteProduct = (product) => {
//     setProductToDelete(product);
//     setIsConfirmModalOpen(true);
//   };

//   // Handle the actual deletion after confirmation
//   const confirmDeleteProduct = async () => {
//     if (!productToDelete) return;

//     try {
//       setLoading(true);
//       const res = await ProductsAPI.delete(productToDelete.id);

//       if (res.success) {
//         setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
//       } else {
//         throw new Error(res.message || "Failed to delete product");
//       }
//     } catch (error) {
//       setError(error.message || "Something went wrong while deleting.");
//     } finally {
//       setLoading(false);
//       setIsConfirmModalOpen(false);
//       setProductToDelete(null);
//     }
//   };

//   // Handle modal close
//   const handleCloseConfirmModal = () => {
//     setIsConfirmModalOpen(false);
//     setProductToDelete(null);
//   };

//   const handleProductUpdate = (updatedProduct) => {
//     setProducts((prev) =>
//       prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
//     );
//     setIsViewModalOpen(false);
//   };

//   const handleProductDelete = (deletedProductId) => {
//     setProducts((prev) => prev.filter((p) => p.id !== deletedProductId));
//     setIsViewModalOpen(false);
//   };

//   // Clear category filter
//   const clearFilters = () => {
//     setSelectedCategoryFilter('');
//     setSelectedThompsFilter('');
//     // Clear navigation state
//     navigate(location.pathname, { replace: true });
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Products</h1>
//           <p className="text-gray-600 mt-1">
//             Manage your product inventory
//             {(selectedCategoryFilter || selectedThompsFilter) && (
//               <span className="ml-2 text-purple-600 font-medium">
//                 - Filtered by: {selectedCategoryFilter} {selectedThompsFilter && `& ${selectedThompsFilter}`}
//               </span>
//             )}
//           </p>
//         </div>
//         <button
//           onClick={handleAddProduct}
//           className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Add Product</span>
//         </button>
//       </div>

//       {/* Stats Cards - Updated to show filtered stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">
//                 {selectedCategoryFilter || selectedThompsFilter ? 'Filtered Products' : 'Total Products'}
//               </p>
//               <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
//             </div>
//             <div className="p-3 rounded-lg bg-blue-100">
//               <Package className="w-6 h-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">In Stock</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {filteredProducts.filter(p => p.inStock).length}
//               </p>
//             </div>
//             <div className="p-3 rounded-lg bg-green-100">
//               <Eye className="w-6 h-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Thomps Products</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {filteredProducts.filter(p => p.thomps).length}
//               </p>
//             </div>
//             <div className="p-3 rounded-lg bg-yellow-100">
//               <span className="text-2xl">🔥</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Best Sellers</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {filteredProducts.filter(p => p.bestSellingProducts).length}
//               </p>
//             </div>
//             <div className="p-3 rounded-lg bg-green-100">
//               <TrendingUp className="w-6 h-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Avg Rating</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {filteredProducts.length > 0 
//                   ? (filteredProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / filteredProducts.length).toFixed(1)
//                   : '0.0'
//                 }
//               </p>
//             </div>
//             <div className="p-3 rounded-lg bg-yellow-100">
//               <Star className="w-6 h-6 text-yellow-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search and Filter */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex flex-col sm:flex-row gap-4">
//           {/* Search */}
//           <div className="relative flex-1">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search products..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//             />
//           </div>

//           {/* Category Filter */}
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Filter className="h-4 w-4 text-gray-400" />
//             </div>
//             <select
//               value={selectedCategoryFilter}
//               onChange={(e) => setSelectedCategoryFilter(e.target.value)}
//               className="pl-9 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none"
//             >
//               <option value="">All Categories</option>
//               {uniqueCategories.map(category => (
//                 <option key={category} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Thomps Filter */}
//           <div className="relative">
//             <select
//               value={selectedThompsFilter}
//               onChange={(e) => setSelectedThompsFilter(e.target.value)}
//               className="pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none"
//             >
//               <option value="">All Types</option>
//               <option value="thomps">Thomps Products</option>
//               <option value="bestSelling">Best Selling</option>
//               <option value="signature">Signature Flavors</option>
//               <option value="nonThomps">Non-Thomps</option>
//             </select>
//           </div>

//           {/* Clear Filter Button */}
//           {(selectedCategoryFilter || selectedThompsFilter) && (
//             <button
//               onClick={clearFilters}
//               className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
//             >
//               <X className="w-4 h-4" />
//               <span>Clear Filters</span>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading && !error && (
//         <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
//           <div className="flex items-center gap-3">
//             <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
//             <div>
//               <h3 className="font-semibold text-blue-800">Loading Products</h3>
//               <p className="text-blue-700">Fetching the latest products...</p>
//               {retryCount > 0 && (
//                 <p className="text-blue-600 text-sm mt-1">
//                   Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Error State */}
//       {error && !loading && (
//         <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
//           <h3 className="font-semibold text-red-800">Something went wrong</h3>
//           <p className="text-red-700">{error}</p>
//           <button
//             onClick={fetchProducts}
//             className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       )}

//       {/* Products Grid */}
//       {!loading && !error && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
//               <div className="relative">
//                 <img
//                   src={product.images && product.images.length > 0 
//                     ? `${BASE_URL}${product.images[0]}`
//                     : 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300'
//                   }
//                   alt={product.name}
//                   className="w-full h-48 object-cover"
//                 />
//                 <div className="absolute top-2 right-2 flex space-x-1">
//                   <button
//                     onClick={() => handleViewProduct(product)}
//                     className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
//                   >
//                     <Eye className="w-4 h-4 text-gray-600" />
//                   </button>
//                   <button
//                     onClick={() => handleEditProduct(product)}
//                     className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
//                   >
//                     <Edit className="w-4 h-4 text-gray-600" />
//                   </button>
//                   <button
//                     onClick={() => handleDeleteProduct(product)}
//                     className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
//                   >
//                     <Trash2 className="w-4 h-4 text-red-600" />
//                   </button>
//                 </div>
                
//                 {/* Stock Status */}
//                 <div className="absolute top-2 left-2 flex flex-col space-y-1">
//                   <span className={`text-xs px-2 py-1 rounded-full ${
//                     product.inStock 
//                       ? 'bg-green-100 text-green-800' 
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     {product.inStock ? 'In Stock' : 'Out of Stock'}
//                   </span>
                  
//                   {/* Thomps Badge */}
//                   {product.thomps && (
//                     <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
//                       <span>🔥</span>
//                     </span>
//                   )}
//                 </div> 

//                 {/* Discount Badge */}
//                 {product.discount > 0 && (
//                   <div className="absolute bottom-2 left-2">
//                     <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                       {product.discount}% OFF
//                     </span>
//                   </div>
//                 )}

//                 {/* Category and Special Features */}
//                 <div className="absolute bottom-1 right-1 flex flex-col items-end space-y-1">
//                   <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
//                     {product?.categoryId?.title || 'Category not found'}
//                   </span>
                  
//                   {/* Thomps Features */}
//                   <div className="flex space-x-1">
//                     {product.bestSellingProducts && (
//                       <span className="bg-green-600 text-white text-xs px-1 py-1 rounded-full">
//                         <TrendingUp className="w-3 h-3" />
//                       </span>
//                     )}
//                     {product.signatureFlavorsProducts && (
//                       <span className="bg-orange-600 text-white text-xs px-1 py-1 rounded-full">
//                         <Award className="w-3 h-3" />
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               <div className="p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
//                   <div className="flex items-center space-x-1">
//                     <Star className="w-3 h-3 text-yellow-400 fill-current" />
//                     <span className="text-xs text-gray-600">{product.rating || 0}</span>
//                   </div>
//                 </div>
                
//                 <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//                   {product.description}
//                 </p>

//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center space-x-2">
//                     <span className="text-lg font-bold text-gray-900 flex items-center">
//                       <IndianRupee className="w-4 h-4" />
//                       {parseFloat(product.price.replace('₹', '').replace(',', '')).toFixed(2)}
//                     </span>
//                     {product.originalPrice && product.originalPrice !== product.price && (
//                       <span className="text-sm text-gray-500 line-through flex items-center">
//                         <IndianRupee className="w-3 h-3" />
//                         {parseFloat(product.originalPrice.replace('₹', '').replace(',', '')).toFixed(2)}
//                       </span>
//                     )} 
//                   </div>
//                   <span className="text-xs text-gray-500">
//                     Stock: {product.stockCount}
//                   </span>
//                 </div>
                
//                 <button 
//                   onClick={() => handleViewProduct(product)}
//                   className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Empty State */}
//       {!loading && !error && filteredProducts.length === 0 && (
//         <div className="text-center py-12">
//           <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
//           <p className="text-gray-600 mb-4">
//             {searchTerm || selectedCategoryFilter || selectedThompsFilter
//               ? 'Try adjusting your search terms or filters' 
//               : 'Get started by adding your first product'
//             }
//           </p>
//           {(searchTerm || selectedCategoryFilter || selectedThompsFilter) ? (
//             <button
//               onClick={() => {
//                 setSearchTerm('');
//                 clearFilters();
//               }}
//               className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 mr-3"
//             >
//               Clear Filters
//             </button>
//           ) : null}
//           <button
//             onClick={handleAddProduct}
//             className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
//           >
//             Add Product
//           </button>
//         </div>
//       )}

//       {/* Product View Modal */}
//       <ProductViewModal
//         isOpen={isViewModalOpen}
//         onClose={() => setIsViewModalOpen(false)}
//         product={selectedProduct}
//         onEdit={handleEditProduct}
//         onDelete={handleProductDelete}
//         onUpdate={handleProductUpdate}
//       />

//       {/* Confirmation Modal for Delete */}
//       <ConfirmationModal
//         isOpen={isConfirmModalOpen}
//         onClose={handleCloseConfirmModal}
//         onConfirm={confirmDeleteProduct}
//         title="Delete Product"
//         message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
//         confirmText="Delete"
//         cancelText="Cancel"
//         type="danger"
//       />
//     </div>
//   ); 
// };

// export default Products;























































// /// import React, { useState, useEffect } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import { Plus, Search, Edit, Trash2, Eye, Package, Loader2, Star, IndianRupee, X, AlertTriangle, Filter } from 'lucide-react';
// // import { ProductsAPI } from '../../api/products';
// // import { API_CONFIG, BASE_URL } from '../../api/api-config';
// // import ProductViewModal from '../../components/modals/ProductViewModal';

// // // Confirmation Modal Component     
// // const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// //       <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
// //         {/* Header */}
// //         <div className="flex items-center justify-between p-6 border-b border-gray-200">
// //           <div className="flex items-center space-x-3">
// //             {type === 'danger' && (
// //               <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
// //                 <AlertTriangle className="w-5 h-5 text-red-600" />
// //               </div>
// //             )}
// //             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
// //           </div>
// //           <button
// //             onClick={onClose}
// //             className="text-gray-400 hover:text-gray-500 transition-colors"
// //           >
// //             <X className="w-5 h-5" />
// //           </button>
// //         </div>

// //         {/* Body */}
// //         <div className="p-6">
// //           <p className="text-gray-600">{message}</p>
// //         </div>

// //         {/* Footer */}
// //         <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
// //           <button
// //             onClick={onClose}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
// //           >
// //             {cancelText || 'Cancel'}
// //           </button>
// //           <button
// //             onClick={onConfirm}
// //             className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
// //               type === 'danger'
// //                 ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
// //                 : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
// //             }`}
// //           >
// //             {confirmText || 'Confirm'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const Products = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [products, setProducts] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [retryCount, setRetryCount] = useState(0);
// //   const [selectedProduct, setSelectedProduct] = useState(null);
// //   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
// //   // Confirmation modal state
// //   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
// //   const [productToDelete, setProductToDelete] = useState(null);

// //   useEffect(() => {
// //     fetchProducts();
    
// //     // Check if we have a selected category from navigation state
// //     if (location.state?.selectedCategory) {
// //       setSelectedCategoryFilter(location.state.selectedCategory);
// //     }
// //   }, [location.state]);

// //   const fetchProducts = async () => {
// //     setLoading(true);
// //     setError(null);
// //     let attempts = 0;

// //     while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
// //       try {
// //         const res = await ProductsAPI.getAll();
// //         if (res.success) {
// //           console.log("Products Result:", res.result);
// //           setProducts(res.result || []);
// //           setLoading(false);
// //           return;
// //         } else {
// //           throw new Error(res.message || 'Failed to fetch products');
// //         }
// //       } catch (err) {
// //         attempts += 1;
// //         setRetryCount(attempts);
// //         if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
// //           await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
// //         } else {
// //           setError('Unable to fetch products. Please try again later.');
// //           setLoading(false);
// //         }
// //       }
// //     }
// //   };

// //   // Enhanced filtering logic
// //   const filteredProducts = products.filter(product => {
// //     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
// //     const matchesCategory = selectedCategoryFilter === '' || 
// //                            product.categoryId?.title === selectedCategoryFilter;
    
// //     return matchesSearch && matchesCategory;
// //   });

// //   // Get unique categories for filter dropdown
// //   const uniqueCategories = [...new Set(products.map(product => product.categoryId?.title).filter(Boolean))];

// //   const handleAddProduct = () => {
// //     navigate('/admin/add-product');
// //   };

// //   const handleViewProduct = (product) => {
// //     setSelectedProduct(product);
// //     setIsViewModalOpen(true);
// //   }; 

// //   const handleEditProduct = (product) => {
// //     navigate('/admin/add-product', { state: { editingProduct: product } });
// //   };

// //   // Modified to show confirmation modal instead of alert
// //   const handleDeleteProduct = (product) => {
// //     setProductToDelete(product);
// //     setIsConfirmModalOpen(true);
// //   };

// //   // Handle the actual deletion after confirmation
// //   const confirmDeleteProduct = async () => {
// //     if (!productToDelete) return;

// //     try {
// //       setLoading(true);
// //       const res = await ProductsAPI.delete(productToDelete.id);

// //       if (res.success) {
// //         setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
// //       } else {
// //         throw new Error(res.message || "Failed to delete product");
// //       }
// //     } catch (error) {
// //       setError(error.message || "Something went wrong while deleting.");
// //     } finally {
// //       setLoading(false);
// //       setIsConfirmModalOpen(false);
// //       setProductToDelete(null);
// //     }
// //   };

// //   // Handle modal close
// //   const handleCloseConfirmModal = () => {
// //     setIsConfirmModalOpen(false);
// //     setProductToDelete(null);
// //   };

// //   const handleProductUpdate = (updatedProduct) => {
// //     setProducts((prev) =>
// //       prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
// //     );
// //     setIsViewModalOpen(false);
// //   };

// //   const handleProductDelete = (deletedProductId) => {
// //     setProducts((prev) => prev.filter((p) => p.id !== deletedProductId));
// //     setIsViewModalOpen(false);
// //   };

// //   // Clear category filter
// //   const clearCategoryFilter = () => {
// //     setSelectedCategoryFilter('');
// //     // Clear navigation state
// //     navigate(location.pathname, { replace: true });
// //   };

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
// //         <div>
// //           <h1 className="text-3xl font-bold text-gray-900">Products</h1>
// //           <p className="text-gray-600 mt-1">
// //             Manage your product inventory
// //             {selectedCategoryFilter && (
// //               <span className="ml-2 text-purple-600 font-medium">
// //                 - Filtered by: {selectedCategoryFilter}
// //               </span>
// //             )}
// //           </p>
// //         </div>
// //         <button
// //           onClick={handleAddProduct}
// //           className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
// //         >
// //           <Plus className="w-4 h-4" />
// //           <span>Add Product</span>
// //         </button>
// //       </div>

// //       {/* Stats Cards - Updated to show filtered stats */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm font-medium text-gray-500">
// //                 {selectedCategoryFilter ? 'Filtered Products' : 'Total Products'}
// //               </p>
// //               <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
// //             </div>
// //             <div className="p-3 rounded-lg bg-blue-100">
// //               <Package className="w-6 h-6 text-blue-600" />
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm font-medium text-gray-500">In Stock</p>
// //               <p className="text-2xl font-bold text-gray-900">
// //                 {filteredProducts.filter(p => p.inStock).length}
// //               </p>
// //             </div>
// //             <div className="p-3 rounded-lg bg-green-100">
// //               <Eye className="w-6 h-6 text-green-600" />
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm font-medium text-gray-500">Out of Stock</p>
// //               <p className="text-2xl font-bold text-gray-900">
// //                 {filteredProducts.filter(p => !p.inStock).length}
// //               </p>
// //             </div>
// //             <div className="p-3 rounded-lg bg-red-100">
// //               <Package className="w-6 h-6 text-red-600" />
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm font-medium text-gray-500">Avg Rating</p>
// //               <p className="text-2xl font-bold text-gray-900">
// //                 {filteredProducts.length > 0 
// //                   ? (filteredProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / filteredProducts.length).toFixed(1)
// //                   : '0.0'
// //                 }
// //               </p>
// //             </div>
// //             <div className="p-3 rounded-lg bg-yellow-100">
// //               <Star className="w-6 h-6 text-yellow-600" />
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Search and Filter */}
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <div className="flex flex-col sm:flex-row gap-4">
// //           {/* Search */}
// //           <div className="relative flex-1">
// //             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //               <Search className="h-5 w-5 text-gray-400" />
// //             </div>
// //             <input
// //               type="text"
// //               placeholder="Search products..."
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
// //             />
// //           </div>

// //           {/* Category Filter */}
// //           <div className="relative">
// //             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //               <Filter className="h-4 w-4 text-gray-400" />
// //             </div>
// //             <select
// //               value={selectedCategoryFilter}
// //               onChange={(e) => setSelectedCategoryFilter(e.target.value)}
// //               className="pl-9 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none"
// //             >
// //               <option value="">All Categories</option>
// //               {uniqueCategories.map(category => (
// //                 <option key={category} value={category}>
// //                   {category}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           {/* Clear Filter Button */}
// //           {selectedCategoryFilter && (
// //             <button
// //               onClick={clearCategoryFilter}
// //               className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
// //             >
// //               <X className="w-4 h-4" />
// //               <span>Clear Filter</span>
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* Loading State */}
// //       {loading && !error && (
// //         <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
// //           <div className="flex items-center gap-3">
// //             <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
// //             <div>
// //               <h3 className="font-semibold text-blue-800">Loading Products</h3>
// //               <p className="text-blue-700">Fetching the latest products...</p>
// //               {retryCount > 0 && (
// //                 <p className="text-blue-600 text-sm mt-1">
// //                   Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
// //                 </p>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Error State */}
// //       {error && !loading && (
// //         <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
// //           <h3 className="font-semibold text-red-800">Something went wrong</h3>
// //           <p className="text-red-700">{error}</p>
// //           <button
// //             onClick={fetchProducts}
// //             className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
// //           >
// //             Try Again
// //           </button>
// //         </div>
// //       )}

// //       {/* Products Grid */}
// //       {!loading && !error && (
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //           {filteredProducts.map(product => (
// //             <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
// //               <div className="relative">
// //                 <img
// //                   src={product.images && product.images.length > 0 
// //                     ? `${BASE_URL}${product.images[0]}`
// //                     : 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300'
// //                   }
// //                   alt={product.name}
// //                   className="w-full h-48 object-cover"
// //                 />
// //                 <div className="absolute top-2 right-2 flex space-x-1">
// //                   <button
// //                     onClick={() => handleViewProduct(product)}
// //                     className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
// //                   >
// //                     <Eye className="w-4 h-4 text-gray-600" />
// //                   </button>
// //                   <button
// //                     onClick={() => handleEditProduct(product)}
// //                     className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
// //                   >
// //                     <Edit className="w-4 h-4 text-gray-600" />
// //                   </button>
// //                   <button
// //                     onClick={() => handleDeleteProduct(product)}
// //                     className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
// //                   >
// //                     <Trash2 className="w-4 h-4 text-red-600" />
// //                   </button>
// //                 </div>
                
// //                 {/* Stock Status */}
// //                 <div className="absolute top-2 left-2">
// //                   <span className={`text-xs px-2 py-1 rounded-full ${
// //                     product.inStock 
// //                       ? 'bg-green-100 text-green-800' 
// //                       : 'bg-red-100 text-red-800'
// //                   }`}>
// //                     {product.inStock ? 'In Stock' : 'Out of Stock'}
// //                   </span>
// //                 </div> 

// //                 {/* Discount Badge */}
// //                 {product.discount > 0 && (
// //                   <div className="absolute bottom-2 left-2">
// //                     <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
// //                       {product.discount}% OFF
// //                     </span>
// //                   </div>
// //                 )}

// //                 {/* Category Status */}
// //                 <div className="absolute bottom-1 right-1">
// //                   <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full" >
// //                     {product?.categoryId?.title || 'Category not found'}
// //                   </span>
// //                 </div>
// //               </div>
              
// //               <div className="p-4">
// //                 <div className="flex items-center justify-between mb-2">
// //                   <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
// //                   <div className="flex items-center space-x-1">
// //                     <Star className="w-3 h-3 text-yellow-400 fill-current" />
// //                     <span className="text-xs text-gray-600">{product.rating || 0}</span>
// //                   </div>
// //                 </div>
                
// //                 <p className="text-sm text-gray-600 mb-3 line-clamp-2">
// //                   {product.description}
// //                 </p>

// //                 <div className="flex items-center justify-between mb-3">
// //                   <div className="flex items-center space-x-2">
// //                     <span className="text-lg font-bold text-gray-900 flex items-center">
// //                       <IndianRupee className="w-4 h-4" />
// //                       {parseFloat(product.price.replace('₹', '').replace(',', '')).toFixed(2)}
// //                     </span>
// //                     {product.originalPrice && product.originalPrice !== product.price && (
// //                       <span className="text-sm text-gray-500 line-through flex items-center">
// //                         <IndianRupee className="w-3 h-3" />
// //                         {parseFloat(product.originalPrice.replace('₹', '').replace(',', '')).toFixed(2)}
// //                       </span>
// //                     )} 
// //                   </div>
// //                   <span className="text-xs text-gray-500">
// //                     Stock: {product.stockCount}
// //                   </span>
// //                 </div>
                
// //                 <button 
// //                   onClick={() => handleViewProduct(product)}
// //                   className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
// //                 >
// //                   View Details
// //                 </button>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* Empty State */}
// //       {!loading && !error && filteredProducts.length === 0 && (
// //         <div className="text-center py-12">
// //           <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //           <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
// //           <p className="text-gray-600 mb-4">
// //             {searchTerm || selectedCategoryFilter 
// //               ? 'Try adjusting your search terms or filters' 
// //               : 'Get started by adding your first product'
// //             }
// //           </p>
// //           {(searchTerm || selectedCategoryFilter) ? (
// //             <button
// //               onClick={() => {
// //                 setSearchTerm('');
// //                 clearCategoryFilter();
// //               }}
// //               className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 mr-3"
// //             >
// //               Clear Filters
// //             </button>
// //           ) : null}
// //           <button
// //             onClick={handleAddProduct}
// //             className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
// //           >
// //             Add Product
// //           </button>
// //         </div>
// //       )}

// //       {/* Product View Modal */}
// //       <ProductViewModal
// //         isOpen={isViewModalOpen}
// //         onClose={() => setIsViewModalOpen(false)}
// //         product={selectedProduct}
// //         onEdit={handleEditProduct}
// //         onDelete={handleProductDelete}
// //         onUpdate={handleProductUpdate}
// //       />

// //       {/* Confirmation Modal for Delete */}
// //       <ConfirmationModal
// //         isOpen={isConfirmModalOpen}
// //         onClose={handleCloseConfirmModal}
// //         onConfirm={confirmDeleteProduct}
// //         title="Delete Product"
// //         message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
// //         confirmText="Delete"
// //         cancelText="Cancel"
// //         type="danger"
// //       />
// //     </div>
// //   ); 
// // };

// // export default Products;













// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { Plus, Search, Edit, Trash2, Eye, Package, Loader2, Star, IndianRupee, X, AlertTriangle } from 'lucide-react';
// // import { ProductsAPI } from '../../api/products';
// // import { API_CONFIG, BASE_URL } from '../../api/api-config';
// // import ProductViewModal from '../../components/modals/ProductViewModal';

// // // Confirmation Modal Component     
// // const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// //       <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
// //         {/* Header */}
// //         <div className="flex items-center justify-between p-6 border-b border-gray-200">
// //           <div className="flex items-center space-x-3">
// //             {type === 'danger' && (
// //               <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
// //                 <AlertTriangle className="w-5 h-5 text-red-600" />
// //               </div>
// //             )}
// //             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
// //           </div>
// //           <button
// //             onClick={onClose}
// //             className="text-gray-400 hover:text-gray-500 transition-colors"
// //           >
// //             <X className="w-5 h-5" />
// //           </button>
// //         </div>

// //         {/* Body */}
// //         <div className="p-6">
// //           <p className="text-gray-600">{message}</p>
// //         </div>

// //         {/* Footer */}
// //         <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
// //           <button
// //             onClick={onClose}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
// //           >
// //             {cancelText || 'Cancel'}
// //           </button>
// //           <button
// //             onClick={onConfirm}
// //             className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
// //               type === 'danger'
// //                 ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
// //                 : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
// //             }`}
// //           >
// //             {confirmText || 'Confirm'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const Products = () => {
// //   const navigate = useNavigate();

// //   const [products, setProducts] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [retryCount, setRetryCount] = useState(0);
// //   const [selectedProduct, setSelectedProduct] = useState(null);
// //   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
// //   // Confirmation modal state
// //   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
// //   const [productToDelete, setProductToDelete] = useState(null);

// //   useEffect(() => {
// //     fetchProducts();
// //   }, []);

// //   const fetchProducts = async () => {
// //     setLoading(true);
// //     setError(null);
// //     let attempts = 0;

// //     while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
// //       try {
// //         const res = await ProductsAPI.getAll();
// //         if (res.success) {
// //           console.log("Products Result:", res.result);
// //           setProducts(res.result || []);
// //           setLoading(false);
// //           return;
// //         } else {
// //           throw new Error(res.message || 'Failed to fetch products');
// //         }
// //       } catch (err) {
// //         attempts += 1;
// //         setRetryCount(attempts);
// //         if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
// //           await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
// //         } else {
// //           setError('Unable to fetch products. Please try again later.');
// //           setLoading(false);
// //         }
// //       }
// //     }
// //   };

// //   const filteredProducts = products.filter(product =>
// //     product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     product.description.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   const handleAddProduct = () => {
// //     navigate('/admin/add-product');
// //   };

// //   const handleViewProduct = (product) => {
// //     setSelectedProduct(product);
// //     setIsViewModalOpen(true);
// //   }; 

// //   const handleEditProduct = (product) => {
// //     navigate('/admin/add-product', { state: { editingProduct: product } });
// //   };

// //   // Modified to show confirmation modal instead of alert
// //   const handleDeleteProduct = (product) => {
// //     setProductToDelete(product);
// //     setIsConfirmModalOpen(true);
// //   };

// //   // Handle the actual deletion after confirmation
// //   const confirmDeleteProduct = async () => {
// //     if (!productToDelete) return;

// //     try {
// //       setLoading(true);
// //       const res = await ProductsAPI.delete(productToDelete.id);

// //       if (res.success) {
// //         setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
// //       } else {
// //         throw new Error(res.message || "Failed to delete product");
// //       }
// //     } catch (error) {
// //       setError(error.message || "Something went wrong while deleting.");
// //     } finally {
// //       setLoading(false);
// //       setIsConfirmModalOpen(false);
// //       setProductToDelete(null);
// //     }
// //   };

// //   // Handle modal close
// //   const handleCloseConfirmModal = () => {
// //     setIsConfirmModalOpen(false);
// //     setProductToDelete(null);
// //   };

// //   const handleProductUpdate = (updatedProduct) => {
// //     setProducts((prev) =>
// //       prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
// //     );
// //     setIsViewModalOpen(false);
// //   };

// //   const handleProductDelete = (deletedProductId) => {
// //     setProducts((prev) => prev.filter((p) => p.id !== deletedProductId));
// //     setIsViewModalOpen(false);
// //   };

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
// //         <div>
// //           <h1 className="text-3xl font-bold text-gray-900">Products</h1>
// //           <p className="text-gray-600 mt-1">Manage your product inventory</p>
// //         </div>
// //         <button
// //           onClick={handleAddProduct}
// //           className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
// //         >
// //           <Plus className="w-4 h-4" />
// //           <span>Add Product</span>
// //         </button>
// //       </div>

// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm font-medium text-gray-500">Total Products</p>
// //               <p className="text-2xl font-bold text-gray-900">{products.length}</p>
// //             </div>
// //             <div className="p-3 rounded-lg bg-blue-100">
// //               <Package className="w-6 h-6 text-blue-600" />
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm font-medium text-gray-500">In Stock</p>
// //               <p className="text-2xl font-bold text-gray-900">
// //                 {products.filter(p => p.inStock).length}
// //               </p>
// //             </div>
// //             <div className="p-3 rounded-lg bg-green-100">
// //               <Eye className="w-6 h-6 text-green-600" />
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm font-medium text-gray-500">Out of Stock</p>
// //               <p className="text-2xl font-bold text-gray-900">
// //                 {products.filter(p => !p.inStock).length}
// //               </p>
// //             </div>
// //             <div className="p-3 rounded-lg bg-red-100">
// //               <Package className="w-6 h-6 text-red-600" />
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm font-medium text-gray-500">Avg Rating</p>
// //               <p className="text-2xl font-bold text-gray-900">
// //                 {products.length > 0 
// //                   ? (products.reduce((acc, p) => acc + (p.rating || 0), 0) / products.length).toFixed(1)
// //                   : '0.0'
// //                 }
// //               </p>
// //             </div>
// //             <div className="p-3 rounded-lg bg-yellow-100">
// //               <Star className="w-6 h-6 text-yellow-600" />
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Search */}
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <div className="relative max-w-md">
// //           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //             <Search className="h-5 w-5 text-gray-400" />
// //           </div>
// //           <input
// //             type="text"
// //             placeholder="Search products..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
// //           />
// //         </div>
// //       </div>

// //       {/* Loading State */}
// //       {loading && !error && (
// //         <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
// //           <div className="flex items-center gap-3">
// //             <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
// //             <div>
// //               <h3 className="font-semibold text-blue-800">Loading Products</h3>
// //               <p className="text-blue-700">Fetching the latest products...</p>
// //               {retryCount > 0 && (
// //                 <p className="text-blue-600 text-sm mt-1">
// //                   Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
// //                 </p>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Error State */}
// //       {error && !loading && (
// //         <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
// //           <h3 className="font-semibold text-red-800">Something went wrong</h3>
// //           <p className="text-red-700">{error}</p>
// //           <button
// //             onClick={fetchProducts}
// //             className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
// //           >
// //             Try Again
// //           </button>
// //         </div>
// //       )}

// //       {/* Products Grid */}
// //       {!loading && !error && (
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //           {filteredProducts.map(product => (
// //             <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
// //               <div className="relative">
// //                 <img
// //                   src={product.images && product.images.length > 0 
// //                     ? `${BASE_URL}${product.images[0]}`
// //                     : 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300'
// //                   }
// //                   alt={product.name}
// //                   className="w-full h-48 object-cover"
// //                 />
// //                 <div className="absolute top-2 right-2 flex space-x-1">
// //                   <button
// //                     onClick={() => handleViewProduct(product)}
// //                     className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
// //                   >
// //                     <Eye className="w-4 h-4 text-gray-600" />
// //                   </button>
// //                   <button
// //                     onClick={() => handleEditProduct(product)}
// //                     className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
// //                   >
// //                     <Edit className="w-4 h-4 text-gray-600" />
// //                   </button>
// //                   <button
// //                     onClick={() => handleDeleteProduct(product)}
// //                     className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
// //                   >
// //                     <Trash2 className="w-4 h-4 text-red-600" />
// //                   </button>
// //                 </div>
                
// //                 {/* Stock Status */}
// //                 <div className="absolute top-2 left-2">
// //                   <span className={`text-xs px-2 py-1 rounded-full ${
// //                     product.inStock 
// //                       ? 'bg-green-100 text-green-800' 
// //                       : 'bg-red-100 text-red-800'
// //                   }`}>
// //                     {product.inStock ? 'In Stock' : 'Out of Stock'}
// //                   </span>
// //                 </div> 

// //                 {/* <div>{console.log(product.categoryId.title)}</div> */}

// //                 {/* Discount Badge */}
// //                 {product.discount > 0 && (
// //                   <div className="absolute bottom-2 left-2">
// //                     <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
// //                       {product.discount}% OFF
// //                     </span>
// //                   </div>
// //                 )}


// //                 {/* Category Status */}
// //                 <div className="absolute bottom-1 right-1">
// //                   <span className= "bg-purple-700 text-white text-xs px-2 py-1 rounded-full" >
// //                     {product?.categoryId?.title || 'Category not found'}
// //                   </span>
// //                 </div>
// //               </div>
              
// //               <div className="p-4">
// //                 <div className="flex items-center justify-between mb-2">
// //                   <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
// //                   <div className="flex items-center space-x-1">
// //                     <Star className="w-3 h-3 text-yellow-400 fill-current" />
// //                     <span className="text-xs text-gray-600">{product.rating || 0}</span>
// //                   </div>
// //                 </div>
                
// //                 <p className="text-sm text-gray-600 mb-3 line-clamp-2">
// //                   {product.description}
// //                 </p>

// //                 <div className="flex items-center justify-between mb-3">
// //                   <div className="flex items-center space-x-2">
// //                     <span className="text-lg font-bold text-gray-900 flex items-center">
// //                       <IndianRupee className="w-4 h-4" />
// //                       {parseFloat(product.price.replace('₹', '').replace(',', '')).toFixed(2)}
// //                     </span>
// //                     {product.originalPrice && product.originalPrice !== product.price && (
// //                       <span className="text-sm text-gray-500 line-through flex items-center">
// //                         <IndianRupee className="w-3 h-3" />
// //                         {parseFloat(product.originalPrice.replace('₹', '').replace(',', '')).toFixed(2)}
// //                       </span>
// //                     )}
// //                   </div>
// //                   <span className="text-xs text-gray-500">
// //                     Stock: {product.stockCount}
// //                   </span>
// //                 </div>
                
// //                 <button 
// //                   onClick={() => handleViewProduct(product)}
// //                   className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
// //                 >
// //                   View Details
// //                 </button>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* Empty State */}
// //       {!loading && !error && filteredProducts.length === 0 && (
// //         <div className="text-center py-12">
// //           <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //           <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
// //           <p className="text-gray-600 mb-4">
// //             {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
// //           </p>
// //           <button
// //             onClick={handleAddProduct}
// //             className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
// //           >
// //             Add Product
// //           </button>
// //         </div>
// //       )}

// //       {/* Product View Modal */}
// //       <ProductViewModal
// //         isOpen={isViewModalOpen}
// //         onClose={() => setIsViewModalOpen(false)}
// //         product={selectedProduct}
// //         onEdit={handleEditProduct}
// //         onDelete={handleProductDelete}
// //         onUpdate={handleProductUpdate}
// //       />

// //       {/* Confirmation Modal for Delete */}
// //       <ConfirmationModal
// //         isOpen={isConfirmModalOpen}
// //         onClose={handleCloseConfirmModal}
// //         onConfirm={confirmDeleteProduct}
// //         title="Delete Product"
// //         message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
// //         confirmText="Delete"
// //         cancelText="Cancel"
// //         type="danger"
// //       />
// //     </div>
// //   );
// // };

// // export default Products;