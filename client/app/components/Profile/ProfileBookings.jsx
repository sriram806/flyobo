"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const PageSize = 10;

export default function ProfileBookings() {
  const API_URL =
    NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const me = useSelector((s) => s?.auth?.user);
  const myId = me?._id || me?.id;

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PageSize)),
    [total]
  );

  const load = useCallback(async () => {
    if (!API_URL) return setError("API not configured");
    if (!myId) return setError("Not logged in");

    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;

      const { data } = await axios.get(`${API_URL}/bookings/user/${myId}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = data?.bookings || data?.data || [];

      setTotal(list.length);
      const start = (page - 1) * PageSize;
      const end = start + PageSize;
      setItems(list.slice(start, end));
      setError("");
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL, myId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const renderPaymentStatus = (status) => {
    const normalized = status?.toLowerCase?.() || "";
    if (normalized.includes("paid"))
      return (
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs px-2.5 py-1 rounded-full font-medium">
          <CheckCircle size={12} /> Paid
        </span>
      );
    if (normalized.includes("pending"))
      return (
        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 text-xs px-2.5 py-1 rounded-full font-medium">
          <Clock size={12} /> Pending
        </span>
      );
    if (normalized.includes("failed"))
      return (
        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-xs px-2.5 py-1 rounded-full font-medium">
          <XCircle size={12} /> Failed
        </span>
      );
    return (
      <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-medium">
        {status || "NA"}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          My Bookings
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages}
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Total Bookings: <span className="font-medium">{total}</span>
      </p>

      {/* Loading */}
      {loading ? (
        <div className="mt-6 space-y-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 flex items-center justify-between bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
          <button
            onClick={load}
            className="text-sm border border-rose-200 dark:border-rose-700 rounded-lg px-3 py-1 hover:bg-rose-100 dark:hover:bg-rose-800 transition"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 text-center text-gray-600 dark:text-gray-300 text-sm">
          You have no bookings yet.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="text-left bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <th className="py-3 px-4 font-medium">Booking ID</th>
                <th className="py-3 px-4 font-medium">Travelers</th>
                <th className="py-3 px-4 font-medium">Start Date</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium text-center">Payment</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b, i) => {
                const start = b?.startDate
                  ? new Date(b.startDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                  : "-";
                const payLabel = b?.payment_info?.status || "NA";
                const payMethod = b?.payment_info?.method ? ` • ${b.payment_info.method}` : "";
                const shortId = b?._id?.slice(0, 10) || "-";
                const total = typeof b?.totalAmount === 'number' ? b.totalAmount : (b?.payment_info?.amount ?? null);
                return (
                  <tr
                    key={b._id || i}
                    className={`${
                      i % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800/50"
                    } border-b border-gray-100 dark:border-gray-800 hover:bg-sky-50/40 dark:hover:bg-sky-900/20 transition`}
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-200 font-medium">
                      #{shortId}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {b?.travelers ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{start}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{total !== null ? total : '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        {renderPaymentStatus(payLabel)}
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">{payMethod}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <button
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
