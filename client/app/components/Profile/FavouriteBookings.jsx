"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Heart, Loader2, HeartOff, Package, List } from 'lucide-react';
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';
import PackageListItem from '@/app/components/Packages/PackageListItem.jsx';

const FavouriteBookings = () => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoritePkgs, setFavoritePkgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const getAuthConfig = () => {
    if (typeof window === 'undefined') return { withCredentials: true };
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const cfg = { withCredentials: true };
    if (token) cfg.headers = { Authorization: `Bearer ${token}` };
    return cfg;
  };

  const fetchFavourites = async () => {
    if (!API_URL) return;
    setError('');
    setLoading(true);
    try {
      const { data: profile } = await axios.get(`${API_URL}/user/profile`, getAuthConfig());
      const favIds = profile?.user?.favoritePackages || profile?.user?.favouritePackages || [];
      setFavoriteIds(favIds);

      if (!favIds?.length) {
        setFavoritePkgs([]);
        setLoading(false);
        return;
      }

      // Fetch all packages from the API
      const { data: packagesData } = await axios.get(`${API_URL}/package/get-packages`, {
        params: { status: 'active', limit: 1000 },
        withCredentials: true,
      });
      
      const allPackages = Array.isArray(packagesData?.packages) 
        ? packagesData.packages 
        : packagesData?.data?.packages || [];
      
      // Filter packages that are in favorites
      const favoritePackages = allPackages.filter((pkg) => 
        favIds.some((id) => String(id) === String(pkg._id || pkg.id))
      );
      
      setFavoritePkgs(favoritePackages);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load favourites';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative w-12 h-12 text-rose-600 dark:text-rose-400 animate-spin" />
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
            <HeartOff className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">Unable to Load Wishlist</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchFavourites}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!favoritePkgs?.length) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 mb-6">
            <Heart className="w-10 h-10 text-rose-500 dark:text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Your Wishlist is Empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start exploring and add your favorite packages to see them here!
          </p>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-105"
          >
            <Package className="w-5 h-5" />
            Explore Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              My Wishlist
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You have {favoritePkgs.length} {favoritePkgs.length === 1 ? 'package' : 'packages'} saved
            </p>
          </div>
          <button
            onClick={fetchFavourites}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Packages List */}
      <div className="space-y-4">
        {favoritePkgs.map((pkg, idx) => (
          <PackageListItem 
            key={pkg?._id || pkg?.id || `pkg-${idx}`} 
            pkg={pkg} 
            loading={false} 
          />
        ))}
      </div>
    </div>
  );
};

export default FavouriteBookings;