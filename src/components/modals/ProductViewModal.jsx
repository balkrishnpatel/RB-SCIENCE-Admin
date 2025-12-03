

// import React, { useState } from 'react';
// import { Edit, Trash2, X, Star, IndianRupee, Package, Loader2, CheckCircle, Award, Plus, Upload } from 'lucide-react';
// import Modal from '../ui/Modal';
// import { ProductsAPI } from '../../api/products';
// import { BASE_URL } from '../../api/api-config';

// // Success Modal Component
// const SuccessModal = ({ isOpen, onClose, title, message }) => {
//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title="">
//       <div className="text-center py-6">
//         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
//           <CheckCircle className="h-6 w-6 text-green-600" />
//         </div>
//         <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
//         <p className="text-sm text-gray-500 mb-6">{message}</p>
//         <button
//           onClick={onClose}
//           className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
//         >
//           OK
//         </button>
//       </div>
//     </Modal>
//   );
// };

// const ProductViewModal = ({ isOpen, onClose, product, onEdit, onDelete, onUpdate }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [addingImages, setAddingImages] = useState(false);
//   const [newImages, setNewImages] = useState([]);
//   const [newImagePreviews, setNewImagePreviews] = useState([]);
//   const [imageError, setImageError] = useState('');
//   const [showAddImagesSection, setShowAddImagesSection] = useState(false);
//   const [updatedProduct, setUpdatedProduct] = useState(null);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   if (!product) return null;

//   // Use updated product if available, otherwise use original product
//   const currentProduct = updatedProduct || product;

//   const handleEdit = () => {
//     onEdit(currentProduct);
//     onClose();
//   };

//   const handleDelete = async () => {
//     if (!window.confirm("Are you sure you want to delete this product?")) return;

//     try {
//       setLoading(true);
//       const res = await ProductsAPI.delete(currentProduct.id);

//       if (res.success) {
//         onDelete(currentProduct.id);
//       } else {
//         throw new Error(res.message || "Failed to delete product");
//       }
//     } catch (error) {
//       setError(error.message || "Something went wrong while deleting.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateAndSetNewImages = (files) => {
//     setImageError('');
//     const validImages = [];
//     const previews = [];

//     for (let file of files) {
//       const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//       if (!allowedTypes.includes(file.type)) {
//         setImageError('Please select valid image files (JPEG, PNG, GIF, or WebP)');
//         return;
//       }

//       const fileSizeInMB = file.size / (1024 * 1024);
//       if (fileSizeInMB > 5) {
//         setImageError('Each image size must not exceed 5 MB');
//         return;
//       }

//       validImages.push(file);
//       previews.push(URL.createObjectURL(file));
//     }

//     setNewImages(validImages);
//     setNewImagePreviews(previews);
//   };

//   const handleNewImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 0) {
//       validateAndSetNewImages(files);
//     }
//   };

//   const removeNewImage = (index) => {
//     const updatedImages = newImages.filter((_, i) => i !== index);
//     const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);

//     // Revoke URL for removed preview
//     if (newImagePreviews[index]) {
//       URL.revokeObjectURL(newImagePreviews[index]);
//     }

//     setNewImages(updatedImages);
//     setNewImagePreviews(updatedPreviews);
//   };

//   const handleAddImages = async () => {
//     if (newImages.length === 0) {
//       setImageError('Please select at least one image to add');
//       return;
//     }

//     try {
//       setAddingImages(true);
//       setImageError('');

//       const imageData = {
//         id: currentProduct.id,
//         name: currentProduct.name,
//         images: newImages
//       };

//       console.log('Adding images for product:', imageData);

//       const response = await ProductsAPI.addImages(imageData);

//       if (response.success) {
//         // Update the current product with new images
//         const updatedProductData = {
//           ...currentProduct,
//           images: response.result.images
//         };
        
//         setUpdatedProduct(updatedProductData);
        
//         // Clear the new images
//         setNewImages([]);
//         setNewImagePreviews([]);
//         setShowAddImagesSection(false);
        
