"use client";

import { FiMapPin } from "react-icons/fi";
import { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useHomeContent } from "@/app/context/HomeContentContext";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("packages");
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();

  const quickDestinations = ["Goa", "Kerala", "Rajasthan", "Andaman", "Himachal"];

  function handleSubmit(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return router.push("/packages");
    router.push(`/packages?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  return (
    <header className="relative bg-gradient-to-br from-sky-50 to-white dark:from-[#050506] dark:to-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

        {/* LEFT SECTION */}
        <div className="lg:col-span-7 space-y-6">
          {user?.name && (
            <p className="text-sm text-sky-600 font-semibold animate-fadeInUp">
              Welcome back, {user.name.split(" ")[0]} 👋
            </p>
          )}

          {!user?.name && (
            <p className="text-sm text-sky-600 font-semibold animate-fadeInUp">
              Flyobo — Travel made easy
            </p>
          )}

          <h1 className="animate-fadeInUp text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Make memories, not plans — explore curated trips & great prices.
          </h1>

          <p className="animate-fadeInUp text-gray-600 dark:text-gray-300 max-w-xl">
            Discover verified packages, explore amazing destinations, and enjoy trusted local experiences. Travel with confidence.
          </p>

          {/* Search Panel */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded shadow-lg p-5 border animate-fadeInUp border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4" role="search">
              <div className="md:col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiMapPin />
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === "packages"
                      ? "Search packages or destinations"
                      : activeTab === "hotels"
                        ? "Enter city or hotel name"
                        : "Enter route / city"
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-4 py-3 font-semibold shadow-md transition"
              >
                Search
              </button>
            </form>

            {/* Quick Chips */}
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {quickDestinations.map((place) => (
                <button
                  key={place}
                  onClick={() => {
                    setSearchQuery(place);
                    router.push(`/packages?q=${encodeURIComponent(place)}`);
                  }}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {place}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION — Full height image */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="relative rounded-md overflow-hidden shadow-md h-full min-h-[520px] max-h-[90vh] animate-fadeIn">
            <Image
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop"
              alt="Travel"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>


      </div>
    </header>
  );
}
