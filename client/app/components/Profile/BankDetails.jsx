"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";

const BankDetails = () => {
  const user = useSelector((state) => state?.auth?.user);
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    isVerified: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/user/bank-details`, {
        withCredentials: true
      });

      if (data.success) {
        if (data.data) {
          setBankDetails({
            accountHolderName: data.data.accountHolderName || "",
            accountNumber: data.data.accountNumber || "",
            bankName: data.data.bankName || "",
            ifscCode: data.data.ifscCode || "",
            isVerified: !!data.data.isVerified,
          });
          setIsEditing(!!(data.data.accountNumber));
        } else {
          setBankDetails({
            accountHolderName: "",
            accountNumber: "",
            bankName: "",
            ifscCode: "",
            isVerified: false
          });
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load bank details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (bankDetails.ifscCode && !/^[A-Z0-9]{11}$/.test(bankDetails.ifscCode.toUpperCase())) {
        toast.error("IFSC code should be 11 characters alphanumeric");
        setSubmitting(false);
        return;
      }
      if (bankDetails.accountNumber && !/^\d+$/.test(bankDetails.accountNumber)) {
        toast.error("Account number should contain only digits");
        setSubmitting(false);
        return;
      }

      const { data } = await axios.put(`${API_URL}/user/bank-details`, bankDetails, {
        withCredentials: true
      });

      if (data.success) {
        toast.success("Bank details updated successfully");
        setIsEditing(true);
        setBankDetails({
          accountHolderName: data.data.accountHolderName || "",
          accountNumber: data.data.accountNumber || "",
          bankName: data.data.bankName || "",
          ifscCode: data.data.ifscCode || "",
          isVerified: true,
        });
      } else {
        toast.error(data.message || "Failed to update bank details");
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error(error.response?.data?.message || "Failed to update bank details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bank Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your bank account information for reward payments
          </p>
        </div>
        <button
          onClick={fetchBankDetails}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Information
          </h3>
          {/* Show simple status: saved or not saved. We don't require admin approval to store bank details. */}
          {!bankDetails.accountNumber ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Set
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={bankDetails.accountHolderName}
                onChange={handleInputChange}
                placeholder="Enter account holder name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleInputChange}
                placeholder="Enter account number"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleInputChange}
                placeholder="Enter bank name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={bankDetails.ifscCode}
                onChange={handleInputChange}
                placeholder="Enter IFSC code"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Bank Details' : 'Save Bank Details'}
            </button>
          </div>
        </form>

        {bankDetails.accountNumber && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Important Information</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Your bank details are used for reward payments.</li>
              <li>• Details are saved immediately; no admin approval is required to store them.</li>
              <li>• Ensure the account number and IFSC are correct to avoid transfer failures.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDetails;