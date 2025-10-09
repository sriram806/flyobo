"use client";

import React, { useState } from "react";
import AdminProtected from "../../hooks/adminProtected";
import BookingAnalytics from "../../components/Admin/BookingAnalytics";
import { BarChart3, Heart, TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('bookings');

  const tabs = [
    {
      id: 'bookings',
      name: 'Booking Analytics',
      icon: BarChart3,
      component: BookingAnalytics
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || BookingAnalytics;

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="mr-3 h-8 w-8 text-blue-600" />
                  Advanced Analytics
                </h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive insights into your business performance
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
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
          </div>

          {/* Analytics Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </AdminProtected>
  );
}