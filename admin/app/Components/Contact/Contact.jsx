"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { IoMailSharp } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import { RiLoader2Line } from "react-icons/ri";

const PageSize = 12;

export default function AdminContacts() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const me = useSelector((s) => s?.auth?.user); // Redux user

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});

  const [selected, setSelected] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PageSize)), [total]);

  const STATUSES = ["pending", "in-progress", "resolved", "closed"];

  // ---------------- Load contacts ----------------
  async function load() {
    if (!API_URL || !me) return; // Ensure user exists
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/contact`, {
        params: { q, page, limit: PageSize },
        withCredentials: true, // send cookies automatically
      });

      const list = data?.data || [];
      setItems(list);
      setTotal(Number(data?.meta?.total || list.length));
      // refresh aggregated status counts
      fetchCounts();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load messages";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const fetchCounts = async () => {
    if (!API_URL || !me) return;
    try {
      const { data } = await axios.get(`${API_URL}/contact`, {
        params: { page: 1, limit: 100000 },
        withCredentials: true,
      });
      const all = data?.data || [];
      const counts = {};
      all.forEach((c) => {
        const k = (c.status || 'pending').toString();
        counts[k] = (counts[k] || 0) + 1;
      });
      setStatusCounts(counts);
      if (data?.meta?.total) setTotal(Number(data.meta.total));
    } catch (e) {
      console.warn('Failed to fetch contact counts', e?.message || e);
    }
  };

  useEffect(() => {
    if (me) load();
    // eslint-disable-next-line
  }, [q, page, API_URL, me]);

  // ---------------- Actions ----------------
  const handleDelete = async (id) => {
    if (!API_URL) return;
    if (!confirm("Delete this message? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/contact/${id}`, { withCredentials: true });
      toast.success("Message deleted");
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else {
        await load();
      }
      // refresh aggregated counts
      fetchCounts();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete message";
      toast.error(msg);
    }
  };

  const handleMarkRead = async (id) => {
    if (!API_URL) return;
    try {
      await axios.put(`${API_URL}/contact/${id}/read`, {}, { withCredentials: true });
      toast.success("Marked as read");
      await load();
      fetchCounts();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to mark as read";
      toast.error(msg);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!API_URL) return;
    try {
      await axios.patch(`${API_URL}/contact/${id}/status`, { status }, { withCredentials: true });
      toast.success("Status updated");
      await load();
      fetchCounts();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update status";
      toast.error(msg);
    }
  };

  const openView = async (id) => {
    if (!API_URL) return;
    try {
      setViewLoading(true);
      const { data } = await axios.get(`${API_URL}/contact/${id}`, { withCredentials: true });
      setSelected(data?.data || null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load message";
      toast.error(msg);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Contact Messages
            </h2>

            {/* Stats cards */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="p-3 bg-gray-200 border-gray-300 dark:bg-gray-900 shadow rounded-xl border dark:border-gray-700">
                <p className="text-xs text-gray-500">Total Messages</p>
                <p className="text-2xl text-gray-900 dark:text-gray-200 font-bold">{total}</p>
              </div>
              {Object.entries(statusCounts).length === 0 ? (
                <></>
              ) : (
                Object.entries(statusCounts).map(([k, v]) => (
                  <div key={k} className="p-3 bg-gray-200 border-gray-300 dark:bg-gray-900 shadow rounded-xl border dark:border-gray-700">
                    <p className="text-xs text-gray-500 capitalize">{k.replace(/[-_]/g, ' ')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-200">{v}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              className="w-full text-gray-900 bg-gray-200 border-gray-300 dark:text-gray-100 pl-4 pr-4 py-2.5 rounded-xl border dark:border-gray-700 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                <th className="py-4 px-6">From</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Received</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td className="py-12 text-center" colSpan={5}>
                    <div className="flex flex-col items-center gap-3">
                      <RiLoader2Line className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Loading messages...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="py-12 text-center" colSpan={5}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                        <IoMailSharp className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">No messages found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((m, idx) => (
                  <tr key={m._id || m.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {(m.name || m.email)?.[0]?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{m.name || '-'}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">{m.subject || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <select
                          value={m.status || 'pending'}
                          onChange={(e) => handleUpdateStatus(m._id || m.id, e.target.value)}
                          className="text-sm rounded-md text-gray-900 dark:text-gray-200 border px-2 py-1 bg-gray-200 border-gray-300 dark:bg-gray-800"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('-', ' ')}
                            </option>
                          ))}
                        </select>

                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${m.isRead
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            }`}
                        >
                          {m.isRead ? 'Read' : 'New'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openView(m._id || m.id)}
                          className="inline-flex text-gray-900 dark:text-gray-100 items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium hover:shadow-sm"
                        >
                          View
                        </button>
                        {!m.isRead && (
                          <button
                            onClick={() => handleMarkRead(m._id || m.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                          >
                            <FaCheckCircle className="w-4 h-4" /> Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(m._id || m.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Page <span className="text-gray-900 dark:text-white">{page}</span> of{' '}
                <span className="text-gray-900 dark:text-white">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Viewer Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selected.subject || 'Message'}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  From {selected.name} • {selected.email} {selected.phone ? `• ${selected.phone}` : ''}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">Status:</label>
                <select
                  value={selected.status || 'pending'}
                  onChange={(e) => handleUpdateStatus(selected._id || selected.id, e.target.value)}
                  className="text-sm rounded-md border px-2 py-1 bg-white dark:bg-gray-800"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('-', ' ')}
                    </option>
                  ))}
                </select>

                {!selected.isRead && (
                  <button onClick={() => handleMarkRead(selected._id || selected.id)} className="px-3 py-1 rounded-md bg-emerald-600 text-white">
                    Mark read
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="px-3 py-1 text-gray-900 dark:text-gray-100 rounded-md border">
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selected.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
