"use client";

import React, { useEffect, useMemo, useState } from "react";
import PieChart from "./PieChart";
import UserBarChart from "./UserBarChart";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

export default function AllUserAnalytics() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const base =
    NEXT_PUBLIC_BACKEND_URL

  // Fetch All Users
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${base}/user/get-all-users`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (mounted) setUsers(json?.users || []);
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
        const res = await fetch(`${base}/analytics/users`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
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

  // Count Admins / Users
  const counts = useMemo(() => {
    const c = { admin: 0, user: 0 };
    users.forEach((u) => {
      if (String(u.role).toLowerCase() === "admin") c.admin++;
      else c.user++;
    });
    return c;
  }, [users]);

  const recent = users.slice(0, 3);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* TOP 3 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700">
          <div className="text-gray-500 text-sm">Total Users</div>
          <div className="text-3xl font-semibold mt-1 text-gray-800 dark:text-gray-100">
            {users.length}
          </div>
        </div>

        <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700">
          <div className="text-gray-500 text-sm">Admins</div>
          <div className="text-3xl font-semibold mt-1 text-gray-800 dark:text-gray-100">
            {counts.admin}
          </div>
        </div>

        <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700">
          <div className="text-gray-500 text-sm">Users</div>
          <div className="text-3xl font-semibold mt-1 text-gray-800 dark:text-gray-100">
            {counts.user}
          </div>
        </div>
      </div>

      {/* PIE CHART + RECENT USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 flex justify-center">
          <PieChart items={counts} size={200} />
        </div>
        <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              Recent Users
            </h3>
            <div className="text-sm text-gray-500">Latest 3</div>
          </div>

          <ul className="divide-y dark:divide-gray-700">
            {recent.map((u) => (
              <li key={u._id} className="flex justify-between p-3 text-sm">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {u.name}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>

                <span className="text-lg px-1 py-1 rounded-md bg-gray-300 dark:bg-gray-700">
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* MONTHLY BAR CHART */}
      <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            Monthly Users
          </h3>
          <div className="text-sm text-gray-500">Last 12 months</div>
        </div>

        {analyticsLoading ? (
          <div className="p-6 text-center text-gray-500">Loading chart…</div>
        ) : analytics?.last12MonthsData?.length > 0 ? (
          <div className="overflow-auto">
            <UserBarChart
              dataPoints={analytics.last12MonthsData}
              size={{ width: 920, height: 260 }}
            />
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No analytics data available.
          </div>
        )}
      </div>
    </section>
  );
}
