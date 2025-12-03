"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../Utils/Themes/ThemeToggle";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";
import { FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { performLogout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import Navitems from "../Navbar/Navitems";
import AdminActions from "../Navbar/AdminActions";
import Notifications from "../Header/Notifications";


const Header = ({ activeItem }) => {
    const user = useSelector((state) => state?.auth?.user);
    const dispatch = useDispatch();
    const router = useRouter();
    const [openSidebar, setOpenSidebar] = useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const onDocClick = (e) => {
            if (!openSidebar) return;
            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpenSidebar(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [openSidebar]);

    // notification logic extracted to a dedicated component

    const handleLogout = async () => {
        try {
            await dispatch(performLogout());
            toast.success("Logged out successfully");
            setOpenSidebar(false);
        } catch (error) {
            console.error("Logout error:", error);
            // even if dispatch fails, clear UI state
            toast.success("Logged out successfully");
            setOpenSidebar(false);
        }
    };

    const handleClose = (e) => {
        if (e.target.id === "screen") {
            setOpenSidebar(false);
        }
    };

    return (
        <header className="w-full relative">
            <div
                className="sticky top-0 z-1000 w-full border-b border-gray-200 dark:border-gray-800
        bg-white dark:bg-gray-900 duration-300"
            >
                <div className=" mx-auto px-4 lg:px-8">
                    <div className="hidden md:flex items-center justify-between h-20">
                                                <Link href="/" className="flex items-center gap-3" aria-label="Flyobo home">
                                                        <Image
                                                                src={"/images/banner.png"}
                                                                alt="Flyobo"
                                                                width={110}
                                                                height={40}
                                                                className="object-contain hover:scale-105 transition-transform duration-200"
                                                                priority
                                                        />
                                                </Link>

                        {/* nav */}
                        <nav className="flex items-center gap-6" aria-label="Main navigation">
                            <Navitems activeItem={activeItem} isMobile={false} />
                        </nav>

                        {/* actions */}
                        <div className="flex items-center gap-3" role="toolbar" aria-label="Header actions">

                            {user && user.role === "admin" && (
                                <div className="relative">
                                    <Notifications />
                                </div>
                            )}

                            {/* user or login */}
                            {user ? (
                                <AdminActions user={user} onLogout={handleLogout} variant="desktop" />
                            ) : (
                                <button
                                    onClick={() => router.push('/')}
                                    className="inline-flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:shadow-sm bg-white dark:bg-gray-800 hover:ring-1 hover:ring-sky-300 transition-all focus:outline-none focus:ring-2"
                                    aria-label="Log in"
                                >
                                    <HiOutlineUserCircle size={22} className="text-gray-900 dark:text-white" />
                                    <span className="text-sm pr-2 text-gray-700 dark:text-gray-200">Log in</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile */}
                    <div className="flex md:hidden items-center justify-between h-16">
                        <button
                            onClick={() => setOpenSidebar(true)}
                            aria-label="Open menu"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                        >
                            <HiOutlineMenuAlt3 size={24} className="text-gray-900 dark:text-white" />
                        </button>

                        <Link href="/" aria-label="Flyobo home">
                            <Image src={"/images/banner.png"} alt="Flyobo" width={110} height={40} className="object-contain" />
                        </Link>

                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            {user ? (
                                <AdminActions user={user} onLogout={handleLogout} variant="mobile" />
                            ) : (
                                <HiOutlineUserCircle
                                    size={26}
                                    className="cursor-pointer text-gray-900 dark:text-white hover:text-sky-500"
                                    onClick={() => router.push('/')} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar (slide-in) */}
            {openSidebar && (
                <div
                    id="screen"
                    onClick={handleClose}
                    className="fixed inset-0 z-1100 flex bg-black/40 dark:bg-black/60 transition-opacity"
                    aria-hidden={!openSidebar}
                >
                    <aside
                        ref={sidebarRef}
                        className="w-4/6 max-w-sm h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 overflow-auto transform transition-transform duration-300 ease-out translate-x-0"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Image src={"/images/banner.png"} alt="Flyobo" width={96} height={32} />
                            </div>
                            <button
                                onClick={() => setOpenSidebar(false)}
                                aria-label="Close menu"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                            >
                                <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <Navitems activeItem={activeItem} isMobile={true} />
                        </div>

                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            {user ? (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-sky-500 to-indigo-600 text-white font-bold shadow">
                                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-160px">{user?.name || user?.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-1.5 text-sm rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <HiOutlineUserCircle
                                        size={32}
                                        className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-sky-500"
                                        onClick={() => {
                                            setOpenSidebar(false);
                                            router.push('/');
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </aside>

                    <div className="flex-1" />
                </div>
            )}
        </header>
    );
};

export default Header;
