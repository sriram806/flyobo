"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  Search,
  TrendingUp,
  Users
} from "lucide-react";

const AdminPayoutsManagement = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all-time');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [payoutStats, setPayoutStats] = useState({});

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const statusFilters = [
    { value: 'all', label: 'All Payouts' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  const dateFilters = [
    { value: 'all-time', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' }
  ];

  useEffect(() => {
    fetchPayouts();
    fetchPayoutStats();
  }, [statusFilter, dateFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPayouts = [
        {
          id: 'PAY001',
          user: {
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            id: 'USR001'
          },
          amount: 1500,
          status: 'completed',
          requestedAt: '2024-01-10T10:30:00Z',
          processedAt: '2024-01-10T14:45:00Z',
          method: 'bank_transfer',
          referralsCount: 15,
          transactionId: 'TXN123456789',
          bankDetails: {
            accountNumber: '****1234',
            ifscCode: 'HDFC0001234',
            accountHolder: 'Rajesh Kumar'
          }
        },
        {
          id: 'PAY002',
          user: {
            name: 'Priya Sharma',
            email: 'priya@example.com',
            id: 'USR002'
          },
          amount: 2300,
          status: 'processing',
          requestedAt: '2024-01-09T15:20:00Z',
          processedAt: null,
          method: 'upi',
          referralsCount: 23,
          transactionId: null,
          upiId: 'priya@okhdfc'
        },
        {
          id: 'PAY003',
          user: {
            name: 'Amit Patel',
            email: 'amit@example.com',
            id: 'USR003'
          },
          amount: 800,
          status: 'pending',
          requestedAt: '2024-01-08T09:15:00Z',
          processedAt: null,
          method: 'wallet',
          referralsCount: 8,
          transactionId: null
        }
      ];
      
      setPayouts(mockPayouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setPayoutStats({
        totalPayouts: 156,
        totalAmount: 234500,
        pendingPayouts: 23,
        pendingAmount: 15600,
        completedThisMonth: 45,
        avgProcessingTime: 2.4
      });
    } catch (error) {
      console.error("Error fetching payout stats:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleProcessPayout = async (payoutId) => {
    try {
      setPayouts(payouts.map(payout => 
        payout.id === payoutId 
          ? { ...payout, status: 'processing' }
          : payout
      ));
      toast.success("Payout processing initiated");
    } catch (error) {
      toast.error("Failed to process payout");
    }
  };

  const handleApprovePayout = async (payoutId) => {
    try {
      setPayouts(payouts.map(payout => 
        payout.id === payoutId 
          ? { 
              ...payout, 
              status: 'completed', 
              processedAt: new Date().toISOString(),
              transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
            }
          : payout
      ));
      toast.success("Payout approved successfully");
    } catch (error) {
      toast.error("Failed to approve payout");
    }
  };

  const handleRejectPayout = async (payoutId) => {
    if (!confirm("Are you sure you want to reject this payout?")) return;
    
    try {
      setPayouts(payouts.map(payout => 
        payout.id === payoutId 
          ? { ...payout, status: 'failed' }
          : payout
      ));
      toast.success("Payout rejected");
    } catch (error) {
      toast.error("Failed to reject payout");
    }
  };

  const exportPayouts = () => {
    const csvContent = [
      ['Payout ID', 'User Name', 'Email', 'Amount', 'Status', 'Method', 'Requested Date', 'Transaction ID'].join(','),
      ...filteredPayouts.map(payout => [
        payout.id,
        payout.user.name,
        payout.user.email,
        payout.amount,
        payout.status,
        payout.method,
        new Date(payout.requestedAt).toLocaleDateString(),
        payout.transactionId || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${statusFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    const matchesSearch = payout.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payout.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payout.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payouts Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage referral reward payouts and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPayouts()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportPayouts}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payouts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{payoutStats.totalPayouts || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{payoutStats.totalAmount || 0}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payouts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{payoutStats.pendingPayouts || 0}</p>
              <p className="text-xs text-gray-500">₹{payoutStats.pendingAmount || 0} pending</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{payoutStats.avgProcessingTime || 0}h</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search payouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
          >
            {statusFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
          >
            {dateFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payout Requests ({filteredPayouts.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payout ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {payout.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-r from-sky-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {payout.user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payout.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payout.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-600">₹{payout.amount}</div>
                    <div className="text-xs text-gray-500">{payout.referralsCount} referrals</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {payout.method.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                      {getStatusIcon(payout.status)}
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>{new Date(payout.requestedAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(payout.requestedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPayout(payout);
                          setShowDetailsModal(true);
                        }}
                        className="text-sky-600 hover:text-sky-900 dark:hover:text-sky-400"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {payout.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleProcessPayout(payout.id)}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                          >
                            Process
                          </button>
                          <button
                            onClick={() => handleRejectPayout(payout.id)}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {payout.status === 'processing' && (
                        <button
                          onClick={() => handleApprovePayout(payout.id)}
                          className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Details Modal */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payout Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payout ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPayout.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayout.status)}`}>
                      {getStatusIcon(selectedPayout.status)}
                      {selectedPayout.status.charAt(0).toUpperCase() + selectedPayout.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      User
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPayout.user.name}</p>
                    <p className="text-xs text-gray-500">{selectedPayout.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount
                    </label>
                    <p className="text-lg font-bold text-green-600">₹{selectedPayout.amount}</p>
                    <p className="text-xs text-gray-500">From {selectedPayout.referralsCount} referrals</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Method
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedPayout.method.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Transaction ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedPayout.transactionId || 'Not generated'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Requested At
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedPayout.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Processed At
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedPayout.processedAt 
                        ? new Date(selectedPayout.processedAt).toLocaleString()
                        : 'Not processed'
                      }
                    </p>
                  </div>
                </div>

                {/* Payment Method Details */}
                {selectedPayout.bankDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bank Details
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-sm"><strong>Account Holder:</strong> {selectedPayout.bankDetails.accountHolder}</p>
                      <p className="text-sm"><strong>Account Number:</strong> {selectedPayout.bankDetails.accountNumber}</p>
                      <p className="text-sm"><strong>IFSC Code:</strong> {selectedPayout.bankDetails.ifscCode}</p>
                    </div>
                  </div>
                )}

                {selectedPayout.upiId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      UPI Details
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm"><strong>UPI ID:</strong> {selectedPayout.upiId}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6">
                {selectedPayout.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleProcessPayout(selectedPayout.id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Process Payout
                    </button>
                    <button
                      onClick={() => {
                        handleRejectPayout(selectedPayout.id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedPayout.status === 'processing' && (
                  <button
                    onClick={() => {
                      handleApprovePayout(selectedPayout.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutsManagement;