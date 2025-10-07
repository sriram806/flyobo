"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { useSelector } from "react-redux";

const PageSize = 10;

export default function AdminUsers() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const me = useSelector((s) => s?.auth?.user);
  const myId = me?._id || me?.id;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PageSize)), [total]);
  const displayed = useMemo(() => {
    return items.filter((u) => (u?._id || u?.id) !== myId);
  }, [items, myId]);

  async function load() {
    if (!API_URL) return;
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const { data } = await axios.get(`${API_URL}/user/get-all-users`, {
        params: { q, page, limit: PageSize },
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = data?.users || data?.data || [];
      setItems(list);
      setTotal(Number(data?.total || list.length));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load users";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [q, page]);

  const handleDelete = async (id) => {
    if (!API_URL) return;
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      await axios.delete(`${API_URL}/user/${id}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      toast.success("User deleted");
      // refresh
      if (items.length === 1 && page > 1) setPage((p) => p - 1); else load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete user";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">Users</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6" colSpan={5}>Loading...</td></tr>
              ) : displayed.length === 0 ? (
                <tr><td className="py-6" colSpan={5}>No users found.</td></tr>
              ) : (
                displayed.map((u, idx) => (
                  <tr key={u._id || u.id || u.email || idx} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4 text-gray-900 dark:text-white">{u.name || '-'}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{u.email}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{u.phone || 'NA'}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{(u.role || 'user').toString().slice(0,10)}</td>
                    <td className="py-2 pr-0">
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                          disabled={(u?._id || u?.id) === myId}
                          onClick={() => handleDelete(u._id || u.id)}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >Previous</button>
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

