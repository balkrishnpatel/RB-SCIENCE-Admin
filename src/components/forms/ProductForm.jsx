



import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { BASE_URL } from '../../api/api-config';
const ProductForm = ({ product, categories, units, onSave, onCancel, isSubmitting }) => {
const [formData, setFormData] = useState({
name: '',
price: '',
originalPrice: '',
unitId: '',
categoryId: '',
rating: '0',
reviews: '0',
inStock: true,
stockCount: '0',
discount: '0',
description: '',
longDescription: '',
features: [''],
specifications: {
weight: '',
origin: '',
shelfLife: '',
storage: '',
certification: '',
nutritionalValue: '',
packaging: ''
},
benefits: [''],
images: [],
thomps: false,
bestSellingProducts: false,
signatureFlavorsProducts: false
});

const [selectedImages, setSelectedImages] = useState([]);
const [previewUrls, setPreviewUrls] = useState([]);
const [errors, setErrors] = useState({});
const [imageError, setImageError] = useState('');

useEffect(() => {
if (product) {
console.log("Product ID:", product.id);
console.log("Full product data:", product);
setFormData({
...product,
// Ensure proper field mapping for form inputs
categoryId: product.categoryId?.id || product.category?.id || product.category || '',
unitId: product.unitId?.id || product.unit?.id || product.unit || '',
price: product.price ? product.price.replace('₹', '') : '',
originalPrice: product.originalPrice || '',
discount: product.discount || '0',
rating: product.rating || '0',
reviews: product.reviews || '0',
stockCount: product.stockCount || '0',
features: product.features || [''],
benefits: product.benefits || [''],
specifications: {
weight: '',
origin: '',
shelfLife: '',
storage: '',
certification: '',
nutritionalValue: '',
packaging: '',
...product.specifications
},
thomps: product.thomps || false,
bestSellingProducts: product.bestSellingProducts || false,
signatureFlavorsProducts: product.signatureFlavorsProducts || false
});

  // Set preview URLs for existing images
  if (product.images && product.images.length > 0) {
      setPreviewUrls(product.images.map(img => `${BASE_URL}${img}`));
  }
}
}, [product]);

// Function to calculate original price from current price and discount
const calculateOriginalPrice = (currentPrice, discount) => {
if (!currentPrice || !discount || discount === '0') return '';
const price = parseFloat(currentPrice);
const discountPercent = parseFloat(discount);
if (price > 0 && discountPercent > 0) {
// Original Price = Current Price / (1 - discount/100)
// const originalPrice = price / (1 - discountPercent / 100);
const originalPrice = price - (price * discountPercent / 100);
return originalPrice.toFixed(2);
}
return '';
};

const handleChange = (e) => {
const { name, value, type, checked } = e.target;
const newValue = type === 'checkbox' ? checked : value;

setFormData(prev => {
  const updated = {
    ...prev,
    [name]: newValue
  };

  // Auto-calculate original price when price or discount changes
  if (name === 'price' || name === 'discount') {
    const price = name === 'price' ? value : prev.price;
    const discount = name === 'discount' ? value : prev.discount;
    updated.originalPrice = calculateOriginalPrice(price, discount);
  }

  // Handle Thomps logic - UPDATED LOGIC
  if (name === 'thomps' && !checked) {
    // If Thomps is unchecked, reset both sub-options
    updated.bestSellingProducts = false;
    updated.signatureFlavorsProducts = false;
  }

  return updated;
});

// Clear errors when user starts typing/changing values
if (errors[name]) {
  setErrors(prev => ({ ...prev, [name]: '' }));
}

// Clear Thomps error when user changes Thomps-related fields
if (name === 'thomps' || name === 'bestSellingProducts' || name === 'signatureFlavorsProducts') {
  if (errors.thomps) {
    setErrors(prev => ({ ...prev, thomps: '' }));
  }
}
};

const handleSpecificationChange = (key, value) => {
setFormData(prev => ({
...prev,
specifications: {
...prev.specifications,
[key]: value
}
}));
};

const handleArrayChange = (arrayName, index, value) => {
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

const removeArrayItem = (arrayName, index) => {
setFormData(prev => ({
...prev,
[arrayName]: prev[arrayName].filter((_, i) => i !== index)
}));
};

const validateAndSetImages = (files) => {
setImageError('');
const validImages = [];
const previews = [];

for (let file of files) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    setImageError('Please select valid image files (JPEG, PNG, GIF, or WebP)');
    return;
  }

  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > 5) {
    setImageError('Each image size must not exceed 5 MB');
    return;
  }

  validImages.push(file);
  previews.push(URL.createObjectURL(file));
}

