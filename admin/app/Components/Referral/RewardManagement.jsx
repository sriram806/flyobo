"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaSearch, FaCheckCircle, FaCreditCard, FaUser } from "react-icons/fa";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import Loading from "../Loading/Loading";

const STATUS_FILTERS = ["all","pending","credited","used","expired","paid","rejected"];

const REJECTION_REASONS = [
  "Invalid bank details",
  "Suspicious activity detected",
  "User not eligible for reward",
  "Incorrect amount requested",
  "Multiple pending requests",
];

export default function ReferralRewardsManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);

  const [depositReference, setDepositReference] = useState("");
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
  const [customRejectReason, setCustomRejectReason] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Requests 
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("status", filter);
      params.set("page", page);
      params.set("limit", 20);

      const { data } = await axios.get(
        `${API_URL}/user/admin/redeem-requests?${params.toString()}`,
        { withCredentials: true }
      );

      const mapped = (data.data || []).map((r) => ({
        ...r,
        userName: r.name,
        userEmail: r.email,
        createdAt: r.requestedAt,
      }));

      setRequests(mapped);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter((r) => {
    const q = debouncedSearch.toLowerCase();
    return (
      r.userName?.toLowerCase().includes(q) ||
      r.userEmail?.toLowerCase().includes(q)
    );
  });

  // ===== Approve =====
  const handleApprove = async () => {
    try {
      await axios.post(
        `${API_URL}/user/admin/process-redeem`,
        {
          userId: selectedRequest.userId,
          historyId: selectedRequest.historyId,
          action: "approve",
          depositReference,
        },
        { withCredentials: true }
      );

      toast.success("Marked as Paid!");
      setApproveModal(false);
      fetchRequests();
    } catch {
      toast.error("Approval failed");
    }
  };

  // ===== Reject =====
  const handleReject = async () => {
    try {
      await axios.post(
        `${API_URL}/user/admin/process-redeem`,
        {
          userId: selectedRequest.userId,
          historyId: selectedRequest.historyId,
          action: "reject",
          adminNote:
            rejectReason === "custom" ? customRejectReason : rejectReason,
        },
        { withCredentials: true }
      );

      toast.success("Request Rejected");
      setRejectModal(false);
      fetchRequests();
    } catch {
      toast.error("Rejection failed");
    }
  };

  const statusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-700",
      paid: "bg-green-500/20 text-green-700",
      rejected: "bg-red-500/20 text-red-700",
      used: "bg-purple-500/20 text-purple-700",
      credited: "bg-blue-500/20 text-blue-700",
      expired: "bg-gray-500/20 text-gray-700",
    };
    return (
      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Referral Rewards Management</h1>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
        >
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative w-full max-w-xs">
          <FaSearch className="absolute left-3 top-3 text-gray-400" size={17} />
          <input
            className="w-full pl-10 py-2 border text-gray-900 dark:text-gray-200 rounded dark:bg-gray-800"
            placeholder="Search by name/email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 text-gray-900 dark:text-gray-200 py-1 rounded-full border text-sm ${
                filter === s ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl dark:border-gray-700 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-900 dark:text-gray-200 dark:bg-gray-800 sticky top-0">
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
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center"><Loading /></td>
              </tr>
            ) : (
              filteredRequests.map((r) => (
                <tr key={r.historyId} className="border-t text-gray-900 dark:text-gray-200 dark:border-gray-700">
                  <td className="p-3">
                    <div className="font-semibold">{r.userName}</div>
                    <div className="text-xs text-gray-500">{r.userEmail}</div>
                  </td>

                  <td className="p-3 font-semibold">₹{r.amount}</td>

                  <td className="p-3 text-xs">
                    {r.bankDetails ? (
                      <>
                        <div className="font-semibold">{r.bankDetails.accountHolderName}</div>
                        <div>A/C: {r.bankDetails.accountNumber}</div>
                      </>
                    ) : (
                      <span className="text-gray-500">No bank details</span>
                    )}
                  </td>

                  <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>

                  <td className="p-3">{statusBadge(r.status)}</td>

                  <td className="p-3 flex gap-2">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(r);
                            setApproveModal(true);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1"
                        >
                          <FaCheckCircle size={14} /> Approve
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRequest(r);
                            setRejectModal(true);
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-1"
                        >
                          <RxCross2 size={14} /> Reject
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setSelectedRequest(r);
                        setDetailsModal(true);
                      }}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-4">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">
          Next
        </button>
      </div>

      {/* ================== APPROVE MODAL ================== */}
      {approveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md animate-scaleIn space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <FaCreditCard /> Confirm Payment
            </h2>

            <p className="text-sm text-gray-500">
              Mark this request as <b>Paid</b>.
            </p>

            <input
              className="w-full border px-3 py-2 rounded dark:bg-gray-700"
              placeholder="Deposit Reference ID"
              value={depositReference}
              onChange={(e) => setDepositReference(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setApproveModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>

              <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded">
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== REJECT MODAL ================== */}
      {rejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md animate-scaleIn space-y-4">
            <h2 className="font-bold text-lg text-red-600 flex items-center gap-2">
              <FiAlertCircle /> Reject Request
            </h2>

            <select
              className="w-full border px-3 py-2 rounded dark:bg-gray-700"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              {REJECTION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
              <option value="custom">Custom Reason</option>
            </select>

            {rejectReason === "custom" && (
              <textarea
                className="w-full border px-3 py-2 rounded dark:bg-gray-700"
                placeholder="Enter custom rejection reason"
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>

              <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== DETAILS MODAL (CENTER) ================== */}
      {detailsModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setDetailsModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 w-full max-w-lg p-6 rounded-xl shadow-xl animate-scaleIn overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaUser /> Request Details
            </h2>

            <div className="mt-4 space-y-4 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="font-semibold text-gray-700 dark:text-gray-200">User</div>
                <div>{selectedRequest.userName}</div>
                <div className="text-gray-500">{selectedRequest.userEmail}</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="font-semibold">Amount</div>
                <div>₹{selectedRequest.amount}</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="font-semibold">Deposit Reference</div>
                <div>{selectedRequest.depositReference || "—"}</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="font-semibold">Bank Details</div>
                {selectedRequest.bankDetails ? (
                  <>
                    <div>{selectedRequest.bankDetails.accountHolderName}</div>
                    <div>A/C: {selectedRequest.bankDetails.accountNumber}</div>
                    <div>Bank: {selectedRequest.bankDetails.bankName}</div>
                    <div>IFSC: {selectedRequest.bankDetails.ifscCode}</div>
                  </>
                ) : (
                  <div className="text-gray-500">No bank details</div>
                )}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="font-semibold">Description</div>
                <div>{selectedRequest.description || "—"}</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="font-semibold">Status</div>
                {statusBadge(selectedRequest.status)}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="font-semibold">Requested On</div>
                <div>{new Date(selectedRequest.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <button
              onClick={() => setDetailsModal(false)}
              className="mt-6 px-4 py-2 w-full border rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Animations */
<style jsx global>{`
  .animate-scaleIn {
    animation: scaleIn 0.25s ease-out;
  }
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.92);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`}</style>
