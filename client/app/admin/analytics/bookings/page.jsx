"use client";

import AdvancedBookingAnalytics from "@/Components/Admin/AdvancedBookingAnalytics";
import React from "react";

const BookingsAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold">Bookings Analytics</h2>
        <p className="text-sm text-gray-500">Detailed booking trends and performance</p>
      </div>

      <AdvancedBookingA
      nalytics />
    </div>
  );
};

export default BookingsAnalyticsPage;
