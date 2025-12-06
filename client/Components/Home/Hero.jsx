"use client";

import { FiMapPin, FiMic, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("packages");
  const [suggestions, setSuggestions] = useState([]);
  const [slide, setSlide] = useState(0);

  const router = useRouter();
  const user = useSelector((state) => state?.auth?.user);

  const quickDestinations = ["Goa", "Kerala", "Rajasthan", "Andaman", "Himachal"];

  const images = [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80",
    "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&q=80",
    "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1200&q=80",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return router.push("/packages");
    router.push(`/packages?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleTyping = (val) => {
    setSearchQuery(val);
    if (!val.trim()) return setSuggestions([]);

    const match = quickDestinations.filter((i) =>
      i.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(match);
  };

  return (
    <header className="relative bg-gradient-to-br from-sky-50 to-white dark:from-[#050506] dark:to-gray-900 py-20 overflow-hidden">

      {/* FLOATING GRADIENT ORBS */}
      <motion.div
        animate={{ x: [0, 120, 0], y: [0, -80, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -top-20 -left-20 w-80 h-80 bg-sky-200 dark:bg-sky-900 opacity-30 blur-[130px] rounded-full"
      />
      <motion.div
        animate={{ x: [0, -120, 0], y: [0, 80, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 dark:bg-purple-900 opacity-30 blur-[150px] rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-20">

        {/* LEFT SECTION ------------------------------------------------ */}
        <div className="lg:col-span-7 space-y-8">

          {/* Welcome Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-sky-600 dark:text-sky-400 font-semibold"
          >
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]} 👋` : "Flyobo — Travel made easy"}
          </motion.p>

          {/* MAIN HEADING */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight"
          >
            Make memories, not plans —  
            <span className="bg-gradient-to-r from-sky-500 to-purple-500 bg-clip-text text-transparent">
              explore curated trips.
            </span>
          </motion.h1>

          <p className="text-gray-600 dark:text-gray-300 max-w-xl">
            Discover verified packages, explore amazing destinations, and enjoy trusted local experiences.
          </p>

          {/* SEARCH PANEL ----------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 p-5"
          >
            <form onSubmit={handleSearch} className="relative">

              <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3">
                <FiMapPin className="text-gray-400 text-xl mr-5" />

                <input
                  value={searchQuery}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder={"Search packages or destinations"}
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
                />

                <FiSearch className="text-gray-400 text-xl cursor-pointer hover:text-sky-600 transition" />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(s);
                        setSuggestions([]);
                        router.push(`/packages?q=${encodeURIComponent(s)}`);
                      }}
                      className="block text-left w-full px-2 py-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <FiSearch className="inline mr-2" /> {s}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Quick Chips */}
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {quickDestinations.map((place) => (
                <button
                  key={place}
                  onClick={() => router.push(`/packages?q=${place}`)}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {place}
                </button>
              ))}
            </div>
          </motion.div>

        </div>

        <div className="lg:col-span-5 hidden lg:block">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="relative rounded-xl overflow-hidden shadow-xl h-[550px]"
          >
            <Image
              src={images[slide]}
              alt="Travel"
              fill
              className="object-cover transition-all duration-700"
            />
          </motion.div>
        </div>

      </div>
    </header>
  );
}
