"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { formatDistanceToNow } from "date-fns";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL 

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

  const getConfig = useCallback(() => {
    const cfg = { withCredentials: true };
    if (typeof window === "undefined") return cfg;
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (token) cfg.headers = { Authorization: `Bearer ${token}` };
    return cfg;
  }, []);

  const fetchNotifications = useCallback(
    async (p = 1) => {
      if (!API_URL) {
        toast.error("API URL not configured");
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/notification`, {
          params: { page: p, limit },
          withCredentials: true,
          ...getConfig(),
        });
        const data = res.data || {};
        const raw = data.notifications || data.data?.notifications || [];
        let list = Array.isArray(raw) ? raw : [];

        if (statusFilter !== "all") {
          list = list.filter((n) => (statusFilter === "unread" ? n.status === "unread" : n.status === "read"));
        }
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          list = list.filter((n) => (`${n.title} ${n.message}`).toLowerCase().includes(q));
        }

        setNotifications(list);

        const actors = [];
        list.forEach((n) => {
          if (n.actor && n.actor._id && !actors.find((a) => a._id === n.actor._id)) {
            actors.push(n.actor);
          }
        });
        setActorOptions(actors);

        const pagination = data.pagination || data.data?.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setPage(pagination.currentPage || p);

        const unreadCount = Array.isArray(list) ? list.filter((x) => x.status === "unread").length : 0;
        if (authUser && authUser.unreadNotificationsCount !== unreadCount) {
          dispatch(setAuthUser({ ...authUser, unreadNotificationsCount: unreadCount }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [API_URL, limit, statusFilter, query, dispatch, authUser, getConfig]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  useEffect(() => {
    const t = setTimeout(() => fetchNotifications(1), 300);
    return () => clearTimeout(t);
  }, [query, statusFilter, actorFilter, fetchNotifications]);

  const markAsRead = async (id) => {
    if (!API_URL) return toast.error("API URL not configured");
    try {
      const res = await axios.put(`${API_URL}/notification/${id}`, {}, { withCredentials: true, ...getConfig() });
      if (res.data?.success) {
        toast.success("Marked as read");
        fetchNotifications(page);
      } else {
        toast.error(res.data?.message || "Failed to mark as read");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    if (!API_URL) return toast.error("API URL not configured");
    try {
      const res = await axios.post(`${API_URL}/notification/mark-all-read`, {}, { withCredentials: true, ...getConfig() });
      if (res.data?.success) {
        toast.success(res.data.message || "All marked as read");
        fetchNotifications(1);
      } else {
        toast.error(res.data?.message || "Failed to mark all");
      }
    } catch (err) {
      console.error(err);
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
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <input
          placeholder="Search notifications..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>

        {actorOptions.length > 0 && (
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
          >
            <option value="all">From: All</option>
            {actorOptions.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name || a.email}
              </option>
            ))}
          </select>
        )}

        <button onClick={markAllRead} className="px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700">
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">No notifications found.</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications
            .filter((n) => actorFilter === "all" || n.actor?._id === actorFilter)
            .map((n) => (
              <li
                key={n._id}
                className={`p-4 rounded-lg border transition-all ${
                  n.status === "unread"
                    ? "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{n.title}</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(n.createdAt || Date.now()), { addSuffix: true })}
                    </div>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{n.message}</p>
                    {n.actor && <div className="mt-2 text-xs text-gray-400">From: {n.actor.name || n.actor.email}</div>}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {n.status === "unread" ? (
                      <button onClick={() => markAsRead(n._id)} className="text-xs px-3 py-1 rounded-lg bg-sky-600 text-white">
                        Mark read
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Read</span>
                    )}
                    <button onClick={() => setSelected(selected === n._id ? null : n._id)} className="text-xs text-sky-600">
                      {selected === n._id ? "Hide" : "View"}
                    </button>
                  </div>
                </div>

                {selected === n._id && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                    <p>{n.message}</p>
                    <div className="mt-2 text-xs text-gray-400">Created: {new Date(n.createdAt).toLocaleString()}</div>
                    {n.actor && <div className="text-xs text-gray-400">Sender: {n.actor.name || n.actor.email}</div>}
                  </div>
                )}
              </li>
            ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={handlePrev} disabled={page <= 1} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 disabled:opacity-50">
            <HiOutlineArrowLeft />
          </button>
          <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
          <button onClick={handleNext} disabled={page >= totalPages} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 disabled:opacity-50">
            <HiOutlineArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}
