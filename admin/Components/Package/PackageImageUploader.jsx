"use client";

import { useState, useCallback } from "react";
import { 
  HiOutlinePhotograph, 
  HiOutlineTrash,
  HiOutlineEye
} from "react-icons/hi";

const PackageImageUploader = ({ 
  image = null, 
  onImageChange, 
  disabled = false,
  label = "Package Cover Image"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Handle file selection
  const handleFiles = useCallback((files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not a valid image file`);
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} is too large. Maximum size is 10MB`);
      return;
    }

    // Clear URL if file is selected
    setImageUrl("");

    // Create preview URL and update
    const imageData = {
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    };

    onImageChange(imageData);
  }, [onImageChange]);

  // Handle URL input
  const handleUrlChange = useCallback((url) => {
    setImageUrl(url);
    if (url.trim()) {
      const imageData = {
        url: url.trim(),
        isUrl: true,
        isNew: true
      };
      onImageChange(imageData);
    }
  }, [onImageChange]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  // Handle input change
  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [disabled, handleFiles]);

  // Remove image
  const removeImage = useCallback(() => {
    setImageUrl("");
    onImageChange(null);
  }, [onImageChange]);

  // Preview image
  const previewImage = () => {
    const url = image?.preview || image?.url || image;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const hasImage = image?.preview || image?.url || image;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      </div>

      {/* Current Image Display */}
      {hasImage ? (
        <div className="relative group">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <img
              src={image?.preview || image?.url || image}
              alt="Package cover"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
                <button
                  type="button"
                  onClick={previewImage}
                  className="p-2 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
                  title="Preview image"
                  aria-label="Preview image"
                >
                  <HiOutlineEye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={disabled}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
          </div>
          
          {/* New image indicator */}
          {(image?.isNew || image?.isUrl) && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              New
            </div>
          )}
        </div>
      ) : (
        /* Upload Area */
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="text-center">
            <HiOutlinePhotograph className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PNG, JPG, GIF, WebP up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Or paste image URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={disabled || hasImage}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Upload Tips */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Recommended image size: 1200x800 pixels or higher</p>
        <p>• This image will be used as the package cover on cards and listings</p>
        <p>• You can either upload a file or provide an image URL</p>
      </div>
    </div>
  );
};

export default PackageImageUploader;