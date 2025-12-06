"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import BookingBarChart from "./BookingBarChart";
import BookingPieChart from "./BookingPieChart";

export default function AllBookingsAnalytics() {
  const base = NEXT_PUBLIC_BACKEND_URL;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadReport() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${base}/reports/bookings`, { withCredentials: true });
        if (mounted) setReport(data?.data || null);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || err.message || "Failed to fetch report");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadReport();
    return () => (mounted = false);
  }, [base]);

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!report) return <div className="p-6 text-center text-gray-500 dark:text-gray-300">No data available</div>;

  const {
    totalBookings,
    totalRevenue,
    avgBookingValue,
    statusCounts,
    monthlyBookings,
    paymentMethods,
    recentBookings,
    topPackages,
    topBookingUsers,
  } = report;

  const chartHeight = 350; // set same height for both charts

  return (
    <section className="p-5 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-6">

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 text-center">
          <div className="text-gray-500 text-sm">Total Bookings</div>
          <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{totalBookings}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 text-center">
          <div className="text-gray-500 text-sm">Total Revenue</div>
          <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100">₹{totalRevenue}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 text-center">
          <div className="text-gray-500 text-sm">Average Booking</div>
          <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100">₹{avgBookingValue}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 text-center">
          <div className="text-gray-500 text-sm">Confirmed</div>
          <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{statusCounts.confirmed || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* PIE CHART */}
        <div className="lg:col-span-4">
          <BookingPieChart
            paymentMethods={paymentMethods}
            height={350}
          />
        </div>

        {/* BAR CHART */}
        <div className="lg:col-span-8">
          <BookingBarChart dataPoints={monthlyBookings} height={350} />
        </div>

      </div>


      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Bookings</h3>
        <ul className="divide-y dark:divide-gray-700">
          {recentBookings.length === 0 ? (
            <li className="p-3 text-sm text-gray-500">No recent bookings.</li>
          ) : (
            recentBookings.map((b) => (
              <li key={b._id} className="flex justify-between p-3 text-sm">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">{b.package.title || "Unknown"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">By: {b.user.name}</div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  ₹{b.totalAmount} · {b.status}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      {/* Top Packages & Top Booking Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Packages */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 h-[400px] overflow-y-auto">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 text-lg">Top Packages</h3>
          <ul className="divide-y dark:divide-gray-700">
            {topPackages.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">No top packages available.</li>
            ) : (
              topPackages.map((p) => (
                <li key={p._id} className="p-3 flex justify-between items-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{p.title || "Unknown"}</div>
                    <div className="text-xs text-gray-500">ID: {p.packageId}</div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {p.bookingsCount} bookings · ₹{p.totalRevenue ?? 0}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Top Booking Users */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 h-[400px] overflow-y-auto">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 text-lg">Top Booking Users</h3>
          <ul className="divide-y dark:divide-gray-700">
            {topBookingUsers.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">No top users available.</li>
            ) : (
              topBookingUsers.map((u) => (
                <li key={u._id} className="p-3 flex justify-between items-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{u.name}</div>
                    <div className="text-xs text-gray-500">Email: {u.email}</div>
                    <div className="text-xs text-gray-500">Role: {u.role}</div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {u.bookingsCount} bookings · ₹{u.totalSpent ?? 0}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
