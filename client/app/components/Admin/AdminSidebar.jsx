"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  HiOutlineUser,
  HiOutlineBookmark,
  HiOutlineHeart,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineCamera,
  HiOutlineCog,
  HiCollection,
} from "react-icons/hi";
import {
  Gift,
  Users,
  TrendingUp,
  Award,
  Settings,
  BarChart3,
  DollarSign,
  UserCheck
} from "lucide-react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const items = [
  {
    section: "Management",
    links: [
      { key: "dashboard", label: "Dashboard", icon: HiOutlineHeart },
      { key: "users", label: "Users", icon: HiOutlineUser },
      { key: "package", label: "Packages", icon: HiOutlineBookmark },
      { key: "bookings", label: "Bookings", icon: HiOutlineCog },
      { key: "analytics", label: "Advanced Analytics", icon: HiOutlineBell },
      { key: "contacts", label: "Contact", icon: HiCollection},
      { key: "gallery", label: "Gallery", icon: HiOutlineCamera },
    ],
  },
  {
    section: "Referral System",
    links: [
      { key: "referrals-overview", label: "Referral System", icon: Gift },
    ],
  },
];

const AdminSidebar = ({ selected = "overview", onSelect, onLogout }) => {
  const user = useSelector((s) => s?.auth?.user);
  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [bookingsCount, setBookingsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    let timer;
    const fetchCount = async () => {
      try {
        if (!API_URL) return;
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const { data } = await axios.get(`${API_URL}/bookings`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const list = data?.bookings || data?.data || [];
        setBookingsCount(Array.isArray(list) ? list.length : 0);

        // notifications
        try {
          const resp = await axios.get(`${API_URL}/notification`, {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          const notes = resp?.data?.notifications || [];
          const unread = Array.isArray(notes) ? notes.filter((n) => n?.status !== 'read').length : 0;
          setNotificationsCount(unread);
        } catch {}
      } catch (e) {
        
      }
    };
    fetchCount();
    timer = setInterval(fetchCount, 30000); // poll every 30s
    return () => clearInterval(timer);
  }, [API_URL]);

  return (
    <aside
      className={`relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden 
        w-full lg:w-auto lg:sticky lg:top-24`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white truncate">
            {user?.name || "Traveler"}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
            {user?.email || "youremail@gmail.com"}
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <HiOutlineSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4 max-h-[40vh] sm:max-h-none">
        {items.map((group) => (
          <div key={group.section}>
            <div className="px-3 py-1 text-xs uppercase text-gray-400">
              {group.section}
            </div>
            {group.links
              .filter((it) => it.label.toLowerCase().includes(search.toLowerCase()))
              .map((it) => {
                const active = selected === it.key || pathname.includes(it.key);
                const Icon = it.icon;
                const dynamicBadge = it.key === "bookings"
                  ? bookingsCount
                  : it.badge;
                return (
                  <button
                    key={it.key}
                    onClick={() => onSelect?.(it.key)}
                    className={`relative w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${active
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate">{it.label}</span>
                    {dynamicBadge > 0 && (
                      <span className="absolute right-3 bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {dynamicBadge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </nav>
      <div className="p-2 mt-32 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onLogout}
          className="mt-2 w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-500/10"
        >
          <HiOutlineLogout className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;