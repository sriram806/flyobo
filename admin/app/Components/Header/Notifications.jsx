"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiOutlineBell } from "react-icons/hi";
import { FiX } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

export default function Notifications() {
  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const notifRef = useRef(null);
  const notifButtonRef = useRef(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    const onDocClick = (e) => {
      if (!notifRef.current) return;
      if (notifButtonRef.current?.contains(e.target) || notifRef.current?.contains(e.target)) return;
      setOpenNotif(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpenNotif(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (openNotif) fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNotif]);

  useEffect(() => {
    // fetch unread count on mount
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUnreadCount = async () => {
    if (!API_URL || !token) return;
    try {
      const { data } = await axios.get(`${API_URL}/notification/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
      if (data?.success) setUnreadCount(data.count || 0);
    } catch (err) {
      if (err?.response?.status === 401) return;
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchNotifications = async (page = 1) => {
    if (!API_URL || !token) return;
    try {
      setLoadingNotif(true);
      const { data } = await axios.get(`${API_URL}/notification?page=${page}&limit=5`, { headers: { Authorization: `Bearer ${token}` } });
      if (data?.success) {
        setNotifications(data.notifications || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoadingNotif(false);
    }
  };

  const markAllAsRead = async () => {
    if (!API_URL || !token) return;
    try {
      const { data } = await axios.post(`${API_URL}/notification/mark-all-read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (data?.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark as read");
    }
  };

  const markAsRead = async (id) => {
    if (!API_URL || !token || !id) return;
    try {
      const { data } = await axios.put(`${API_URL}/notification/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (data?.success) {
        setNotifications(data.notifications || []);
        fetchUnreadCount();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update notification");
    }
  };

  return (
    <div className="relative">
      <button
        ref={notifButtonRef}
        onClick={() => setOpenNotif((s) => !s)}
        aria-expanded={openNotif}
        aria-controls="notif-panel"
        aria-label="Notifications"
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        <HiOutlineBell className="text-gray-900 dark:text-white" size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center animate-pulse">{unreadCount}</span>
        )}
      </button>

      {openNotif && (
        <div id="notif-panel" ref={notifRef} role="dialog" aria-label="Notifications panel" className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden ring-1 ring-sky-50 dark:ring-sky-900/40">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-sky-600 hover:text-sky-800">Mark all</button>}
              <button onClick={() => setOpenNotif(false)} aria-label="Close notifications" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2"><FiX className="w-4 h-4 text-gray-700 dark:text-gray-200" aria-hidden /></button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loadingNotif && <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>}
            {!loadingNotif && (notifications?.length === 0) && <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>}
            {!loadingNotif && notifications?.map((n) => {
              const isNew = new Date() - new Date(n?.createdAt) < 86400000;
              return (
                <button key={n?._id} onClick={() => markAsRead(n?._id)} className={`w-full text-left p-3 flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 ${n?.status === 'unread' ? 'bg-sky-50 dark:bg-sky-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} aria-label={n?.title}>
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n?.status === 'read' ? 'bg-gray-400' : 'bg-sky-500'}`} aria-hidden />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{n?.title}</div>
                      {isNew && <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full">New</span>}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{n?.message}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{new Date(n?.createdAt).toLocaleDateString()}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {!loadingNotif && notifications?.length > 0 && totalPages > 1 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button onClick={() => fetchNotifications(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">Prev</button>
              <div className="text-sm text-gray-600 dark:text-gray-400">{currentPage}/{totalPages}</div>
              <button onClick={() => fetchNotifications(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
