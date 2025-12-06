"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
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

export default function Sidebar({ collapsed = false, onToggleSidebar = () => {} }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;

  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hrefIsActive = (href) => {
    if (!href) return false;
    try {
      const url = new URL(href, "http://dummy");
      const targetPath = url.pathname.replace(/\/$/, "");
      const targetTab = url.searchParams.get("tab");
      const currentPath = pathname.replace(/\/$/, "");
      const pathMatches =
        currentPath === targetPath || currentPath.startsWith(targetPath + "/");
      if (targetTab) return pathMatches && targetTab === currentTab;
      return pathMatches;
    } catch {
      return pathname.startsWith(href);
    }
  };

  const iconClass = (active) =>
    `flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
      active
        ? "bg-blue-600/20 text-blue-400"
        : "text-gray-400 hover:bg-white/10"
    }`;

  const menu = [
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
      children: [
        { id: "faq", label: "Faq", icon: <FaQuestion size={18} />, href: "/layout?tab=faq" },
      ],
    },
    { id: "gallery", label: "Gallery", icon: <RiGalleryLine size={18} />, href: "/gallery" },
    { id: "contact", label: "Contact", icon: <IoMdContact size={18} />, href: "/contact" },
  ];

  useEffect(() => {
    const auto = {};
    menu.forEach((item) => {
      if (item.children?.some((c) => hrefIsActive(c.href))) auto[item.id] = true;
    });
    setOpenGroups((prev) => ({ ...prev, ...auto }));
  }, [pathname, currentTab]);

  return (
    <aside
      className={`flex flex-col sticky top-0 h-screen p-5 transition-all duration-300 overflow-y-auto no-scrollbar
      ${collapsed ? "w-20" : "w-64"}
      bg-[#0B1220] text-white`}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && <h1 className="text-xl font-semibold text-blue-400">Menu</h1>}
        <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-white/10">
          <FaBars className="text-blue-400" />
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {menu.map((item) => {
          const isActive = hrefIsActive(item.href);
          const hasChildren = item.children?.length > 0;
          const isOpen = openGroups[item.id];

          if (collapsed) {
            if (hasChildren) {
              return (
                <div key={item.id} className="relative group">
                  <div onClick={() => toggleGroup(item.id)} className={iconClass(isActive)}>
                    {item.icon}
                  </div>
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              );
            }
            return (
              <div key={item.id} className="relative group">
                <Link href={item.href}>
                  <div className={iconClass(isActive)}>{item.icon}</div>
                </Link>
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            );
          }

          if (!hasChildren) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                  isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-white/10"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          }

          return (
            <div key={item.id}>
              <button
                onClick={() => toggleGroup(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                  item.children.some((c) => hrefIsActive(c.href))
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:bg-white/10"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</span>
              </button>

              {isOpen && (
                <div className="pl-10 mt-2 space-y-1">
                  {item.children.map((child) => {
                    const active = hrefIsActive(child.href);
                    return (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                          active
                            ? "bg-blue-600/20 text-blue-400"
                            : "text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {child.icon}
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="flex items-center gap-4 px-4 py-2 text-red-400 hover:bg-white/10 rounded-xl w-full">
          <FaSignOutAlt size={18} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
