"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { Search, Filter, Plus, DollarSign } from "lucide-react";

const ReferralRewardsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveForm, setApproveForm] = useState({ userId: "", amount: "", description: "", historyId: "", depositReference: "" });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchUsers()]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user/admin/redeem-requests`, { withCredentials: true });
      const mapped = (data.data || []).map((r) => ({
        userId: r.userId,
        userName: r.name,
        userEmail: r.email,
        amount: r.amount,
        description: r.description,
        createdAt: r.requestedAt,
        historyId: r.historyId,
        status: 'pending'
      }));
      setRequests(mapped);
    } catch (err) {
      console.error('Fetch requests error', err);
    }
  };

  const fetchUsers = async () => {
    try {
      // endpoint is mounted under /user on the backend (app.use('/api/v1/user', userRoute))
      const { data } = await axios.get(`${API_URL}/user/get-all-users`, { withCredentials: true });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Fetch users error', err);
    }
  };

  const openApproveModal = (req) => {
    setShowApproveModal(true);
    setApproveForm({ userId: req.userId, amount: req.amount, description: req.description, historyId: req.historyId, depositReference: '' });
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
    setApproveForm({ userId: "", amount: "", description: "", historyId: "", depositReference: "" });
  };

  const handleApproveChange = (e) => setApproveForm({ ...approveForm, [e.target.name]: e.target.value });

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: approveForm.userId,
        historyId: approveForm.historyId,
        action: 'approve',
        depositReference: approveForm.depositReference || null,
        adminNote: approveForm.description || null
      };
      await axios.post(`${API_URL}/user/admin/process-redeem`, payload, { withCredentials: true });
      toast.success('Redeem request approved and marked as paid');
      closeApproveModal();
      fetchRequests();
    } catch (err) {
      console.error('Approve error', err);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (r) => {
    const note = prompt('Reason for rejection (optional)');
    try {
      await axios.post(`${API_URL}/user/admin/process-redeem`, { userId: r.userId, historyId: r.historyId, action: 'reject', adminNote: note || null }, { withCredentials: true });
      toast.success('Redeem request rejected');
      fetchRequests();
    } catch (err) {
      console.error('Reject error', err);
      toast.error('Failed to reject request');
    }
  };

  const filtered = requests.filter((rq) => {
    const matchesFilter = filter === 'all' || rq.status === filter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || rq.userName?.toLowerCase().includes(q) || rq.userEmail?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Referral Rewards Management</h1>
          <p className="text-sm text-gray-500">Manage referral reward redemption requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAllData} className="px-3 py-2 bg-gray-100 rounded">Refresh</button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input className="pl-10 pr-4 py-2 w-full border rounded" placeholder="Search by name or email" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded">
          <option value="all">All</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="py-2">User</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Requested</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.historyId} className="border-t">
                <td className="py-3">
                  <div className="font-medium">{r.userName}</div>
                  <div className="text-xs text-gray-500">{r.userEmail}</div>
                </td>
                <td className="py-3">₹{r.amount}</td>
                <td className="py-3">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openApproveModal(r)} className="px-3 py-1 bg-green-500 text-white rounded">Approve</button>
                    <button onClick={() => handleReject(r)} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">No pending requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Approve modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold">Approve Redeem Request</h3>
            <form onSubmit={handleApproveSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm">User</label>
                <select name="userId" value={approveForm.userId} onChange={handleApproveChange} className="w-full border rounded px-3 py-2">
                  <option value="">Select user</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm">Amount</label>
                <input name="amount" value={approveForm.amount} onChange={handleApproveChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm">Deposit Reference</label>
                <input name="depositReference" value={approveForm.depositReference} onChange={handleApproveChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeApproveModal} className="px-3 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Approve</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralRewardsManagement;