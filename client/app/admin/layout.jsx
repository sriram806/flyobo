"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { performLogout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
// logout handled via redux performLogout thunk
import Heading from "../components/MetaData/Heading";
import ProfileSetting from "../components/Profile/ProfileSetting";
import AdminDashboard from "../components/Admin/AdminDashboard";
import AdminUsers from "../components/Admin/AdminUsers";
import AdminPackages from "../components/Admin/AdminPackages";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import AdminGallery from "../components/Admin/AdminGallery";
import AdminBookings from "../components/Admin/AdminBookings";
import AdminProtected from "../hooks/adminProtected";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AuthDebugger from "../components/Debug/AuthDebugger";

function AdminLayoutContent({ children }) {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const [selected, setSelected] = useState("dashboard");
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync selected tab with URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setSelected(tab);
    }
  }, [searchParams]);

  const routeMap = {
    dashboard: "/admin",
    users: "/admin/users",
    package: "/admin/packages",
    bookings: "/admin/bookings",
    reports: "/admin/reports",
    gallery: "/admin/gallery",
    analytics: "/admin/analytics",
    contact: "/admin/conatcts",
    home: "/admin/home",
    "analytics-users": "/admin/analytics/users",
    "analytics-packages": "/admin/analytics/packages",
    "analytics-bookings": "/admin/analytics/bookings",
    "referrals-overview": "/admin/referrals"
  };
  const handleLogout = async () => {
    try {
      await dispatch(performLogout());
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error('Logout error:', error);
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  return (
    <AdminProtected>
      <Heading title="Admin - Flyobo" description="Admin dashboard" keywords="admin, dashboard" />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <AdminSidebar
              selected={selected}
              onSelect={(key) => {
                setSelected(key);
                // Navigate to a concrete admin route when available, otherwise fall back to query param
                const path = routeMap[key] || `/admin?tab=${key}`;
                router.push(path);
              }}
              onLogout={handleLogout}
            />
          </aside>
          <section className="lg:col-span-3">
            {children}
          </section>
        </div>
      </main>
      <Footer />
    </AdminProtected>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
