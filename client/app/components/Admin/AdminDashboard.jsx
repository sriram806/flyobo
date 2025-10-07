"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import Link from "next/link";

const StatCard = ({ label, value, trend }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4">
    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
    <div className="mt-1 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
      {value}
      {trend !== undefined && (
        <span className={`text-sm font-semibold ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const [userAnalytics, setUserAnalytics] = useState({ last12Months: [], total: 0 });
  const [packageAnalytics, setPackageAnalytics] = useState({ last12Months: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [latestUsers, setLatestUsers] = useState([]);
  const [recentPackages, setRecentPackages] = useState([]);

  const initials = (name = "") => {
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || "U";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  };

  const calculateTrend = (series) => {
    if (series.length < 2) return 0;
    const last = series[series.length - 1].value || 0;
    const prev = series[series.length - 2].value || 0;
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  };

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      if (!API_URL) return;
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        // Users
        const { data: userData } = await axios.get(`${API_URL}/analytics/users`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!mounted) return;
        const uData = userData?.data || {};
        setUserAnalytics({
          last12Months: uData.last12MonthsData || [],
          total: uData.total ?? 0,
        });

        // Packages
        const { data: packageData } = await axios.get(`${API_URL}/analytics/packages`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!mounted) return;
        const pData = packageData?.data || {};
        setPackageAnalytics({
          last12Months: pData.last12MonthsData || [],
          total: pData.total ?? 0,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestUsers = async () => {
      if (!API_URL) return;
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const { data } = await axios.get(`${API_URL}/user/get-all-users`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const list = data?.users || data?.data || [];
        setLatestUsers(list.slice(0, 5));
      } catch (_) {}
    };

    const fetchRecentPackages = async () => {
      if (!API_URL) return;
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const { data } = await axios.get(`${API_URL}/package/get-packages`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const list = Array.isArray(data?.packages) ? data.packages : data?.data?.packages || [];
        const sortByDate = (x) => new Date(x?.updatedAt || x?.createdAt || 0).getTime();
        setRecentPackages([...list].sort((a, b) => sortByDate(b) - sortByDate(a)).slice(0, 5));
      } catch (_) {}
    };

    fetchAnalytics();
    fetchLatestUsers();
    fetchRecentPackages();

    return () => {
      mounted = false;
    };
  }, [API_URL]);

  // Build normalized series for charts and trend
  const userSeries = useMemo(() => (userAnalytics.last12Months || []).map((x) => {
    const value = Number(x?.value ?? x?.count ?? 0);
    let label = x?.label;
    if (!label && x?.month) {
      const [y, m] = String(x.month).split("-");
      const dt = new Date(Number(y), Number(m) - 1, 1);
      label = dt.toLocaleString(undefined, { month: "short" });
    }
    return { label: label ?? "", value };
  }), [userAnalytics.last12Months]);
  const packageSeries = useMemo(() => (packageAnalytics.last12Months || []).map((x) => {
    const value = Number(x?.value ?? x?.count ?? 0);
    let label = x?.label;
    if (!label && x?.month) {
      const [y, m] = String(x.month).split("-");
      const dt = new Date(Number(y), Number(m) - 1, 1);
      label = dt.toLocaleString(undefined, { month: "short" });
    }
    return { label: label ?? "", value };
  }), [packageAnalytics.last12Months]);
  const userTrend = useMemo(() => calculateTrend(userSeries), [userSeries]);
  const packageTrend = useMemo(() => calculateTrend(packageSeries), [packageSeries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Overview of your platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={loading ? "..." : userAnalytics.total} trend={userTrend} />
        <StatCard label="Total Packages" value={loading ? "..." : packageAnalytics.total} trend={packageTrend} />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">New Users</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Recently joined travelers (latest 5)</p>
        {loading ? <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p> : (
          latestUsers.length === 0 ? <p className="text-sm text-gray-600 dark:text-gray-400">No recent users.</p> :
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2">Avatar</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {latestUsers.map((u) => (
                    <tr key={u._id || u.id || u.email} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2">
                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                          {initials(u.name)}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">{u.name || "Unknown"}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>

      {/* Recent Packages */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Packages</h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Recently added or updated (latest 5)</p>
          </div>
          <Link href="/admin/packages" className="text-sm text-sky-600 hover:underline">View all</Link>
        </div>
        {recentPackages.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No packages available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Destination</th>
                  <th className="px-4 py-2">Duration</th>
                  <th className="px-4 py-2">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentPackages.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{p.title}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.destination || '-'}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.duration ?? p.days ?? 0} days</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">₹{Number(p.price || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
