"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CreditCard, 
  Eye, 
  Download,
  Filter,
  Search,
  TrendingUp,
  Award,
  Star,
  RefreshCw
} from 'lucide-react';
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';

const FavouriteBookings = () => {
  const user = useSelector((state) => state?.auth?.user);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    };
  };

  const fetchBookings = async () => {
    if (!API_URL) return;
    
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: 6,
        status: statusFilter,
        sortBy: sortBy
      };

      const { data } = await axios.get(`${API_URL}/user/my-bookings`, {
        ...getAuthHeaders(),
        params
      });

      setBookings(data.data?.bookings || []);
      setTotalPages(data.data?.pagination?.total || 1);
      
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to fetch bookings';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!API_URL) return;
    
    try {
      const { data } = await axios.get(`${API_URL}/user/booking-stats`, getAuthHeaders());
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch booking stats:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchStats();
    }
  }, [user, currentPage, statusFilter, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBookings = bookings.filter(booking => 
    booking.packageId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.packageId?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          <p className="text-gray-600">You need to be logged in to view your bookings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-600">Manage and track your travel bookings</p>
        </div>
        <button
          onClick={() => { fetchBookings(); fetchStats(); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary.completedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.summary.totalSpent)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Booking</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.summary.averageBookingValue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Latest First</option>
              <option value="startDate">By Travel Date</option>
              <option value="amount">By Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border">
            <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start exploring our amazing packages!</p>
            <Link
              href="/packages"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Packages
            </Link>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Package Image */}
                  <div className="lg:w-48 h-32 lg:h-auto">
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <Image
                        src={booking.packageId?.images?.[0]?.url || '/images/placeholder.jpg'}
                        alt={booking.packageId?.title || 'Package'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {booking.packageId?.title || 'Package Title'}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.packageId?.destination || 'Destination'}
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                        {booking.status || 'pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Booked</p>
                          <p>{formatDate(booking.createdAt)}</p>
                        </div>
                      </div>
                      
                      {booking.startDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <div>
                            <p className="font-medium">Travel Date</p>
                            <p>{formatDate(booking.startDate)}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Travelers</p>
                          <p>{booking.travelers || 1} {booking.travelers === 1 ? 'person' : 'people'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Amount</p>
                          <p className="font-bold text-blue-600">{formatCurrency(booking.totalAmount)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/packages/${booking.packageId?.slug || booking.packageId?._id}`}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Package
                      </Link>
                      
                      <button
                        onClick={() => {
                          // Generate booking receipt/invoice
                          const bookingDetails = {
                            id: booking._id,
                            package: booking.packageId?.title,
                            destination: booking.packageId?.destination,
                            amount: booking.totalAmount,
                            status: booking.status,
                            bookingDate: booking.createdAt,
                            travelDate: booking.startDate,
                            travelers: booking.travelers
                          };
                          
                          const content = `
Booking Receipt
================
Booking ID: ${bookingDetails.id}
Package: ${bookingDetails.package}
Destination: ${bookingDetails.destination}
Amount: ${formatCurrency(bookingDetails.amount)}
Status: ${bookingDetails.status}
Booking Date: ${formatDate(bookingDetails.bookingDate)}
Travel Date: ${bookingDetails.travelDate ? formatDate(bookingDetails.travelDate) : 'Not specified'}
Travelers: ${bookingDetails.travelers}
                          `;
                          
                          const blob = new Blob([content], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `booking-${booking._id}.txt`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </button>
                      
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => {
                            toast.success('Review feature coming soon!');
                          }}
                          className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 border rounded-md ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Favorite Destinations */}
      {stats?.favoriteDestinations && stats.favoriteDestinations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Your Favorite Destinations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.favoriteDestinations.map((dest, index) => (
              <div key={dest._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{dest._id}</p>
                    <p className="text-sm text-gray-600">{dest.count} visits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{formatCurrency(dest.totalSpent)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavouriteBookings;
