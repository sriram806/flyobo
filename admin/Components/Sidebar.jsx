"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  FaHome, FaSignOutAlt, FaUsers, FaUserPlus, FaChartBar,
  FaAcquisitionsIncorporated, FaBars, FaChevronDown, FaChevronRight,
  FaBoxes, FaCalendarAlt, FaGift, FaQuestion,
  FaPlane
} from "react-icons/fa";
import { FiLayout } from "react-icons/fi";
import { IoIosSettings, IoMdContact } from "react-icons/io";
import { MdLeaderboard } from "react-icons/md";
import { RiMoneyRupeeCircleLine, RiGalleryLine } from "react-icons/ri";

export default function Sidebar({ collapsed = false, onToggleSidebar = () => { }, counts = {} }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;

  const [openGroups, setOpenGroups] = useState({});

  // Toggle a sidebar group
  function toggleGroup(id) {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // Advanced active detection (handles tabs, nested paths, trailing slashes)
  function hrefIsActive(href) {
    if (!href) return false;
    try {
      const url = new URL(href, "http://dummy"); // base required
      const targetPath = url.pathname.replace(/\/$/, ""); // remove trailing slash
      const targetTab = url.searchParams.get("tab");

      const currentPath = pathname.replace(/\/$/, "");

      const pathMatches = currentPath === targetPath || currentPath.startsWith(targetPath + "/");

      if (targetTab) {
        return pathMatches && targetTab === currentTab;
      }

      return pathMatches;
    } catch {
      return pathname.startsWith(href);
    }
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

  // Sidebar menu
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

  // Automatically open groups if a child is active
  useEffect(() => {
    const newOpenGroups = {};
    menu.forEach(item => {
      if (item.children?.some(c => hrefIsActive(c.href))) {
        newOpenGroups[item.id] = true;
      }
    });
    setOpenGroups(prev => ({ ...prev, ...newOpenGroups }));
  }, [pathname, currentTab]);

  // Sidebar footer
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
        {!collapsed && <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Menu</h1>}
        <button onClick={onToggleSidebar} aria-label="Toggle Sidebar" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <FaBars className="text-blue-500" />
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {menu.map(item => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const isGroupOpen = openGroups[item.id];

          if (hasChildren) {
            const childActive = item.children.some(c => hrefIsActive(c.href));
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
                  {item.children.map(child => {
                    const active = hrefIsActive(child.href);
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

          const active = hrefIsActive(item.href);
          return (
            <Link key={item.id} href={item.href || "#"} className={itemClass(active)}>
              {item.icon}
              {!collapsed && <span className="font-medium">{item.label}</span>}
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
