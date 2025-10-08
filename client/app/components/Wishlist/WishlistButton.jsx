"use client";

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/app/hooks/useWishlist';
import { useSelector } from 'react-redux';

const WishlistButton = ({ 
  packageId, 
  className = '', 
  size = 'md',
  showText = false,
  variant = 'default'
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { checkWishlistStatus, toggleWishlist } = useWishlist();
  const user = useSelector((state) => state?.auth?.user);

  // Size classes
  const sizeClasses = {
    sm: 'p-2 w-8 h-8',
    md: 'p-2.5 w-10 h-10',
    lg: 'p-3 w-12 h-12'
  };

  // Icon sizes
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // Variant classes
  const variantClasses = {
    default: `${isInWishlist 
      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
    } border transition-all duration-200`,
    minimal: `${isInWishlist 
      ? 'text-red-600 hover:text-red-700' 
      : 'text-gray-400 hover:text-red-500'
    } transition-colors duration-200`,
    filled: `${isInWishlist 
      ? 'bg-red-600 text-white hover:bg-red-700' 
      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
    } transition-all duration-200`
  };

  // Check wishlist status on mount
  useEffect(() => {
    if (user && packageId) {
      checkWishlistStatus(packageId).then(setIsInWishlist);
    }
  }, [packageId, user, checkWishlistStatus]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // You might want to open a login modal here
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const success = await toggleWishlist(packageId);
      if (success) {
        setIsInWishlist(!isInWishlist);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        rounded-full flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        group relative
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={iconSizes[size]}
        className={`
          transition-all duration-200
          ${isInWishlist ? 'fill-current' : 'fill-none'}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />
      
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isInWishlist ? 'Saved' : 'Save'}
        </span>
      )}

      {/* Tooltip for hover */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                      bg-gray-900 text-white text-xs px-2 py-1 rounded
                      opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none whitespace-nowrap z-10">
        {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      </div>
    </button>
  );
};

export default WishlistButton;