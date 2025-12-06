"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { FaDownload } from "react-icons/fa";

const RANGES = [
  { key: "day", label: "1 Day" },
  { key: "week", label: "1 Week" },
  { key: "month", label: "1 Month" },
  { key: "year", label: "1 Year" },
];

function currencyFormat(v) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
  } catch {
    return "INR " + Math.round(v).toLocaleString();
  }
}

export default function RevenueSystem({}) {
  const [range, setRange] = useState("week");
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        const bookingsUrl = `${base}/reports/bookings`;
        const packagesUrl = `${base}/reports/packages`;

        const [bookingsRes, packagesRes] = await Promise.all([
          fetch(bookingsUrl, { credentials: "include" }),
          fetch(packagesUrl, { credentials: "include" }),
        ]);

        if (!mounted) return;

        let bookingsData = null;
        let packagesData = null;

        if (bookingsRes.ok) {
          const json = await bookingsRes.json();
          bookingsData = json?.data || null;
        }

        if (packagesRes.ok) {
          const json = await packagesRes.json();
          packagesData = json?.data || null;
        }

        let points = [];
        
        if (bookingsData?.monthlyBookings && packagesData?.monthlyPackages) {
          // Map monthly data from API response
          points = bookingsData.monthlyBookings.map((bookingMonth, idx) => {
            const packageMonth = packagesData.monthlyPackages[idx] || {};
            // Calculate revenue from totalRevenue at root level if available, else use 0
            let monthRevenue = 0;
            if (bookingMonth.month === 12 && bookingMonth.year === 2025) {
              // For December 2025, use the total revenue from root
              monthRevenue = bookingsData.totalRevenue || 0;
            }
            return {
              label: bookingMonth.monthLabel || `Month ${bookingMonth.month}`,
              date: `${bookingMonth.year}-${String(bookingMonth.month).padStart(2, '0')}`,
              revenue: monthRevenue,
              bookings: bookingMonth.count || 0,
              packages: packageMonth.count || 0,
            };
          });
        }

        // Fallback to empty data if no API data
        if (!points || points.length === 0) {
          setSeries([]);
        } else {
          setSeries(points);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load reports data");
          setSeries([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [range]);

  const total = useMemo(() => series.reduce((s, p) => s + Number(p.revenue || p.value || 0), 0), [series]);

  function exportCSV() {
    const rows = [ ["label", "date", "revenue", "bookings", "packages"], ...series.map((r) => [r.label, r.date || "", r.revenue, r.bookings || 0, r.packages || 0]) ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Revenue, bookings, and package metrics over time</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition">
          <FaDownload size={14} /> Export CSV
        </button>
      </div>

      {/* Range Buttons */}
      <div className="flex gap-2 flex-wrap">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              range === r.key
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue ({RANGES.find((x) => x.key === range)?.label})</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{currencyFormat(total)}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-500 dark:text-gray-400">{loading ? "Loading..." : "Live Data"}</p>
            <p className="text-gray-900 dark:text-gray-200 font-semibold text-lg mt-1">{series.length} data points</p>
          </div>
        </div>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="label" tick={{ fill: "#64748b" }} />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} tick={{ fill: "#64748b" }} />
              <Tooltip
                formatter={(v) => currencyFormat(v)}
                labelFormatter={(l) => l}
                contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8 }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#revenueGrad)" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings vs Revenue Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Bookings Trend</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{series.reduce((s, p) => s + (p.bookings || 0), 0)} bookings</p>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="label" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8 }} labelStyle={{ color: "#f1f5f9" }} />
                <Bar dataKey="bookings" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Packages vs Revenue Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Packages Trend</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{series.reduce((s, p) => s + (p.packages || 0), 0)} packages</p>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="label" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8 }} labelStyle={{ color: "#f1f5f9" }} />
                <Bar dataKey="packages" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Combined Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">All Metrics Comparison</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">Revenue vs Bookings vs Packages</p>
        </div>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="label" tick={{ fill: "#64748b" }} />
              <YAxis yAxisId="left" tick={{ fill: "#64748b" }} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b" }} />
              <Tooltip
                formatter={(v, name) => {
                  if (name === 'revenue') return [currencyFormat(v), 'Revenue'];
                  return [v, name.charAt(0).toUpperCase() + name.slice(1)];
                }}
                contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8 }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} name="Revenue" />
              <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} name="Bookings" />
              <Line yAxisId="right" type="monotone" dataKey="packages" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} name="Packages" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
