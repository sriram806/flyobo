"use client";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { HiOutlineHome, HiOutlineUsers, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineShoppingCart, HiOutlineChartBar, HiOutlineCog } from "react-icons/hi";

const baseItems = [
  { name: "Dashboard", url: "/dashboard", icon: HiOutlineHome },
  { name: "Users", url: "/users?tab=analytics", icon: HiOutlineUsers, roles: ["admin", "owner"] },
  { name: "Referrals", url: "/referral?tab=analytics", icon: HiOutlineUserGroup, roles: ["admin", "owner"] },
  { name: "Rewards", url: "/referral?tab=management", icon: HiOutlineClipboardList, roles: ["admin", "owner"] },
  { name: "Bookings", url: "/bookings", icon: HiOutlineShoppingCart, roles: ["admin", "owner"] },
];

const Navitems = ({ activeItem, isMobile }) => {
  const user = useSelector((state) => state?.auth?.user) || {};
  const role = (user.role || "").toLowerCase();

  // Filter items by role if item defines `roles`
  const navItems = baseItems.filter((it) => !it.roles || it.roles.includes(role));

  return (
    <>
      {/* Desktop Navigation: compact admin style */}
      <div className="hidden md:flex items-center space-x-6">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link href={item.url} key={item.name} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors">
              <Icon className={`w-5 h-5 ${activeItem === index ? "text-sky-600" : "text-gray-600 dark:text-gray-300"}`} aria-hidden />
              <span className={`${activeItem === index ? "text-sky-600" : "text-gray-800 dark:text-gray-200"} text-sm font-medium`}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Navigation: stacked admin menu */}
      {isMobile && (
        <div className="md:hidden mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
          <div className="w-full text-center py-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="text-2xl font-bold text-sky-600">Admin</Link>
          </div>
          {navItems.map((item, index) => (
            <Link href={item.url} key={item.name} className={`flex items-center gap-3 py-4 px-6 text-lg font-medium transition-colors ${activeItem === index ? "bg-sky-50 dark:bg-gray-800 text-sky-600" : "text-gray-800 dark:text-gray-200 hover:text-sky-500 dark:hover:text-sky-400"}`}>
              {item.icon && React.createElement(item.icon, { className: "w-5 h-5" })}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Navitems;
