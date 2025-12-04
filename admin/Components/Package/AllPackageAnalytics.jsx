"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import PieChart from "../User/PieChart";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import PackageBarChart from "./PackageBarchart";

export default function AllPackageAnalytics() {
  const base = NEXT_PUBLIC_BACKEND_URL;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch reports/packages
  useEffect(() => {
    let mounted = true;
    async function loadReport() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${base}/reports/packages`, { withCredentials: true });
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

  const { statusCounts, monthlyPackages, totalPackages, topPackages, featuredCount, domesticCount, internationalCount } = report;

  const latestPackages = topPackages.slice(0, 4);

  return (
    <section className="p-5 bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 text-center">
          <div className="text-gray-500 text-sm">Total Packages</div>
          <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{totalPackages}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 text-center">
          <div className="text-gray-500 text-sm">Active</div>
          <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{statusCounts.active}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 text-center">
          <div className="text-gray-500 text-sm">Draft</div>
          <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{statusCounts.draft}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 text-center">
          <div className="text-gray-500 text-sm">Featured</div>
          <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{featuredCount}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 flex justify-center items-center">
          <PieChart items={{ active: statusCounts.active, draft: statusCounts.draft }} size={200} />
        </div>

        {/* Latest Packages */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 lg:col-span-2">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Latest Packages</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">Top 4</span>
          </div>
          <ul className="divide-y dark:divide-gray-700">
            {latestPackages.map((p) => (
              <li key={p._id} className="flex justify-between p-3 text-sm">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">{p.title || "Unknown"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {p.destination || "-"} · {p.duration || "-"} days
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700">
                  ₹{p.totalSpent ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Monthly Packages Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mb-6">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Monthly Packages</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">Last 12 months</span>
        </div>
        <PackageBarChart dataPoints={monthlyPackages} size={{ width: 920, height: 260 }} />
      </div>

      {/* Top Packages Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Top Packages</h3>
        <ul className="divide-y dark:divide-gray-700">
          {topPackages.length === 0 ? (
            <li className="p-3 text-sm text-gray-500">No top packages available.</li>
          ) : (
            topPackages.map((p) => (
              <li key={p._id} className="p-3 flex justify-between text-sm">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">{p.title || "Unknown"}</div>
                  <div className="text-xs text-gray-500">ID: {p.packageId}</div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {p.bookingsCount} bookings · ₹{p.totalSpent ?? 0}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
