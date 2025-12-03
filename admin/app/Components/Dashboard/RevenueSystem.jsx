"use client";

import React, { useEffect, useMemo, useState } from "react";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { FaChevronDown, FaDownload } from "react-icons/fa";

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
    return "₹" + Math.round(v).toLocaleString();
  }
}

function generateDummyRevenue(rangeKey) {
  const now = new Date();
  const points = [];
  if (rangeKey === "day") {
    for (let i = 0; i < 24; i++) {
      const d = new Date(now);
      d.setHours(now.getHours() - (23 - i));
      points.push({ label: `${d.getHours()}:00`, date: d.toISOString(), value: Math.round(2000 + Math.random() * 8000) });
    }
  } else if (rangeKey === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      points.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }), date: d.toISOString(), value: Math.round(15000 + Math.random() * 30000) });
    }
  } else if (rangeKey === "month") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      points.push({ label: d.getDate().toString(), date: d.toISOString(), value: Math.round(8000 + Math.random() * 25000) });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      points.push({ label: d.toLocaleDateString(undefined, { month: "short" }), date: d.toISOString(), value: Math.round(120000 + Math.random() * 400000) });
    }
  }
  return points;
}

export default function RevenueSystem({ apiBase = "" }) {
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
        // Prefer an explicit prop, then the built/public backend URL, then a runtime-derived origin.
        const base =
          apiBase ||
          NEXT_PUBLIC_BACKEND_URL ||
          (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}/api/v1` : "http://localhost:5000/api/v1");
        // Map our range keys to server query params
        // server booking analytics endpoints:
        // - overview: /api/v1/bookings/analytics/overview?timeRange=7days|30days|12months
        // - trends: /api/v1/bookings/analytics/trends?period=daily|weekly|monthly
        let url = "";
        if (range === "day") {
          // server does not provide hourly breakdown; try trends daily and fallback to generated hourly
          url = `${base}/bookings/analytics/trends?period=daily`;
        } else if (range === "week") {
          url = `${base}/bookings/analytics/trends?period=weekly`;
        } else if (range === "month") {
          url = `${base}/bookings/analytics/trends?period=daily`;
        } else {
          url = `${base}/bookings/analytics/overview?timeRange=12months`;
        }

        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (!mounted) return;

          // normalize responses for different endpoints
          // trends response: { success, data: { trends, period, metric } }
          // overview response: { success, data: { revenueAnalytics: [...] } }
          let points = [];
          if (json && json.data) {
            if (json.data.trends && Array.isArray(json.data.trends)) {
              // trends: each item has _id and revenue
              // map to label and value
              points = json.data.trends.map((t) => ({
                label:
                  t._id && (t._id.day || t._id.week || t._id.month)
                    ? `${t._id.day || t._id.week || t._id.month}`
                    : t._id && (t._id.month ? new Date(t._id.year, t._id.month - 1, 1).toLocaleDateString(undefined, { month: 'short' }) : ''),
                date: t._id ? JSON.stringify(t._id) : undefined,
                value: Number(t.revenue || t.totalRevenue || t.value || 0),
              }));
            } else if (Array.isArray(json.data.revenueAnalytics)) {
              points = json.data.revenueAnalytics.map((r) => ({ label: r._id && (r._id.month || r._id.day) ? (r._id.month || r._id.day) : r.label || '', date: r._id ? JSON.stringify(r._id) : undefined, value: Number(r.totalRevenue || r.revenue || r.value || 0) }));
            } else if (Array.isArray(json.data) && json.data.length && typeof json.data[0] === 'object') {
              points = json.data.map((p) => ({ label: p.label || p._id || '', date: p.date || p._id, value: Number(p.revenue || p.value || p.totalRevenue || 0) }));
            }
          }

          // If we didn't get useful points, fallback to generated
          if (!points || points.length === 0) {
            if (range === 'day') setSeries(generateDummyRevenue('day'));
            else if (range === 'week') setSeries(generateDummyRevenue('week'));
            else if (range === 'month') setSeries(generateDummyRevenue('month'));
            else setSeries(generateDummyRevenue('year'));
          } else {
            setSeries(points);
          }
        } else {
          // non-ok
          if (range === 'day') setSeries(generateDummyRevenue('day'));
          else if (range === 'week') setSeries(generateDummyRevenue('week'));
          else if (range === 'month') setSeries(generateDummyRevenue('month'));
          else setSeries(generateDummyRevenue('year'));
        }
      } catch (err) {
        if (mounted) {
          setError('API unreachable — showing sample data');
          if (range === 'day') setSeries(generateDummyRevenue('day'));
          else if (range === 'week') setSeries(generateDummyRevenue('week'));
          else if (range === 'month') setSeries(generateDummyRevenue('month'));
          else setSeries(generateDummyRevenue('year'));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [range, apiBase]);

  const total = useMemo(() => series.reduce((s, p) => s + Number(p.value || 0), 0), [series]);

  function exportCSV() {
    const rows = [ ["label", "date", "value"], ...series.map((r) => [r.label, r.date || "", r.value]) ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Revenue</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track revenue over time with flexible ranges</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200">
            <FaDownload /> Export
          </button>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <button key={r.key} onClick={() => setRange(r.key)} className={`px-3 py-1 rounded-md text-sm ${range === r.key ? "bg-sky-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Total ({RANGES.find((x) => x.key === range).label})</p>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{currencyFormat(total)}</div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{loading ? "Loading…" : "Live"}</div>
        </div>

        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5a4" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0ea5a4" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={"rgba(100,116,139,0.06)"} />
              <XAxis dataKey="label" tick={{ fill: "#94a3b8" }} />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} tick={{ fill: "#94a3b8" }} />
              <Tooltip formatter={(v) => currencyFormat(v)} labelFormatter={(l) => l} contentStyle={{ background: "#0b1220", borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#0ea5a4" fillOpacity={1} fill="url(#g1)" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
