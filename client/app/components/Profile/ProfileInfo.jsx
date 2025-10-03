"use client";

import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
  HiOutlineMail, HiOutlinePencil, HiOutlineBadgeCheck,
  HiOutlineBell, HiOutlineLink, HiOutlineCalendar, HiOutlinePhone,
} from "react-icons/hi";

const ProfileInfo = () => {
  const user = useSelector((state) => state?.auth?.user);
  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  const joinedDate = (() => {
    try {
      if (!user?.createdAt) return "";
      const d = new Date(user.createdAt);
      if (isNaN(d.getTime())) return String(user.createdAt).slice(0, 10);
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  })();

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="h-24 w-24 rounded-full shadow-lg border-4 border-white dark:border-gray-900 overflow-hidden bg-blue-600 flex items-center justify-center">
              {user?.avatar?.url ? (
                <img
                  src={`${user.avatar.url}${user?.updatedAt ? `?v=${new Date(user.updatedAt).getTime()}` : `?v=${Date.now()}`}`}
                  alt={user?.name ? `${user.name}'s avatar` : "User avatar"}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="text-white text-3xl font-bold">{initial}</span>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {user?.name || "Traveler"}
                </h2>
                {(user?.isAccountVerified === true) && (<HiOutlineBadgeCheck className="text-sky-500" title="Verified" aria-label="Verified account" />)}
              </div>
              <div className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <HiOutlineMail />
                <span>{user?.email || "guest@flyobo.com"}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <HiOutlinePhone />
                <span>{user?.phone || "No phone added"}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <HiOutlineCalendar /> Joined {joinedDate}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <HiOutlineBell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <Link
                href="/profile/edit"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <HiOutlinePencil /> Edit
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-blue-500"
                style={{ width: `100%` }}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {user?.bio && user.bio.trim().length > 0 ? (
                user.bio
              ) : (
                <span className="text-gray-500 dark:text-gray-400">No bio added yet.</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Trips", value: "12" },
              { label: "Wishlist", value: "7" },
              { label: "Reviews", value: "18" },
              { label: "Member", value: "Gold" },
            ].map((s, i) => (
              <button
                key={i}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4 text-left hover:shadow-sm transition"
              >
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{s.label}</div>
                <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{s.value}</div>
              </button>
            ))}
          </div>

          {/* Social Links */}
          <div className="mt-6 flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <HiOutlineLink /> Connect Google
            </button>
            <button className="flex items-center gap-2 rounded-lg border px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <HiOutlineLink /> Connect Facebook
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileInfo;