//         // Revoke all preview URLs
//         newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        
//         // Call onUpdate if provided to update parent component
//         if (onUpdate) {
//           onUpdate(updatedProductData);
//         }

//         // Show success modal instead of alert
//         setShowSuccessModal(true);
//       } else {
//         throw new Error(response.message || 'Failed to add images');
//       }
//     } catch (error) {
//       console.error('Error adding images:', error);
//       setImageError(error.message || 'Failed to add images. Please try again.');
//     } finally {
//       setAddingImages(false);
//     }
//   };

//   const cancelAddImages = () => {
//     setNewImages([]);
//     setNewImagePreviews([]);
//     setShowAddImagesSection(false);
//     setImageError('');
    
//     // Revoke all preview URLs
//     newImagePreviews.forEach(url => URL.revokeObjectURL(url));
//   };

//   // Helper function to format specification labels
//   const formatSpecificationLabel = (key) => {
//     const labelMap = {
//       weight: 'Weight',
//       origin: 'Origin',
//       shelfLife: 'Shelf Life',
//       storage: 'Storage',
//       certification: 'Certification',
//       nutritionalValue: 'Nutritional Value',
//       packaging: 'Packaging'
//     };
//     return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
//   };

//   return (
//     <>
//       <Modal isOpen={isOpen} onClose={onClose} title="">
//         <div className="max-w-[95%] mx-auto">
//           {/* Header with Actions */}
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-4">
//               <h2 className="text-2xl font-bold text-gray-900">{currentProduct.name}</h2>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={handleEdit}
//                 className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
//                 disabled={loading || addingImages}
//               >
//                 <Edit className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
//                 disabled={loading || addingImages}
//               >
//                 {loading ? (
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                 ) : (
//                   <Trash2 className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-red-700">{error}</p>
//             </div>
//           )}

//           {/* Category and Thomps Status */}
//           <div className="flex justify-between my-5">
//             <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
//               {currentProduct?.categoryId?.title || 'Category not found'}
//             </span>
            
//             {/* Thomps Badges */}
//             {currentProduct.thomps && (
//               <div className="flex items-center space-x-2">
//                 <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
//                   <CheckCircle className="w-3 h-3" />
//                   <span>Thomps</span>
//                 </span>
//                 {currentProduct.signatureFlavorsProducts && (
//                   <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
//                     Signature
//                   </span>
//                 )}
//                 {currentProduct.bestSellingProducts && (
//                   <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
//                     <Award className="w-3 h-3" />
//                     <span>Best Seller</span>
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Images Section */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>

//               {/* Existing Images */}
//               {currentProduct.images && currentProduct.images.length > 0 ? (
//                 <div className="grid grid-cols-2 gap-4">
//                   {currentProduct.images.map((image, index) => (
//                     <div key={index} className="relative">
//                       <img
//                         src={`${BASE_URL}${image}`}
//                         alt={`${currentProduct.name} ${index + 1}`}
//                         className="w-full h-40 object-cover rounded-lg border"
//                       />
//                       <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
//                         {index + 1}
//                       </span>
//                     </div>
//                   ))}
//                 </div>  
//               ) : (
//                 <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
//                   <Package className="w-12 h-12 text-gray-400" />
//                 </div>
//               )}

//               {/* Add Images Button - Moved below images */}
//               {!showAddImagesSection && (
//                 <button
//                   onClick={() => setShowAddImagesSection(true)}
//                   className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
//                   disabled={loading || addingImages}
//                 >
//                   <Plus className="w-5 h-5" />
//                   <span>Add More Images</span>
//                 </button>
//               )}

//               {/* Add Images Section */}
//               {showAddImagesSection && (
//                 <div className="border-t pt-6 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="font-medium text-gray-900">Add New Images</h4>
//                     <button
//                       onClick={cancelAddImages}
//                       className="text-gray-500 hover:text-gray-700"
//                       disabled={addingImages}
//                     >
//                       <X className="w-5 h-5" />
//                     </button>
//                   </div>

//                   <div className="space-y-4">
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                       onChange={handleNewImageChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
//                       disabled={addingImages}
//                     />
                    
//                     {imageError && (
//                       <p className="text-red-500 text-sm">{imageError}</p>
//                     )}
                    
//                     {newImagePreviews.length > 0 && (
//                       <div className="grid grid-cols-2 gap-4">
//                         {newImagePreviews.map((url, index) => (
//                           <div key={index} className="relative">
//                             <img
//                               src={url}
//                               alt={`New image ${index + 1}`}
//                               className="w-full h-32 object-cover rounded-lg border-2 border-green-300"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => removeNewImage(index)}
//                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//                               disabled={addingImages}
//                             >
//                               ×
//                             </button>
//                             <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
//                               New
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     )}
                    
