"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";

export default function AdminCreateBookingPage() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [userId, setUserId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!API_URL) return;
    if (!userId.trim() || !packageId.trim()) {
      toast.error("userId and packageId are required");
      return;
    }
    try {
      setCreating(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const payload = {
        userId: userId.trim(),
        packageId: packageId.trim(),
        payment_info: paymentStatus ? { status: paymentStatus } : undefined,
      };
      const { data } = await axios.post(`${API_URL}/bookings/admin`, payload, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (data?.success) {
        toast.success("Booking created");
        setUserId("");
        setPackageId("");
        setPaymentStatus("");
        router.push("/admin?tab=bookings");
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Create Booking</h1>
        <Link href="/admin?tab=bookings" className="text-sm text-rose-600 hover:underline">
          Back to Bookings
        </Link>
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Package ID"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Payment status (optional)"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}