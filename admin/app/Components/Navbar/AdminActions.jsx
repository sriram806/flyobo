"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Portal from "./Portal";

export default function AdminActions({ user, onLogout, variant = "desktop" }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, right: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const onDocClick = (e) => {
            const insideButton = buttonRef.current && buttonRef.current.contains(e.target);
            const insideDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
            if (!insideButton && !insideDropdown) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // compute dropdown position relative to button
    const computePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setPos({ top: Math.round(rect.bottom + 8), right: Math.round(window.innerWidth - rect.right) });
    };

    useEffect(() => {
        if (open) {
            computePosition();
            window.addEventListener("resize", computePosition);
            window.addEventListener("scroll", computePosition, { passive: true });
        }
        return () => {
            window.removeEventListener("resize", computePosition);
            window.removeEventListener("scroll", computePosition);
        };
    }, [open]);

    const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A";

    return (
        <div className={variant === "desktop" ? "flex items-center ml-1" : "relative"}>
            <button
                ref={buttonRef}
                onClick={() => setOpen((s) => !s)}
                className={`${variant === "desktop" ? "flex items-center gap-2 pl-1 pr-1 py-1.5" : "p-1"} rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm transition-all duration-200`}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <div className={`${variant === "desktop" ? "w-8 h-8" : "w-7 h-7"} flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold`}>{initial}</div>
            </button>

            {open && (
                <Portal>
                    <div ref={dropdownRef} style={{ top: `${pos.top}px`, right: `${pos.right}px` }} className={`fixed ${variant === "desktop" ? "w-48" : "w-40"} rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl py-2 z-2000`} role="menu">
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">Signed in as</div>
                        <div className="px-4 pb-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name || user?.email}</div>

                        <div className="my-1 h-px bg-gray-200 dark:bg-gray-800" />

                        <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                            onClick={() => {
                                setOpen(false);
                                router.push("/dashboard");
                            }}
                        >
                            Dashboard
                        </button>

                        <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors">
                            Open Site
                        </button>

                        <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                            onClick={() => {
                                setOpen(false);
                                router.push("/settings");
                            }}
                        >
                            Settings
                        </button>

                        <button
                            className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
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
