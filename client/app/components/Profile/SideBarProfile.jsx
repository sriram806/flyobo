"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  HiOutlineUser, HiOutlineBookmark, HiOutlineHeart, HiOutlineCog,
  HiOutlineLogout, HiOutlineBell, HiOutlineSearch
} from "react-icons/hi";
import { usePathname } from "next/navigation";

const items = [
  {
    section: "Profile",
    links: [
      { key: "overview", label: "Overview", icon: HiOutlineUser },
      { key: "bookings", label: "Bookings", icon: HiOutlineBookmark, badge: 2 },
      { key: "wishlist", label: "Wishlist", icon: HiOutlineHeart },
    ],
  },
  {
    section: "App",
    links: [
      { key: "settings", label: "Settings", icon: HiOutlineCog },
      { key: "notifications", label: "Notifications", icon: HiOutlineBell, badge: 5 },
    ],
  },
];

const SideBarProfile = ({ selected = "overview", onSelect, onLogout }) => {
  const user = useSelector((s) => s?.auth?.user);
  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
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
            {user.email || "youremail@gmail.com"}
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <HiOutlineSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
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
            {group.links.filter((it) => it.label.toLowerCase().includes(search.toLowerCase())).map((it) => {
              const active = selected === it.key || pathname.includes(it.key);
              const Icon = it.icon;
              return (
                <button
                  key={it.key}
                  onClick={() => onSelect?.(it.key)}
                  className={`relative w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${active
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{it.label}</span>
                  {it.badge && (
                    <span className="absolute right-3 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {it.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 mt-24 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onLogout}
          className="mt-2 w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
        >
          <HiOutlineLogout className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default SideBarProfile