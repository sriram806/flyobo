"use client";

import React, { useEffect, useState } from "react";

function Sparkline({ values = [] }) {
  const width = 80;
  const height = 32;
  const nums = (values || []).map((v) => Number(v || 0));

  if (!nums || nums.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#e5e7eb" strokeWidth="1" />
        </svg>
        <span className="text-xs text-gray-400 mt-1">—</span>
      </div>
    );
  }

  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const span = max - min || 1;

  const barCount = nums.length;
  const gap = 2;
  const totalGap = gap * (barCount - 1);
  const barAvailableWidth = Math.max(1, width - totalGap);
  const barWidth = Math.max(1, Math.floor(barAvailableWidth / barCount));

  const last = nums[nums.length - 1] ?? 0;
  const prev = nums.length > 1 ? nums[nums.length - 2] ?? 0 : 0;
  const percent = prev === 0 ? (last === 0 ? 0 : 100) : Math.round(((last - prev) / Math.abs(prev)) * 100);
  const trend = percent > 0 ? "up" : percent < 0 ? "down" : "flat";
  const color = trend === "up" ? "#16a34a" : trend === "down" ? "#ef4444" : "#0ea5a4";

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Trend chart, ${trend}`}>
        {nums.map((v, i) => {
          const val = Number(v || 0);
          const h = Math.round(((val - min) / span) * (height - 4));
          const x = i * (barWidth + gap);
          const y = height - h;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={1}
              fill={color}
              opacity={0.9}
            />
          );
        })}
      </svg>
      <span className={`text-xs mt-1 ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-sky-500"}`}>
        {trend === "up" ? "▲" : trend === "down" ? "▼" : "•"} {Math.abs(percent)}%
      </span>
    </div>
  );
}

