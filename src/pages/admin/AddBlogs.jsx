


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { ArrowLeft, Plus, Minus, Save, Loader2, Info } from 'lucide-react';
// import { BlogsAPI, BlogCategoriesAPI } from '../../api/blogs';
// import { BASE_URL } from '../../api/api-config';

// const AddBlogs = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const location = useLocation();
//   const isEdit = Boolean(id);
  
//   const [formData, setFormData] = useState({
//     name: '',
//     title: '',
//     excerpt: '',
//     author: '',
//     authorRole: '',
//     readTime: '',
//     categoryId: '',
//     content: [{ heading: '', para: '' }],
//     tags: [''],
//     views: 0,
//     likes: 0,
//     comments: 0,
//     isActive: true,
//     featured: false,
//     image: null,
//     authorImage: null
//   });

//   const [blogCategories, setBlogCategories] = useState([]);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreviewUrl, setImagePreviewUrl] = useState('');
//   const [selectedAuthorImage, setSelectedAuthorImage] = useState(null);
//   const [authorImagePreviewUrl, setAuthorImagePreviewUrl] = useState('');
//   const [imageError, setImageError] = useState('');
//   const [authorImageError, setAuthorImageError] = useState('');
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     fetchBlogCategories();
//     if (isEdit && location.state?.blog) {
//       populateFormData(location.state.blog);
//     } else if (isEdit && id) {
//       fetchBlogById(id);
//     }
//   }, [id, isEdit, location.state]);

//   const fetchBlogCategories = async () => {
//     try {
//       const res = await BlogCategoriesAPI.getAll();
//       if (res.success) {
//         setBlogCategories(res.result || []);
//       }
//     } catch (err) {
//       console.error('Failed to fetch blog categories:', err);
//       setErrors(prev => ({ ...prev, categories: 'Failed to load blog categories' }));
//     }
//   };

//   const fetchBlogById = async (blogId) => {
//     try {
//       setLoading(true);
//       const res = await BlogsAPI.getById(blogId);
//       if (res.success) {
//         populateFormData(res.result);
//       } else {
//         throw new Error(res.message || 'Failed to fetch blog');
//       }
//     } catch (err) {
//       setErrors(prev => ({ ...prev, fetch: 'Failed to load blog data' }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const populateFormData = (blog) => {
//     setFormData({
//       name: blog.name || '',
//       title: blog.title || '',
//       excerpt: blog.excerpt || '',
//       author: blog.author || '',
//       authorRole: blog.authorRole || '',
//       readTime: blog.readTime || '',
//       categoryId: blog.categoryId || '',
//       content: blog.content && blog.content.length > 0 ? blog.content : [{ heading: '', para: '' }],
//       tags: blog.tags && blog.tags.length > 0 ? blog.tags : [''],
//       views: blog.views || 0,
//       likes: blog.likes || 0,
//       comments: blog.comments || 0,
//       isActive: blog.isActive !== undefined ? blog.isActive : true,
//       featured: blog.featured || false,
//       image: null,
//       authorImage: null
//     });
    
//     if (blog.image) {
//       setImagePreviewUrl(BASE_URL + blog.image);
//     }
//     if (blog.authorImage) {
//       setAuthorImagePreviewUrl(BASE_URL + blog.authorImage);
//     }
//   };

//   const validateAndSetFile = (file, isAuthor = false) => {
//     const errorSetter = isAuthor ? setAuthorImageError : setImageError;
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
      
//       if (isAuthor) {
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

//   const removeImage = (isAuthor = false) => {
//     const inputId = isAuthor ? 'author-image-upload' : 'image-upload';
    
