"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

const DefaultPageSize = 10;

export default function AdminPackages() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DefaultPageSize);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [jumpPage, setJumpPage] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const axiom = useMemo(() => {
    const inst = axios.create({ baseURL: API_URL || undefined, withCredentials: true });
    inst.interceptors.request.use((cfg) => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (token) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
      } catch {}
      return cfg;
    });
    return inst;
  }, [API_URL]);

  const normalizedStatus = (pkg) => (pkg?.status ?? pkg?.Status ?? "draft");

  async function load() {
    if (!API_URL) return;
    try {
      setLoading(true);
      const params = { q: q || undefined, page, limit: pageSize, location: locationFilter || undefined };
      const res = await axiom.get("/package/get-packages", { params });
      const data = res?.data || {};
      const list = Array.isArray(data.packages ? data.packages : data.data ? data.data : data) ? (data.packages || data.data || data) : [];
      setItems(Array.isArray(list) ? list.map((it) => ({ ...it, status: normalizedStatus(it) })) : []);
      setTotal(Number(data.total ?? list.length ?? 0));
    } catch (err) {
      setItems([]);
      setTotal(0);
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  }

  async function loadLocations() {
    if (!API_URL) return;
    try {
      const res = await axiom.get("/package/locations");
      setLocations(res?.data?.locations || []);
    } catch {
      setLocations([]);
    }
  }

  async function toggleStatus(pkg) {
    if (!API_URL) return;
    const id = pkg._id || pkg.id;
    const current = normalizedStatus(pkg);
    const next = current === "active" ? "draft" : "active";
    try {
      setUpdatingId(id);
      setItems((arr) => arr.map((it) => (it._id === id || it.id === id ? { ...it, status: next } : it)));
      await axiom.put(`/package/edit-package/${id}`, { status: next, Status: next });
      toast.success(`Status changed to ${next}`);
    } catch (err) {
      setItems((arr) => arr.map((it) => (it._id === id || it.id === id ? { ...it, status: current } : it)));
      const msg = err?.response?.data?.message || err?.message || "Failed to update status";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  }

  async function removePkg(id) {
    if (!API_URL) return;
    if (!confirm("Delete this package? This cannot be undone.")) return;
    try {
      await axiom.delete(`/package/${id}`);
      toast.success("Package deleted successfully");
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(msg);
    }
  }

  useEffect(() => {
    loadLocations();
  }, [axiom]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, pageSize, locationFilter]);

  return (
    <div className="space-y-4">
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">Packages</h2>
          <div className="flex gap-2">
            <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }} className="rounded-lg text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 text-sm">
              <option value="">All Locations</option>
              {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <input type="text" placeholder="Search packages..." value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} className="w-full text-gray-800 dark:text-gray-100 sm:w-64 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
            <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }} className="rounded-lg text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 text-sm" title="Items per page">
              {[5, 10, 20, 50].map((sz) => <option key={sz} value={sz}>{sz}/page</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Duration</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="py-6" colSpan={6}>Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td className="py-6" colSpan={6}>No packages found.</td></tr>
                ) : (
                  items.map((p) => (
                    <tr key={p._id || p.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">{p.name || p.title || '-'}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{p.location || p.destination || '-'}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{p.price != null ? `₹${p.price}` : '-'}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{p.duration != null ? `${p.duration}D` : `${p.days ?? 0}D/${p.nights ?? 0}N`}</td>
                      <td className="py-2 pr-0">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/packages/edit?id=${p._id || p.id}`} className="px-3 py-1.5 text-gray-800 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-300/90 dark:hover:bg-gray-800">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="py-6 text-center">Loading...</div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center">No packages found.</div>
            ) : (
              items.map((p) => (
                <div key={p._id || p.id} className="border rounded-lg p-3 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{p.name || p.title || '-'}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{p.location || p.destination || '-'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{p.price != null ? `₹${p.price}` : '-'}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{p.duration != null ? `${p.duration}D` : `${p.days ?? 0}D/${p.nights ?? 0}N`}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Link href={`/admin/packages/edit?id=${p._id || p.id}`} className="px-3 py-1.5 text-gray-800 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-300/90 dark:hover:bg-gray-800 text-sm">Edit</Link>
                    <button onClick={() => toggleStatus(p)} disabled={updatingId === (p._id || p.id)} className="px-3 py-1.5 rounded-lg border text-sm">{normalizedStatus(p) === "active" ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => removePkg(p._id || p.id)} className="px-3 py-1.5 rounded-lg border text-sm text-rose-600">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="hidden md:flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400">Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(1)} className="px-3 py-1.5 text-gray-900 rounded-lg border disabled:opacity-50">First</button>
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-gray-900 rounded-lg border disabled:opacity-50">Previous</button>
              {(() => {
                const windowSize = 5;
                const start = Math.max(1, page - Math.floor(windowSize / 2));
                const end = Math.min(totalPages, start + windowSize - 1);
                const realStart = Math.max(1, end - windowSize + 1);
                const pages = [];
                for (let i = realStart; i <= end; i++) pages.push(i);
                return pages.map((n) => (
                  <button key={n} onClick={() => setPage(n)} disabled={n === page} className={`px-3 py-1.5 rounded-lg border text-sm ${n === page ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-200 dark:border-gray-700'}`}>{n}</button>
                ));
              })()}
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-gray-900 rounded-lg border disabled:opacity-50">Next</button>
              <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1.5 text-gray-900 rounded-lg border disabled:opacity-50">Last</button>
              <div className="flex items-center gap-2 ml-2">
                <input value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} placeholder="#" className="w-16 rounded-lg border border-gray-300 dark:border-gray-700 px-2 py-1 text-sm bg-transparent text-gray-800 dark:text-gray-100" />
                <button onClick={() => { const n = parseInt(jumpPage); if (!isNaN(n) && n >= 1 && n <= totalPages) setPage(n); setJumpPage(''); }} className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-sm">Go</button>
              </div>
            </div>
          </div>

          <div className="flex md:hidden items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400">{total === 0 ? 'No results' : `Page ${page} of ${totalPages}`}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-gray-900 rounded-lg border disabled:opacity-50">Previous</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-gray-900 rounded-lg border disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
