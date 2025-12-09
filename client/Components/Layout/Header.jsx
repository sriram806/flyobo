"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineMenuAlt3, HiOutlineUserCircle, HiOutlineBell, HiOutlineSearch, } from "react-icons/hi";
import { FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import Navitems from "../Navbar/Navitems";
import UserMenu from "../Navbar/UserMenu";
import ThemeSwitcher from "../utils/ThemeSwitcher";
import CustomModel from "../utils/Models/CustomModel";
import Login from "../utils/Models/Auth/Login";
import SignUp from "../utils/Models/Auth/SignUp";
import Verification from "../utils/Models/Auth/Verification";
import ForgetPassword from "../utils/Models/User/ForgetPassword";
import ResetPassword from "../utils/Models/User/ResetPassword";
import Terms from "../utils/Models/Legal/Terms";
import Privacy from "../utils/Models/Legal/Privacy";
import { performLogout } from "@/redux/authSlice";

const Header = ({ open, setOpen, activeItem, route, setRoute }) => {
    const user = useSelector((state) => state?.auth?.user);
    const dispatch = useDispatch();
    const router = useRouter();

    const [openSidebar, setOpenSidebar] = useState(false);
    const [openNotif, setOpenNotif] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotif, setLoadingNotif] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    const notifRef = useRef(null);
    const notifButtonRef = useRef(null);
    const sidebarRef = useRef(null);

    const getAuthHeader = () => {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("auth_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const onDocumentClick = (e) => {
            if (openNotif && notifRef.current && !notifRef.current.contains(e.target) && !notifButtonRef.current?.contains(e.target)) {
                setOpenNotif(false);
            }
            if (openSidebar && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpenSidebar(false);
            }
        };
        const onKey = (e) => {
            if (e.key === "Escape") {
                setOpenNotif(false);
                setOpenSidebar(false);
            }
        };
        document.addEventListener("mousedown", onDocumentClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocumentClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [openNotif, openSidebar]);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }
        const fetchUnread = async () => {
            if (!API_URL) return;
            try {
                const { data } = await axios.get(`${API_URL}/notification/unread-count`, {
                    headers: getAuthHeader(),
                });
                if (data?.success) setUnreadCount(data.count || 0);
            } catch (err) {
                if (err?.response?.status === 401) setUnreadCount(0);
                console.error("Failed to fetch unread count:", err);
            }
        };
        fetchUnread();
    }, [user]);

    const fetchNotifications = async (page = 1) => {
        if (!API_URL) return;
        try {
            setLoadingNotif(true);
            const { data } = await axios.get(`${API_URL}/notification?page=${page}&limit=5`, {
                headers: getAuthHeader(),
            });
            if (data?.success) {
                setNotifications(data.notifications || []);
                setCurrentPage(data.pagination?.currentPage || 1);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (err) {
            if (openNotif) toast.error(err?.response?.data?.message || "Failed to load notifications");
        } finally {
            setLoadingNotif(false);
        }
    };

    const markAllAsRead = async () => {
        if (!API_URL) return;
        try {
            const { data } = await axios.post(`${API_URL}/notification/mark-all-read`, {}, { headers: getAuthHeader() });
            if (data?.success) {
                setNotifications(data.notifications || []);
                setUnreadCount(0);
                toast.success("All notifications marked as read");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to mark as read");
        }
    };

    const markAsRead = async (id) => {
        if (!API_URL || !id) return;
        try {
            const { data } = await axios.put(`${API_URL}/notification/${id}`, {}, { headers: getAuthHeader() });
            if (data?.success && Array.isArray(data.notifications)) {
                setNotifications(data.notifications);
                // refresh unread count
                const { data: cntData } = await axios.get(`${API_URL}/notification/unread-count`, { headers: getAuthHeader() }).catch(() => ({}));
                if (cntData?.success) setUnreadCount(cntData.count || 0);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update notification");
        }
    };

    useEffect(() => {
        if (openNotif) {
            fetchNotifications();
            setTimeout(() => notifRef.current?.querySelector("button, [tabindex='0']")?.focus?.(), 50);
        }
    }, [openNotif]);

    const handleLogout = async () => {
        try {
            await dispatch(performLogout());
            toast.success("Logged out successfully");
            setOpenSidebar(false);
            setOpen(false);
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
            toast.success("Logged out successfully");
            setOpenSidebar(false);
            setOpen(false);
            router.push("/");
        }
    };

    const handleClose = (e) => {
        if (e.target.id === "screen") setOpenSidebar(false);
    };

    const formatDateShort = (iso) => {
        try {
            return new Date(iso).toLocaleDateString();
        } catch {
            return "";
        }
    };

    return (
        <header className="w-full relative">
            <div
                className="sticky top-0 z-1000 w-full border-b border-gray-200 dark:border-gray-800
        bg-white dark:bg-gray-900/80 backdrop-blur supports-backdrop-filter:bg-white dark:supports-backdrop-filter:bg-gray-900/70
        transition-colors duration-300"
            >
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    {/* Desktop */}
                    <div className="hidden md:flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center gap-3" aria-label="Flyobo home">
                            <Image
                                src={"/images/banner.png"}
                                alt="Flyobo"
                                width={110}
                                height={40}
                                style={{ width: 'auto', height: 'auto' }}
                                className="object-contain hover:scale-105 transition-transform duration-200"
                                priority
                            />
                        </Link>

                        <nav className="flex items-center gap-6" aria-label="Main navigation">
                            <Navitems activeItem={activeItem} isMobile={false} />
                        </nav>

                        <div className="flex items-center gap-3" role="toolbar" aria-label="Header actions">
                            <button
                                aria-label="Search"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300"
                                title="Search (coming soon)"
                            >
                                <HiOutlineSearch className="text-gray-700 dark:text-gray-200" size={20} />
                            </button>

                            {user && user.role === "admin" && (
                                <div className="relative">
                                    <button
                                        ref={notifButtonRef}
                                        onClick={() => setOpenNotif((s) => !s)}
                                        aria-expanded={openNotif}
                                        aria-controls="notif-panel"
                                        aria-label="Notifications"
                                        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300"
                                    >
                                        <HiOutlineBell className="text-gray-900 dark:text-white" size={22} />
                                        {unreadCount > 0 && (
                                            <span
                                                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center animate-pulse"
                                                aria-hidden
                                            >
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {openNotif && (
                                        <div
                                            id="notif-panel"
                                            ref={notifRef}
                                            role="dialog"
                                            aria-label="Notifications panel"
                                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden ring-1 ring-sky-50 dark:ring-sky-900/40"
                                        >
                                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                                <div className="flex items-center gap-2">
                                                    {unreadCount > 0 && (
                                                        <button onClick={markAllAsRead} className="text-xs text-sky-600 hover:text-sky-800 dark:text-sky-400 focus:outline-none">
                                                            Mark all
                                                        </button>
                                                    )}
                                                    <button onClick={() => setOpenNotif(false)} aria-label="Close notifications" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2">
                                                        <FiX className="w-4 h-4 text-gray-700 dark:text-gray-200" aria-hidden />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="max-h-96 overflow-y-auto">
                                                {loadingNotif && <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>}

                                                {!loadingNotif && notifications?.length === 0 && (
                                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                                                )}

                                                {!loadingNotif &&
                                                    notifications?.map((n) => {
                                                        const isNew = new Date() - new Date(n?.createdAt) < 86400000;
                                                        return (
                                                            <button
                                                                key={n?._id}
                                                                onClick={() => markAsRead(n?._id)}
                                                                className={`w-full text-left p-3 flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 transition-colors duration-150
                                  ${n?.status === "unread" ? "bg-sky-50 dark:bg-sky-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                                                                aria-label={n?.title}
                                                            >
                                                                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n?.status === "read" ? "bg-gray-400" : "bg-sky-500"}`} aria-hidden />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{n?.title}</div>
                                                                        {isNew && <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full">New</span>}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{n?.message}</div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatDateShort(n?.createdAt)}</div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                            </div>

                                            {!loadingNotif && notifications?.length > 0 && totalPages > 1 && (
                                                <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                    <button
                                                        onClick={() => fetchNotifications(Math.max(1, currentPage - 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-3 py-1 rounded text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                                    >
                                                        Prev
                                                    </button>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {currentPage}/{totalPages}
                                                    </div>
                                                    <button
                                                        onClick={() => fetchNotifications(Math.min(totalPages, currentPage + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className="px-3 py-1 rounded text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {user ? (
                                <UserMenu user={user} onLogout={handleLogout} variant="desktop" />
                            ) : (
                                <button
                                    onClick={() => {
                                        setOpen(true);
                                        setRoute("Login");
                                    }}
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
                        <button onClick={() => setOpenSidebar(true)} aria-label="Open menu" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300">
                            <HiOutlineMenuAlt3 size={24} className="text-gray-900 dark:text-white" />
                        </button>

                        <Link href="/" aria-label="Flyobo home">
                            <Image src={"/images/banner.png"} alt="Flyobo" width={110} height={40} style={{ width: 'auto', height: 'auto' }} className="object-contain" />
                        </Link>

                        <div className="flex items-center gap-2">
                            <ThemeSwitcher />
                            {user ? (
                                <UserMenu user={user} onLogout={handleLogout} variant="mobile" />
                            ) : (
                                <HiOutlineUserCircle
                                    size={26}
                                    className="cursor-pointer text-gray-900 dark:text-white hover:text-sky-500"
                                    onClick={() => {
                                        setOpen(true);
                                        setRoute("Login");
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar (slide-in) */}
            {openSidebar && (
                <div id="screen" onClick={handleClose} className="fixed inset-0 z-1100 flex bg-black/40 dark:bg-black/60 transition-opacity" aria-hidden={!openSidebar}>
                    <aside ref={sidebarRef} className="w-4/6 max-w-sm h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 overflow-auto transform transition-transform duration-300 ease-out translate-x-0" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Image src={"/images/banner.png"} alt="Flyobo" width={96} height={32} style={{ width: 'auto', height: 'auto' }} />
                            </div>
                            <button onClick={() => setOpenSidebar(false)} aria-label="Close menu" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300">
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
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-160">{user?.name || user?.email}</div>
                                            {user?.email && <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{user.email}</div>}
                                        </div>
                                    </div>
                                    <button onClick={handleLogout} className="px-4 py-1.5 text-sm rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <HiOutlineUserCircle
                                        size={32}
                                        className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-sky-500"
                                        onClick={() => {
                                            setOpen(true);
                                            setRoute("Login");
                                            setOpenSidebar(false);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </aside>

                    <div className="flex-1" />
                </div>
            )}

            {open && (
                <CustomModel
                    open={open}
                    setOpen={setOpen}
                    activeItem={activeItem}
                    component={route === "Login" ? Login : route === "Sign-Up" ? SignUp : route === "Verification" ? Verification : route === "ForgetPassword" ? ForgetPassword : route === "Terms" ? Terms : route === "Privacy" ? Privacy : ResetPassword}
                    setRoute={setRoute}
                />
            )}
        </header>
    );
};

export default Header;