//     if (isAuthor) {
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
    
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
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
//       setFormData(prev => ({
//         ...prev,
//         content: prev.content.filter((_, i) => i !== index)
//       }));
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
//       setFormData(prev => ({
//         ...prev,
//         tags: prev.tags.filter((_, i) => i !== index)
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) newErrors.name = 'Name is required';
//     if (!formData.title.trim()) newErrors.title = 'Title is required';
//     if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
//     if (!formData.author.trim()) newErrors.author = 'Author is required';
//     if (!formData.authorRole.trim()) newErrors.authorRole = 'Author role is required';
//     if (!formData.readTime.trim()) newErrors.readTime = 'Read time is required';
//     if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    
//     // Validate content sections
//     formData.content.forEach((content, index) => {
//       if (!content.heading.trim()) {
//         newErrors[`content_${index}_heading`] = 'Heading is required';
//       }
//       if (!content.para.trim()) {
//         newErrors[`content_${index}_para`] = 'Content is required';
//       }
//     });

//     // Validate tags
//     const validTags = formData.tags.filter(tag => tag.trim());
//     if (validTags.length === 0) {
//       newErrors.tags = 'At least one tag is required';
//     }
    
//     if (!imagePreviewUrl) {
//       setImageError('Blog image is required');
//     }

//     if (!authorImagePreviewUrl) {
//       setAuthorImageError('Author image is required');
//     }
    
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setErrors({});
    
