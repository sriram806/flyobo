"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ThemeSwitcher from "../../utils/ThemeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";
import CustomModel from "../../utils/Models/CustomModel";
import Login from "../../utils/Models/Auth/Login";
import SignUp from "../../utils/Models/Auth/SignUp";
import Verification from "../../utils/Models/Auth/Verification";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import ForgetPassword from "../../utils/Models/User/ForgetPassword";
import ResetPassword from "../../utils/Models/User/ResetPassword";
import Navitems from "../Navbar/Navitems";
import UserMenu from "../Navbar/UserMenu";


const Header = ({ open, setOpen, activeItem, route, setRoute }) => {
    const user = useSelector((state) => state?.auth?.user);
    const dispatch = useDispatch();
    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setOpenSidebar(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                                <ThemeSwitcher />
                            </div>
                            {user ? (
                                <UserMenu
                                    user={user}
                                    onLogout={() => {
                                        dispatch(logout());
                                        toast.success("Logged out");
                                    }}
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
                            <span className="text-xl font-extrabold tracking-tight text-rose-600">Flyobo</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <ThemeSwitcher />
                            {user ? (
                                <UserMenu
                                    user={user}
                                    onLogout={() => {
                                        dispatch(logout());
                                        toast.success("Logged out");
                                    }}
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
                                            onClick={() => {
                                                dispatch(logout());
                                                setOpenSidebar(false);
                                                toast.success("Logged out");
                                            }}
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
