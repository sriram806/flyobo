"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loading from "../Loading/Loading";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const perPage = 10;

  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";

  const loadBookings = async (page = 1, q = "") => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${base}/bookings/bookings?page=${page}&limit=${perPage}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
        { withCredentials: true }
      );
      if (data?.success) {
        setBookings(data.bookings || []);
        setPages(data.pages || 1);
        setCurrentPage(data.page || page);
      } else {
        setError(data?.message || "Failed to load bookings");
      }
    } catch (err) {
      setError(err?.response?.data?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(1, "");
  }, []);

  const paginated = useMemo(() => bookings || [], [bookings]);

  return (
    <section className="m-6 min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Bookings</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings by customer, email or notes..."
            className="px-4 py-2 w-full md:w-96 rounded-lg border bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none"
          />
          <button
            onClick={() => loadBookings(1, search)}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Search
          </button>
          <button
            onClick={() => loadBookings(currentPage, "")}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-300 dark:border-gray-700">
        {loading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400"><Loading /></div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-200 dark:bg-gray-800">
                <tr>
                  {[
                    "Booking ID",
                    "Package",
                    "Customer",
                    "Email",
                    "Start Date",
                    "Created",
                    "Status",
                    "Total",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length ? (
                  paginated.map((b) => (
                    <tr key={b._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{b._id}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.packageId?.title || b.packageId?.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{b.userId?.name || b.customerInfo?.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.userId?.email || b.customerInfo?.email || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.startDate ? new Date(b.startDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3 capitalize text-gray-800 dark:text-gray-200">{b.status}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">₹{b.totalAmount || b.payment?.amount || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a href={`/admin/bookings/${b._id}`} className="px-2 py-1 rounded bg-blue-600 text-white">View</a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center p-6 text-gray-500 dark:text-gray-400">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button onClick={() => { const np = Math.max(currentPage - 1, 1); loadBookings(np, search); }} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Prev</button>
                {[...Array(pages)].map((_, i) => (
                  <button key={i} onClick={() => loadBookings(i+1, search)} className={`px-3 py-1 rounded transition ${currentPage === i+1 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}>{i+1}</button>
                ))}
                <button onClick={() => { const np = Math.min(currentPage + 1, pages); loadBookings(np, search); }} disabled={currentPage === pages} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