//     const formErrors = validateForm();
//     if (Object.keys(formErrors).length > 0 || imageError || authorImageError) {
//       setErrors(formErrors);
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const submitData = {
//         ...formData,
//         image: selectedImage,
//         authorImage: selectedAuthorImage,
//         tags: formData.tags.filter(tag => tag.trim()),
//         content: formData.content.filter(c => c.heading.trim() && c.para.trim())
//       };

//       if (isEdit) {
//         submitData.id = id;
//       }

//       console.log("Submitting blog data:", submitData);

//       const res = isEdit 
//         ? await BlogsAPI.update(submitData)
//         : await BlogsAPI.add(submitData);

//       if (res.success) {
//         navigate('/admin/blogs');
//       } else {
//         throw new Error(res.message || 'Failed to save blog');
//       }
//     } catch (error) {
//       console.error('Full API Error:', error);
//       console.error('Error response:', error.response);
//       console.error('Error message:', error.message);
      
//       // Extract message from different error formats
//       let errorMessage = 'Something went wrong while saving the blog.';
      
//       try {
//         // Method 1: Check if it's an axios error with response data
//         if (error.response?.data) {
//           console.log('Response data:', error.response.data);
//           if (typeof error.response.data === 'object' && error.response.data.message) {
//             errorMessage = error.response.data.message;
//           } else if (typeof error.response.data === 'string') {
//             const parsed = JSON.parse(error.response.data);
//             errorMessage = parsed.message || errorMessage;
//           }
//         }
//         // Method 2: Check error.message for JSON content
//         else if (error.message) {
//           console.log('Processing error message:', error.message);
          
//           // Look for JSON in the error message
//           const jsonMatch = error.message.match(/\{.*\}/);
//           if (jsonMatch) {
//             const parsed = JSON.parse(jsonMatch[0]);
//             errorMessage = parsed.message || errorMessage;
//           } else {
//             errorMessage = error.message;
//           }
//         }
//       } catch (parseError) {
//         console.error('Error parsing error message:', parseError);
//         // If all parsing fails, try to extract from the raw error message
//         if (error.message && error.message.includes('"message":')) {
//           const messageMatch = error.message.match(/"message":"([^"]+)"/);
//           if (messageMatch && messageMatch[1]) {
//             errorMessage = messageMatch[1].replace(/\\"/g, '"'); // Unescape quotes
//           }
//         } else {
//           errorMessage = error.message || errorMessage;
//         }
//       }
      
//       console.log('Final error message:', errorMessage);
//       setErrors({ submit: errorMessage });
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

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="flex items-center gap-3">
//           <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
//           <span className="text-gray-600">Loading blog data...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center space-x-4">
//         <button
//           onClick={() => navigate('/admin/blogs')}
//           className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
//         >
//           <ArrowLeft className="w-6 h-6" />
//         </button>
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {isEdit ? 'Edit Blog' : 'Add New Blog'}
//           </h1>
//           <p className="text-gray-600 mt-1">
//             {isEdit ? 'Update blog information' : 'Create a new blog post'}
//           </p>
//         </div>
//       </div>

//       {/* Error States */}
//       {errors.fetch && (
//         <div className="bg-red-50 border border-red-200 rounded-md p-4">
//           <p className="text-red-600">{errors.fetch}</p>
//           <button
//             onClick={() => navigate('/admin/blogs')}
//             className="mt-2 text-red-700 underline"
//           >
//             Go back to blogs
//           </button>
//         </div>
//       )}

//       {errors.categories && (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
//           <p className="text-yellow-600">{errors.categories}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
//           {/* Basic Information */}
//           <div className="space-y-4">
//             <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                     errors.name ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter blog name"
//                 />
//                 {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Category *
//                 </label>
//                 <select
//                   name="categoryId"
//                   value={formData.categoryId}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                     errors.categoryId ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 >
//                   <option value="">Select category</option>
//                   {blogCategories.map(category => (
//                     <option key={category.id} value={category.id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Title *
//               </label>
//               <input
//                 type="text"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                   errors.title ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter blog title"
//               />
//               {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Excerpt *
//               </label>
//               <textarea
//                 name="excerpt"
//                 value={formData.excerpt}
//                 onChange={handleChange}
//                 rows={3}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                   errors.excerpt ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter brief excerpt"
//               />
//               {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
//             </div>
//           </div>


//           <div className="flex items-center space-x-6">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   name="isActive"
//                   checked={formData.isActive}
//                   onChange={handleChange}
//                   className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">Active</span>
//               </label>

//               <label className="flex items-center">
//                 <input
//                   type="checkbox" 
//                   name="featured"
//                   checked={formData.featured}
//                   onChange={handleChange}
//                   className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">      
//                   Featured
//                   <div className="relative group inline-block">
//                      {/* Icon */}
//                      <Info className="w-4 h-4 ms-3 text-gray-600 cursor-pointer animate-ping" />
//                      <span
//                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2
//                                  px-2 py-0 text-sm text-white bg-gray-800 rounded-md hidden group-hover:block 
//                                  transition-opacity duration-300 whitespace-nowrap shadow-lg text-wrap w-[35vw] md:w-[40vw] lg:w-[30vw] xl:w-[20vw]"
//                      >
//                        If 'Featured' is selected, the blog will appear under Featured Articles. Otherwise, it will be displayed under Latest Articles.
//                      </span>
//                    </div>
//                 </span>
//               </label>
//             </div>

//           {/* Author Information */}
//           <div className="space-y-4">
//             <h2 className="text-xl font-semibold text-gray-900">Author Information</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Author Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="author"
//                   value={formData.author}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                     errors.author ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter author name"
//                 />
//                 {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Author Role *
//                 </label>
//                 <input
//                   type="text"
//                   name="authorRole"
//                   value={formData.authorRole}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                     errors.authorRole ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter author role"
//                 />
//                 {errors.authorRole && <p className="text-red-500 text-sm mt-1">{errors.authorRole}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Read Time *
//                 </label>
//                 <input
//                   type="text"
//                   name="readTime"
//                   value={formData.readTime}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                     errors.readTime ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="e.g., 5 min"
//                 />
//                 {errors.readTime && <p className="text-red-500 text-sm mt-1">{errors.readTime}</p>}
//               </div>
//             </div>

//             {/* Author Image Upload */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Author Image * (Max 5 MB)
//               </label>
              
//               <div className="space-y-3">
//                 <input
//                   type="file"
//                   id="author-image-upload"
//                   accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                   onChange={handleAuthorImageChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//                 />
                
//                 {authorImageError && (
//                   <p className="text-red-500 text-sm">{authorImageError}</p>
//                 )}
                
//                 {authorImagePreviewUrl && (
//                   <div className="relative inline-block">
//                     <img
//                       src={authorImagePreviewUrl}
//                       alt="Author Preview"
//                       className="w-24 h-24 object-cover rounded-full border-2 border-gray-300"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => removeImage(true)}
//                       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Blog Content */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-xl font-semibold text-gray-900">Blog Content</h2>
//               <button
//                 type="button"
//                 onClick={addContentSection}
//                 className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Add Section</span>
//               </button>
//             </div>

//             {formData.content.map((content, index) => (
//               <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-600">Section {index + 1}</span>
//                   {formData.content.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeContentSection(index)}
//                       className="text-red-600 hover:text-red-800 transition-colors"
//                     >
//                       <Minus className="w-4 h-4 " />
//                     </button>
//                   )}
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Heading *
//                   </label>
//                   <input
//                     type="text"
//                     value={content.heading}
//                     onChange={(e) => handleContentChange(index, 'heading', e.target.value)}
//                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                       errors[`content_${index}_heading`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="Enter section heading"
//                   />
//                   {errors[`content_${index}_heading`] && (
//                     <p className="text-red-500 text-sm mt-1">{errors[`content_${index}_heading`]}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Content *
//                   </label>
//                   <textarea
//                     value={content.para}
//                     onChange={(e) => handleContentChange(index, 'para', e.target.value)}
//                     rows={4}
//                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
//                       errors[`content_${index}_para`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="Enter section content"
//                   />
//                   {errors[`content_${index}_para`] && (
//                     <p className="text-red-500 text-sm mt-1">{errors[`content_${index}_para`]}</p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Tags */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-xl font-semibold text-gray-900">Tags</h2>
//               <button
//                 type="button"
//                 onClick={addTag}
//                 className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Add Tag</span>
//               </button>
//             </div>

//             {formData.tags.map((tag, index) => (
//               <div key={index} className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   value={tag}
//                   onChange={(e) => handleTagChange(index, e.target.value)}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//                   placeholder="Enter tag"
//                 />
//                 {formData.tags.length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => removeTag(index)}
//                     className="text-red-600 hover:text-red-800 transition-colors"
//                   >
//                     <Minus className="w-4 h-4 " />
//                   </button>
//                 )}
//               </div>
//             ))}
//             {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
//           </div>

//           {/* Blog Image Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Blog Image * (Max 5 MB)
//             </label>
            
//             <div className="space-y-3">
//               <input
//                 type="file"
//                 id="image-upload"
//                 accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                 onChange={handleImageChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//               />
              
//               {imageError && (
//                 <p className="text-red-500 text-sm">{imageError}</p>
//               )}
              
//               {imagePreviewUrl && (
//                 <div className="relative inline-block">
//                   <img
//                     src={imagePreviewUrl}
//                     alt="Blog Preview"
//                     className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeImage(false)}
//                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//                   >
//                     ×
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Stats and Settings */}
//           <div className="space-y-4">
//             <h2 className="text-xl font-semibold text-gray-900">Settings & Stats</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Views
//                 </label>
//                 <input
//                   type="number"
//                   name="views"
//                   value={formData.views}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Likes
//                 </label>
//                 <input
//                   type="number"
//                   name="likes"
//                   value={formData.likes}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Comments
//                 </label>
//                 <input
//                   type="number"
//                   name="comments"
//                   value={formData.comments}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//                 />
//               </div>
//             </div>

            
//           </div>
//         </div>

