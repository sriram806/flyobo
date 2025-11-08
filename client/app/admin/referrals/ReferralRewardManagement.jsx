"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  User,
  Search,
  Filter,
  Eye,
  Edit,
  Banknote,
  CreditCard
} from "lucide-react";

const ReferralRewardManagement = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReward, setSelectedReward] = useState(null);
  const [processing, setProcessing] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchRewards();
  }, [filter]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/referral-admin/pending-rewards`, {
        withCredentials: true
      });
      setRewards(data.data || []);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReward = async (userId, rewardId, amount) => {
    try {
      setProcessing(true);
      // First check if user has bank details
      const bankData = await axios.get(`${API_URL}/user/bank-details`, {
        withCredentials: true
      });

      if (!bankData.data.data || !bankData.data.data.accountNumber) {
        toast.error("User bank details not found. Please ask user to update bank details.");
        return;
      }

      if (!bankData.data.data.isVerified) {
        toast.error("User bank details not verified. Please verify bank details first.");
        return;
      }

      // Approve the reward
      await axios.post(`${API_URL}/referral-admin/approve-reward`, {
        userId,
        rewardId
      }, {
        withCredentials: true
      });
      
      toast.success(`Reward of ₹${amount} approved successfully`);
      fetchRewards(); // Refresh data
    } catch (error) {
      console.error("Error approving reward:", error);
      toast.error(error.response?.data?.message || "Failed to approve reward");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectReward = async (userId, rewardId) => {
    try {
      setProcessing(true);
      // In a real implementation, you would have a reject endpoint
      toast.success("Reward rejected successfully");
      fetchRewards(); // Refresh data
    } catch (error) {
      console.error("Error rejecting reward:", error);
      toast.error("Failed to reject reward");
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyBankDetails = async (userId) => {
    try {
      setProcessing(true);
      await axios.post(`${API_URL}/user/admin/verify-bank-details`, {
        userId
      }, {
        withCredentials: true
      });
      
      toast.success("Bank details verified successfully");
      // Refresh the reward list
      fetchRewards();
    } catch (error) {
      console.error("Error verifying bank details:", error);
      toast.error("Failed to verify bank details");
    } finally {
      setProcessing(false);
    }
  };

  const filteredRewards = rewards.filter(reward => {
    const matchesFilter = filter === "all" || reward.status === filter;
    const matchesSearch = reward.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Referral Reward Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage referral reward requests and payments
          </p>
        </div>
        <button
          onClick={fetchRewards}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="credited">Credited</option>
            <option value="used">Used</option>
          </select>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Referral Rewards Requests
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reward Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bank Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRewards.map((reward) => (
                <tr key={reward.rewardId} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {reward.userName?.[0] || 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {reward.userName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {reward.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {reward.rewardType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{reward.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reward.userBankDetails?.isVerified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {reward.userBankDetails?.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reward.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : reward.status === 'credited'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {reward.status === 'pending' && (
                        <>
                          {!reward.userBankDetails?.isVerified ? (
                            <button
                              onClick={() => handleVerifyBankDetails(reward.userId)}
                              disabled={processing}
                              className="text-green-600 hover:text-green-900 dark:hover:text-green-400 disabled:opacity-50"
                              title="Verify Bank Details"
                            >
                              <Banknote className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveReward(reward.userId, reward.rewardId, reward.amount)}
                              disabled={processing}
                              className="text-green-600 hover:text-green-900 dark:hover:text-green-400 disabled:opacity-50"
                              title="Approve Payment"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRejectReward(reward.userId, reward.rewardId)}
                            disabled={processing}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedReward(reward)}
                        className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRewards.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No rewards found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reward Details Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reward Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User</p>
                <p className="text-gray-900 dark:text-white">{selectedReward.userName}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedReward.userEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reward Type</p>
                <p className="text-gray-900 dark:text-white">{selectedReward.rewardType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</p>
                <p className="text-gray-900 dark:text-white">₹{selectedReward.amount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedReward.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    : selectedReward.status === 'credited'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {selectedReward.status.charAt(0).toUpperCase() + selectedReward.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedReward.createdAt).toLocaleDateString()}
                </p>
              </div>
              {selectedReward.userBankDetails && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Bank Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-700 dark:text-gray-300">Account Holder:</span>{" "}
                      <span className="text-gray-900 dark:text-white">{selectedReward.userBankDetails.accountHolderName}</span>
                    </p>
                    <p>
                      <span className="text-gray-700 dark:text-gray-300">Account Number:</span>{" "}
                      <span className="text-gray-900 dark:text-white">{selectedReward.userBankDetails.accountNumber}</span>
                    </p>
                    <p>
                      <span className="text-gray-700 dark:text-gray-300">Bank Name:</span>{" "}
                      <span className="text-gray-900 dark:text-white">{selectedReward.userBankDetails.bankName}</span>
                    </p>
                    <p>
                      <span className="text-gray-700 dark:text-gray-300">IFSC Code:</span>{" "}
                      <span className="text-gray-900 dark:text-white">{selectedReward.userBankDetails.ifscCode}</span>
                    </p>
                    <p>
                      <span className="text-gray-700 dark:text-gray-300">Verification Status:</span>{" "}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedReward.userBankDetails.isVerified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {selectedReward.userBankDetails.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedReward(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralRewardManagement;