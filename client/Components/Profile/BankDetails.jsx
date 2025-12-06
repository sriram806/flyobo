"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { HiOutlineRefresh } from "react-icons/hi";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL 

export default function BankDetails() {
  const user = useSelector((s) => s?.auth?.user);
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    isVerified: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchBankDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBankDetails = async () => {
    if (!API_URL) return setLoading(false);
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/user/bank-details`, { withCredentials: true });
      if (data?.success && data.data) {
        setBankDetails({
          accountHolderName: data.data.accountHolderName || "",
          accountNumber: data.data.accountNumber || "",
          bankName: data.data.bankName || "",
          ifscCode: data.data.ifscCode || "",
          isVerified: !!data.data.isVerified,
        });
        setIsEditing(!!data.data.accountNumber);
      } else {
        setBankDetails((s) => ({ ...s, isVerified: false }));
        setIsEditing(false);
      }
    } catch (err) {
      if (err?.response?.status === 401) toast.error("Session expired. Please login again.");
      else toast.error("Failed to load bank details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!API_URL) return toast.error("API URL not configured");
    if (bankDetails.ifscCode && !/^[A-Z0-9]{11}$/i.test(bankDetails.ifscCode)) {
      return toast.error("IFSC code should be 11 alphanumeric characters");
    }
    if (bankDetails.accountNumber && !/^\d+$/.test(bankDetails.accountNumber)) {
      return toast.error("Account number should contain only digits");
    }

    setSubmitting(true);
    try {
      const { data } = await axios.put(`${API_URL}/user/bank-details`, bankDetails, { withCredentials: true });
      if (data?.success) {
        toast.success("Bank details updated successfully");
        setIsEditing(true);
        setBankDetails({
          accountHolderName: data.data?.accountHolderName || "",
          accountNumber: data.data?.accountNumber || "",
          bankName: data.data?.bankName || "",
          ifscCode: data.data?.ifscCode || "",
          isVerified: true,
        });
      } else {
        toast.error(data?.message || "Failed to update bank details");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update bank details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your bank account for payouts</p>
        </div>
        <button
          onClick={fetchBankDetails}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <HiOutlineRefresh className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Bank Account Information
          </h3>

          {!bankDetails.accountNumber ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" /> Not Set
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" /> Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                value={bankDetails.accountHolderName}
                onChange={handleInputChange}
                placeholder="Account holder name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleInputChange}
                placeholder="Account number"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleInputChange}
                placeholder="Bank name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                placeholder="IFSC code"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-200"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white rounded-lg"
            >
              {submitting ? "Saving..." : isEditing ? "Update Bank Details" : "Save Bank Details"}
            </button>
          </div>
        </form>

        {bankDetails.accountNumber && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-300/10 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Important</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-200 space-y-1">
              <li>• Your bank details are used for reward payouts.</li>
              <li>• Make sure the account number and IFSC are correct.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
