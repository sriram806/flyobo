"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  Users,
  UserPlus,
  Calendar,
  CalendarCheck,
  RefreshCcw,
  Search as SearchIcon,
  Trash2,
  Pencil,
  Eye,
} from "lucide-react";

const PageSize = 10;

export default function AdminBookings() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Edit states
  const [editModal, setEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTravelers, setEditTravelers] = useState(1);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editCustName, setEditCustName] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('pending');
  const [editPaymentMethod, setEditPaymentMethod] = useState('cash');

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
    users.forEach((u) => map.set(String(u._id), u));
    return map;
  }, [users]);

  const packageById = useMemo(() => {
    const map = new Map();
    packages.forEach((p) => map.set(String(p._id), p));
    return map;
  }, [packages]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PageSize)), [total]);

  async function fetchLookups() {
    if (!API_URL) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
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
      if (uRes.status === "fulfilled") {
        const list = uRes.value?.data?.users || uRes.value?.data?.data || uRes.value?.data || [];
        setUsers(Array.isArray(list) ? list : []);
      }
      if (pRes.status === "fulfilled") {
        const list = pRes.value?.data?.packages || pRes.value?.data?.data || pRes.value?.data || [];
        setPackages(Array.isArray(list) ? list : []);
      }
    } catch { }
  }

  async function load() {
    if (!API_URL) return;
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const { data } = await axios.get(`${API_URL}/bookings`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = data?.bookings || data?.data || [];

      // enrich with email/title
      const enriched = list.map((b) => ({
        ...b,
        userEmail: userById.get(String(b.userId))?.email || b.userEmail || "",
        packageTitle: packageById.get(String(b.packageId))?.title || b.packageTitle || "",
      }));

      const t = q.trim().toLowerCase();
      const filtered = enriched.filter((b) => {
        if (t) {
          const id = (b?._id || "").toString().toLowerCase();
          const email = (b?.userEmail || "").toLowerCase();
          const title = (b?.packageTitle || "").toLowerCase();
          if (!(id.includes(t) || email.includes(t) || title.includes(t))) return false;
        }
        if (paymentFilter && paymentFilter !== 'all') {
          const p = (b?.payment_info?.status || '').toLowerCase();
          if (paymentFilter === 'completed') {
            // treat paid/completed as equivalent
            if (!(p.includes('paid') || p.includes('completed'))) return false;
          } else {
            if (!p.includes(paymentFilter)) return false;
          }
        }
        return true;
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
    // include primitive deps to keep array size stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, paymentFilter, users.length, packages.length]);

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
    const user = users.find((u) => u.email?.toLowerCase() === newUserEmail.trim().toLowerCase());
    const pkg = packages.find((p) => p.title?.toLowerCase() === newPackageTitle.trim().toLowerCase());
    if (!user) {
      toast.error("User email not found");
      return;
    }
    if (!pkg) {
      toast.error("Package title not found");
      return;
    }

    try {
      setCreating(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
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
        source: "agent",
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

  async function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const { data } = await axios.delete(`${API_URL}/bookings/${id}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (data?.success) {
        toast.success("Booking deleted");
        await load();
      } else {
        toast.error(data?.message || "Failed to delete");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(msg);
    }
  }

  // Open edit modal and populate fields
  function openEdit(b) {
    setEditingId(b._id);
    setEditTravelers(b.travelers || (b.customerInfo?.travellers || 1));
    setEditStartDate(b.startDate ? new Date(b.startDate).toISOString().slice(0, 10) : '');
    setEditEndDate(b.endDate ? new Date(b.endDate).toISOString().slice(0, 10) : '');
    setEditCustName(b.customerInfo?.name || '');
    setEditCustEmail(b.customerInfo?.email || '');
    setEditCustPhone(b.customerInfo?.phone || '');
    setEditPaymentStatus(b.payment_info?.status || 'pending');
    setEditPaymentMethod(b.payment_info?.method || 'cash');
    setEditModal(true);
  }

  async function updateBookingAdmin(e) {
    e?.preventDefault?.();
    if (!API_URL || !editingId) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const payload = {
        travelers: Number(editTravelers) || 1,
        startDate: editStartDate || undefined,
        endDate: editEndDate || undefined,
        customerInfo: {
          name: editCustName,
          email: editCustEmail,
          phone: editCustPhone,
        },
        payment_info: {
          method: editPaymentMethod,
          status: editPaymentStatus,
        }
      };

      const { data } = await axios.put(`${API_URL}/bookings/admin/${editingId}`, payload, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (data?.success) {
        toast.success('Booking updated');
        setEditModal(false);
        setEditingId(null);
        await load();
      } else {
        toast.error(data?.message || 'Update failed');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update booking';
      toast.error(msg);
    }
  }

  const renderStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("paid") || s.includes("completed"))
      return <span className="inline-flex px-2 py-1 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-100">Paid</span>;
    if (s.includes("pending"))
      return <span className="inline-flex px-2 py-1 text-xs rounded bg-amber-50 text-amber-700 border border-amber-100">Pending</span>;
    if (s.includes("failed"))
      return <span className="inline-flex px-2 py-1 text-xs rounded bg-rose-50 text-rose-700 border border-rose-100">Failed</span>;
    if (s.includes("refunded"))
      return <span className="inline-flex px-2 py-1 text-xs rounded bg-sky-50 text-sky-700 border border-sky-100">Refunded</span>;
    return <span className="inline-flex px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 border border-gray-200">{status || "NA"}</span>;
  };

  const Skeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 p-4 h-28" />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
        {/* Header / Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">Bookings</h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by id, user email, or package title..."
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
                className="w-full pl-10 pr-3 py-2 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-2 text-sm text-gray-900 dark:text-gray-100">
              <option value="all">All payments</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex text-gray-900 dark:text-gray-100 items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCcw size={16} /> {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Packages</div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{packages?.length ?? 0}</div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Users</div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{users?.length ?? 0}</div>
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
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
            <datalist id="user-emails">
              {users.map((u) => (
                <option key={u._id} value={u.email}>
                  {u.name ? `${u.name}` : u.email}
                </option>
              ))}
            </datalist>
          </div>
          {/* Package title */}
          <div>
            <input
              list="package-titles"
              placeholder="Package title"
              value={newPackageTitle}
              onChange={(e) => setNewPackageTitle(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
            <datalist id="package-titles">
              {packages.map((p) => (
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
              onChange={(e) => setNewTravelers(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* Start date */}
          <div>
            <input
              type="date"
              placeholder="Start date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* End date (optional) */}
          <div>
            <input
              type="date"
              placeholder="End date (optional)"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
            />
          </div>
          {/* Customer name */}
          <div>
            <input
              placeholder="Customer name"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* Customer email */}
          <div>
            <input
              type="email"
              placeholder="Customer email"
              value={custEmail}
              onChange={(e) => setCustEmail(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* Customer phone */}
          <div>
            <input
              placeholder="Customer phone"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          {/* Payment method */}
          <div>
            <select
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
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
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>

        {/* Bookings cards */}
        <div className="mt-6">
          {loading ? (
            <Skeleton />
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-600 dark:text-gray-300">
              <Users className="mx-auto mb-2 text-gray-400" />
              No bookings found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {items.map((b) => {
                const created = b?.createdAt
                  ? new Date(b.createdAt).toLocaleString()
                  : "-";

                const startDate = b?.startDate
                  ? new Date(b.startDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                  : "—";

                const endDate = b?.endDate
                  ? new Date(b.endDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                  : "—";

                const travelers =
                  b?.travelers ?? b?.customerInfo?.travellers ?? "—";

                return (
                  <div
                    key={b._id}
                    className="rounded-2xl border border-gray-100 dark:border-gray-800
        bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm hover:shadow-xl
        transition-all p-6 flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-medium tracking-wide text-gray-400">
                          Booking
                        </span>
                        <h3 className="mt-1 text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
                          {b.packageTitle ||
                            (b.packageId ? String(b.packageId).slice(0, 12) : "—")}
                        </h3>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-medium text-gray-400">Created</p>
                        <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                          {created}
                        </p>
                      </div>
                    </div>

                    {/* Details - 2 cards per row */}
                    <div className="mt-5 grid grid-cols-1 gap-4 text-sm">

                      {/* User */}
                      <div className="flex items-start gap-2">
                        <Users size={15} className="text-gray-500" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">User</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200 break-all">
                            {b.userEmail ||
                              (b.userId ? String(b.userId).slice(0, 10) : "—")}
                          </p>
                        </div>
                      </div>

                      {/* Travelers */}
                      <div className="flex items-start gap-2">
                        <UserPlus size={15} className="text-gray-500" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Travelers</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {travelers}
                          </p>
                        </div>
                      </div>

                      {/* Start Date */}
                      <div className="flex items-start gap-2">
                        <Calendar size={15} className="text-gray-500" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Start Date</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {startDate}
                          </p>
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="flex items-start gap-2">
                        <CalendarCheck size={15} className="text-gray-500" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">End Date</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {endDate}
                          </p>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase">Payment</p>
                        <div className="mt-1">
                          {renderStatusBadge(
                            b?.payment_info?.status || (b.payment_info ? "Provided" : "NA")
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Customer Info */}
                    {b?.customerInfo && (
                      <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-[10px]">
                        <p className="text-[10px] text-gray-400 uppercase">Customer</p>
                        <p className="font-light text-gray-800 dark:text-gray-200 mt-1 leading-snug">
                          {b.customerInfo.name} • {b.customerInfo.email} •{" "}
                          {b.customerInfo.phone}
                        </p>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ID #{String(b._id).slice(0, 10)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          title="View"
                          onClick={() => toast(() => `View booking ${b._id}`)}
                          className="p-2 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => openEdit(b)}
                          className="p-2 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => deleteBooking(b._id)}
                          className="p-2 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditModal(false)} />
          <div className="relative w-full max-w-lg mx-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Booking</h3>
              <form onSubmit={updateBookingAdmin} className="mt-4 grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Travelers</label>
                  <input
                    type="number"
                    min={1}
                    value={editTravelers}
                    onChange={(e) => setEditTravelers(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Start Date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">End Date</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Customer Name</label>
                  <input
                    type="text"
                    value={editCustName}
                    onChange={(e) => setEditCustName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Customer Email</label>
                    <input
                      type="email"
                      value={editCustEmail}
                      onChange={(e) => setEditCustEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Customer Phone</label>
                    <input
                      type="text"
                      value={editCustPhone}
                      onChange={(e) => setEditCustPhone(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Payment Status</label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Payment Method</label>
                    <select
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setEditModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

