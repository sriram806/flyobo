"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

const AdminDashboard = () => {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const [userAnalytics, setUserAnalytics] = useState({ last12Months: [], total: 0 });
  const [packageAnalytics, setPackageAnalytics] = useState({ last12Months: [], total: 0 });
  const [packageAdvanced, setPackageAdvanced] = useState({ topByBookings: [], priceBuckets: [], byDestination: [] });
  const [bookingsAnalytics, setBookingsAnalytics] = useState({ last12Months: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [latestUsers, setLatestUsers] = useState([]);
  const [recentPackages, setRecentPackages] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenue, setRevenue] = useState({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

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
        // Support new response shape where analytics are nested under `basic` and `advanced` keys
        if (pData.basic) {
          setPackageAnalytics({
            last12Months: pData.basic.last12Months || pData.basic.last12MonthsData || [],
            total: pData.basic.total ?? 0,
          });
        } else {
          setPackageAnalytics({
            last12Months: pData.last12MonthsData || pData.last12Months || [],
            total: pData.total ?? 0,
          });
        }

        // Advanced analytics (topByBookings, priceBuckets, byDestination)
        const adv = pData.advanced || {};
        setPackageAdvanced({
          topByBookings: adv.topByBookings || [],
          priceBuckets: adv.priceBuckets || [],
          byDestination: adv.byDestination || [],
        });

        // Bookings
        const { data: bookingsData } = await axios.get(`${API_URL}/analytics/bookings`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!mounted) return;
        const bData = bookingsData?.data || {};
        setBookingsAnalytics({
          last12Months: bData.last12MonthsData || [],
          total: bData.total ?? 0,
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
        setAllUsers(list);
      } catch (_) { }
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
        setAllPackages(list);
      } catch (_) { }
    };

    const fetchRecentBookings = async () => {
      if (!API_URL) return;
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const { data } = await axios.get(`${API_URL}/bookings`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const bookings = data?.bookings || data?.data || [];
        // Build lookup maps for email and package price/title
        const userById = new Map(allUsers.map(u => [String(u._id || u.id), u]));
        const packageById = new Map(allPackages.map(p => [String(p._id || p.id), p]));

        // Enrich bookings
        const enriched = bookings.map(b => {
          const u = userById.get(String(b.userId));
          const p = packageById.get(String(b.packageId));
          const price = Number(p?.price || 0);
          return {
            ...b,
            userEmail: u?.email || '',
            packageTitle: p?.title || '',
            amount: isNaN(price) ? 0 : price,
          };
        });

        // Sort by createdAt desc and take last 5
        const sorted = enriched.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setRecentBookings(sorted.slice(0, 5));

        // Compute revenue totals
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay); startOfWeek.setDate(startOfWeek.getDate() - 6); // last 7 days
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const sum = (from) => enriched.reduce((acc, b) => {
          const t = new Date(b.createdAt || 0);
          return acc + (t >= from ? (b.amount || 0) : 0);
        }, 0);

        setRevenue({
          daily: sum(startOfDay),
          weekly: sum(startOfWeek),
          monthly: sum(startOfMonth),
          yearly: sum(startOfYear),
        });
      } catch (_) { }
    };

    fetchAnalytics();
    fetchLatestUsers();
    fetchRecentPackages();
    // fetch bookings after lookups
    setTimeout(fetchRecentBookings, 0);

    return () => {
      mounted = false;
    };
  }, [API_URL, refreshCounter]);

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
  const bookingsSeries = useMemo(() => (bookingsAnalytics.last12Months || []).map((x) => {
    const value = Number(x?.value ?? x?.count ?? 0);
    let label = x?.label;
    if (!label && x?.month) {
      const [y, m] = String(x.month).split("-");
      const dt = new Date(Number(y), Number(m) - 1, 1);
      label = dt.toLocaleString(undefined, { month: "short" });
    }
    return { label: label ?? "", value };
  }), [bookingsAnalytics.last12Months]);
  const bookingsTrend = useMemo(() => calculateTrend(bookingsSeries), [bookingsSeries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Overview and quick actions for your travel platform.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshCounter((c) => c + 1)}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link href="/" target="_blank" className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
            View Site
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.6 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Users</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : userAnalytics.total}</div>
            <div className={`text-sm ${userTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>{userTrend >= 0 ? `▲ ${userTrend}%` : `▼ ${Math.abs(userTrend)}%`}</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3v5h8v-5h3a1 1 0 001-1V7M16 3H8v4h8V3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Packages</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : packageAnalytics.total}</div>
            <div className={`text-sm ${packageTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>{packageTrend >= 0 ? `▲ ${packageTrend}%` : `▼ ${Math.abs(packageTrend)}%`}</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3 8 4-16 3 8h4" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Bookings</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : bookingsAnalytics.total}</div>
            <div className={`text-sm ${bookingsTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>{bookingsTrend >= 0 ? `▲ ${bookingsTrend}%` : `▼ ${Math.abs(bookingsTrend)}%`}</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.12-3 2.5S10.343 13 12 13s3-1.12 3-2.5S13.657 8 12 8z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Revenue (Today)</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{Number(revenue.daily || 0).toLocaleString('en-IN')}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Weekly ₹{Number(revenue.weekly || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Services Panel */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Services</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quick access to backend services and administration pages.</p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Status: <span className="text-green-600">Connected</span></div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'users', title: 'Users', count: userAnalytics.total, href: '/admin?tab=users', color: 'bg-blue-50', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.6 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
            { key: 'packages', title: 'Packages', count: packageAnalytics.total, href: '/admin?tab=package', color: 'bg-green-50', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3v5h8v-5h3a1 1 0 001-1V7M16 3H8v4h8V3z" /></svg>) },
            { key: 'bookings', title: 'Bookings', count: bookingsAnalytics.total, href: '/admin?tab=bookings', color: 'bg-yellow-50', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3 8 4-16 3 8h4" /></svg>) },
            { key: 'gallery', title: 'Gallery', count: undefined, href: '/admin?tab=gallery', color: 'bg-emerald-50', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /></svg>) },
            { key: 'analytics', title: 'Analytics', count: undefined, href: '/admin?tab=analytics', color: 'bg-sky-50', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18M4 7h14M4 12h9M4 17h6" /></svg>) },
            { key: 'contacts', title: 'Contacts / Notifications', count: undefined, href: '/admin?tab=contacts', color: 'bg-gray-50', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>) },
            { key: 'referrals', title: 'Referrals', count: undefined, href: '/admin/referrals', color: 'bg-rose-50', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.618V14a2 2 0 01-1.447 1.938L16 18M9 14l-4.553 2.276A2 2 0 013 14.382V10a2 2 0 011.447-1.938L8 6" /></svg>) },
            { key: 'otp', title: 'OTP Service', count: undefined, href: '/', color: 'bg-indigo-50', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-3 p-3 rounded border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className={`p-2 rounded-md ${s.color} flex items-center justify-center`}>{s.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">{s.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.count !== undefined ? `${s.count} items` : 'Manage and inspect'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={s.href} className="text-sm text-sky-600 hover:underline">Open</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue overview */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
            <div className="text-lg font-semibold">₹{Number(revenue.daily).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Last 7 Days</div>
            <div className="text-lg font-semibold">₹{Number(revenue.weekly).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">This Month</div>
            <div className="text-lg font-semibold">₹{Number(revenue.monthly).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">This Year</div>
            <div className="text-lg font-semibold">₹{Number(revenue.yearly).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Package Advanced Analytics */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Package Analytics</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Advanced package insights (top packages, destinations, price buckets)</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Updated: just now</div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
              <div className="text-xs text-gray-500">Top By Bookings</div>
              <div className="mt-2 space-y-2 text-sm text-gray-900 dark:text-white">
                {packageAdvanced.topByBookings && packageAdvanced.topByBookings.length > 0 ? (
                  packageAdvanced.topByBookings.map((t, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="truncate">{t.name || t.title || t.package || '—'}</div>
                      <div className="text-gray-500">{t.count ?? t.bookings ?? 0}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No data available.</div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
              <div className="text-xs text-gray-500">By Destination</div>
              <div className="mt-2 space-y-2 text-sm text-gray-900 dark:text-white">
                {packageAdvanced.byDestination && packageAdvanced.byDestination.length > 0 ? (
                  packageAdvanced.byDestination.map((d, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="truncate">{d.destination || d.name || '—'}</div>
                      <div className="text-gray-500">{d.count ?? d.bookings ?? 0}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No data available.</div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
              <div className="text-xs text-gray-500">Price Buckets</div>
              <div className="mt-2 space-y-2 text-sm text-gray-900 dark:text-white">
                {packageAdvanced.priceBuckets && packageAdvanced.priceBuckets.length > 0 ? (
                  packageAdvanced.priceBuckets.map((b, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="truncate">{b.range || b.label || `Bucket ${i + 1}`}</div>
                      <div className="text-gray-500">{b.count ?? 0}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No data available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Users */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Users</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recently joined travelers (latest 5)</p>
            </div>
            <Link href="/admin?tab=users" className="text-sm text-sky-600 hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {latestUsers.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No recent users.</div>
            ) : (
              latestUsers.map((u) => (
                <div key={u._id || u.id || u.email} className="flex items-center gap-3 p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold">{initials(u.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{u.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Packages & Bookings */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Packages</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recently added or updated</p>
              </div>
              <Link href="/admin?tab=package" className="text-sm text-sky-600 hover:underline mt-2 sm:mt-0">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {recentPackages.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No packages available.</div>
              ) : (
                recentPackages.map((p) => (
                  <div
                    key={p._id || p.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{p.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {p.destination || "-"} · {p.duration ?? p.days ?? 0} days
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-0">
                      ₹{Number(p.price || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