//                     <p className="text-xs text-gray-500">
//                       Supported formats: JPEG, PNG, GIF, WebP. Max size: 5 MB per image
//                     </p>

//                     <div className="flex justify-end space-x-3">
//                       <button
//                         type="button"
//                         onClick={cancelAddImages}
//                         className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//                         disabled={addingImages}
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleAddImages}
//                         disabled={addingImages || newImages.length === 0}
//                         className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                       >
//                         {addingImages && (
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                         )}
//                         <Upload className="w-4 h-4" />
//                         <span>
//                           {addingImages ? 'Adding...' : `Add ${newImages.length} Image${newImages.length !== 1 ? 's' : ''}`}
//                         </span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Product Details */}
//             <div className="space-y-6">
//               {/* Basic Info */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Price:</span>
//                     <span className="font-semibold text-lg flex items-center text-green-600">
//                       <IndianRupee className="w-4 h-4" />
//                       {currentProduct.price ? currentProduct.price.replace('₹', '') : '0.00'}
//                     </span>
//                   </div>
//                   {currentProduct.originalPrice && currentProduct.originalPrice !== currentProduct.price && (
//                     <div className="flex items-center justify-between">
//                       <span className="text-gray-600">Original Price:</span>
//                       <span className="text-gray-500 line-through flex items-center">
//                         <IndianRupee className="w-3 h-3" />
//                         {currentProduct.originalPrice.replace('₹', '')}
//                       </span>
//                     </div>
//                   )}
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Stock Status:</span>
//                     <span className={`px-2 py-1 rounded-full text-xs ${
//                       currentProduct.inStock 
//                         ? 'bg-green-100 text-green-800' 
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {currentProduct.inStock ? 'In Stock' : 'Out of Stock'}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Stock Count:</span>
//                     <span className="font-medium">{currentProduct.stockCount}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Rating:</span>
//                     <div className="flex items-center space-x-1">
//                       <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                       <span className="font-medium">{currentProduct.rating}</span>
//                       <span className="text-gray-500">({currentProduct.reviews} reviews)</span>
//                     </div>
//                   </div>
//                   {currentProduct.discount > 0 && (
//                     <div className="flex items-center justify-between">
//                       <span className="text-gray-600">Discount:</span>
//                       <span className="font-medium text-red-600">{currentProduct.discount}% OFF</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Description */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
//                 <p className="text-gray-700">{currentProduct.description}</p>
//                 {currentProduct.longDescription && (
//                   <div className="mt-3">
//                     <h4 className="font-medium text-gray-900 mb-2">Detailed Description</h4>
//                     <p className="text-gray-700">{currentProduct.longDescription}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Features */}
//               {currentProduct.features && currentProduct.features.length > 0 && (
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
//                   <ul className="space-y-1">
//                     {currentProduct.features.map((feature, index) => (
//                       <li key={index} className="flex items-center space-x-2">
//                         <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
//                         <span className="text-gray-700">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Benefits */}
//               {currentProduct.benefits && currentProduct.benefits.length > 0 && (
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
//                   <ul className="space-y-1">
//                     {currentProduct.benefits.map((benefit, index) => (
//                       <li key={index} className="flex items-center space-x-2">
//                         <span className="w-2 h-2 bg-green-600 rounded-full"></span>
//                         <span className="text-gray-700">{benefit}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Specifications */}
//               {currentProduct.specifications && Object.keys(currentProduct.specifications).some(key => currentProduct.specifications[key]) && (
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
//                   <div className="space-y-2">
//                     {Object.entries(currentProduct.specifications).map(([key, value]) => (
//                       value && (
//                         <div key={key} className="flex items-center justify-between">
//                           <span className="text-gray-600">{formatSpecificationLabel(key)}:</span>
//                           <span className="font-medium text-right max-w-xs">{value}</span>
//                         </div>
//                       )
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* Success Modal */}
//       <SuccessModal
//         isOpen={showSuccessModal}
//         onClose={() => setShowSuccessModal(false)}
//         title="Images Added Successfully!"
//         message="The new images have been added to the product successfully."
//       />
//     </>
//   );
// };

