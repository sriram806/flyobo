"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";
import { FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import Navitems from "../Navbar/Navitems";
import UserMenu from "../Navbar/UserMenu";
import CustomModel from "../utils/Models/CustomModel";
import Login from "../utils/Models/Auth/Login";
import SignUp from "../utils/Models/Auth/SignUp";
import { performLogout } from "@/redux/authSlice";
import Verification from "../utils/Models/Auth/Verification";
import ForgetPassword from "../utils/Models/User/ForgetPassword";
import ResetPassword from "../utils/Models/User/ResetPassword";
import Terms from "../utils/Models/Legal/Terms";
import Privacy from "../utils/Models/Legal/Privacy";

const Header = ({ activeItem, open, setOpen, route, setRoute }) => {
    const user = useSelector((state) => state?.auth?.user);
    const dispatch = useDispatch();
    const router = useRouter();

    const [openSidebar, setOpenSidebar] = useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const close = (e) => {
            if (openSidebar && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpenSidebar(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [openSidebar]);

    const handleLogout = async () => {
        await dispatch(performLogout());
        setOpenSidebar(false);
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">

                {/* Desktop */}
                <div className="hidden md:flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/images/banner.png"
                            alt="Flyobo"
                            width={110}
                            height={40}
                            priority
                        />
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Navitems activeItem={activeItem} />
                    </nav>

                    <div className="flex items-center gap-3">

                        {user ? (
                            <UserMenu user={user} onLogout={handleLogout} />
                        ) : (
                            <button
                                onClick={() => {
                                    setOpen(true);
                                    setRoute("Login");
                                }}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <HiOutlineUserCircle size={22} />
                                Login
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile */}
                <div className="flex md:hidden items-center justify-between h-14">
                    <button onClick={() => setOpenSidebar(true)}>
                        <HiOutlineMenuAlt3 size={24} />
                    </button>

                    <Link href="/">
                        <Image src="/images/banner.png" alt="Flyobo" width={96} height={32} />
                    </Link>

                </div>
            </div>

            {/* Mobile Sidebar */}
            {openSidebar && (
                <div className="fixed inset-0 z-50 bg-black/50">
                    <aside
                        ref={sidebarRef}
                        className="w-4/5 max-w-sm h-full bg-white dark:bg-gray-900 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <Image src="/images/banner.png" alt="Flyobo" width={90} height={30} />
                            <button onClick={() => setOpenSidebar(false)}>
                                <FiX size={20} />
                            </button>
                        </div>

                        <Navitems activeItem={activeItem} isMobile />

                        <div className="mt-6 border-t pt-4">
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2 rounded-lg bg-rose-500 text-white"
                                >
                                    Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setOpen(true);
                                        setRoute("Login");
                                        setOpenSidebar(false);
                                    }}
                                    className="w-full py-2 rounded-lg bg-sky-500 text-white"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
            )}

            {/* Auth Modal */}
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