//         {/* Submit Error */}
//         {errors.submit && (
//           <div className="bg-red-50 border border-red-200 rounded-md p-4">
//             <p className="text-red-600">{errors.submit}</p>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex justify-end space-x-4">
//           <button
//             type="button"
//             onClick={() => navigate('/admin/blogs')}
//             className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//             disabled={isSubmitting}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
//           >
//             {isSubmitting && (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             )}
//             <Save className="w-4 h-4" />
//             <span>
//               {isSubmitting 
//                 ? 'Saving...' 
//                 : (isEdit ? 'Update Blog' : 'Create Blog')
//               }
//             </span>
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddBlogs;




















import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Save, Loader2, Info, X } from 'lucide-react';
import { BlogsAPI, BlogCategoriesAPI } from '../../api/blogs';
import { BASE_URL } from '../../api/api-config';

const AddBlogs = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    excerpt: '',
    author: '',
    authorRole: '',
    readTime: '',
    categoryId: '',
    content: [{ heading: '', para: '' }],
    tags: [''],
    views: 0,
    likes: 0,
    comments: 0,
    isActive: true,
    featured: false,
    image: null,
    authorImage: null
  });

  const [blogCategories, setBlogCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [selectedAuthorImage, setSelectedAuthorImage] = useState(null);
  const [authorImagePreviewUrl, setAuthorImagePreviewUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [authorImageError, setAuthorImageError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogCategories();
  }, []);

  useEffect(() => {
    if (isEdit && blogCategories.length > 0) {
      if (location.state?.blog) {
        populateFormData(location.state.blog);
      } else if (id) {
        fetchBlogById(id);
      }
    }
  }, [id, isEdit, location.state, blogCategories]);

  const fetchBlogCategories = async () => {
    try {
      const res = await BlogCategoriesAPI.getAll();
      if (res.success) {
        console.log('Blog Categories:', res.result);
        setBlogCategories(res.result || []);
      }
    } catch (err) {
      console.error('Failed to fetch blog categories:', err);
      setErrors(prev => ({ ...prev, categories: 'Failed to load blog categories' }));
    }
  };

  const fetchBlogById = async (blogId) => {
    try {
      setLoading(true);
      const res = await BlogsAPI.getById(blogId);
      if (res.success) {
        console.log('Fetched Blog:', res.result);
        populateFormData(res.result);
      } else {
        throw new Error(res.message || 'Failed to fetch blog');
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, fetch: 'Failed to load blog data' }));
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (blog) => {
    console.log('Populating form with blog data:', blog);
    console.log('Blog categoryId:', blog.categoryId);
    console.log('Available categories:', blogCategories);

    // Find the correct category ID
    let selectedCategoryId = '';
    
    if (blog.categoryId) {
      // If categoryId is a string (ID), use it directly
      if (typeof blog.categoryId === 'string') {
        selectedCategoryId = blog.categoryId;
      }
      // If categoryId is an object with id property
      else if (typeof blog.categoryId === 'object' && blog.categoryId.id) {
        selectedCategoryId = blog.categoryId.id;
      }
      // If categoryId is an object with _id property
      else if (typeof blog.categoryId === 'object' && blog.categoryId._id) {
        selectedCategoryId = blog.categoryId._id;
      }
    }

    // Verify the category exists in our categories list
    const categoryExists = blogCategories.find(cat => 
      cat.id === selectedCategoryId || 
      cat._id === selectedCategoryId ||
      cat.id === blog.categoryId ||
      cat._id === blog.categoryId
    );

    if (!categoryExists && blog.categoryId) {
      console.warn('Category not found in categories list:', blog.categoryId);
      // Try to find by name if available
      const categoryByName = blogCategories.find(cat => 
        cat.name === (typeof blog.categoryId === 'object' ? blog.categoryId.name : blog.categoryId)
      );
      if (categoryByName) {
        selectedCategoryId = categoryByName.id || categoryByName._id;
      }
    } else if (categoryExists) {
      selectedCategoryId = categoryExists.id || categoryExists._id;
    }

    console.log('Selected category ID:', selectedCategoryId);

    setFormData({
      name: blog.name || '',
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      author: blog.author || '',
      authorRole: blog.authorRole || '',
      readTime: blog.readTime || '',
      categoryId: selectedCategoryId,
      content: blog.content && blog.content.length > 0 ? blog.content : [{ heading: '', para: '' }],
      tags: blog.tags && blog.tags.length > 0 ? blog.tags : [''],
      views: blog.views || 0,
      likes: blog.likes || 0,
      comments: blog.comments || 0,
      isActive: blog.isActive !== undefined ? blog.isActive : true,
      featured: blog.featured || false,
      image: null,
      authorImage: null
    });
    
    if (blog.image) {
      setImagePreviewUrl(BASE_URL + blog.image);
    }
    if (blog.authorImage) {
      setAuthorImagePreviewUrl(BASE_URL + blog.authorImage);
    }
  };

  const validateAndSetFile = (file, isAuthor = false) => {
    const errorSetter = isAuthor ? setAuthorImageError : setImageError;
    errorSetter('');

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        errorSetter('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        errorSetter('Image size must not exceed 5 MB');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      
      if (isAuthor) {
        setSelectedAuthorImage(file);
        setAuthorImagePreviewUrl(previewUrl);
      } else {
        setSelectedImage(file);
        setImagePreviewUrl(previewUrl);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file, false);
  };

  const handleAuthorImageChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file, true);
  };

  const removeImage = (isAuthor = false) => {
    const inputId = isAuthor ? 'author-image-upload' : 'image-upload';
    
    if (isAuthor) {
      if (authorImagePreviewUrl && authorImagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(authorImagePreviewUrl);
      }
      setSelectedAuthorImage(null);
      setAuthorImagePreviewUrl('');
      setAuthorImageError('');
    } else {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setSelectedImage(null);
      setImagePreviewUrl('');
      setImageError('');
    }
    
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContentChange = (index, field, value) => {
    const newContent = [...formData.content];
    newContent[index][field] = value;
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const addContentSection = () => {
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, { heading: '', para: '' }]
    }));
  };

  const removeContentSection = (index) => {
    if (formData.content.length > 1) {
      setFormData(prev => ({
        ...prev,
        content: prev.content.filter((_, i) => i !== index)
      }));
    }
  };

  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index) => {
    if (formData.tags.length > 1) {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.authorRole.trim()) newErrors.authorRole = 'Author role is required';
    if (!formData.readTime.trim()) newErrors.readTime = 'Read time is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    
    // Validate content sections
    formData.content.forEach((content, index) => {
      if (!content.heading.trim()) {
        newErrors[`content_${index}_heading`] = 'Heading is required';
      }
      if (!content.para.trim()) {
        newErrors[`content_${index}_para`] = 'Content is required';
      }
    });

    // Validate tags
    const validTags = formData.tags.filter(tag => tag.trim());
    if (validTags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    
    if (!imagePreviewUrl) {
      setImageError('Blog image is required');
    }

    if (!authorImagePreviewUrl) {
      setAuthorImageError('Author image is required');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0 || imageError || authorImageError) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        image: selectedImage,
        authorImage: selectedAuthorImage,
        tags: formData.tags.filter(tag => tag.trim()),
        content: formData.content.filter(c => c.heading.trim() && c.para.trim())
      };

      if (isEdit) {
        submitData.id = id;
      }

      console.log("Submitting blog data:", submitData);

      const res = isEdit 
        ? await BlogsAPI.update(submitData)
        : await BlogsAPI.add(submitData);

      if (res.success) {
        navigate('/admin/blogs');
      } else {
        throw new Error(res.message || 'Failed to save blog');
      }
    } catch (error) {
      console.error('Full API Error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Extract message from different error formats
      let errorMessage = 'Something went wrong while saving the blog.';
      
      try {
        // Method 1: Check if it's an axios error with response data
        if (error.response?.data) {
          console.log('Response data:', error.response.data);
          if (typeof error.response.data === 'object' && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            const parsed = JSON.parse(error.response.data);
            errorMessage = parsed.message || errorMessage;
          }
        }
        // Method 2: Check error.message for JSON content
        else if (error.message) {
          console.log('Processing error message:', error.message);
          
          // Look for JSON in the error message
          const jsonMatch = error.message.match(/\{.*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            errorMessage = parsed.message || errorMessage;
          } else {
            errorMessage = error.message;
          }
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
        // If all parsing fails, try to extract from the raw error message
        if (error.message && error.message.includes('"message":')) {
          const messageMatch = error.message.match(/"message":"([^"]+)"/);
          if (messageMatch && messageMatch[1]) {
            errorMessage = messageMatch[1].replace(/\\"/g, '"'); // Unescape quotes
          }
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      console.log('Final error message:', errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      if (authorImagePreviewUrl && authorImagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(authorImagePreviewUrl);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          <span className="text-gray-600">Loading blog data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/blogs')}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Blog' : 'Add New Blog'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update blog information' : 'Create a new blog post'}
          </p>
        </div>
        
      </div>

      {/* Error States */}
      {errors.fetch && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{errors.fetch}</p>
          <button
            onClick={() => navigate('/admin/blogs')}
            className="mt-2 text-red-700 underline"
          >
            Go back to blogs
          </button>
        </div>
      )}

      {errors.categories && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-600">{errors.categories}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter blog name"
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
                  <option value="">Select category</option>
                  {blogCategories.map(category => (
                    <option key={category.id || category._id} value={category.id || category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter blog title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.excerpt ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter brief excerpt"
              />
              {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox" 
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">      
                Featured
                <div className="relative group inline-block">
                   {/* Icon */}
                   <Info className="w-4 h-4 ms-3 text-gray-600 cursor-pointer animate-ping" />
                   <span
                     className="absolute left-full top-1/2 -translate-y-1/2 ml-2
                               px-2 py-0 text-sm text-white bg-gray-800 rounded-md hidden group-hover:block 
                               transition-opacity duration-300 whitespace-nowrap shadow-lg text-wrap w-[35vw] md:w-[40vw] lg:w-[30vw] xl:w-[20vw]"
                   >
                     If 'Featured' is selected, the blog will appear under Featured Articles. Otherwise, it will be displayed under Latest Articles.
                   </span>
                 </div>
              </span>
            </label>
          </div>

          {/* Author Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Author Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.author ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter author name"
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Role *
                </label>
                <input
                  type="text"
                  name="authorRole"
                  value={formData.authorRole}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.authorRole ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter author role"
                />
                {errors.authorRole && <p className="text-red-500 text-sm mt-1">{errors.authorRole}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Read Time *
                </label>
                <input
                  type="text"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.readTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 5 min"
                />
                {errors.readTime && <p className="text-red-500 text-sm mt-1">{errors.readTime}</p>}
              </div>
            </div>

            {/* Author Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author Image * (Max 5 MB)
              </label>
              
              <div className="space-y-3">
                <input
                  type="file"
                  id="author-image-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAuthorImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                
                {authorImageError && (
                  <p className="text-red-500 text-sm">{authorImageError}</p>
                )}
                
                {authorImagePreviewUrl && (
                  <div className="relative inline-block">
                    <img
                      src={authorImagePreviewUrl}
                      alt="Author Preview"
                      className="w-24 h-24 object-cover rounded-full border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(true)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blog Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Blog Content</h2>
              <button
                type="button"
                onClick={addContentSection}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>

            {formData.content.map((content, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Section {index + 1}</span>
                  {formData.content.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContentSection(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heading *
                  </label>
                  <input
                    type="text"
                    value={content.heading}
                    onChange={(e) => handleContentChange(index, 'heading', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      errors[`content_${index}_heading`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter section heading"
                  />
                  {errors[`content_${index}_heading`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`content_${index}_heading`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={content.para}
                    onChange={(e) => handleContentChange(index, 'para', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      errors[`content_${index}_para`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter section content"
                  />
                  {errors[`content_${index}_para`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`content_${index}_para`]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Tags</h2>
              <button
                type="button"
                onClick={addTag}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </div>

            {formData.tags.map((tag, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter tag"
                />
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  > 
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
          </div>

          {/* Blog Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blog Image * (Max 5 MB)
            </label>
            
            <div className="space-y-3">
              <input
                type="file"
                id="image-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              
              {imageError && (
                <p className="text-red-500 text-sm">{imageError}</p>
              )}
              
              {imagePreviewUrl && (
                <div className="relative inline-block">
                  <img
                    src={imagePreviewUrl}
                    alt="Blog Preview"
                    className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(false)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats and Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Settings & Stats</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Views
                </label>
                <input
                  type="number"
                  name="views"
                  value={formData.views}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Likes
                </label>
                <input
                  type="number"
                  name="likes"
                  value={formData.likes}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <input
                  type="number"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/blogs')}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? 'Saving...' 
                : (isEdit ? 'Update Blog' : 'Create Blog')
              }
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBlogs;