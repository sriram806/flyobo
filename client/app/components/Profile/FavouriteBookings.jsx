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
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-sky-700 rounded-full blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative w-12 h-12 text-sky-600 dark:text-sky-400 animate-spin" />
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/30 p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-sky-100 dark:bg-sky-900/30">
            <HeartOff className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-300 mb-2">Unable to Load Wishlist</h3>
            <p className="text-sm text-sky-700 dark:text-sky-400 mb-4">{error}</p>
            <button
              onClick={fetchFavourites}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition-colors"
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-sky-300 dark:from-sky-900/30 dark:to-sky-900/30 mb-6">
            <Heart className="w-10 h-10 text-sky-500 dark:text-sky-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Your Wishlist is Empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start exploring and add your favorite packages to see them here!
          </p>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-800 hover:from-sky-700 hover:to-sky-700 text-white font-semibold shadow-lg shadow-sky-500/30 transition-all duration-300 hover:scale-105"
          >
            <Package className="w-5 h-5" />
            Explore Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md transition-all">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              My Wishlist
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You have {favoritePkgs.length} {favoritePkgs.length === 1 ? 'package' : 'packages'} saved
            </p>
          </div>
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