"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  FaHome, FaSignOutAlt, FaUsers, FaUserPlus, FaChartBar,
  FaAcquisitionsIncorporated, FaBars, FaChevronDown, FaChevronRight,
  FaBoxes, FaCalendarAlt, FaGift, FaQuestion, FaPlane,
  FaMoneyBill
} from "react-icons/fa";
import { FiLayout } from "react-icons/fi";
import { IoIosSettings, IoMdContact } from "react-icons/io";
import { MdLeaderboard } from "react-icons/md";
import { RiMoneyRupeeCircleLine, RiGalleryLine } from "react-icons/ri";

export default function Sidebar({
  collapsed = false,
  onToggleSidebar = () => { },
  onLogout = null,
  user = null,
}) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;

  const [openGroups, setOpenGroups] = useState({});
  const [internalCollapsed, setInternalCollapsed] = useState(Boolean(collapsed));
  const [filter, setFilter] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);

  const menu = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <FaHome size={18} />,
        children: [
          { id: "overview", label: "Overview", icon: <FaChartBar size={16} />, href: "/dashboard?tab=overview" },
          { id: "analytics", label: "Analytics", icon: <FaChartBar size={16} />, href: "/dashboard?tab=analytics" },
        ],
      },
      {
        id: "users",
        label: "Users",
        icon: <FaUsers size={18} />,
        children: [
          { id: "analytics", label: "Analytics", icon: <FaChartBar size={16} />, href: "/users?tab=analytics" },
          { id: "manageadmin", label: "Managers", icon: <FaAcquisitionsIncorporated size={16} />, href: "/users?tab=manageadmin" },
          { id: "allusers", label: "Customers", icon: <FaUsers size={16} />, href: "/users?tab=allusers" },
          { id: "create", label: "Create User", icon: <FaUserPlus size={16} />, href: "/users?tab=create" },
        ],
      },
      {
        id: "destinations",
        label: "Destinations",
        icon: <FaPlane size={18} />,
        children: [
          { id: "analytics", label: "Analytics", icon: <FaChartBar size={16} />, href: "/destinations?tab=analytics" },
          { id: "create", label: "Create", icon: <FaBoxes size={16} />, href: "/destinations?tab=create" },
          { id: "alldestinations", label: "Destinations", icon: <FaCalendarAlt size={16} />, href: "/destinations?tab=alldestinations" },
        ],
      },
      {
        id: "package",
        label: "Package",
        icon: <FaBoxes size={18} />,
        children: [
          { id: "analytics", label: "Analytics", icon: <FaChartBar size={16} />, href: "/packages?tab=analytics" },
          { id: "create", label: "Create Packages", icon: <FaBoxes size={16} />, href: "/packages?tab=create" },
          { id: "packages", label: "All Packages", icon: <FaCalendarAlt size={16} />, href: "/packages?tab=packages" },
        ],
      },
      {
        id: "bookings",
        label: "Bookings",
        icon: <FaMoneyBill size={18} />,
        children: [
          { id: "analytics", label: "Analytics", icon: <FaChartBar size={16} />, href: "/bookings?tab=analytics" },
          { id: "create", label: "Create", icon: <FaBoxes size={16} />, href: "/bookings?tab=create" },
          { id: "allbookings", label: "All Bookings", icon: <FaCalendarAlt size={16} />, href: "/bookings?tab=allbookings" },
        ],
      },
      {
        id: "referral",
        label: "Referrals",
        icon: <FaGift size={18} />,
        children: [
          { id: "analytics", label: "Analytics", icon: <FaChartBar size={18} />, href: "/referral?tab=analytics" },
          { id: "leaderboard", label: "Leaderboard", icon: <MdLeaderboard size={16} />, href: "/referral?tab=leaderboard" },
          { id: "management", label: "Management", icon: <RiMoneyRupeeCircleLine />, href: "/referral?tab=management" },
          { id: "settings", label: "Settings", icon: <IoIosSettings size={18} />, href: "/referral?tab=settings" },
        ],
      },
      {
        id: "layout",
        label: "Layout",
        icon: <FiLayout size={18} />,
        children: [{ id: "faq", label: "Faq", icon: <FaQuestion size={18} />, href: "/layout?tab=faq" }],
      },
      { id: "gallery", label: "Gallery", icon: <RiGalleryLine size={18} />, href: "/gallery" },
      { id: "contact", label: "Contact", icon: <IoMdContact size={18} />, href: "/contact" },
    ],
    []
  );

  // helper to robustly test if href is active (handles path and ?tab=)
  const hrefIsActive = useCallback(
    (href) => {
      if (!href) return false;
      try {
        const url = new URL(href, "http://dummy");
        const targetPath = url.pathname.replace(/\/$/, "");
        const targetTab = url.searchParams.get("tab");
        const currentPath = pathname.replace(/\/$/, "");
        const pathMatches = currentPath === targetPath || currentPath.startsWith(targetPath + "/");
        if (targetTab) return pathMatches && targetTab === currentTab;
        return pathMatches;
      } catch {
        // fallback simple match
        return pathname.startsWith(href);
      }
    },
    [pathname, currentTab]
  );

  // icon wrapper class
  const iconClass = (active) =>
    `flex items-center justify-center w-12 h-12 rounded-xl transition-all ${active ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-white/10"
    }`;

  // keep open state in localStorage so it survives reloads
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" && localStorage.getItem("flyobo_sidebar_open_groups");
      if (stored) setOpenGroups(JSON.parse(stored));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("flyobo_sidebar_open_groups", JSON.stringify(openGroups));
    } catch (e) {
      // ignore
    }
  }, [openGroups]);

  // auto-open groups that contain the active link
  useEffect(() => {
    const auto = {};
    menu.forEach((item) => {
      if (item.children?.some((c) => hrefIsActive(c.href))) auto[item.id] = true;
    });
    setOpenGroups((prev) => ({ ...prev, ...auto }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentTab]);

  const toggleGroup = useCallback((id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // keyboard: Enter/Space toggles group when focused
  const handleKey = useCallback(
    (e, id, hasChildren) => {
      if (!hasChildren) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleGroup(id);
      }
    },
    [toggleGroup]
  );

  // toggle collapse (both internal state + notify parent)
  const toggleCollapse = useCallback(() => {
    setInternalCollapsed((c) => !c);
    onToggleSidebar();
  }, [onToggleSidebar]);

  // filter menu items by label
  const filteredMenu = useMemo(() => {
    const q = (filter || "").trim().toLowerCase();
    if (!q) return menu;
    return menu
      .map((m) => {
        if (m.children) {
          const children = m.children.filter((c) => c.label.toLowerCase().includes(q));
          if (m.label.toLowerCase().includes(q) || children.length) return { ...m, children };
          return null;
        }
        if (m.label.toLowerCase().includes(q)) return m;
        return null;
      })
      .filter(Boolean);
  }, [menu, filter]);

  useEffect(() => {
    if (!listRef.current) return;
    const nodes = Array.from(listRef.current.querySelectorAll("a, button"));
    if (focusedIndex >= 0 && focusedIndex < nodes.length) nodes[focusedIndex].focus();
  }, [focusedIndex]);

  return (
    <aside
      className={`flex flex-col top-0 h-screen p-5 transition-all duration-300 overflow-y-auto
      ${internalCollapsed ? "w-20" : "w-64"}
      bg-[#0B1220] text-white`}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between mb-4">
        {!internalCollapsed && (
          <div className="flex items-center gap-3">
            <Image
              src={"/images/icon.png"}
              alt="Flyobo"
              width={40}
              height={40}
              className="object-contain hover:scale-105 transition-transform duration-200"
              priority
            />
            <div>
              <div className="text-sm font-semibold text-blue-200">Flyobo Admin</div>
              <div className="text-xs text-gray-300">Travel Agency</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-pressed={internalCollapsed}
            title={internalCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FaBars className="text-blue-400" />
          </button>
        </div>
      </div>

      {/* Search (only when expanded) */}
      {!internalCollapsed && (
        <div className="mb-4">
          <input
            placeholder="Search menu..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Search sidebar menu"
          />
        </div>
      )}

      <nav ref={listRef} className="space-y-2 flex-1" role="navigation" aria-label="Main menu">
        {filteredMenu.map((item) => {
          const isActive = hrefIsActive(item.href);
          const hasChildren = item.children?.length > 0;
          const isOpen = Boolean(openGroups[item.id]);

          // when collapsed, show icon-only with tooltip on hover
          if (internalCollapsed) {
            if (hasChildren) {
              return (
                <div key={item.id} className="relative group" onKeyDown={(e) => handleKey(e, item.id, hasChildren)}>
                  <button
                    onClick={() => toggleGroup(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`group-${item.id}`}
                    className={iconClass(isActive)}
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              );
            }

            // simple link in collapsed form
            return (
              <div key={item.id} className="relative group">
                <Link href={item.href || "#"} className={iconClass(isActive)} title={item.label}>
                  {item.icon}
                </Link>
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            );
          }

          // expanded view
          if (!hasChildren) {
            return (
              <Link key={item.id} href={item.href || "#"} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-white/10"}`}>
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          }

          return (
            <div key={item.id}>
              <button
                onClick={() => toggleGroup(item.id)}
                onKeyDown={(e) => handleKey(e, item.id, true)}
                aria-expanded={isOpen}
                aria-controls={`group-${item.id}`}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${item.children.some((c) => hrefIsActive(c.href)) ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-white/10"}`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</span>
              </button>

              {isOpen && (
                <div id={`group-${item.id}`} className="pl-10 mt-2 space-y-1" role="group" aria-label={item.label + " sub menu"}>
                  {item.children.map((child) => {
                    const active = hrefIsActive(child.href);
                    return (
                      <Link
                        key={child.id}
                        href={child.href || "#"}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${active ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-white/10"}`}
                      >
                        {child.icon}
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* profile + logout */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm text-white">
            {user?.avatar ? <img src={user.avatar} alt={user.name || "User"} className="w-10 h-10 rounded-full object-cover" /> : (user?.name ? user.name[0].toUpperCase() : "H")}
          </div>
          {!internalCollapsed && (
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{user?.name || "Admin"}</div>
              <div className="text-xs text-gray-300">{user?.email || "admin@flyobo.com"}</div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => (onLogout ? onLogout() : null)}
            className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-white/10 rounded-xl w-full"
            aria-label="Logout"
          >
            <FaSignOutAlt size={18} />
            {!internalCollapsed && <span className="font-medium">Logout</span>}
          </button>
          {!internalCollapsed && (
            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">
              <IoIosSettings size={18} />
              <span className="text-sm text-gray-200">Settings</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
