import React from 'react';
import { Edit, Trash2, Calendar, Clock, User, Eye, Heart, MessageCircle, Star, Tag, X } from 'lucide-react';
import { BASE_URL } from '../../api/api-config';

const BlogViewModal = ({
  isOpen, 
  onClose,  
  blog, 
  onEdit, 
  onDelete, 
  getCategoryName,  
  formatDate 
}) => {
  if (!isOpen || !blog) return null;

  const handleEdit = () => {
    onEdit(blog);
    onClose();
  };

  const handleDelete = async () => {
    await onDelete(blog.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full max-w-4xl h-[100%]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Blog Details
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                title="Edit Blog"
              >
                <Edit className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                title="Delete Blog"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                title='Close Blog'
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white h-[100%] overflow-visible py-9">
            {/* Blog Image */}
            <div className="relative">
              <img
                src={BASE_URL + blog.image}
                alt={blog.title}
                className="w-full h-64 object-cover"
              />
              {blog.featured && (
                <div className="absolute top-4 left-4 bg-yellow-500 rounded-full p-2 shadow-md">
                  <Star className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                {/* {getCategoryName(blog.categoryId) */}
                {getCategoryName(blog.categoryId.name)}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Blog Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h1>
                <p className="text-gray-600 text-lg">{blog.excerpt}</p>
              </div>

              {/* Blog Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{blog.readTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{blog.views || 0} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{blog.likes || 0} likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{blog.comments || 0} comments</span>
                </div>
              </div>

              {/* Author Section */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={BASE_URL + blog.authorImage}
                  alt={blog.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{blog.author}</p>
                  <p className="text-sm text-gray-600">{blog.authorRole}</p>
                </div>
                <div className="ml-auto text-sm text-gray-500 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                </div>
              </div>

              {/* Blog Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Content</h3>
                {blog.content && blog.content.map((section, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{section.heading}</h4>
                    <p className="text-gray-700">{section.para}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Tag className="w-5 h-5" />
                    <span>Tags</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Indicators */}
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  blog.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {blog.isActive ? 'Active' : 'Inactive'}
                </span>
                {blog.featured && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogViewModal;