"use client";

import React, { useEffect, useMemo, useState } from "react";
import PieChart from "../User/PieChart";
import UserBarChart from "../User/UserBarChart";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

export default function AllPackageAnalytics() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const base = NEXT_PUBLIC_BACKEND_URL;

  // Fetch All Packages
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${base}/package/get-packages`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (mounted) setPackages(json?.packages || json?.data || []);
        }
      } catch (e) {
        if (mounted) setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [base]);

  // Fetch Analytics
  useEffect(() => {
    let mounted = true;
    async function loadAnalytics() {
      setAnalyticsLoading(true);
      try {
        const res = await fetch(`${base}/analytics/packages`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          console.log(json);
          
          if (mounted) setAnalytics(json?.data || null);
        }
      } catch (e) {
        if (mounted) setAnalytics(null);
      } finally {
        if (mounted) setAnalyticsLoading(false);
      }
    }
    loadAnalytics();
    return () => (mounted = false);
  }, [base]);

  // Count Active / Draft
  const counts = useMemo(() => {
    const c = { active: 0, draft: 0 };
    packages.forEach((p) => {
      const s = (p.Status || p.status || "").toLowerCase();
      if (s === "draft") c.draft++;
      else c.active++;
    });
    return c;
  }, [packages]);

  const recent = packages.slice(0, 3);

  const monthly = analytics?.basic?.last12Months || [];
  const totalBookings = analytics?.basic?.total ?? 0;
  const topByBookings = analytics?.advanced?.topByBookings || [];
  const byDestination = analytics?.advanced?.byDestination || [];

  return (
    <section className="pr-5 pl-5 bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* TOP 3 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700">
          <div className="text-gray-500 text-sm">Total Packages</div>
          <div className="text-3xl font-semibold mt-1 text-gray-800 dark:text-gray-100">
            {packages.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700">
          <div className="text-gray-500 text-sm">Active</div>
          <div className="text-3xl font-semibold mt-1 text-gray-800 dark:text-gray-100">
            {counts.active}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700">
          <div className="text-gray-500 text-sm">Draft</div>
          <div className="text-3xl font-semibold mt-1 text-gray-800 dark:text-gray-100">
            {counts.draft}
          </div>
        </div>
      </div>

      {/* PIE CHART + RECENT PACKAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* ⭐ Bigger Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 flex justify-center">
          <PieChart items={counts} size={200} />
        </div>

        {/* RECENT PACKAGES LIST */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Recent Packages</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">Latest 3</div>
          </div>

          <ul className="divide-y dark:divide-gray-700">
            {recent.map((p) => (
              <li key={p._id} className="flex justify-between p-3 text-sm">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">{p.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{p.destination} · {p.duration} days</div>
                </div>

                <span className="text-xs px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700">
                  {typeof p.price === 'number' ? `₹${p.price}` : p.price}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* MONTHLY BAR CHART */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Monthly Packages</h3>
          <div className="text-sm text-gray-500">Last 12 months</div>
        </div>

        {analyticsLoading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-300">Loading chart…</div>
        ) : monthly.length > 0 ? (
          <div className="overflow-auto">
            <UserBarChart dataPoints={monthly} size={{ width: 920, height: 260 }} />
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">No analytics data available.</div>
        )}
      </div>
      
      {/* Advanced summaries */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Top Packages (by bookings)</h3>
              <div className="text-sm text-gray-500">Total bookings: {totalBookings}</div>
            </div>
            <ul className="divide-y dark:divide-gray-700">
              {topByBookings.length === 0 ? (
                <li className="p-3 text-sm text-gray-500">No top packages data.</li>
              ) : (
                topByBookings.map((t) => (
                  <li key={t._id} className="p-3 text-sm flex justify-between">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{t.packageName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">id: {t._id}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-800 dark:text-gray-200">{t.bookings} bookings</div>
                      <div className="text-xs text-gray-500">₹{t.revenue ?? 0}</div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">By Destination</h3>
              <div className="text-sm text-gray-500">Buckets</div>
            </div>
            <ul className="divide-y dark:divide-gray-700">
              {byDestination.length === 0 ? (
                <li className="p-3 text-sm text-gray-500">No destination data.</li>
              ) : (
                byDestination.map((d, idx) => (
                  <li key={idx} className="p-3 text-sm flex justify-between">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{d._id || 'Unknown'}</div>
                    <div className="text-right text-sm text-gray-500">{d.bookings} bookings · ₹{d.revenue ?? 0}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
