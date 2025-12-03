"use client";

import { FiMapPin } from "react-icons/fi";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function HeroLivePreview({ tags, slides }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();

  // Auto slideshow
  useEffect(() => {
    if (!slides?.length) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [slides]);

  const quickTags = tags || [];

  function handleSubmit(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return router.push("/packages");
    router.push(`/packages?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  return (
    <header className="relative py-20 overflow-hidden">

      {/* Background Slideshow */}
      <div className="absolute inset-0 w-full h-full">
        {slides?.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt="Hero Slide"
            fill
            className={`object-cover transition-opacity duration-700 ${
              activeSlide === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-br from-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
        {user?.name && (
          <p className="font-semibold text-sky-300 text-sm">Welcome back, {user.name.split(" ")[0]} 👋</p>
        )}

        <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight drop-shadow-lg">
          Make memories — not plans.
        </h1>

        <p className="mt-3 text-lg text-gray-200 max-w-xl drop-shadow-md">
          Find curated trips, premium experiences & handpicked destinations.
        </p>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white/90 backdrop-blur-md text-gray-800 p-4 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="md:col-span-3 relative">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search packages or destinations"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <button className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-4 py-3 font-semibold shadow">
            Search
          </button>
        </form>

        {/* Quick Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {quickTags.map((tag, i) => (
            <button
              key={i}
              onClick={() => router.push(`/packages?q=${encodeURIComponent(tag)}`)}
              className="px-3 py-1.5 rounded-full bg-white/30 hover:bg-white/40 text-white text-sm backdrop-blur-md"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
