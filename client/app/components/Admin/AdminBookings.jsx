"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, MapPin, BarChart3, PieChart } from "lucide-react";

const PageSize = 10;

export default function AdminBookings() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // selection by email/title for creation
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newPackageTitle, setNewPackageTitle] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("pending");
  const [newPaymentMethod, setNewPaymentMethod] = useState("cash");

  // required booking fields
  const [newTravelers, setNewTravelers] = useState(1);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");

  // lookup data
  const [users, setUsers] = useState([]); // { _id, email, name }
  const [packages, setPackages] = useState([]); // { _id, title }

  const userById = useMemo(() => {
    const map = new Map();
    users.forEach(u => map.set(String(u._id), u));
    return map;
  }, [users]);

  const packageById = useMemo(() => {
    const map = new Map();
    packages.forEach(p => map.set(String(p._id), p));
    return map;
  }, [packages]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PageSize)), [total]);

  async function fetchLookups() {
    if (!API_URL) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      // users (auth required)
      const uReq = axios.get(`${API_URL}/user/get-all-users`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      // packages (public)
      const pReq = axios.get(`${API_URL}/package/get-packages`, {
        withCredentials: true,
      });
      const [uRes, pRes] = await Promise.allSettled([uReq, pReq]);
      if (uRes.status === 'fulfilled') {
        const list = uRes.value?.data?.users || uRes.value?.data?.data || uRes.value?.data || [];
        setUsers(Array.isArray(list) ? list : []);
      }
      if (pRes.status === 'fulfilled') {
        const list = pRes.value?.data?.packages || pRes.value?.data?.data || pRes.value?.data || [];
        setPackages(Array.isArray(list) ? list : []);
      }
    } catch {}
  }

  async function load() {
    if (!API_URL) return;
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const { data } = await axios.get(`${API_URL}/bookings`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = data?.bookings || data?.data || [];

      // enrich with email/title
      const enriched = list.map(b => ({
        ...b,
        userEmail: userById.get(String(b.userId))?.email || b.userEmail || '',
        packageTitle: packageById.get(String(b.packageId))?.title || b.packageTitle || '',
      }));

      const t = q.trim().toLowerCase();
      const filtered = enriched.filter((b) => {
        if (!t) return true;
        const id = (b?._id || "").toString().toLowerCase();
        const email = (b?.userEmail || "").toLowerCase();
        const title = (b?.packageTitle || "").toLowerCase();
        return id.includes(t) || email.includes(t) || title.includes(t);
      });

      setTotal(filtered.length);
      const start = (page - 1) * PageSize;
      const end = start + PageSize;
      setItems(filtered.slice(start, end));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load bookings";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    load();
  }, [q, page, users, packages]);

  async function createBookingAdmin(e) {
    e?.preventDefault?.();
    if (!API_URL) return;
    if (!newUserEmail || !newPackageTitle) {
      toast.error("Email and Package title are required");
      return;
    }
    // required by server
    if (!newTravelers || !newStartDate || !custName || !custEmail || !custPhone) {
      toast.error("Travelers, Start date, and Customer name/email/phone are required");
      return;
    }
    // map to ids
    const user = users.find(u => u.email?.toLowerCase() === newUserEmail.trim().toLowerCase());
    const pkg = packages.find(p => p.title?.toLowerCase() === newPackageTitle.trim().toLowerCase());
    if (!user) { toast.error("User email not found"); return; }
    if (!pkg) { toast.error("Package title not found"); return; }

    try {
      setCreating(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const payload = {
        userId: user._id,
        packageId: pkg._id,
        travelers: Number(newTravelers),
        startDate: newStartDate,
        endDate: newEndDate || undefined,
        customerInfo: {
          name: custName,
          email: custEmail,
          phone: custPhone,
        },
        payment_info: {
          method: newPaymentMethod,
          status: newPaymentStatus,
        },
        source: 'agent',
      };
      const { data } = await axios.post(`${API_URL}/bookings/admin`, payload, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (data?.success) {
        toast.success("Booking created");
        setNewUserEmail("");
        setNewPackageTitle("");
        setNewPaymentStatus("pending");
        setNewPaymentMethod("cash");
        setNewTravelers(1);
        setNewStartDate("");
        setNewEndDate("");
        setCustName("");
        setCustEmail("");
        setCustPhone("");
        setPage(1);
        await load();
      } else {
        toast.error(data?.message || "Failed to create booking");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create booking";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">Bookings</h2>
          <input
            type="text"
            placeholder="Search by id, user email, or package title..."
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            className="w-full sm:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-5">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
            <div className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{total}</div>
          </div>
        </div>

        {/* Admin create booking */}
        <form onSubmit={createBookingAdmin} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* User email */}
          <div>
            <input
              list="user-emails"
              placeholder="User email"
              value={newUserEmail}
              onChange={(e)=>setNewUserEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
            <datalist id="user-emails">
              {users.map(u => (
                <option key={u._id} value={u.email}>{u.name ? `${u.name}` : u.email}</option>
              ))}
            </datalist>
          </div>
          {/* Package title */}
          <div>
            <input
              list="package-titles"
              placeholder="Package title"
              value={newPackageTitle}
              onChange={(e)=>setNewPackageTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
            <datalist id="package-titles">
              {packages.map(p => (
                <option key={p._id} value={p.title} />
              ))}
            </datalist>
          </div>
          {/* Travelers */}
          <div>
            <input
              type="number"
              min={1}
              placeholder="Travelers"
              value={newTravelers}
              onChange={(e)=>setNewTravelers(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* Start date */}
          <div>
            <input
              type="date"
              placeholder="Start date"
              value={newStartDate}
              onChange={(e)=>setNewStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* End date (optional) */}
          <div>
            <input
              type="date"
              placeholder="End date (optional)"
              value={newEndDate}
              onChange={(e)=>setNewEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
            />
          </div>
          {/* Customer name */}
          <div>
            <input
              placeholder="Customer name"
              value={custName}
              onChange={(e)=>setCustName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* Customer email */}
          <div>
            <input
              type="email"
              placeholder="Customer email"
              value={custEmail}
              onChange={(e)=>setCustEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* Customer phone */}
          <div>
            <input
              placeholder="Customer phone"
              value={custPhone}
              onChange={(e)=>setCustPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* Payment method */}
          <div>
            <select
              value={newPaymentMethod}
              onChange={(e)=>setNewPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
              <option value="card">Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          {/* Payment status */}
          <div>
            <select
              value={newPaymentStatus}
              onChange={(e)=>setNewPaymentStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm disabled:opacity-50"
          >{creating ? 'Creating...' : 'Create Booking'}</button>
        </form>

        {/* Bookings table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="py-2 pr-4">Booking</th>
                <th className="py-2 pr-4">User (Email)</th>
                <th className="py-2 pr-4">Package (Title)</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6" colSpan={5}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6" colSpan={5}>No bookings found.</td></tr>
              ) : (
                items.map((b) => {
                  const short = (val) => (val ? String(val).slice(0, 10) + (String(val).length > 10 ? '…' : '') : '-');
                  const created = b?.createdAt ? new Date(b.createdAt).toLocaleString() : '-';
                  const payLabel = b?.payment_info ? (b.payment_info.status || 'Provided') : 'NA';
                  return (
                    <tr key={b._id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">{short(b._id)}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{b.userEmail || short(b.userId)}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{b.packageTitle || short(b.packageId)}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{created}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{payLabel}</td>
                    </tr>
                  );
                })
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
