"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { Heart, TrendingUp, Package, Users, Star, Calendar } from "lucide-react";

const WishlistAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    };
  };

  const fetchAnalytics = async () => {
    if (!API_URL) return;
    
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/wishlist/analytics`, getAuthHeaders());
      setAnalytics(data.data);
    } catch (error) {
      console.error('Wishlist analytics error:', error);
      toast.error('Failed to fetch wishlist analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Heart className="mr-3 h-8 w-8 text-pink-600" />
            Wishlist Analytics
          </h2>
          <p className="text-gray-600">Insights into customer preferences and wishlist behavior</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Wishlist Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary.totalWishlistItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary.uniqueUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wishlisted Packages</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary.uniquePackages}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Items/User</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary.averageItemsPerUser}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Most Wished Packages */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          Most Wished Packages
        </h3>
        <div className="space-y-4">
          {analytics.mostWishedPackages?.slice(0, 10).map((item, index) => (
            <div key={item.packageId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-pink-600 font-medium">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.packageTitle}</p>
                  <p className="text-sm text-gray-600">{item.packageDestination}</p>
                  <p className="text-xs text-gray-500">
                    Priority Score: {item.averagePriority.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-pink-600">{item.wishlistCount}</p>
                <p className="text-sm text-gray-600">wishes</p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(item.packagePrice)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Priority Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.priorityDistribution?.map((priority) => (
            <div key={priority._id} className="text-center p-6 bg-gray-50 rounded-lg">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-3 ${getPriorityColor(priority._id)}`}>
                {priority._id} Priority
              </div>
              <p className="text-3xl font-bold text-gray-900">{priority.count}</p>
              <p className="text-sm text-gray-600">items</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wishlist Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          Wishlist Activity Trends
        </h3>
        <div className="space-y-4">
          {analytics.wishlistTrends?.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">
                  {new Date(trend._id.year, trend._id.month - 1).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{trend.count}</p>
                <p className="text-sm text-gray-600">new wishes</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Insights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlist Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Customer Engagement</h4>
            <p className="text-sm text-blue-800">
              Users with wishlists are more likely to make purchases. Focus on wishlist-to-booking conversion strategies.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Popular Destinations</h4>
            <p className="text-sm text-green-800">
              Track which destinations are most wished for to inform marketing and package development strategies.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Priority Patterns</h4>
            <p className="text-sm text-purple-800">
              High-priority wishlist items indicate strong purchase intent. Consider targeted promotions.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Seasonal Trends</h4>
            <p className="text-sm text-orange-800">
              Monitor wishlist activity to predict seasonal demand and plan inventory accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistAnalytics;