"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { Search, RefreshCw, X, CheckCircle, AlertCircle, CreditCard } from "lucide-react";

const rejectionReasons = [
  "Invalid bank details",
  "Suspicious activity detected",
  "User not eligible for reward",
  "Incorrect amount requested",
  "Multiple pending requests",
];

const ReferralRewardsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [approveForm, setApproveForm] = useState({ depositReference: "" });
  const [rejectReason, setRejectReason] = useState("");

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => { fetchAllData(); }, []);
  useEffect(() => { fetchRequests(); }, [filter, page]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchUsers()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      params.set("status", filter);
      params.set("page", page);
      params.set("limit", 20);

      const { data } = await axios.get(`${API_URL}/user/admin/redeem-requests?${params.toString()}`, { withCredentials: true });

      const mapped = (data.data || []).map((r) => ({
        userId: r.userId,
        userName: r.name,
        userEmail: r.email,
        amount: r.amount,
        type: r.type,
        description: r.description,
        createdAt: r.requestedAt,
        historyId: r.historyId,
        status: r.status,
        bankDetails: r.bankDetails || null,
        depositReference: r.depositReference || null,
      }));

      setRequests(mapped);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch requests");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user/get-all-users`, { withCredentials: true });
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openApproveModal = (r) => {
    setSelectedRequest(r);
    setShowApproveModal(true);
  };

  const openRejectModal = (r) => {
    setSelectedRequest(r);
    setRejectReason(rejectionReasons[0]);
    setShowRejectModal(true);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: selectedRequest.userId,
        historyId: selectedRequest.historyId,
        action: "approve",
        depositReference: approveForm.depositReference || null,
      };

      await axios.post(`${API_URL}/user/admin/process-redeem`, payload, { withCredentials: true });
      toast.success("Marked as Paid Successfully!");
      setShowApproveModal(false);
      fetchRequests();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`${API_URL}/user/admin/process-redeem`, {
        userId: selectedRequest.userId,
        historyId: selectedRequest.historyId,
        action: "reject",
        adminNote: rejectReason,
      }, { withCredentials: true });

      toast.success("Request Rejected");
      setShowRejectModal(false);
      fetchRequests();
    } catch (err) {
      toast.error("Rejection failed");
    }
  };

  const filtered = requests.filter((rq) => {
    const q = searchTerm.toLowerCase();
    return (
      (filter === "all" || rq.status === filter) &&
      (rq.userName?.toLowerCase().includes(q) || rq.userEmail?.toLowerCase().includes(q))
    );
  });

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-600",
      credited: "bg-blue-500/20 text-blue-600",
      used: "bg-purple-500/20 text-purple-600",
      expired: "bg-gray-500/20 text-gray-600",
      paid: "bg-green-500/20 text-green-600",
      rejected: "bg-red-500/20 text-red-600",
    };
    return <span className={`px-3 py-1 rounded text-xs font-semibold ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Referral Rewards Management</h1>
        <button onClick={fetchAllData} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 border rounded dark:bg-gray-800"
            placeholder="Search by name or email"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded dark:bg-gray-800"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="credited">Credited</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Bank</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.historyId} className="border-t dark:border-gray-700">
                <td className="p-3">
                  <div className="font-medium">{r.userName}</div>
                  <div className="text-xs text-gray-400">{r.userEmail}</div>
                </td>
                <td className="p-3 font-semibold">₹{r.amount}</td>
                <td className="p-3 text-xs">
                  {r.bankDetails ? (
                    <div>
                      <div className="font-medium">{r.bankDetails.accountHolderName}</div>
                      <div>A/C: {r.bankDetails.accountNumber}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No bank details</span>
                  )}
                </td>

                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3">{statusBadge(r.status)}</td>

                <td className="p-3 flex gap-2">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => openApproveModal(r)}
                        className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>

                      <button
                        onClick={() => openRejectModal(r)}
                        className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-1"
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { setDetailsRequest(r); setShowDetailsModal(true); }}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-sm rounded flex items-center gap-1"
                  >
                    <Search size={14} /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard size={18} /> Confirm Payment
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-300">
              Mark this redeem request as <b>Paid</b> after completing the transaction.
            </p>

            {/* Bank details preview for admin confirmation */}
            {selectedRequest.bankDetails ? (
              <div className="p-3 border rounded bg-gray-50 dark:bg-gray-900 text-sm space-y-1">
                <div className="font-semibold">Bank Details</div>
                <div>{selectedRequest.bankDetails.accountHolderName}</div>
                <div>A/C: {selectedRequest.bankDetails.accountNumber}</div>
                <div>Bank: {selectedRequest.bankDetails.bankName}</div>
                <div>IFSC: {selectedRequest.bankDetails.ifscCode}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">No bank details available for this request.</div>
            )}

            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="text-sm">Deposit Reference ID</label>
                <input
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700"
                  value={approveForm.depositReference}
                  onChange={(e) => setApproveForm({ depositReference: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowApproveModal(false)} type="button" className="px-3 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                  Mark as Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-red-600">
              <AlertCircle size={18} /> Reject Request
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-300">
              Select a predefined reason for rejecting this request.
            </p>

            <select
              className="w-full border px-3 py-2 rounded dark:bg-gray-700"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              {rejectionReasons.map((reason, idx) => (
                <option key={idx} value={reason}>{reason}</option>
              ))}
            </select>

            <div className="text-xs text-gray-400">You can choose one of the predefined reasons above; it will be sent to the user as the admin note.</div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailsRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Request Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-sm px-2 py-1">Close</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">User</div>
                <div>{detailsRequest.userName}</div>
                <div className="text-xs text-gray-500">{detailsRequest.userEmail}</div>
              </div>

              <div>
                <div className="font-semibold">Amount</div>
                <div>₹{detailsRequest.amount}</div>
                <div className="text-xs text-gray-500">Requested: {new Date(detailsRequest.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="p-3 border rounded bg-gray-50 dark:bg-gray-900 text-sm space-y-1">
              <div className="font-semibold">Bank Details</div>
              {detailsRequest.bankDetails ? (
                <>
                  <div>{detailsRequest.bankDetails.accountHolderName}</div>
                  <div>A/C: {detailsRequest.bankDetails.accountNumber}</div>
                  <div>Bank: {detailsRequest.bankDetails.bankName}</div>
                  <div>IFSC: {detailsRequest.bankDetails.ifscCode}</div>
                </>
              ) : (
                <div className="text-gray-400">No bank details available.</div>
              )}
            </div>

            <div>
              <div className="font-semibold">Description</div>
              <div className="text-sm text-gray-600">{detailsRequest.description || "—"}</div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralRewardsManagement;