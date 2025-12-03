
// import React, { useState, useEffect } from 'react';
// import { Plus, Trash2 } from 'lucide-react';

// const BlogForm = ({ blog, categories, onSave, onCancel }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     title: '',    
//     excerpt: '',
//     author: '',
//     authorRole: '',
//     readTime: '',
//     categoryId: '',
//     views: '0',
//     likes: '0',
//     comments: '0',
//     isActive: true,
//     featured: false,
//     content: [{ heading: '', para: '' }],
//     tags: ['']
//   });

//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreviewUrl, setImagePreviewUrl] = useState('');
//   const [selectedAuthorImage, setSelectedAuthorImage] = useState(null);
//   const [authorImagePreviewUrl, setAuthorImagePreviewUrl] = useState('');
//   const [imageError, setImageError] = useState('');
//   const [authorImageError, setAuthorImageError] = useState('');
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (blog) {
//       console.log("Blog ID: ", blog.id);
//       setFormData({
//         name: blog.name || '',
//         title: blog.title || '',
//         excerpt: blog.excerpt || '',
//         author: blog.author || '',
//         authorRole: blog.authorRole || '',
//         readTime: blog.readTime || '',
//         categoryId: blog.categoryId || '',
//         views: blog.views?.toString() || '0',
//         likes: blog.likes?.toString() || '0',
//         comments: blog.comments?.toString() || '0',
//         isActive: blog.isActive ?? true,
//         featured: blog.featured ?? false,
//         content: blog.content || [{ heading: '', para: '' }],
//         tags: blog.tags || ['']
//       });
//       setImagePreviewUrl(blog.image);
//       setAuthorImagePreviewUrl(blog.authorImage);
//     }
//   }, [blog]);

//   const validateAndSetFile = (file, isAuthorImage = false) => {
//     const errorSetter = isAuthorImage ? setAuthorImageError : setImageError;
    
//     errorSetter('');

//     if (file) {
//       const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//       if (!allowedTypes.includes(file.type)) {
//         errorSetter('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
//         return;
//       }

//       const fileSizeInMB = file.size / (1024 * 1024);
//       if (fileSizeInMB > 5) {
//         errorSetter('Image size must not exceed 5 MB');
//         return;
//       }

//       const previewUrl = URL.createObjectURL(file);
      
//       if (isAuthorImage) {
//         setSelectedAuthorImage(file);
//         setAuthorImagePreviewUrl(previewUrl);
//       } else {
//         setSelectedImage(file);
//         setImagePreviewUrl(previewUrl);
//       }
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     validateAndSetFile(file, false);
//   };

//   const handleAuthorImageChange = (e) => {
//     const file = e.target.files[0];
//     validateAndSetFile(file, true);
//   };

//   const removeImage = (isAuthorImage = false) => {
//     const inputId = isAuthorImage ? 'author-image-upload' : 'image-upload';
    
//     if (isAuthorImage) {
//       if (authorImagePreviewUrl && authorImagePreviewUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(authorImagePreviewUrl);
//       }
//       setSelectedAuthorImage(null);
//       setAuthorImagePreviewUrl('');
//       setAuthorImageError('');
//     } else {
//       if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(imagePreviewUrl);
//       }
//       setSelectedImage(null);
//       setImagePreviewUrl('');
//       setImageError('');
//     }
    
//     const fileInput = document.getElementById(inputId);
//     if (fileInput) {
//       fileInput.value = '';
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
    
//     // Clear errors when user starts typing
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: '' });
//     }
//   };

//   const handleContentChange = (index, field, value) => {
//     const newContent = [...formData.content];
//     newContent[index][field] = value;
//     setFormData(prev => ({ ...prev, content: newContent }));
//   };

//   const addContentSection = () => {
//     setFormData(prev => ({
//       ...prev,
//       content: [...prev.content, { heading: '', para: '' }]
//     }));
//   };

//   const removeContentSection = (index) => {
//     if (formData.content.length > 1) {
//       const newContent = formData.content.filter((_, i) => i !== index);
//       setFormData(prev => ({ ...prev, content: newContent }));
//     }
//   };

//   const handleTagChange = (index, value) => {
//     const newTags = [...formData.tags];
//     newTags[index] = value;
//     setFormData(prev => ({ ...prev, tags: newTags }));
//   };

//   const addTag = () => {
//     setFormData(prev => ({
//       ...prev,
//       tags: [...prev.tags, '']
//     }));
//   };

//   const removeTag = (index) => {
//     if (formData.tags.length > 1) {
//       const newTags = formData.tags.filter((_, i) => i !== index);
//       setFormData(prev => ({ ...prev, tags: newTags }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     }
    
//     if (!formData.title.trim()) {
//       newErrors.title = 'Title is required';
//     }
    
//     if (!formData.excerpt.trim()) {
//       newErrors.excerpt = 'Excerpt is required';
//     }

//     if (!formData.author.trim()) {
//       newErrors.author = 'Author is required';
//     }

//     if (!formData.authorRole.trim()) {
//       newErrors.authorRole = 'Author role is required';
//     }

//     if (!formData.readTime.trim()) {
//       newErrors.readTime = 'Read time is required';
//     }

//     if (!formData.categoryId) {
//       newErrors.categoryId = 'Category is required';
//     }
    
//     if (!imagePreviewUrl && !blog?.image) {
//       setImageError('Blog image is required');
//     }

//     if (!authorImagePreviewUrl && !blog?.authorImage) {
//       setAuthorImageError('Author image is required');
//     }
    
//     return newErrors;
//   };

//   const handleSubmit = () => {
//     setIsSubmitting(true);
    
//     const formErrors = validateForm();
//     if (Object.keys(formErrors).length > 0 || imageError || authorImageError) {
//       setErrors(formErrors);
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       // Filter out empty content sections and tags
//       const cleanedContent = formData.content.filter(item => item.heading.trim() || item.para.trim());
//       const cleanedTags = formData.tags.filter(tag => tag.trim());

//       const blogData = {
//         ...formData,
//         content: cleanedContent,
//         tags: cleanedTags,
//         image: selectedImage,
//         authorImage: selectedAuthorImage
//       };

//       console.log("✅ Sending this to backend:", blogData);
    
//       // 🔹 Call parent save with FormData
//       onSave(blogData);
      
//     } catch (error) {
//       console.error('Error saving blog:', error);
//       setErrors({ submit: 'Failed to save blog. Please try again.' });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Cleanup object URLs on component unmount
//   useEffect(() => {
//     return () => {
//       if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(imagePreviewUrl);
//       }
//       if (authorImagePreviewUrl && authorImagePreviewUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(authorImagePreviewUrl);
//       }
//     };
//   }, []);

//   return (
//     <div className="space-y-6 max-h-96 overflow-y-auto">
//       {/* Basic Information */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Namebalu *
//           </label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//               errors.name ? 'border-red-500' : 'border-gray-300'
//             }`}
//             placeholder="Enter blog name"
//           />
//           {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Category *
//           </label>
//           <select
//             name="categoryId"
//             value={formData.categoryId}
//             onChange={handleChange}
//             required
//             className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//               errors.categoryId ? 'border-red-500' : 'border-gray-300'
//             }`}
//           >
//             <option value="">Select a category</option>
//             {categories.map(category => (
//               <option key={category.id} value={category.id}>
//                 {category.name}
//               </option>
//             ))}
//           </select>
//           {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Title *
//         </label>
//         <input
//           type="text"
//           name="title"
//           value={formData.title}
//           onChange={handleChange}
//           required
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//             errors.title ? 'border-red-500' : 'border-gray-300'
//           }`}
//           placeholder="Enter blog title"
//         />
//         {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Excerpt *
//         </label>
//         <textarea
//           name="excerpt"
//           value={formData.excerpt}
//           onChange={handleChange}
//           rows={3}
//           required
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//             errors.excerpt ? 'border-red-500' : 'border-gray-300'
//           }`}
//           placeholder="Enter blog excerpt"
//         />
//         {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
//       </div>

//       {/* Author Information */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Author *
//           </label>
//           <input
//             type="text"
//             name="author"
//             value={formData.author}
//             onChange={handleChange}
//             required
//             className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//               errors.author ? 'border-red-500' : 'border-gray-300'
//             }`}
//             placeholder="Enter author name"
//           />
//           {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Author Role *
//           </label>
//           <input
//             type="text"
//             name="authorRole"
//             value={formData.authorRole}
//             onChange={handleChange}
//             required
//             className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//               errors.authorRole ? 'border-red-500' : 'border-gray-300'
//             }`}
//             placeholder="Enter author role"
//           />
//           {errors.authorRole && <p className="text-red-500 text-sm mt-1">{errors.authorRole}</p>}
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Read Time *
//         </label>
//         <input
//           type="text"
//           name="readTime"
//           value={formData.readTime}
//           onChange={handleChange}
//           required
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//             errors.readTime ? 'border-red-500' : 'border-gray-300'
//           }`}
//           placeholder="e.g., 5"
//         />
//         {errors.readTime && <p className="text-red-500 text-sm mt-1">{errors.readTime}</p>}
//       </div>

//       {/* Author Image Upload */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Author Image * (Max 5 MB)
//         </label>
        