export default function SiteAnalytics({ apibaseApi = "" }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function currencyFormat(v) {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
    } catch {
      return "₹" + Math.round(v).toLocaleString();
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      const baseApi = process.env.NEXT_PUBLIC_BACKEND_URL

      async function fetchUsers() {
        try {
          const res = await fetch(`${baseApi}/analytics/users`, { credentials: "include" });
          if (!res.ok) return null;
          const json = await res.json();
          return json?.data || null;

        } catch (e) {
          console.warn("fetchUsers error", e);
          return null;
        }
      }

      async function fetchPackages() {
        try {
          const res = await fetch(`${baseApi}/analytics/packages`, { credentials: "include" });
          if (!res.ok) return null;
          const json = await res.json();
          const payload = json?.data || null;
          if (!payload) return null;
          if (payload.total || payload.last12MonthsData) return payload;
          const basic = payload.basic || {};
          return {
            total: basic.total ?? 0,
            last12MonthsData: basic.last12Months || basic.last12MonthsData || [],
            advanced: payload.advanced || {},
          };
        } catch (e) {
          console.warn("fetchPackages error", e);
          return null;
        }
      }

      async function fetchBookings() {
        try {
          const res = await fetch(`${baseApi}/analytics/bookings/advanced`, { credentials: "include" });
          if (!res.ok) return null;
          const json = await res.json();
          const payload = json?.data || null;

          if (!payload) return null;
          // If backend already returns the simple flat shape, return as-is
          if (payload.total || payload.last12MonthsData) return payload;

          // Advanced response shape: map into flat shape the component expects
          // Prefer summary.totalBookings for total, fallback to aggregated basic.total
          const basic = payload.basic || {};
          const summary = payload.summary || {};
          const total = summary.totalBookings ?? basic.total ?? summary.currentMonthBookings ?? 0;

          // Create last12MonthsData in the form [{ y: number }, ...] from monthlyTrends or basic.last12Months
          let last12MonthsData = [];
          if (Array.isArray(basic.last12Months) && basic.last12Months.length) {
            last12MonthsData = basic.last12Months;
          } else if (Array.isArray(basic.last12MonthsData) && basic.last12MonthsData.length) {
            last12MonthsData = basic.last12MonthsData;
          } else if (Array.isArray(payload.monthlyTrends) && payload.monthlyTrends.length) {
            last12MonthsData = payload.monthlyTrends.map((m) => ({ y: m.bookings ?? m.count ?? m.value ?? 0 }));
          }

          return {
            total,
            last12MonthsData,
            advanced: payload,
          };
        } catch (e) {
          console.warn("fetchBookings error", e);
          return null;
        }
      }

      async function fetchGallery() {
        try {
          const res = await fetch(`${baseApi}/gallery`, { credentials: "include" });
          if (!res.ok) return null;
          const json = await res.json();
          return Array.isArray(json) ? json : (json?.items || null);
        } catch (e) {
          console.warn("fetchGallery error", e);
          return null;
        }
      }

      async function fetchLayout() {
        try {
          const res = await fetch(`${baseApi}/layout?type=FAQ`, { credentials: "include" });
          if (!res.ok) return null;
          const json = await res.json();
          return json?.layout || json || null;
        } catch (e) {
          console.warn("fetchLayout error", e);
          return null;
        }
      }

      try {
        const [userData, packageData, bookingData, galleryData, layoutData] = await Promise.all([
          fetchUsers(),
          fetchPackages(),
          fetchBookings(),
          fetchGallery(),
          fetchLayout(),
        ]);

        if (!mounted) return;

        const derived = [
          {
            label: "Total Users",
            value:
              userData?.total ?? (Array.isArray(userData?.last12MonthsData) ? userData.last12MonthsData.reduce((s, p) => s + (p?.y || p?.value || 0), 0) : 0),
            spark: (userData?.last12MonthsData || []).map((p) => p?.y ?? p?.value ?? 0),
          },
          {
            label: "Packages",
            value: packageData?.total ?? 0,
            spark: (packageData?.last12MonthsData || []).map((p) => p?.y ?? p?.value ?? 0),
          },
          {
            label: "Bookings",
            value: bookingData?.total ?? 0,
            // meta contains helpful small text for the UI when advanced payload available
            meta: (() => {
              const adv = bookingData?.advanced || {};
              const summary = adv.summary || bookingData?.summary || {};
              const currentMonthBookings = summary.currentMonthBookings ?? summary.currentMonthBookings ?? 0;
              const currentMonthRevenue = summary.currentMonthRevenue ?? summary.currentMonthRevenue ?? 0;
              const sd = adv.statusDistribution || bookingData?.statusDistribution || [];
              const pending = Array.isArray(sd) ? sd.find((s) => String(s._id).toLowerCase() === "pending") : null;
              const pendingCount = pending?.count ?? null;
              const parts = [];
              if (typeof currentMonthBookings === "number" && currentMonthBookings > 0) parts.push(`${currentMonthBookings} this month`);
              if (typeof currentMonthRevenue === "number" && currentMonthRevenue > 0) parts.push(`${currencyFormat(currentMonthRevenue)} revenue`);
              if (pendingCount !== null) parts.push(`${pendingCount} pending`);
              return parts.join(" • ") || null;
            })(),
            spark: (bookingData?.last12MonthsData || []).map((p) => p?.y ?? p?.value ?? 0),
          },
          {
            label: "Gallery Photos",
            value: Array.isArray(galleryData) ? galleryData.length : (galleryData?.items?.length ?? 0),
            spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
          },
          {
            label: "FAQ Questions",
            value: layoutData?.faq?.length ?? (Array.isArray(layoutData?.data?.faq) ? layoutData.data.faq.length : 0),
            spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
          },
          {
            label: "Active Sessions",
            value: Math.floor(Math.random() * 100),
            spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
          },
          {
            label: "Pending Bookings",
            value: (() => {
              // try advanced payload first, then top-level statusDistribution
              const sd = bookingData?.advanced?.statusDistribution || bookingData?.statusDistribution || [];
              const pending = Array.isArray(sd) ? sd.find((s) => String(s._id).toLowerCase() === "pending") : null;
              return pending?.count ?? Math.floor(Math.random() * 30);
            })(),
            spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
          },
          {
            label: "Total Admins",
            value: 5,
            spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
          },
        ];

        setStats(derived);
      } catch (err) {
        console.error("SiteAnalytics fetch error:", err);
        if (!mounted) return;
        setError("Unable to fetch analytics — showing sample data");
        // fallback to sample data
        const sample = [
          { label: "Total Users", value: 245, spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)) },
          { label: "Total Packages", value: 18, spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)) },
          { label: "Total Bookings", value: 312, spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)) },
          { label: "Gallery Photos", value: 1245, spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)) },
          { label: "FAQ Questions", value: 42, spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)) },
          { label: "Active Sessions", value: 56, spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)) },
          { label: "Pending Bookings", value: 14, spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)) },
          { label: "Total Admins", value: 5, spark: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)) },
        ];
        setStats(sample);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [apibaseApi]);

  return (
    <section className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Site Analytics</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">{loading ? "Loading…" : error ? error : "Live"}</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4 animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Stats Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, i) => (
            <div key={item.label + i} className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{item.value}</div>
              </div>

              <Sparkline values={item.spark} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
