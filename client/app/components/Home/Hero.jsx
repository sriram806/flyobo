"use client";

import { FiMapPin } from "react-icons/fi";
import { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useHomeContent } from "@/app/context/HomeContentContext";
import { motion } from "framer-motion";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("packages");
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();
  const { content } = useHomeContent();

  const stats = [
    { number: "15K+", label: "Happy Travelers" },
    { number: "120+", label: "Destinations" },
    { number: "350+", label: "Curated Packages" },
    { number: "24/7", label: "Support" },
  ];

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
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-sky-600 font-semibold"
          >
            Flyobo — Travel made easy
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight"
          >
            Make memories, not plans — explore curated trips & great prices.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-600 dark:text-gray-300 max-w-xl"
          >
            Discover verified packages, explore amazing destinations, and enjoy trusted local experiences. Travel with confidence.
          </motion.p>

          {/* Search Panel */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4" role="search" aria-label="Search packages">
              <div className="md:col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiMapPin aria-hidden="true" />
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
                  aria-label="Search packages or destinations"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-4 py-3 font-semibold shadow-md transition"
                aria-label="Search"
              >
                Search
              </button>
            </form>

            {/* Quick Chips */}
            <div className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Quick destinations">
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

            {/* Primary CTA */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => router.push('/packages')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-semibold shadow-md"
              >
                Explore Packages
              </button>
              <a
                href="#how-it-works"
                className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
              >
                How it works
              </a>
            </div>
          </div>

          
        </div>

        {/* RIGHT SECTION — Image + Promo Cards */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop"
              alt="Travel"
              width={900}
              height={700}
              className="object-cover w-full h-full"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Promo Cards */}
            <div className="absolute bottom-6 left-6 right-6 grid gap-4">
              {[ 
                { tag: "Special Offer", title: "Test 2 — 29% OFF", price: "₹5,000", scratch: null },
                { tag: "Popular", title: "Palasa Package", price: "₹6,998", scratch: "₹8,900" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="flex items-center justify-between bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl p-4 shadow-lg"
                >
                  <div>
                    <div className="text-sm text-gray-500">{item.tag}</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-200">{item.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-sky-600">{item.price}</div>
                    {item.scratch && (
                      <div className="text-xs text-gray-500 line-through">{item.scratch}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