setSelectedImages(validImages);
setPreviewUrls(previews);
};

const handleImageChange = (e) => {
const files = Array.from(e.target.files);
if (files.length > 0) {
validateAndSetImages(files);
}
};

const removeImage = (index) => {
const newImages = selectedImages.filter((_, i) => i !== index);
const newPreviews = previewUrls.filter((_, i) => i !== index);

// Revoke URL for removed preview
if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
  URL.revokeObjectURL(previewUrls[index]);
}

setSelectedImages(newImages);
setPreviewUrls(newPreviews);
};

const validateForm = () => {
const newErrors = {};

if (!formData.name.trim()) {
  newErrors.name = 'Product name is required';
}

if (!formData.price || parseFloat(formData.price) <= 0) {
  newErrors.price = 'Valid price is required';
}

if (!formData.categoryId) {
  newErrors.categoryId = 'Category is required';
}

if (!formData.unitId) {
  newErrors.unitId = 'Unit is required';
}

if (!formData.description.trim()) {
  newErrors.description = 'Description is required';
}

// Discount validation
const discount = parseFloat(formData.discount);
if (discount > 75) {
  newErrors.discount = 'Discount cannot be more than 75%';
}
if (discount < 0) {
  newErrors.discount = 'Discount cannot be negative';
}
 
// UPDATED THOMPS VALIDATION LOGIC
if (formData.thomps) {
  // When Thomps is enabled, at least one of the sub-options must be selected
  // Users can select one or both, but not neither
  if (!formData.bestSellingProducts && !formData.signatureFlavorsProducts) {
    newErrors.thomps = 'When Thomps is enabled, you must select at least one option: Best Selling Products or Signature Flavors Products (you can select both if desired)';
  }
}
// Note: If Thomps is disabled, both sub-options are automatically unchecked (handled in handleChange)
// and no validation error should occur

if (!product && selectedImages.length === 0) {
  setImageError('At least one product image is required');
}

return newErrors;
};

const handleSubmit = () => {
const formErrors = validateForm();
if (Object.keys(formErrors).length > 0 || imageError) {
setErrors(formErrors);
return;
}

const productData = {
  ...formData,
  images: selectedImages,
  features: formData.features.filter(f => f.trim() !== ''),
  benefits: formData.benefits.filter(b => b.trim() !== '')
};

console.log("✅ Sending this to backend:", productData);
onSave(productData);
};

// Cleanup object URLs on component unmount
useEffect(() => {
return () => {
previewUrls.forEach(url => {
if (url && url.startsWith('blob:')) {
URL.revokeObjectURL(url);
}
});
};
}, []);

