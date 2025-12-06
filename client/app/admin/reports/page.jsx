"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Helpers ---
const monthsBack = (n = 12) => {
  const arr = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    arr.push({
      key: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`,
      label: dt.toLocaleString(undefined, { month: "short" }),
    });
  }
  return arr;
};

const normalizeSeries = (last12MonthsData, months = 12) => {
  const base = monthsBack(months);
  const map = new Map((last12MonthsData || []).map((x) => [x.month, x]));
  return base.map((m) => {
    const item = map.get(m.key) || {};
    return {
      month: m.key,
      label: m.label,
      value: Number(item.count || 0),
      growth: item.growth ?? null,
      cumulative: item.cumulative ?? null,
      trend: item.trend ?? "no-change",
    };
  });
};

const useAnalyticsData = (endpoint) => {
  const API_URL =process.env.NEXT_PUBLIC_BACKEND_URL;
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!API_URL) {
      setError("API not configured");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}${endpoint}`, { withCredentials: true });
      const series = res?.data?.data?.last12MonthsData || [];
      const ttl = res?.data?.data?.total ?? 0;
      setData(Array.isArray(series) ? series : []);
      setTotal(Number(ttl) || 0);
      setError("");
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL]);

  return { data, total, loading, error, refetch: fetchData };
};

// --- Line Chart Component ---
const GrowthLineChart = ({ title, series, accent = "#0284c7", months = 12 }) => {
  const normalized = Array.isArray(series) ? series : [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={normalized}>
          <defs>
            <linearGradient id={`lineGradient-${accent}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accent} stopOpacity={0.9} />
              <stop offset="95%" stopColor={accent} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              border: "none",
            }}
            labelStyle={{ color: "#6b7280", fontWeight: "bold" }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload;
                return (
                  <div className="p-2 rounded bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 text-xs">
                    <div className="font-semibold mb-1">{label}</div>
                    <div>Count: {p.value}</div>
                    <div>Growth: {p.growth}%</div>
                    <div>Cumulative: {p.cumulative}</div>
                    <div>Trend: {p.trend}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={`url(#lineGradient-${accent})`}
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: accent }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- CSV Export ---
const exportCSV = (series, filename = "report.csv") => {
  const dateStr = new Date().toISOString().split("T")[0];
  const csvContent = [
    "Month,Count,Growth,Cumulative,Trend",
    ...series.map((s) => `${s.month},${s.value},${s.growth},${s.cumulative},${s.trend}`),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename.replace(".csv", `_${dateStr}.csv`)}`);
};

// --- Main Page ---
export default function ReportsPage() {
  const [months, setMonths] = useState(12);
  const users = useAnalyticsData("/analytics/users");
  const packages = useAnalyticsData("/analytics/packages");

  const usersSeries = useMemo(() => normalizeSeries(users.data, months), [users.data, months]);
  const packagesSeries = useMemo(() => normalizeSeries(packages.data, months), [packages.data, months]);

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Overview of users and packages growth.</p>

        {/* Filters */}
        <div className="mt-4 flex gap-2">
          {[6, 12].map((m) => (
            <button
              key={m}
              className={`px-3 py-1 rounded ${
                months === m
                  ? "bg-sky-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
              }`}
              onClick={() => setMonths(m)}
            >
              Last {m} months
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {(users.error || packages.error) && (
        <div className="p-4 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex justify-between items-center">
          <span>{users.error || packages.error}</span>
          <button
            className="text-sm font-semibold underline"
            onClick={() => {
              users.refetch();
              packages.refetch();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Charts */}
      {(users.loading || packages.loading) ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">Loading charts…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <GrowthLineChart title="Users" series={usersSeries} accent="#0ea5e9" months={months} />
            <button
              className="mt-2 px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-800"
              onClick={() => exportCSV(usersSeries, `users_last_${months}_months.csv`)}
            >
              Export Users CSV
            </button>
          </div>
          <div>
            <GrowthLineChart title="Packages" series={packagesSeries} accent="#f43f5e" months={months} />
            <button
              className="mt-2 px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-800"
              onClick={() => exportCSV(packagesSeries, `packages_last_${months}_months.csv`)}
            >
              Export Packages CSV
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
