"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const PageSize = 10;

export default function ProfileBookings() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const me = useSelector((s) => s?.auth?.user);
  const myId = me?._id || me?.id;

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PageSize)), [total]);

  const load = useCallback(async () => {
    if (!API_URL) return setError("API not configured");
    if (!myId) return setError("Not logged in");

    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

      let list = [];
      try {
        const { data } = await axios.get(`${API_URL}/bookings/${myId}`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        list = data?.bookings || data?.data || data || [];
      } catch {
        const { data } = await axios.get(`${API_URL}/bookings`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const all = data?.bookings || data?.data || [];
        list = all.filter((b) => {
          const uid = b?.userId || b?.user?._id || b?.user;
          return String(uid) === String(myId);
        });
      }

      setTotal(list.length);
      const start = (page - 1) * PageSize;
      const end = start + PageSize;
      setItems(list.slice(start, end));
      setError("");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load bookings");
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
      return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Paid</span>;
    if (normalized.includes("pending"))
      return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">Pending</span>;
    if (normalized.includes("failed"))
      return <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full font-medium">Failed</span>;
    return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">{status || "NA"}</span>;
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Bookings</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages}
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Bookings: {total}</p>

      {/* Loading State */}
      {loading ? (
        <div className="mt-6 space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>
          <button
            onClick={load}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">No bookings yet.</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
                <th className="py-2 pr-4">Booking</th>
                <th className="py-2 pr-4">Package</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Payment</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const short = (val) =>
                  val ? String(val).slice(0, 10) + (String(val).length > 10 ? "…" : "") : "-";
                const created = b?.createdAt ? new Date(b.createdAt).toLocaleString() : "-";
                const payLabel = b?.payment_info?.status || "NA";
                return (
                  <tr
                    key={b._id}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                  >
                    <td className="py-2 pr-4 text-gray-900 dark:text-white">{short(b._id)}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {b?.package?.name || short(b.packageId)}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{created}</td>
                    <td className="py-2 pr-4">{renderPaymentStatus(payLabel)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-end gap-2 text-sm">
        <button
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <button
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
