"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { performLogout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import AdminProtected from "@/Components/hooks/adminProtected";
import Heading from "@/Components/MetaData/Heading";
import Header from "@/Components/Layout/Header";
import AdminSidebar from "@/Components/Admin/AdminSidebar";
import Loading from "@/Components/LoadingScreen/Loading";
import Footer from "@/Components/Layout/Footer";

function AdminLayoutContent({ children }) {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const [selected, setSelected] = useState("dashboard");
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setSelected(tab);
  }, [searchParams]);

  const routeMap = {
    dashboard: "/admin",
    users: "/admin/users",
    package: "/admin/packages",
    bookings: "/admin/bookings",
    reports: "/admin/reports",
    gallery: "/admin/gallery",
    contact: "/admin/contacts",
    home: "/admin/home",
    "analytics-users": "/admin/analytics/users",
    "analytics-packages": "/admin/analytics/packages",
    "analytics-bookings": "/admin/analytics/bookings",
    "referrals-overview": "/admin/referrals",
  };

  const handleLogout = async () => {
    try {
      await dispatch(performLogout());
      toast.success("Logged out successfully");
    } finally {
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
            <section className="lg:col-span-3">{children}</section>
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