return (
<div className="max-w-full mx-auto p-6 space-y-8">
<form onSubmit={(e) => e.preventDefault()} className="space-y-6">
{/* Basic Information */}
<div className="bg-gray-50 p-6 rounded-lg">
<h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Product Name *
</label>
<input
type="text"
name="name"
value={formData.name}
onChange={handleChange}
className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
placeholder="Enter product name"
/>
{errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
</div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.categoryId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Price * (After Discount)
          </label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount (%) <span className="text-sm text-gray-500">Max 75%</span>
          </label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            onInput={(e) => {
              // Prevent entering values greater than 75
              if (parseFloat(e.target.value) > 75) {
                e.target.value = '75';
                setFormData(prev => ({ ...prev, discount: '75' }));
              }
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.discount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
            max="75"
          />
          {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Original Price (Auto-calculated)
          </label>
          <input
            type="number"
            step="0.01"
            name="originalPrice"
            value={formData.originalPrice}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
            placeholder="Auto-calculated based on discount"
          />
          <p className="text-xs text-gray-500 mt-1">
            This field is automatically calculated based on current price and discount
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit *
          </label>
          <select
            name="unitId"
            value={formData.unitId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.unitId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Unit</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          {errors.unitId && <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>}
        </div>
      </div>
    </div>

    {/* UPDATED THOMPS SECTION */}
    <div className="bg-gray-50 border-l-4 border-gray-50 p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="thomps"
          checked={formData.thomps}
          onChange={handleChange}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-3"
        />
        <h3 className="text-lg font-semibold text-gray-900">Thomps Features</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Enable Thomps special features for this product. When enabled, you must select at least one option below (you can select both if desired).
      </p>

      {errors.thomps && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{errors.thomps}</p>
        </div>
      )}

      {/* Conditional Thomps Options */}
      {formData.thomps && (
        <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Signature Flavors Products */}
            <div className={`bg-white p-4 rounded-lg border-2 transition-all duration-200 ${
              formData.signatureFlavorsProducts 
                ? 'border-purple-300 bg-purple-50' 
                : 'border-red-200 hover:border-red-300'
            }`}>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="signatureFlavorsProducts"
                  checked={formData.signatureFlavorsProducts}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Signature Flavors Products</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Mark this product as part of our signature flavors collection
                  </p>
                </div>
              </label>
            </div>

            {/* Best Selling Products */}
            <div className={`bg-white p-4 rounded-lg border-2 transition-all duration-200 ${
              formData.bestSellingProducts 
                ? 'border-green-300 bg-green-50' 
                : 'border-red-200 hover:border-red-300'
            }`}>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="bestSellingProducts"
                  checked={formData.bestSellingProducts}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Best Selling Products</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Mark this product as one of our best sellers
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-purple-100 p-3 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> You must select at least one option when Thomps is enabled. You can choose one or both options as needed.
            </p>
          </div>
        </div>
      )}
    </div>
    {/* UPDATED THOMPS SECTION END*/}

    {/* Stock Information */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">In Stock</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Count
          </label>
          <input
            type="number"
            name="stockCount"
            value={formData.stockCount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating <span className="text-sm text-gray-500">Max 5.0</span>
          </label>
          <input
            type="number"
            step="0.1"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            onInput={(e) => {
              // Prevent entering values greater than 5
              if (parseFloat(e.target.value) > 5) {
                e.target.value = '5';
                setFormData(prev => ({ ...prev, rating: '5' }));
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="0.0"
            min="0"
            max="5"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Reviews
        </label>
        <input
          type="number"
          name="reviews"
          value={formData.reviews}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          placeholder="0"
          min="0"
        />
      </div>
    </div>

    {/* Descriptions */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Descriptions</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter short product description"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Long Description
          </label>
          <textarea
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter detailed product description"
          />
        </div>
      </div>
    </div>

    {/* Features */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
      <div className="space-y-3">
        {formData.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleArrayChange('features', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter feature"
            />
            {formData.features.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('features', index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('features')}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Feature</span>
        </button>
      </div>
    </div>

    {/* Benefits */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
      <div className="space-y-3">
        {formData.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={benefit}
              onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter benefit"
            />
            {formData.benefits.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('benefits', index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('benefits')}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Benefit</span>
        </button>
      </div>
    </div>

    {/* Specifications */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
          <input
            type="text"
            value={formData.specifications.weight}
            onChange={(e) => handleSpecificationChange('weight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., 250g"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
          <input
            type="text"
            value={formData.specifications.origin}
            onChange={(e) => handleSpecificationChange('origin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., California"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Life</label>
          <input
            type="text"
            value={formData.specifications.shelfLife}
            onChange={(e) => handleSpecificationChange('shelfLife', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., 12 months"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Storage</label>
          <input
            type="text"
            value={formData.specifications.storage}
            onChange={(e) => handleSpecificationChange('storage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Cool, dry place"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
          <input
            type="text"
            value={formData.specifications.certification}
            onChange={(e) => handleSpecificationChange('certification', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Organic, FDA Approved, ISO 22000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nutritional Value</label>
          <input
            type="text"
            value={formData.specifications.nutritionalValue}
            onChange={(e) => handleSpecificationChange('nutritionalValue', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., High in Protein, Rich in Vitamins"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Packaging</label>
          <input
            type="text"
            value={formData.specifications.packaging}
            onChange={(e) => handleSpecificationChange('packaging', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Vacuum-sealed pack, Recyclable container"
          />
        </div> 
      </div>
    </div>

    {/* Product Images */}
    <div className="bg-gray-50 p-6 rounded-lg">
      {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images * (Max 5 MB each)&()</h3> */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Product Images *
        <span className="text-sm text-gray-500 ml-2">(Max 5 MB each) & (You can add up to 10 images)</span>
      </h3>
      
      <div className="space-y-4">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        
        {imageError && (
          <p className="text-red-500 text-sm">{imageError}</p>
        )}
        
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          Supported formats: JPEG, PNG, GIF, WebP. Max size: 5 MB per image
        </p>
      </div>
    </div>

    {/* Submit Error */}
    {errors.submit && (
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <p className="text-red-600 text-sm">{errors.submit}</p>
      </div>
    )}

    {/* Action Buttons */}
    <div className="flex justify-end space-x-3 pt-6 border-t">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
      >
        {isSubmitting && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        <span>
          {isSubmitting 
            ? 'Saving...' 
            : (product ? 'Update Product' : 'Add Product')
          }
        </span>
      </button>
    </div>
  </form>
</div>
);
};

export default ProductForm;