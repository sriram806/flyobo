"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserProtected from "../hooks/userProtected";
import Heading from "../components/MetaData/Heading";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import SideBarProfile from "../components/Profile/SideBarProfile";
import ProfileInfo from "../components/Profile/ProfileInfo";
import ProfileSetting from "../components/Profile/ProfileSetting";
import ProfileBookings from "../components/Profile/ProfileBookings";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import FavouriteBookings from "../components/Profile/FavouriteBookings";

const Page = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const [selected, setSelected] = useState("overview");
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
  };

  return (
    <UserProtected>
      <Heading
        title="Flyobo"
        description="Discover travel tips, destination guides, and vacation inspiration for your next adventure. Explore the world's amazing places with expert advice, top itineraries, and travel deals tailored for every kind of explorer."
        keywords="Travel, Adventure, Destinations, Vacation, Itineraries, Hotels, Flights, Tourism, Sightseeing, Travel Tips, Holiday, Guided Tours, Budget Travel, Luxury Travel, Family Travel, Solo Travel, Travel Deals"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <SideBarProfile
              selected={selected}
              onSelect={(key) => setSelected(key)}
              onLogout={handleLogout}
            />
          </aside>

          {/* Content */}
          <section className="lg:col-span-3">
            {selected === "overview" && <ProfileInfo />}

            {selected === "bookings" && <ProfileBookings />}

            {selected === "wishlist" && <FavouriteBookings />}

            {selected === "settings" && <ProfileSetting />}
          </section>
        </div>
      </main>
      <Footer />
    </UserProtected>
  );
};

export default Page;
