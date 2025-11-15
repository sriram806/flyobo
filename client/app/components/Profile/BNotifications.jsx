"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { formatDistanceToNow } from "date-fns";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { toast } from "react-hot-toast";

const API_URL =
  NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function BNotifications() {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s?.auth?.user);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("all");
  const [actorOptions, setActorOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchNotifications = async (p = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/notification?page=${p}&limit=${limit}`,
        { withCredentials: true }
      );
      const data = res.data;
      if (data.success) {
        let notifs = data.notifications || data.data?.notifications || [];
        if (statusFilter !== "all") {
          notifs = notifs.filter((n) =>
            statusFilter === "unread"
              ? n.status === "unread"
              : n.status === "read"
          );
        }
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          notifs = notifs.filter((n) =>
            (n.title + " " + n.message).toLowerCase().includes(q)
          );
        }
  setNotifications(notifs);

        // Collect actor options
        const actors = [];
        notifs.forEach((n) => {
          if (n.actor && n.actor._id) {
            const exists = actors.find((a) => a._id === n.actor._id);
            if (!exists) actors.push(n.actor);
          }
        });
        setActorOptions(actors);

        const pagination = data.pagination || data.data?.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setPage(pagination.currentPage || p);

        // Update unread count in Redux so sidebar badges stay in sync
        try {
          const unreadCount = Array.isArray(notifs) ? notifs.filter((x) => x.status === "unread").length : 0;
          if (authUser && authUser.unreadNotificationsCount !== unreadCount) {
            // Merge into existing user object to avoid overwriting other fields
            const updatedUser = { ...authUser, unreadNotificationsCount: unreadCount };
            dispatch(setAuthUser(updatedUser));
          }
        } catch (e) {
          // non-fatal
        }
      } else {
        toast.error(data.message || "Failed to load notifications");
      }
    } catch (err) {
      console.error("Fetch notifications error", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchNotifications(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, statusFilter, actorFilter]);

  const markAsRead = async (id) => {
    try {
      const res = await axios.put(
        `${API_URL}/notification/${id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Marked as read");
        fetchNotifications(page);
      } else {
        toast.error(res.data.message || "Failed to mark as read");
      }
    } catch (err) {
      console.error("Mark read error", err);
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/notification/mark-all-read`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message || "All marked as read");
        fetchNotifications(1);
      } else {
        toast.error(res.data.message || "Failed to mark all");
      }
    } catch (err) {
      console.error("Mark all read error", err);
      toast.error("Failed to mark all as read");
    }
  };

  const handlePrev = () => {
    if (page > 1) fetchNotifications(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) fetchNotifications(page + 1);
  };

  return (
    <div className="relative rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-6 transition-all">
      {/* 🔍 Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          placeholder="Search notifications..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-gray-900 dark:text-gray-200 px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-gray-900 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="px-3 py-2 text-gray-900 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
        >
          <option value="all">From: All</option>
          {actorOptions.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name || a.email}
            </option>
          ))}
        </select>
        <button
          onClick={markAllRead}
          className="px-4 py-2 rounded bg-sky-600 text-white text-sm hover:bg-sky-700 transition"
        >
          Mark all as read
        </button>
      </div>

      {/* 🔔 Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse h-24 rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          No notifications found.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications
            .filter(
              (n) => actorFilter === "all" || n.actor?._id === actorFilter
            )
            .map((n) => (
              <li
                key={n._id}
                className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                  n.status === "unread"
                    ? "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {n.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {n.message}
                    </p>
                    {n.actor && (
                      <p className="mt-1 text-xs text-gray-400">
                        From: {n.actor.name || n.actor.email}
                      </p>
                    )}
                  </div>
                  <div className="ml-3 flex flex-col items-end gap-2">
                    {n.status === "unread" ? (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="text-xs px-3 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Read</span>
                    )}
                    <button
                      onClick={() =>
                        setSelected(selected === n._id ? null : n._id)
                      }
                      className="text-xs text-sky-600 dark:text-sky-400"
                    >
                      {selected === n._id ? "Hide" : "View"}
                    </button>
                  </div>
                </div>

                {selected === n._id && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-all">
                    <p>{n.message}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Created: {new Date(n.createdAt).toLocaleString()}
                    </p>
                    {n.actor && (
                      <p className="text-xs text-gray-400">
                        Sender: {n.actor.name || n.actor.email}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
        </ul>
      )}

      {/* 🔄 Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={page <= 1}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <HiOutlineArrowLeft />
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page >= totalPages}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <HiOutlineArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}
