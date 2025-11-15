"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import authRequest from "@/app/utils/authRequest";

const DefaultPageSize = 10;

const AdminPackages = () => {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [pageSize, setPageSize] = useState(DefaultPageSize);
  
  // Excel bulk upload state
  const [excelFile, setExcelFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const normalizedStatus = (pkg) => (pkg?.status ?? pkg?.Status ?? "draft");

  const load = async () => {
    if (!API_URL) return;
    try {
      setLoading(true);
      
      const data = await authRequest.get(`${API_URL}/package/get-packages`, { q, page, limit: pageSize });
      
      const list = data?.packages || data?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        // normalize status casing for UI
        setItems(list.map(it => ({ ...it, status: normalizedStatus(it) })));
        setTotal(Number(data?.total || list.length));
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (err) {
      // Error handling is done in authRequest utility
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (pkg) => {
    if (!API_URL) return;
    const id = pkg._id || pkg.id;
    const current = normalizedStatus(pkg);
    const next = current === "active" ? "draft" : "active";

    try {
      setUpdatingId(id);
      // Optimistic update
      setItems((arr) =>
        arr.map((it) =>
          it._id === id || it.id === id ? { ...it, status: next } : it
        )
      );

      await axios.put(
        `${API_URL}/package/edit-package/${id}`,
        // send both keys to be safe with backend casing
        { status: next, Status: next },
        { withCskyentials: true }
      );

      toast.success(`Status changed to ${next}`);
    } catch (err) {
      // Revert if API fails
      setItems((arr) =>
        arr.map((it) =>
          it._id === id || it.id === id ? { ...it, status: current } : it
        )
      );
      const msg =
        err?.response?.data?.message || err?.message || "Failed to update status";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    load();
  }, [q, page, pageSize]);


  const removePkg = async (id) => {
    if (!API_URL) return;
    if (!confirm("Delete this package? This cannot be undone.")) return;
    
    try {
      await authRequest.delete(`${API_URL}/package/${id}`);
      toast.success("Package deleted successfully");
      
      // Refresh the list
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await load();
      }
    } catch (err) {
      // Error handling is done in authRequest utility
      console.error("Delete package error:", err);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }
    
    try {
      setUploading(true);
      setUploadResults(null);
      
      const formData = new FormData();
      formData.append('excelFile', excelFile);
      
      const response = await authRequest.postForm(`${API_URL}/package/bulk-upload`, formData);
      
      setUploadResults(response.results);
      toast.success(response.message || "Bulk upload completed");
      
      // Refresh package list
      await load();
      setExcelFile(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Bulk upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Excel Bulk Upload Section */}
      {showUploadModal && (
        <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Upload Packages</h3>
            <button
              onClick={() => { setShowUploadModal(false); setUploadResults(null); }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Excel File (.xlsx, .xls)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files[0])}
                disabled={uploading}
                className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-white dark:bg-gray-800 focus:outline-none disabled:opacity-50"
              />
              {excelFile && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Selected: {excelFile.name}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleExcelUpload}
                disabled={!excelFile || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <a
                href="/package-template.xlsx"
                download
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Download Template
              </a>
            </div>
            
            {uploadResults && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Upload Results</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">Total: {uploadResults.total}</p>
                  <p className="text-green-600 dark:text-green-400">✓ Success: {uploadResults.success.length}</p>
                  <p className="text-sky-600 dark:text-sky-400">✗ Failed: {uploadResults.failed.length}</p>
                </div>
                {uploadResults.failed.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">View failed rows</summary>
                    <ul className="mt-2 space-y-1 text-xs text-sky-600 dark:text-sky-400">
                      {uploadResults.failed.map((f, i) => (
                        <li key={i}>Row {f.row}: {f.error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">Packages</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadModal(!showUploadModal)}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📊 Bulk Upload
            </button>
            <input
              type="text"
              placeholder="Search packages..."
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value); }}
              className="w-full text-gray-800 dark:text-gray-100 sm:w-64 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={pageSize}
              onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
              className="rounded-lg text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 text-sm"
              title="Items per page"
            >
              {[5,10,20,50].map(sz => (
                <option key={sz} value={sz}>{sz}/page</option>
              ))}
            </select>
            <Link
              href="/admin/packages/create"
              className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700"
            >Create Package</Link>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Status</th>
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
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {p.duration != null ? `${p.duration}D` : `${p.days ?? 0}D/${p.nights ?? 0}N`}
                    </td>
                    <td className="py-2 pr-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(p)}
                        disabled={updatingId === (p._id || p.id)}
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold border transition active:translate-y-px disabled:opacity-60
                          ${(normalizedStatus(p) === "active")
                            ? "bg-gradient-to-b from-emerald-200 to-emerald-300 text-emerald-800 border-emerald-400 shadow-inner"
                            : "bg-gradient-to-b from-gray-200 to-gray-300 text-gray-800 border-gray-400 shadow-inner"}`}
                        title={normalizedStatus(p) || "draft"}
                      >
                        {updatingId === (p._id || p.id) ? "Updating..." : (normalizedStatus(p) || "draft")}
                      </button>
                    </td>
                    <td className="py-2 pr-0">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/packages/edit?id=${p._id || p.id}`}
                          className="px-3 py-1.5 text-gray-800 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-300/90 dark:hover:bg-gray-800"
                        >Edit</Link>
                        <button
                          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                          onClick={() => removePkg(p._id || p.id)}
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
          <div className="text-gray-600 dark:text-gray-400">
            Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-gray-900 rounded-lg border border-gray-900 dark:border-gray-700 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >Previous</button>
            {
              // Numbesky page buttons with a small window
              (() => {
                const windowSize = 5;
                const start = Math.max(1, page - Math.floor(windowSize/2));
                const end = Math.min(totalPages, start + windowSize - 1);
                const realStart = Math.max(1, end - windowSize + 1);
                const pages = [];
                for (let i = realStart; i <= end; i++) pages.push(i);
                return pages.map(n => (
                  <button
                    key={n}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${n === page ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-200 dark:border-gray-700'}`}
                    onClick={() => setPage(n)}
                    disabled={n === page}
                  >{n}</button>
                ));
              })()
            }
            <button
              className="px-3 py-1.5 text-gray-900 rounded-lg border border-gray-800 dark:border-gray-700 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >Next</button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminPackages;
