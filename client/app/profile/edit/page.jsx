"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import UserProtected from "../../hooks/userProtected";
import Heading from "../../components/MetaData/Heading";
import Header from "../../components/Layout/Header";
import SideBarProfile from "../../components/Profile/SideBarProfile";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import Footer from "@/app/components/Layout/Footer";

export default function EditProfilePage() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!API_URL) {
        toast.error("API base URL is Missing.");
      }
      const endpoint = `${API_URL}/user/profile`;

      const { data } = await axios.put(
        endpoint,
        { name, phone, bio },
        { withCredentials: true }
      );

      const updatedUser = data?.user || data?.data?.user || { ...user, name, email, phone };
      dispatch(setAuthUser(updatedUser));
      toast.success(data?.message || "Profile updated successfully");
      router.push("/profile?tab=overview");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserProtected>
      <Heading
        title="Edit Profile - Flyobo"
        description="Update your profile information on Flyobo."
        keywords="Edit Profile, Account, Settings"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <SideBarProfile selected="settings" onSelect={() => {}} onLogout={() => {}} />
          </aside>

          {/* Edit Form */}
          <section className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <div className="p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update your personal information below.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => router.push("/profile?tab=settings")}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </UserProtected>
  );
}
