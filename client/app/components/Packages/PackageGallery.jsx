"use client";

import { useState } from "react";
import { 
  HiOutlineX, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlinePhotograph
} from "react-icons/hi";

const PackageGallery = ({ images = [], title = "Package Gallery" }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle both array and single image formats
  const imageList = Array.isArray(images) ? images : (images?.url ? [images] : []);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(imageList[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % imageList.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(imageList[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + imageList.length) % imageList.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(imageList[prevIndex]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  if (imageList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <HiOutlinePhotograph className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        {imageList.length > 0 && (
          <div 
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={imageList[0].url}
              alt={`${title} - Main image`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white dark:bg-gray-800 rounded-full p-2">
                <HiOutlinePhotograph className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            {imageList.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                +{imageList.length - 1} more
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Grid */}
        {imageList.length > 1 && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {imageList.slice(1).map((image, index) => (
              <div
                key={image.public_id || index}
                className="relative aspect-square rounded-md overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index + 1)}
              >
                <img
                  src={image.url}
                  alt={`${title} - Image ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {imageList.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <HiOutlineChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <HiOutlineChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedImage.url}
              alt={`${title} - Full size`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Counter */}
            {imageList.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                {currentIndex + 1} / {imageList.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PackageGallery;