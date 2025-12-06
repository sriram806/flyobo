"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

const ProfileSetting = () => {
  const user = useSelector((state) => state?.auth?.user);
  const dispatch = useDispatch();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const disablePwSubmit = pwLoading || !currentPassword || !newPassword || !confirmPassword || passwordsMismatch;

  // ✅ Change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!API_URL) return toast.error("API base URL is missing");
    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error("Please fill in all fields");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      setPwLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

      await axios.put(
        `${API_URL}/user/change-password`,
        { oldPassword: currentPassword, newPassword },
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update password";
      toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

  // 🗑️ Delete account handler
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!API_URL) return toast.error("API base URL is missing");

    const confirmed = confirm("⚠️ Are you sure you want to permanently delete your account?");
    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

      await axios.delete(`${API_URL}/user/${user._id}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      toast.success("Your account has been deleted successfully.");
      
      // Clear all storage and state
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie?.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      // Dispatch logout after clearing storage
      dispatch(logout());
      
      // Force page reload to ensure clean state
      window.location.href = "/";
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete account";
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="relative p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your account preferences and security.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6">
            {/* 🔑 Change Password */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Secure your account by updating your password regularly.
              </p>

              <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    minLength={6}
                    className="mt-1 text-gray-900 dark:text-gray-200 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="•••••••"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                      className="mt-1 text-gray-900 dark:text-gray-200 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="•••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                      className="mt-1 w-full text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="•••••••"
                    />
                    {passwordsMismatch && (
                      <p className="mt-1 text-xs text-rose-600">Passwords do not match.</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={disablePwSubmit}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-500 text-white px-4 py-2 text-sm hover:bg-sky-700 disabled:opacity-60 transition"
                  >
                    {pwLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* 🗑️ Delete Account */}
            <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-red-500/10 dark:bg-rose-950/30 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Account</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Permanently delete your account and remove all associated data.
              </p>

              <form onSubmit={handleDeleteAccount} className="mt-6 space-y-4">
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={deleteLoading}
                    aria-label="Delete account permanently"
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-600 text-white px-4 py-2 text-sm hover:bg-rose-700 disabled:opacity-60 transition"
                  >
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSetting;