// export default ProductViewModal;



// import React, { useState } from 'react';
// import { Edit, Trash2, X, Star, IndianRupee, Package, Loader2, CheckCircle, Award, Plus, Upload, ImageIcon } from 'lucide-react';
// import Modal from '../ui/Modal';
// import { ProductsAPI } from '../../api/products';
// import { BASE_URL } from '../../api/api-config';

// const ProductViewModal = ({ isOpen, onClose, product, onEdit, onDelete, onUpdate }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showAddImages, setShowAddImages] = useState(false);
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [imageError, setImageError] = useState('');
//   const [uploadingImages, setUploadingImages] = useState(false);

//   if (!product) return null;

//   const handleEdit = () => {
//     onEdit(product);
//     onClose();
//   };

//   const handleDelete = async () => {
//     if (!window.confirm("Are you sure you want to delete this product?")) return;

//     try {
//       setLoading(true);
//       const res = await ProductsAPI.delete(product.id);

//       if (res.success) {
//         onDelete(product.id);
//       } else {
//         throw new Error(res.message || "Failed to delete product");
//       }
//     } catch (error) {
//       setError(error.message || "Something went wrong while deleting.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle image selection for adding new images
//   const validateAndSetImages = (files) => {
//     setImageError('');
//     const validImages = [];
//     const previews = [];

//     for (let file of files) {
//       const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//       if (!allowedTypes.includes(file.type)) {
//         setImageError('Please select valid image files (JPEG, PNG, GIF, or WebP)');
//         return;
//       }

//       const fileSizeInMB = file.size / (1024 * 1024);
//       if (fileSizeInMB > 5) {
//         setImageError('Each image size must not exceed 5 MB');
//         return;
//       }

//       validImages.push(file);
//       previews.push(URL.createObjectURL(file));
//     }

