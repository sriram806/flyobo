"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { performLogout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import Heading from "../components/MetaData/Heading";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import AdminProtected from "../hooks/adminProtected";
import AdminSidebar from "../components/Admin/AdminSidebar";
import Loading from "../components/LoadingScreen/Loading";

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
      <main className="min-h-screen bg-gray-100/90 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <AdminSidebar
                selected={selected}
                onSelect={(key) => {
                  setSelected(key);
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
        </div>
      </main>
      <Footer />
    </AdminProtected>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<Loading />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