//         <div className="space-y-3">
//           <input
//             type="file"
//             id="author-image-upload"
//             accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//             onChange={handleAuthorImageChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//           />
          
//           {authorImageError && (
//             <p className="text-red-500 text-sm">{authorImageError}</p>
//           )}
          
//           {authorImagePreviewUrl && (
//             <div className="relative inline-block">
//               <img
//                 src={authorImagePreviewUrl}
//                 alt="Author Preview"
//                 className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeImage(true)}
//                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//               >
//                 ×
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Blog Image Upload */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Blog Image * (Max 5 MB)
//         </label>
        
//         <div className="space-y-3">
//           <input
//             type="file"
//             id="image-upload"
//             accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//             onChange={handleImageChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//           />
          
//           {imageError && (
//             <p className="text-red-500 text-sm">{imageError}</p>
//           )}
          
//           {imagePreviewUrl && (
//             <div className="relative inline-block">
//               <img
//                 src={imagePreviewUrl}
//                 alt="Blog Preview"
//                 className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeImage(false)}
//                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//               >
//                 ×
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Content Sections */}
//       <div>
//         <div className="flex items-center justify-between mb-3">
//           <label className="block text-sm font-medium text-gray-700">
//             Content Sections
//           </label>
//           <button
//             type="button"
//             onClick={addContentSection}
//             className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
//           >
//             <Plus className="w-3 h-3" />
//             Add Section
//           </button>
//         </div>

//         {formData.content.map((section, index) => (
//           <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm font-medium text-gray-600">Section {index + 1}</span>
//               {formData.content.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => removeContentSection(index)}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               )}
//             </div>
            
//             <div className="space-y-3">
//               <input
//                 type="text"
//                 value={section.heading}
//                 onChange={(e) => handleContentChange(index, 'heading', e.target.value)}
//                 placeholder="Section heading"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//               />
//               <textarea
//                 value={section.para}
//                 onChange={(e) => handleContentChange(index, 'para', e.target.value)}
//                 placeholder="Section content"
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Tags */}
//       <div>
//         <div className="flex items-center justify-between mb-3">
//           <label className="block text-sm font-medium text-gray-700">
//             Tags
//           </label>
//           <button
//             type="button"
//             onClick={addTag}
//             className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
//           >
//             <Plus className="w-3 h-3" />
//             Add Tag
//           </button>
//         </div>

//         {formData.tags.map((tag, index) => (
//           <div key={index} className="flex items-center gap-2 mb-2">
//             <input
//               type="text"
//               value={tag}
//               onChange={(e) => handleTagChange(index, e.target.value)}
//               placeholder="Enter tag"
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//             />
//             {formData.tags.length > 1 && (
//               <button
//                 type="button"
//                 onClick={() => removeTag(index)}
//                 className="text-red-500 hover:text-red-700"
//               >
//                 <Trash2 className="w-4 h-4" />
//               </button>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Stats and Settings */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Views
//           </label>
//           <input
//             type="number"
//             name="views"
//             value={formData.views}
//             onChange={handleChange}
//             min="0"
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Likes
//           </label>
//           <input
//             type="number"
//             name="likes"
//             value={formData.likes}
//             onChange={handleChange}
//             min="0"
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Comments
//           </label>
//           <input
//             type="number"
//             name="comments"
//             value={formData.comments}
//             onChange={handleChange}
//             min="0"
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//           />
//         </div>
//       </div>

//       {/* Checkboxes */}
//       <div className="flex items-center space-x-6">
//         <label className="flex items-center">
//           <input
//             type="checkbox"
//             name="isActive"
//             checked={formData.isActive}
//             onChange={handleChange}
//             className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
//           />
//           <span className="ml-2 text-sm text-gray-700">Active</span>
//         </label>

//         <label className="flex items-center">
//           <input
//             type="checkbox"
//             name="featured"
//             checked={formData.featured}
//             onChange={handleChange}
//             className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
//           />
//           <span className="ml-2 text-sm text-gray-700">Featured</span>
//         </label>
//       </div>

//       {/* Submit Error */}
//       {errors.submit && (
//         <div className="bg-red-50 border border-red-200 rounded-md p-3">
//           <p className="text-red-600 text-sm">{errors.submit}</p>
//         </div>
//       )}

//       <div className="flex justify-end space-x-3 pt-4">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//           disabled={isSubmitting}
//         >
//           Cancel
//         </button>
//         <button
//           type="button"
//           onClick={handleSubmit}
//           disabled={isSubmitting}
//           className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
//         >
//           {isSubmitting && (
//             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//           )}
//           <span>
//             {isSubmitting 
//               ? 'Saving...' 
//               : (blog ? 'Update Blog' : 'Add Blog')
//             }
//           </span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BlogForm;