//     setSelectedImages(validImages);
//     setPreviewUrls(previews);
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 0) {
//       validateAndSetImages(files);
//     }
//   };

//   const removePreviewImage = (index) => {
//     const newImages = selectedImages.filter((_, i) => i !== index);
//     const newPreviews = previewUrls.filter((_, i) => i !== index);

//     // Revoke URL for removed preview
//     if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
//       URL.revokeObjectURL(previewUrls[index]);
//     }

//     setSelectedImages(newImages);
//     setPreviewUrls(newPreviews);
//   };

//   // Handle adding images to the product
//   const handleAddImages = async () => {
//     if (selectedImages.length === 0) {
//       setImageError('Please select at least one image to add');
//       return;
//     }

//     try {
//       setUploadingImages(true);
//       setImageError('');

//       const imageData = {
//         id: product.id,
//         name: product.name,
//         images: selectedImages
//       };

//       const res = await ProductsAPI.addImages(imageData);

//       if (res.success) {
//         // Update the product with new images
//         const updatedProduct = { ...product, images: res.result.images };
//         onUpdate && onUpdate(updatedProduct);
        
//         // Reset the form
//         setSelectedImages([]);
//         setPreviewUrls([]);
//         setShowAddImages(false);
        
//         // Show success message
//         alert('Images added successfully!');
//       } else {
//         throw new Error(res.message || "Failed to add images");
//       }
//     } catch (error) {
//       setImageError(error.message || "Something went wrong while adding images.");
//     } finally {
//       setUploadingImages(false);
//     }
//   };

//   const cancelAddImages = () => {
//     setShowAddImages(false);
//     setSelectedImages([]);
//     setPreviewUrls([]);
//     setImageError('');
    
//     // Clean up preview URLs
//     previewUrls.forEach(url => {
//       if (url && url.startsWith('blob:')) {
//         URL.revokeObjectURL(url);
//       }
//     });
//   };

//   // Helper function to format specification labels
//   const formatSpecificationLabel = (key) => {
//     const labelMap = {
//       weight: 'Weight',
//       origin: 'Origin',
//       shelfLife: 'Shelf Life',
//       storage: 'Storage',
//       certification: 'Certification',
//       nutritionalValue: 'Nutritional Value',
//       packaging: 'Packaging'
//     };
//     return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title="">
//       <div className="max-w-[95%] mx-auto">
//         {/* Header with Actions */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-4">
//             <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={handleEdit}
//               className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
//               disabled={loading}
//               title="Edit Product"
//             >
//               <Edit className="w-5 h-5" />
//             </button>
//             <button
//               onClick={handleDelete}
//               className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
//               disabled={loading}
//               title="Delete Product"
//             >
//               {loading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 <Trash2 className="w-5 h-5" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-700">{error}</p>
//           </div>
//         )}

//         {/* Category and Thomps Status */}
//         <div className="flex justify-between my-5">
//           <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
//             {product?.categoryId?.title || 'Category not found'}
//           </span>
          
//           {/* Thomps Badges */}
//           {product.thomps && (
//             <div className="flex items-center space-x-2">
//               <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
//                 <CheckCircle className="w-3 h-3" />
//                 <span>Thomps</span>
//               </span>
//               {product.signatureFlavorsProducts && (
//                 <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
//                   Signature
//                 </span>
//               )}
//               {product.bestSellingProducts && (
//                 <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
//                   <Award className="w-3 h-3" />
//                   <span>Best Seller</span>
//                 </span>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Images Section */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
//               <button
//                 onClick={() => setShowAddImages(!showAddImages)}
//                 className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
//                 disabled={uploadingImages}
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Add Images</span>
//               </button>
//             </div>

//             {/* Add Images Section */}
//             {showAddImages && (
//               <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Select New Images (Max 5 MB each)
//                     </label>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                       onChange={handleImageChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
//                       disabled={uploadingImages}
//                     />
//                   </div>

//                   {imageError && (
//                     <div className="p-3 bg-red-50 border border-red-200 rounded-md">
//                       <p className="text-red-600 text-sm">{imageError}</p>
//                     </div>
//                   )}

//                   {/* Preview Selected Images */}
//                   {previewUrls.length > 0 && (
//                     <div>
//                       <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                         {previewUrls.map((url, index) => (
//                           <div key={index} className="relative">
//                             <img
//                               src={url}
//                               alt={`New image ${index + 1}`}
//                               className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => removePreviewImage(index)}
//                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//                               disabled={uploadingImages}
//                             >
//                               ×
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Action Buttons */}
//                   <div className="flex justify-end space-x-3 pt-2">
//                     <button
//                       onClick={cancelAddImages}
//                       className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//                       disabled={uploadingImages}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleAddImages}
//                       disabled={uploadingImages || selectedImages.length === 0}
//                       className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                     >
//                       {uploadingImages ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           <span>Uploading...</span>
//                         </>
//                       ) : (
//                         <>
//                           <Upload className="w-4 h-4" />
//                           <span>Add Images</span>
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Current Images */}
//             <div>
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h4>
//               {product.images && product.images.length > 0 ? (
//                 <div className="grid grid-cols-2 gap-4">
//                   {product.images.map((image, index) => (
//                     <div key={index} className="relative">
//                       <img
//                         src={`${BASE_URL}${image}`}
//                         alt={`${product.name} ${index + 1}`}
//                         className="w-full h-40 object-cover rounded-lg border"
//                       />
//                       <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
//                         {index + 1}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
//                   <div className="text-center">
//                     <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                     <p className="text-gray-500 text-sm">No images available</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Product Details */}
//           <div className="space-y-6">
//             {/* Basic Info */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Price:</span>
//                   <span className="font-semibold text-lg flex items-center text-green-600">
//                     <IndianRupee className="w-4 h-4" />
//                     {product.price ? product.price.replace('₹', '') : '0.00'}
//                   </span>
//                 </div>
//                 {product.originalPrice && product.originalPrice !== product.price && (
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Original Price:</span>
//                     <span className="text-gray-500 line-through flex items-center">
//                       <IndianRupee className="w-3 h-3" />
//                       {product.originalPrice.replace('₹', '')}
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Stock Status:</span>
//                   <span className={`px-2 py-1 rounded-full text-xs ${
//                     product.inStock 
//                       ? 'bg-green-100 text-green-800' 
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     {product.inStock ? 'In Stock' : 'Out of Stock'}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Stock Count:</span>
//                   <span className="font-medium">{product.stockCount}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Rating:</span>
//                   <div className="flex items-center space-x-1">
//                     <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                     <span className="font-medium">{product.rating}</span>
//                     <span className="text-gray-500">({product.reviews} reviews)</span>
//                   </div>
//                 </div>
//                 {product.discount > 0 && (
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Discount:</span>
//                     <span className="font-medium text-red-600">{product.discount}% OFF</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Description */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
//               <p className="text-gray-700">{product.description}</p>
//               {product.longDescription && (
//                 <div className="mt-3">
//                   <h4 className="font-medium text-gray-900 mb-2">Detailed Description</h4>
//                   <p className="text-gray-700">{product.longDescription}</p>
//                 </div>
//               )}
//             </div>

