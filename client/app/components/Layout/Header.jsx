"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ThemeSwitcher from "../../utils/ThemeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle, HiOutlineBell } from "react-icons/hi";
import CustomModel from "../../utils/Models/CustomModel";
import Login from "../../utils/Models/Auth/Login";
import SignUp from "../../utils/Models/Auth/SignUp";
import Verification from "../../utils/Models/Auth/Verification";
import { useDispatch, useSelector } from "react-redux";
import { performLogout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
// logout handled via redux performLogout thunk
import ForgetPassword from "../../utils/Models/User/ForgetPassword";
import ResetPassword from "../../utils/Models/User/ResetPassword";
import Navitems from "../Navbar/Navitems";
import UserMenu from "../Navbar/UserMenu";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";


const Header = ({ open, setOpen, activeItem, route, setRoute }) => {
    console.log('Header component rendering');
    const user = useSelector((state) => state?.auth?.user);
    const dispatch = useDispatch();
    const [openSidebar, setOpenSidebar] = useState(false);
    const [openNotif, setOpenNotif] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotif, setLoadingNotif] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setOpenSidebar(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Listen for global auth modal open events (dispatched by other modules)
    useEffect(() => {
        const handleOpenAuthModal = (e) => {
            try {
                const routeName = e?.detail?.route || 'Login';
                if (setRoute) setRoute(routeName);
                if (setOpen) setOpen(true);
            } catch (err) {
                console.warn('Failed to open auth modal from event', err);
            }
        };
        window.addEventListener('open-auth-modal', handleOpenAuthModal);
        return () => window.removeEventListener('open-auth-modal', handleOpenAuthModal);
    }, [setOpen, setRoute]);

    const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    // Add new state for unread count and pagination
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
        if (!API_URL) return;
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const { data } = await axios.get(`${API_URL}/notification/unread-count`, {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (data?.success) {
                setUnreadCount(data.count);
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!API_URL) return;
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const { data } = await axios.post(`${API_URL}/notification/mark-all-read`, {}, {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (data?.success) {
                setNotifications(data.notifications);
                setUnreadCount(0);
                toast.success('All notifications marked as read');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to mark notifications as read');
        }
    };

    // Fetch notifications with pagination
    const fetchNotifications = async (page = 1) => {
        if (!API_URL) return;
        try {
            setLoadingNotif(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const { data } = await axios.get(`${API_URL}/notification?page=${page}&limit=5`, {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (data?.success) {
                setNotifications(data.notifications);
                setCurrentPage(data.pagination.currentPage);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (err) {
            // show toast only if dropdown is open to avoid noise
            if (openNotif) toast.error(err?.response?.data?.message || 'Failed to load notifications');
        } finally {
            setLoadingNotif(false);
        }
    };

    const markAsRead = async (id) => {
        if (!API_URL || !id) return;
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const { data } = await axios.put(`${API_URL}/notification/${id}`, {}, {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (data?.success && Array.isArray(data.notifications)) {
                setNotifications(data.notifications);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update notification');
        }
    };

    useEffect(() => {
        if (openNotif) {
            fetchNotifications();
        }
    }, [openNotif]);

    const handleLogout = async () => {
        try {
            // Dispatch the logout thunk which calls server logout and clears client state
            await dispatch(performLogout());
            toast.success("Logged out successfully");
            setOpenSidebar(false);
        } catch (error) {
            console.error('Logout error:', error);
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
            <div className={`sticky top-0 z-[1000] w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70 shadow-md`}>
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="hidden md:flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src={'/images/banner.png'} alt="Flyobo" width={100} height={100} />
                        </Link>
                        <nav className="flex items-center gap-6">
                            <Navitems activeItem={activeItem} isMobile={false} />
                        </nav>
                        <div className="flex items-center gap-2">
                            <div className="flex">
                            </div>
                            {/* Notifications */}
                            {user && (
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenNotif((v) => !v)}
                                        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                        aria-label="Notifications"
                                    >
                                        <HiOutlineBell size={22} className="text-gray-900 dark:text-white" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {openNotif && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
                                            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button 
                                                        onClick={markAllAsRead}
                                                        className="text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="max-h-96 overflow-y-auto">
                                                {loadingNotif && <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>}
                                                
                                                {!loadingNotif && notifications?.length === 0 && (
                                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                                                )}
                                                
                                                {!loadingNotif && notifications?.map((n) => (
                                                    <div 
                                                        key={n?._id} 
                                                        className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 ${
                                                            n?.status === 'unread' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                        }`}
                                                        onClick={() => markAsRead(n?._id)}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full ${n?.status === 'read' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-emerald-500'}`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={n?.title}>{n?.title}</div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n?.message}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {new Date(n?.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Pagination */}
                                            {!loadingNotif && notifications?.length > 0 && totalPages > 1 && (
                                                <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                                    <button
                                                        onClick={() => fetchNotifications(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    >
                                                        Previous
                                                    </button>
                                                    
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Page {currentPage} of {totalPages}
                                                    </span>
                                                    
                                                    <button
                                                        onClick={() => fetchNotifications(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                <UserMenu
                                    user={user}
                                    onLogout={handleLogout}
                                    variant="desktop"
                                />
                            ) : (
                                <button
                                    onClick={() => {
                                        setOpen(true);
                                        setRoute("Login");
                                    }}
                                    className="inline-flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:shadow-sm bg-white dark:bg-gray-800"
                                    aria-label="User profile"
                                >
                                    <HiOutlineUserCircle size={22} className="text-gray-900 dark:text-white" />
                                    <span className="text-sm pr-2 text-gray-700 dark:text-gray-200">Log in</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex md:hidden items-center justify-between h-16">
                        <button
                            onClick={() => setOpenSidebar(true)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Open menu"
                        >
                            <HiOutlineMenuAlt3 size={24} className="text-gray-900 dark:text-white" />
                        </button>
                        <Link href="/" className="flex items-center gap-2">
                            <Image src={'/images/banner.png'} alt="Flyobo" width={100} height={100} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <ThemeSwitcher />
                            {user ? (
                                <UserMenu
                                    user={user}
                                    onLogout={handleLogout}
                                    variant="mobile"
                                />
                            ) : (
                                <HiOutlineUserCircle
                                    size={26}
                                    className="cursor-pointer text-gray-900 dark:text-white"
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
            {openSidebar && (
                <div
                    className="fixed top-0 left-0 w-full h-screen bg-black/50 dark:bg-black/70 z-[1100] transition-colors duration-300"
                    onClick={handleClose}
                    id="screen"
                >
                    <div className="w-3/5 h-screen bg-white dark:bg-gray-900 shadow-xl dark:shadow-2xl border-r border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
                        <div className="flex flex-col h-full">
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={() => setOpenSidebar(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    aria-label="Close menu"
                                >
                                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1">
                                <Navitems activeItem={activeItem} isMobile={true} />
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                {user ? (
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-md">
                                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <div className="min-w-0">
                                                <div
                                                    className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]"
                                                    title={user?.name || user?.email}
                                                >
                                                    {user?.name || user?.email}
                                                </div>
                                                {user?.email && (
                                                    <div
                                                        className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]"
                                                        title={user?.email}
                                                    >
                                                        {user.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="px-4 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-sm"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <HiOutlineUserCircle
                                            size={32}
                                            className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                            onClick={() => {
                                                setOpen(true);
                                                setRoute("Login");
                                                setOpenSidebar(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {
                route === "Login" && (
                    <>
                        {
                            open && (
                                <CustomModel
                                    open={open}
                                    setOpen={setOpen}
                                    activeItem={activeItem}
                                    component={Login}
                                    setRoute={setRoute}
                                />
                            )
                        }
                    </>
                )
            }

            {
                route === "Sign-Up" && (
                    <>
                        {
                            open && (
                                <CustomModel
                                    open={open}
                                    setOpen={setOpen}
                                    activeItem={activeItem}
                                    component={SignUp}
                                    setRoute={setRoute}
                                />
                            )
                        }
                    </>
                )
            }
            {
                route === "Verification" && (
                    <>
                        {
                            open && (
                                <CustomModel
                                    open={open}
                                    setOpen={setOpen}
                                    activeItem={activeItem}
                                    component={Verification}
                                    setRoute={setRoute}
                                />
                            )
                        }
                    </>
                )
            }
            {
                route === "ForgetPassword" && (
                    <>
                        {
                            open && (
                                <CustomModel
                                    open={open}
                                    setOpen={setOpen}
                                    activeItem={activeItem}
                                    component={ForgetPassword}
                                    setRoute={setRoute}
                                />
                            )
                        }
                    </>
                )
            }
            {
                route === "ResetPassword" && (
                    <>
                        {
                            open && (
                                <CustomModel
                                    open={open}
                                    setOpen={setOpen}
                                    activeItem={activeItem}
                                    component={ResetPassword}
                                    setRoute={setRoute}
                                />
                            )
                        }
                    </>
                )
            }
        </header>
    );
};

export default Header;