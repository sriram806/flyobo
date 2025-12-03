"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { FaHome, FaSignOutAlt, FaUsers, FaUserPlus, FaChartBar, FaAcquisitionsIncorporated, FaBars, FaChevronDown, FaChevronRight, FaBoxes, FaCalendarAlt, FaImage, FaBell, FaGift, FaQuestion } from "react-icons/fa";
import { FiLayout } from "react-icons/fi";
import { IoIosSettings, IoMdContact } from "react-icons/io";
import { MdLeaderboard } from "react-icons/md";
import { RiMoneyRupeeCircleLine, RiGalleryLine } from "react-icons/ri";

export default function Sidebar({ collapsed = false, onToggleSidebar = () => { }, userCount = null, tab, go, counts = {} }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;
  const [openGroups, setOpenGroups] = useState({});

  function toggleGroup(id) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function itemClass(active) {
    return `
      w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
      ${collapsed ? "justify-center" : "justify-start"}
      ${active
        ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
      }
    `;
  }

  function hrefIsActive(href) {
    if (!href) return false;
    // If href contains a tab query param, compare with currentTab
    const qIndex = href.indexOf("?tab=");
    if (qIndex !== -1) {
      const tabValue = href.substring(qIndex + 5);
      // handle potential additional query params
      const amp = tabValue.indexOf("&");
      const desired = amp === -1 ? tabValue : tabValue.substring(0, amp);
      const base = href.substring(0, qIndex) || "/";
      // Only treat as active if both the tab matches AND the current pathname matches the base path
      return currentTab === desired && pathname.startsWith(base);
    }
    // else compare pathname
    return pathname.startsWith(href);
  }

  const menu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaHome size={18} />,
      children: [
        { id: "overview", label: "Overview", icon: <FaChartBar size={16} />, href: "/dashboard" },
        { id: "reports", label: "Reports", icon: <FaChartBar size={16} />, href: "/dashboard/reports" },
        { id: "metrics", label: "Metrics", icon: <FaChartBar size={16} />, href: "/dashboard/metrics" },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: <FaUsers size={18} />,
      children: [
        { id: "analytics", label: "Analytics", icon: <FaChartBar size={16} />, href: "/users?tab=analytics" },
        { id: "create", label: "Create User", icon: <FaUserPlus size={16} />, href: "/users?tab=create" },
        { id: "allusers", label: "All Users", icon: <FaUsers size={16} />, href: "/users?tab=allusers" },
        { id: "manageadmin", label: "Manage Admin", icon: <FaAcquisitionsIncorporated size={16} />, href: "/users?tab=manageadmin" },
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
      children: [
        { id: "hero", label: "Hero", icon: <FaHome size={18} />, href: "/layout?tab=hero" },
        { id: "faq", label: "Faq", icon: <FaQuestion size={18} />, href: "/layout?tab=faq" },
      ],
    },
    { id: "gallery", label: "Gallery", icon: <RiGalleryLine size={18} />, href: "/gallery" },
    { id: "contact", label: "Contact", icon: <IoMdContact size={18} />, href: "/contact" },

  ];

  const footer = (
    <div className="mt-4">
      <button
        className={`flex items-center gap-4 px-4 py-2 rounded-xl transition text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 ${collapsed ? "justify-center" : "justify-start"}`}
      >
        <FaSignOutAlt size={18} />
        {!collapsed && <span className="font-medium">Logout</span>}
      </button>
    </div>
  );

  return (
    <aside
      className={`flex flex-col sticky top-0 h-screen p-5 transition-all duration-300 ease-in-out overflow-auto no-scrollbar ${collapsed ? "w-20" : "w-64"} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg`}
      aria-expanded={!collapsed}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Menu</h1>
        )}
        <button onClick={onToggleSidebar} aria-label="Toggle Sidebar" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <FaBars className="text-blue-500" />
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {menu.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const isGroupOpen = openGroups[item.id];

          if (hasChildren) {
            const childActive = item.children.some((c) => c.href && hrefIsActive(c.href));
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleGroup(item.id)}
                  className={itemClass(childActive)}
                  aria-expanded={!!isGroupOpen}
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </div>
                  <div className="ml-auto">
                    {!collapsed && (isGroupOpen ? <FaChevronDown /> : <FaChevronRight />)}
                  </div>
                </button>

                <div className={`pl-6 mt-2 space-y-1 ${isGroupOpen ? "block" : "hidden"}`}>
                  {item.children.map((child) => {
                    const active = child.href ? hrefIsActive(child.href) : false;
                    if (child.onClick) {
                      return (
                        <button key={child.id} onClick={child.onClick} className={itemClass(active)}>
                          {child.icon}
                          {!collapsed && <span className="font-medium">{child.label}</span>}
                        </button>
                      );
                    }
                    return (
                      <Link key={child.id} href={child.href || "#"} className={itemClass(active)}>
                        {child.icon}
                        {!collapsed && <span className="font-medium">{child.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const active = item.href ? hrefIsActive(item.href) : false;
          if (item.onClick) {
            return (
              <button key={item.id} onClick={item.onClick} className={itemClass(active)}>
                {item.icon}
                {!collapsed && <span className="font-medium">{item.label}</span>}
                {item.badge && !collapsed && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white">{item.badge}</span>
                )}
                {active && <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.href || "#"} className={itemClass(active)}>
              {item.icon}
              {!collapsed && <span className="font-medium">{item.label}</span>}
              {item.badge && !collapsed && (
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white">{item.badge}</span>
              )}
              {active && <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        {footer || <p className="text-xs text-gray-400 dark:text-gray-500 text-center">© 2025 Admin Panel</p>}
      </div>
    </aside>

  );
}
