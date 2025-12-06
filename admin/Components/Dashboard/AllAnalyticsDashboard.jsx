"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const statCards = [
  { key: "totalUsers", label: "Total Users" },
  { key: "totalManagers", label: "Managers" },
  { key: "totalPackages", label: "Packages" },
  { key: "totalBookings", label: "Bookings" },
  { key: "totalDestinations", label: "Destinations" },
  { key: "featuredPackages", label: "Featured Packages" },
  { key: "activePackages", label: "Active Packages" },
  { key: "recentBookingsCount", label: "Recent Bookings (7d)" },
];

export default function AllAnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/reports/dashboard`, { withCredentials: true });
        if (mounted) setData(res?.data?.data || null);
      } catch (err) {
        if (mounted)
          setError(err?.response?.data?.message || err.message || "Failed to load dashboard report");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchReport();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = data?.totals || {};
  const revenue = totals.totalRevenue ?? data?.totalRevenue ?? 0;

  // Build one-week chart data from API structure
  const buildWeekData = () => {
    const wc = data?.weeklyCharts;
    if (!wc) return [];
    const labels = wc.dayLabels || [];

    // bookings counts and revenues arrays
    const bookingCounts = wc.bookings?.counts || [];
    const bookingRevenues = wc.bookings?.revenues || [];
    const users = wc.users || [];
    const packages = wc.packages || [];
    const destinations = wc.destinations || [];

    const week = labels.map((label, i) => ({
      day: label,
      bookings: Number(bookingCounts[i] ?? 0),
      revenue: Number(bookingRevenues[i] ?? 0),
      users: Number(users[i] ?? 0),
      packages: Number(packages[i] ?? 0),
      destinations: Number(destinations[i] ?? 0),
    }));

    return week;
  };

  const weekData = buildWeekData();

  return (
    <section className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Key metrics across users, bookings, and packages.</p>
        </div>
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      {data && (
        <>
          {/* Revenue highlight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="card col-span-2 flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">INR {revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Lifetime revenue from all bookings</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold">INR</span>
              </div>
            </div>

            <div className="card p-4">
              <p className="text-sm text-gray-500">Bookings Snapshot</p>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <p className="text-xl font-semibold">{totals.totalBookings ?? data.totalBookings ?? 0}</p>
                  <p className="text-xs text-gray-500">Total bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">{data.activeBookings ?? totals.activeBookings ?? 0} active</p>
                  <p className="text-sm text-amber-600">{data.pendingBookings ?? totals.pendingBookings ?? 0} pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Line chart card for 1-week data */}
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Weekly Bookings</p>
                <p className="text-lg font-semibold">Last 7 days - Bookings and Revenue</p>
              </div>
              <div className="text-sm text-gray-500">
                Total: {weekData.reduce((s, x) => s + x.bookings, 0)} bookings - INR {weekData.reduce((s, x) => s + x.revenue, 0).toLocaleString()}
              </div>
            </div>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={weekData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'revenue') return [`INR ${Number(value).toLocaleString()}`, 'Revenue'];
                    return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                  }} />
                  <Legend />

                  <Line yAxisId="left" type="monotone" dataKey="bookings" name="Bookings" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stat cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((c) => (
              <div key={c.key} className="card p-4">
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-semibold mt-1">{(totals && (totals[c.key] ?? data[c.key])) ?? (data[c.key] ?? 0)}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Recent Users</p>
                  <p className="text-lg font-semibold">Latest registrations</p>
                </div>
                <span className="text-xs text-gray-500">Last 5</span>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {(data?.recentActivity?.recentUsers || []).length === 0 && (
                  <p className="text-sm text-gray-500">No recent users.</p>
                )}
                {(data?.recentActivity?.recentUsers || []).map((u) => (
                  <div key={u._id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 capitalize">{u.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Recent Bookings</p>
                  <p className="text-lg font-semibold">Latest confirmations</p>
                </div>
                <span className="text-xs text-gray-500">Last 5</span>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {(data?.recentActivity?.recentBookings || []).length === 0 && (
                  <p className="text-sm text-gray-500">No recent bookings.</p>
                )}
                {(data?.recentActivity?.recentBookings || []).map((b) => {
                  const amount = b.payment?.amount ?? b.totalAmount ?? 0;
                  return (
                    <div key={b._id} className="py-2 flex items-start justify-between">
                      <div className="pr-3">
                        <p className="text-sm font-medium">{b.packageId?.title || "Package"}</p>
                        <p className="text-xs text-gray-500">{b.userId?.name || b.customerInfo?.name} - {b.status}</p>
                        <p className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">INR {amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{b.payment?.status || "pending"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !data && !error && <div className="text-sm text-gray-500">No data available.</div>}
    </section>
  );
}
