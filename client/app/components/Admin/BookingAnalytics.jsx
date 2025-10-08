"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  MapPin, 
  BarChart3, 
  PieChart,
  RefreshCw,
  Download,
  Filter
} from "lucide-react";

const BookingAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [segments, setSegments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('12months');
  const [activeTab, setActiveTab] = useState('overview');

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
      
      const [analyticsRes, trendsRes, segmentsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/bookings/analytics/overview`, {
          ...getAuthHeaders(),
          params: { timeRange }
        }),
        axios.get(`${API_URL}/bookings/analytics/trends`, {
          ...getAuthHeaders(),
          params: { period: 'monthly', metric: 'bookings' }
        }),
        axios.get(`${API_URL}/bookings/analytics/segments`, getAuthHeaders())
      ]);

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data.data);
      }
      
      if (trendsRes.status === 'fulfilled') {
        setTrends(trendsRes.value.data.data);
      }
      
      if (segmentsRes.status === 'fulfilled') {
        setSegments(segmentsRes.value.data.data);
      }
      
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value}%`;
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(change)}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, actions }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your booking performance</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'revenue', name: 'Revenue', icon: DollarSign },
            { id: 'customers', name: 'Customers', icon: Users },
            { id: 'destinations', name: 'Destinations', icon: MapPin }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Bookings"
              value={analytics.summary.totalBookings.toLocaleString()}
              change={analytics.summary.growthRates?.bookingsGrowth}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(analytics.summary.totalRevenue)}
              change={analytics.summary.growthRates?.revenueGrowth}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Average Booking Value"
              value={formatCurrency(analytics.summary.averageBookingValue)}
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="Conversion Rate"
              value={`${analytics.summary.conversionRate}%`}
              icon={PieChart}
              color="orange"
            />
          </div>

          {/* Revenue Chart */}
          <ChartCard title="Revenue Trends">
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Revenue chart would be rendered here</p>
                <p className="text-sm">Integration with chart library needed</p>
              </div>
            </div>
          </ChartCard>

          {/* Status Distribution */}
          <ChartCard title="Booking Status Distribution">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.statusDistribution?.map((status) => (
                <div key={status._id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                  <p className="text-sm text-gray-600 capitalize">{status._id}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(status.totalRevenue)}
                  </p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && analytics && (
        <div className="space-y-6">
          <ChartCard title="Revenue by Month">
            <div className="space-y-4">
              {analytics.revenueAnalytics?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{item.bookingCount} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(item.totalRevenue)}</p>
                    <p className="text-sm text-gray-600">
                      Avg: {formatCurrency(item.averageBookingValue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {analytics?.customerAnalytics && (
            <ChartCard title="Top Customers">
              <div className="space-y-4">
                {analytics.customerAnalytics.slice(0, 10).map((customer, index) => (
                  <div key={customer.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-medium">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.userName}</p>
                        <p className="text-sm text-gray-600">{customer.userEmail}</p>
                        <p className="text-xs text-gray-500">
                          {customer.totalBookings} bookings • {customer.customerType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-sm text-gray-600">
                        Avg: {formatCurrency(customer.averageBookingValue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          {segments && (
            <ChartCard title="Customer Segments">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {segments.map((segment) => (
                  <div key={segment._id} className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">{segment.count}</p>
                    <p className="text-lg font-medium text-gray-700 capitalize">{segment._id}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Avg Bookings: {segment.averageBookings.toFixed(1)}</p>
                      <p>Avg Spent: {formatCurrency(segment.averageSpent)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </div>
      )}

      {/* Destinations Tab */}
      {activeTab === 'destinations' && analytics?.topDestinations && (
        <div className="space-y-6">
          <ChartCard title="Top Destinations">
            <div className="space-y-4">
              {analytics.topDestinations.map((destination, index) => (
                <div key={destination._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{destination._id}</p>
                      <p className="text-sm text-gray-600">{destination.bookingCount} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(destination.totalRevenue)}</p>
                    <p className="text-sm text-gray-600">
                      Avg: {formatCurrency(destination.averagePrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
};

export default BookingAnalytics;