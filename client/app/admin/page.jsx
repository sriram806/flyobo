"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import Loading from "@/Components/LoadingScreen/Loading"
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";
import AdminDashboard from "@/Components/Admin/AdminDashboard";
import AdminUsers from "@/Components/Admin/AdminUsers";
import AdminPackages from "@/Components/Admin/AdminPackages";
import AdminBookings from "@/Components/Admin/AdminBookings";
import AdminContacts from "@/Components/Admin/AdminContacts";
import AdminEditHome from "./home/page";

function AdminAnalytics() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7");
  const [analyticsData, setAnalyticsData] = useState({
    users: { total: 0, data: [], labels: [], raw: { departments: [] } },
    packages: { total: 0, data: [], labels: [] },
    bookings: { total: 0, data: [], labels: [] },
  });

  const periods = [
    { value: "1", label: "24 Hours" },
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "180", label: "6 Months" },
    { value: "365", label: "1 Year" },
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!API_URL) return;
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const config = {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          params: { period },
        };

        const [usersRes, packagesRes, bookingsRes] = await Promise.all([
          axios.get(`${API_URL}/analytics/users`, config),
          axios.get(`${API_URL}/analytics/packages`, config),
          axios.get(`${API_URL}/analytics/bookings`, config),
        ]);

        const usersData = usersRes?.data?.data || { last12MonthsData: [], total: 0, departments: [] };
        const packagesData = packagesRes?.data?.data || { last12MonthsData: [], total: 0 };
        const bookingsData = bookingsRes?.data?.data || { last12MonthsData: [], total: 0 };

        const usersChart = usersData.last12MonthsData || [];
        const packagesChart = packagesData.last12MonthsData || [];
        const bookingsChart = bookingsData.last12MonthsData || [];

        setAnalyticsData({
          users: { total: usersData.total || 0, data: usersChart, labels: usersChart.map((d) => d.month), raw: usersData },
          packages: { total: packagesData.total || 0, data: packagesChart, labels: packagesChart.map((d) => d.month) },
          bookings: { total: bookingsData.total || 0, data: bookingsChart, labels: bookingsChart.map((d) => d.month) },
        });
      } catch {
        // silent fail — UI will show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [API_URL, period]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 p-12 rounded border border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <Loadind />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Real-time data analysis and insights</p>

        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p.value ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analyticsData.users.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Packages</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analyticsData.packages.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analyticsData.bookings.total}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Users (by period)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analyticsData.users.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Packages (by period)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analyticsData.packages.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" name="Packages" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Users by Department / Role</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={analyticsData.users.raw?.departments || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {(analyticsData.users.raw?.departments || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"][index % 5]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  return (
    <>
      {tab === "dashboard" && <AdminDashboard />}
      {tab === "users" && <AdminUsers />}
      {tab === "package" && <AdminPackages />}
      {tab === "bookings" && <AdminBookings />}
      {tab === "analytics" && <AdminAnalytics />}
      {tab === "contacts" && <AdminContacts />}
      {tab === "home" && <AdminEditHome />}
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div><Loading /></div>}>
      <AdminPageContent />
    </Suspense>
  );
}
