"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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

  // package modal state
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [pkgData, setPkgData] = useState(null);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

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
      const pageItems = list.slice(start, end);

      // Enrich page items with package title/slug when missing to ensure Package column shows data.
      const enriched = await Promise.all(
        pageItems.map(async (b) => {
          try {
            const hasTitle = !!(
              b?.package?.title || b?.packageTitle || b?.package_name || b?.pkg?.title || b?.package_title
            );
            if (hasTitle) return b;

            const candidate = b?.packageId || b?.package || b?.package_slug || b?.packageSlug || b?.pkgId;
            if (!candidate) return b;

            const url = `${API_URL}/package/${encodeURIComponent(candidate)}`;
            const res = await axios.get(url, {
              withCredentials: true,
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const p = res?.data?.foundPackage || res?.data?.package || res?.data?.data?.package || res?.data?.data || res?.data || null;
            if (p) {
              // attach minimal package info to booking for table display
              return { ...b, package: { title: p.title, slug: p.slug || p._id, _id: p._id, price: p.price } };
            }
            return b;
          } catch (err) {
            // ignore per-record errors; keep original booking
            return b;
          }
        })
      );

      setItems(enriched);
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

  // Safely resolve an image source (string) for Next/Image or null if not usable.
  const resolveImageSrc = (src) => {
    if (!src) return null;
    // If an array is passed, use first element
    if (Array.isArray(src)) src = src[0];
    if (typeof src === "object") {
      if (src?.url) return resolveImageSrc(src.url);
      return null;
    }
    if (typeof src !== "string") return null;
    const s = src.trim();
    if (!s) return null;
    if (s.startsWith("/") || s.startsWith("data:") || /^https?:\/\//i.test(s)) return s;
    return null;
  };

  // Open package detail view for a booking. Uses embedded package data if present,
  // otherwise fetches from API using package id/slug.
  const openPackageView = async (booking) => {
    setSelectedBooking(booking || null);
    setPkgData(null);
    setPkgLoading(true);
    setPkgModalOpen(true);
    try {
      // If booking already contains package object, use it
      const pkgObj = booking?.package;
      if (pkgObj && typeof pkgObj === "object" && (pkgObj.title || pkgObj._id || pkgObj.slug)) {
        setPkgData(pkgObj);
        return;
      }

      // Otherwise try to derive an id/slug
      const candidate = booking?.packageId || booking?.package || booking?.package_slug || booking?.packageSlug || booking?.pkgId;
      if (!candidate) {
        // nothing to fetch
        setPkgData(null);
        return;
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const url = `${API_URL}/package/${encodeURIComponent(candidate)}`;
      const { data } = await axios.get(url, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const p = data?.foundPackage || data?.package || data?.data?.package || data?.data || data || null;
      setPkgData(p);
    } catch (err) {
      console.error("Failed to load package details", err);
      setPkgData(null);
    } finally {
      setPkgLoading(false);
    }
  };

  return (
    <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md transition-all">
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
          <table className="min-w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left bg-gray-300/50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
                <th className="py-3 px-4 font-semibold rounded-l-xl">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Package</th>
                <th className="py-3 px-4 font-semibold">Travelers</th>
                <th className="py-3 px-4 font-semibold">Start Date</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold text-center rounded-r-xl">Payment</th>
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
                const total = typeof b?.totalAmount === "number"
                  ? b.totalAmount
                  : (b?.payment_info?.amount ?? "—");

                return (
                  <tr
                    key={b._id || i}
                    className="bg-white dark:bg-gray-900 hover:bg-sky-50/70 dark:hover:bg-sky-900/20 transition-shadow shadow-sm border border-gray-200 dark:border-gray-800"
                  >
                    {/* Booking ID */}
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-200 font-[500]">
                      <span className="block sm:hidden text-xs text-gray-500">Booking ID</span>
                      #{shortId}
                    </td>

                    {/* Package */}
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 max-w-xs">
                      <span className="block sm:hidden text-xs text-gray-500">Package</span>
                      {(() => {
                        const pkgTitle = b?.package?.title || b?.packageTitle || b?.package_name || b?.pkg?.title || b?.package_title || b?.packageTitle;
                        const pkgSlug = b?.package?.slug || b?.packageSlug || b?.package_slug || b?.packageId || null;
                        if (pkgTitle && pkgSlug) {
                          return (
                            <Link
                              href={`/packages/${encodeURIComponent(pkgSlug)}`}
                              className="text-sm text-sky-600 dark:text-sky-400 hover:underline truncate block focus:outline-none focus:ring-1 focus:ring-sky-300 dark:focus:ring-sky-500"
                            >
                              {pkgTitle}
                            </Link>
                          );
                        }
                        if (pkgTitle) return <div className="truncate text-sm">{pkgTitle}</div>;
                        return <div className="text-sm text-gray-500">-</div>;
                      })()}
                    </td>

                    {/* Travelers */}
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      <span className="block sm:hidden text-xs text-gray-500">Travelers</span>
                      {b?.travelers ?? "-"}
                    </td>

                    {/* Start Date */}
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      <span className="block sm:hidden text-xs text-gray-500">Start Date</span>
                      {start}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">
                      <span className="block sm:hidden text-xs text-gray-500">Amount</span>
                      ₹{total}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 text-center">
                      <span className="flex flex-col items-center gap-0.5">
                        {renderPaymentStatus(payLabel)}
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {payMethod}
                        </span>
                      </span>
                      <div className="mt-2">
                        <button
                          onClick={() => openPackageView(b)}
                          className="text-xs text-sky-600 dark:text-sky-400 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500"
                        >
                          View package
                        </button>
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

        {/* Package modal */}
        {pkgModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setPkgModalOpen(false)} />
            <div className="relative w-full max-w-3xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Package Details</h3>
                  <button onClick={() => setPkgModalOpen(false)} className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500 rounded">Close</button>
                </div>
              <div className="p-4">
                {pkgLoading ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                      {(() => {
                        const firstImg = resolveImageSrc(pkgData?.images ?? pkgData?.image ?? pkgData?.imageUrl ?? null);
                        if (firstImg) {
                          return (
                            <Image
                              src={firstImg}
                              alt={pkgData?.title || "package"}
                              width={420}
                              height={260}
                              className="rounded-md object-cover"
                            />
                          );
                        }
                        return (
                          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">No image</div>
                        );
                      })()}
                    </div>

                    <div className="md:col-span-2">
                      {/* Booking metadata */}
                      {selectedBooking && (
                        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div><strong className="text-gray-900 dark:text-white">Booking:</strong> #{(selectedBooking._id || '').toString().slice(0, 12)}</div>
                          <div><strong className="text-gray-900 dark:text-white">Travelers:</strong> {selectedBooking.travelers ?? '-'}</div>
                          <div><strong className="text-gray-900 dark:text-white">Start Date:</strong> {selectedBooking.startDate ? new Date(selectedBooking.startDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-'}</div>
                          <div><strong className="text-gray-900 dark:text-white">Amount:</strong> ₹{(selectedBooking.totalAmount ?? selectedBooking?.payment_info?.amount ?? '-')}</div>
                          <div><strong className="text-gray-900 dark:text-white">Payment:</strong> {selectedBooking?.payment_info?.status || 'NA'}{selectedBooking?.payment_info?.method ? ` • ${selectedBooking.payment_info.method}` : ''}</div>
                        </div>
                      )}

                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{pkgData?.title || 'Package'}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{pkgData?.destination || pkgData?.location}</div>
                      <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-6">{pkgData?.description || pkgData?.subtitle || "No description available."}</div>
                      <div className="mt-4 flex items-center gap-3">
                        <Link href={`/packages/${pkgData?.slug || pkgData?._id || ""}`} className="rounded-lg bg-sky-600 dark:bg-sky-500 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500">Open package page</Link>
                        <div className="text-sm text-gray-700 dark:text-gray-300">Price: ₹{Number(pkgData?.price || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
