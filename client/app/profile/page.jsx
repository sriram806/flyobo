"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { performLogout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import UserProtected from "@/Components/hooks/userProtected";
import Header from "@/Components/Layout/Header";
import SideBarProfile from "@/Components/Profile/SideBarProfile";
import ProfileInfo from "@/Components/Profile/ProfileInfo";
import ProfileBookings from "@/Components/Profile/ProfileBookings";
import FavouriteBookings from "@/Components/Profile/FavouriteBookings";
import ReferralProgram from "@/Components/Profile/ReferralProgram";
import BankDetails from "@/Components/Profile/BankDetails";
import BNotifications from "@/Components/Profile/BNotifications";
import ProfileSetting from "@/Components/Profile/ProfileSetting";
import Footer from "@/Components/Layout/Footer";
import Loading from "@/Components/LoadingScreen/Loading";
import Heading from "@/Components/MetaData/Heading";

const ProfileContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const [selected, setSelected] = useState("overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setSelected(tab);
  }, [searchParams]);

  const handleSelect = useCallback(
    (key) => {
      setSelected(key);
      router.replace(`/profile${key ? `?tab=${encodeURIComponent(key)}` : ""}`);
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(performLogout());
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      toast.success("Logged out successfully");
      router.push("/");
    }
  }, [dispatch, router]);

  return (
    <UserProtected>
      <Heading
        title="My Profile — Flyobo"
        description="Manage your profile, bookings, referrals and account settings."
        keywords="profile, bookings, wishlist, referrals, settings"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <SideBarProfile selected={selected} onSelect={handleSelect} onLogout={handleLogout} />
            </aside>

            <section className="lg:col-span-3">
              {selected === "overview" && <ProfileInfo />}
              {selected === "bookings" && <ProfileBookings />}
              {selected === "wishlist" && <FavouriteBookings />}
              {selected === "referral" && <ReferralProgram />}
              {selected === "bank-details" && <BankDetails />}
              {selected === "notifications" && <BNotifications />}
              {selected === "settings" && <ProfileSetting />}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </UserProtected>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[120px] flex items-center justify-center"><Loading /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