//             {/* Features */}
//             {product.features && product.features.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
//                 <ul className="space-y-1">
//                   {product.features.map((feature, index) => (
//                     <li key={index} className="flex items-center space-x-2">
//                       <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
//                       <span className="text-gray-700">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Benefits */}
//             {product.benefits && product.benefits.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
//                 <ul className="space-y-1">
//                   {product.benefits.map((benefit, index) => (
//                     <li key={index} className="flex items-center space-x-2">
//                       <span className="w-2 h-2 bg-green-600 rounded-full"></span>
//                       <span className="text-gray-700">{benefit}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Specifications */}
//             {product.specifications && Object.keys(product.specifications).some(key => product.specifications[key]) && (
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
//                 <div className="space-y-2">
//                   {Object.entries(product.specifications).map(([key, value]) => (
//                     value && (
//                       <div key={key} className="flex items-center justify-between">
//                         <span className="text-gray-600">{formatSpecificationLabel(key)}:</span>
//                         <span className="font-medium text-right max-w-xs">{value}</span>
//                       </div>
//                     )
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default ProductViewModal;






import React, { useState } from 'react';
import { Edit, Trash2, X, Star, IndianRupee, Package, Loader2, CheckCircle, Award, Plus, Upload, ImageIcon } from 'lucide-react';
import Modal from '../ui/Modal';
import { ProductsAPI } from '../../api/products';
import { BASE_URL } from '../../api/api-config';

