"use client";

import React from "react";
import AdvancedBookingAnalytics from "@/app/components/Admin/AdvancedBookingAnalytics";

const BookingsAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold">Bookings Analytics</h2>
        <p className="text-sm text-gray-500">Detailed booking trends and performance</p>
      </div>

      <AdvancedBookingAnalytics />
    </div>
  );
};

export default BookingsAnalyticsPage;
