"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi";
import { useRouter } from "next/navigation";
import Portal from "./Portal";

export default function UserMenu({ user, onLogout, variant = "desktop" }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const firstItemRef = useRef(null);
  const dropdownRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const router = useRouter();

  const computePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top: Math.round(rect.bottom + 8),
      right: Math.round(window.innerWidth - rect.right),
    });
  };

  useEffect(() => {
    const onDocClick = (e) => {
      const insideButton =
        buttonRef.current && buttonRef.current.contains(e.target);
      const insideDropdown =
        dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!insideButton && !insideDropdown) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus?.();
      }
    };

    if (open) {
      computePosition();
      setTimeout(() => firstItemRef.current?.focus?.(), 0);
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("scroll", computePosition, { passive: true });
      window.addEventListener("resize", computePosition);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", computePosition);
      window.removeEventListener("resize", computePosition);
    };
  }, [open]);

  const initial =
    user?.name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div
      className={
        variant === "desktop"
          ? "flex items-center ml-1"
          : "relative"
      }
    >
      {/* Avatar button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className={`${variant === "desktop"
            ? "flex items-center gap-2 pl-2 pr-1 py-1.5"
            : "p-1.5"
          } rounded-full border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-800 hover:shadow-sm transition-all duration-200`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div
          className={`flex items-center justify-center ${variant === "desktop" ? "w-8 h-8" : "w-7 h-7"
            } rounded-full bg-sky-600 dark:bg-sky-500 text-white text-sm font-semibold`}
        >
          {initial}
        </div>
        {variant === "desktop" && (
          <HiOutlineChevronDown className={`h-4 w-4 opacity-70 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`} />
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <Portal>
          <div
            ref={dropdownRef}
            className={`fixed ${variant === "desktop" ? "w-48" : "w-40"
              } rounded-xl border border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-900 shadow-2xl py-2 z-[2000] 
            transition-all duration-200 animate-in fade-in slide-in-from-top-2`}
            role="menu"
            style={{ top: `${pos.top}px`, right: `${pos.right}px` }}
          >
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
              Signed in as
            </div>
            <div className="px-4 pb-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {user?.name || user?.email}
            </div>

            <div className="my-1 h-px bg-gray-200 dark:bg-gray-800" />

            <button
              ref={firstItemRef}
              className="w-full text-left px-4 py-2 text-sm 
              text-gray-800 dark:text-gray-200 
              hover:bg-sky-50 dark:hover:bg-sky-900/20 
              focus:outline-none focus:bg-sky-50 dark:focus:bg-sky-900/20 
              transition-colors duration-200"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push("/profile?tab=overview");
              }}
            >
              Profile
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm 
              text-rose-600 dark:text-rose-400 
              hover:bg-rose-50 dark:hover:bg-rose-900/20 
              focus:outline-none focus:bg-rose-50 dark:focus:bg-rose-900/20 
              transition-colors duration-200"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
            >
              Logout
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
}