const ProductViewModal = ({ isOpen, onClose, product, onEdit, onDelete, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddImages, setShowAddImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imageError, setImageError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!product) return null;

  const handleEdit = () => {
    onEdit(product);
    onClose();
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setLoading(true);
      const res = await ProductsAPI.delete(product.id);

      if (res.success) {
        onDelete(product.id);
      } else {
        throw new Error(res.message || "Failed to delete product");
      }
    } catch (error) {
      setError(error.message || "Something went wrong while deleting.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection for adding new images
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

  const removePreviewImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    // Revoke URL for removed preview
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  // Handle adding images to the product
  const handleAddImages = async () => {
    if (selectedImages.length === 0) {
      setImageError('Please select at least one image to add');
      return;
    }

    try {
      setUploadingImages(true);
      setImageError('');

      const imageData = {
        id: product.id,
        name: product.name,
        images: selectedImages
      };

      const res = await ProductsAPI.addImages(imageData);

      if (res.success) {
        // Update the product with new images
        const updatedProduct = { ...product, images: res.result.images };
        onUpdate && onUpdate(updatedProduct);
        
        // Reset the form
        setSelectedImages([]);
        setPreviewUrls([]);
        setShowAddImages(false);
        
        // Show success modal instead of alert
        setSuccessMessage(`${selectedImages.length} image(s) added successfully to ${product.name}!`);
        setShowSuccessModal(true);
      } else {
        throw new Error(res.message || "Failed to add images");
      }
    } catch (error) {
      setImageError(error.message || "Something went wrong while adding images.");
    } finally {
      setUploadingImages(false);
    }
  };

  const cancelAddImages = () => {
    setShowAddImages(false);
    setSelectedImages([]);
    setPreviewUrls([]);
    setImageError('');
    
    // Clean up preview URLs
    previewUrls.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
  };

  // Helper function to format specification labels
  const formatSpecificationLabel = (key) => {
    const labelMap = {
      weight: 'Weight',
      origin: 'Origin',
      shelfLife: 'Shelf Life',
      storage: 'Storage',
      certification: 'Certification',
      nutritionalValue: 'Nutritional Value',
      packaging: 'Packaging'
    };
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="max-w-[95%] mx-auto">
          {/* Header with Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                disabled={loading}
                title="Edit Product"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                disabled={loading}
                title="Delete Product"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Category and Thomps Status */}
          <div className="flex justify-between my-5">
            <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
              {product?.categoryId?.title || 'Category not found'}
            </span>
            
            {/* Thomps Badges */}
            {product.thomps && (
              <div className="flex items-center space-x-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Thomps</span>
                </span>
                {product.signatureFlavorsProducts && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    Signature
                  </span>
                )}
                {product.bestSellingProducts && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>Best Seller</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>

              {/* Current Images */}
              <div>
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {product.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`${BASE_URL}${image}`}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Images Button */}
              <button
                onClick={() => setShowAddImages(!showAddImages)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                disabled={uploadingImages}
              >
                <Plus className="w-5 h-5" />
                <span>Add New Images</span> 
              </button>
              <span className="text-sm text-gray-500 ml-2">(Max 5 MB each) & (You can add up to 10 images)</span>
              


              {/* Add Images Section */}
              {showAddImages && (
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select New Images (Max 5 MB each)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        disabled={uploadingImages}
                      />
                    </div>

                    {imageError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{imageError}</p>
                      </div>
                    )}

                    {/* Preview Selected Images */}
                    {previewUrls.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`New image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removePreviewImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                disabled={uploadingImages}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={cancelAddImages}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        disabled={uploadingImages}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddImages}
                        disabled={uploadingImages || selectedImages.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {uploadingImages ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Add Images</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-lg flex items-center text-green-600">
                      <IndianRupee className="w-4 h-4" />
                      {product.price ? product.price.replace('₹', '') : '0.00'}
                    </span>
                  </div>
                  {product.originalPrice && product.originalPrice !== product.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="text-gray-500 line-through flex items-center">
                        <IndianRupee className="w-3 h-3" />
                        {product.originalPrice.replace('₹', '')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stock Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stock Count:</span>
                    <span className="font-medium">{product.stockCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-gray-500">({product.reviews} reviews)</span>
                    </div>
                  </div>
                  {product.discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">{product.discount}% OFF</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700">{product.description}</p>
                {product.longDescription && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Detailed Description</h4>
                    <p className="text-gray-700">{product.longDescription}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <ul className="space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                  <ul className="space-y-1">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).some(key => product.specifications[key]) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-gray-600">{formatSpecificationLabel(key)}:</span>
                          <span className="font-medium text-right max-w-xs">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={closeSuccessModal} 
        title="Success"
      >
        <div className="text-center p-6">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Images Added Successfully!</h3>
          <p className="text-sm text-gray-500 mb-6">
            {successMessage}
          </p>
          <button
            onClick={closeSuccessModal}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            OK
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ProductViewModal;