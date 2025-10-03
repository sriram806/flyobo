"use client";

import { useState } from "react";
import AdminProtected from "../hooks/adminProtected";
import Heading from "../components/MetaData/Heading";
import AdminSidebar from "../components/Admin/AdminSidebar";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import ProfileSetting from "../components/Profile/ProfileSetting";
import AdminDashboard from "../components/Admin/AdminDashboard";
import AdminUsers from "../components/Admin/AdminUsers";
import AdminPackages from "../components/Admin/AdminPackages";
import { useRouter } from "next/navigation";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const [selected, setSelected] = useState("dashboard");
  const dispatch = useDispatch();
  const router = useRouter();

  const routeMap = {
    dashboard: "/admin",
    users: "/admin/users", // create this page to enable navigation
    package: "/admin/packages",
    reports: "/admin/reports", // create this page to enable navigation
  };
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
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
                const path = routeMap[key];
                if (path) router.push(path);
              }}
              onLogout={handleLogout}
            />
          </aside>
          <section className="lg:col-span-3">
            {children ? (
              children
            ) : (
              <>
                {selected === "dashboard" && <AdminDashboard />}
                {selected === "users" && (<AdminUsers />)}
                {selected === "package" && (<AdminPackages />)}
                {selected === "reports" && <ProfileSetting />}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </AdminProtected>
  );
}
