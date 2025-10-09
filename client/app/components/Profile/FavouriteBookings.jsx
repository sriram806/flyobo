"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Heart } from 'lucide-react';
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';
import PackageCard from '@/app/components/Packages/PackageCard.jsx';

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

      const results = await Promise.allSettled(
        favIds.map((id) => axios.get(`${API_URL}/package/${id}`))
      );
      const items = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value?.data?.package || r.value?.data?.data || r.value?.data)
        .filter(Boolean);
      setFavoritePkgs(items);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 text-center">
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-gray-100">
        🚧 Page Under Maintenance
      </h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        We're working hard to bring you something amazing! Please check back soon.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200"
      >
        Refresh Page
      </button>
    </div>
  );
};

export default FavouriteBookings;