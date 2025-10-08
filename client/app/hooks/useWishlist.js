"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  // Get auth token
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    };
  };

  // Fetch user's wishlist
  const fetchWishlist = async (page = 1, limit = 10, priority = '', sortBy = 'addedAt') => {
    if (!API_URL) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = { page, limit };
      if (priority) params.priority = priority;
      if (sortBy) params.sortBy = sortBy;

      const { data } = await axios.get(`${API_URL}/wishlist/my-wishlist`, {
        ...getAuthHeaders(),
        params
      });

      setWishlist(data.data?.wishlist || []);
      return data.data;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to fetch wishlist';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (packageId, notes = '', priority = 'medium') => {
    if (!API_URL) return false;
    
    try {
      const { data } = await axios.post(`${API_URL}/wishlist/add`, {
        packageId,
        notes,
        priority
      }, getAuthHeaders());

      toast.success(data.message || 'Added to wishlist successfully');
      
      // Refresh wishlist
      await fetchWishlist();
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to add to wishlist';
      toast.error(message);
      return false;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (packageId) => {
    if (!API_URL) return false;
    
    try {
      const { data } = await axios.delete(`${API_URL}/wishlist/remove/${packageId}`, getAuthHeaders());
      
      toast.success(data.message || 'Removed from wishlist successfully');
      
      // Update local state
      setWishlist(prev => prev.filter(item => item.packageId._id !== packageId));
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to remove from wishlist';
      toast.error(message);
      return false;
    }
  };

  // Update wishlist item
  const updateWishlistItem = async (packageId, updates) => {
    if (!API_URL) return false;
    
    try {
      const { data } = await axios.put(`${API_URL}/wishlist/update/${packageId}`, updates, getAuthHeaders());
      
      toast.success(data.message || 'Wishlist item updated successfully');
      
      // Update local state
      setWishlist(prev => prev.map(item => 
        item.packageId._id === packageId 
          ? { ...item, ...updates }
          : item
      ));
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update wishlist item';
      toast.error(message);
      return false;
    }
  };

  // Check if package is in wishlist
  const checkWishlistStatus = async (packageId) => {
    if (!API_URL) return false;
    
    try {
      const { data } = await axios.get(`${API_URL}/wishlist/check/${packageId}`, getAuthHeaders());
      return data.data?.inWishlist || false;
    } catch (err) {
      return false;
    }
  };

  // Toggle wishlist status
  const toggleWishlist = async (packageId, packageData = null) => {
    const isInWishlist = await checkWishlistStatus(packageId);
    
    if (isInWishlist) {
      return await removeFromWishlist(packageId);
    } else {
      return await addToWishlist(packageId);
    }
  };

  return {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    checkWishlistStatus,
    toggleWishlist
  };
};