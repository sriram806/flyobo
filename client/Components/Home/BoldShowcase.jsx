"use client";

import Link from "next/link";
import Image from "next/image";

const highlights = [
  { heading: "Curated & Trusted", sub: "Handpicked stays and experiences", icon: "✨" },
  { heading: "Transparent Pricing", sub: "No hidden fees, ever", icon: "₹" },
  { heading: "24/7 Support", sub: "We're with you, anywhere", icon: "🛟" },
  { heading: "Price Match", sub: "Best rates guaranteed", icon: "💰" },
  { heading: "Flexible Booking", sub: "Easy changes & cancellations", icon: "📅" },
  { heading: "Local Experts", sub: "Insider knowledge & tips", icon: "🗺️" },
];

const images = [
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80&auto=format&fit=crop",
    title: "Discover Hidden Gems",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop",
    title: "Unforgettable Views Await",
  },
  {
    src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1600&q=80&auto=format&fit=crop",
    title: "Journeys with Stories",
  },
];

export default function BoldShowcase() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-sky-50 to-blue-50 dark:from-gray-950 dark:via-sky-900/10 dark:to-gray-900 transition-all" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Headings */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            Go Bold. Travel Smarter.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-300">
            Big vibes. Bigger memories. Flyobo brings striking destinations, clean design & fast
            booking—so you plan less and explore more.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/packages"
              className="inline-flex items-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold transition"
            >
              Explore Packages
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-xl border border-gray-300 dark:border-gray-700 px-6 py-3 font-semibold text-gray-900 dark:text-white hover:bg-white/70 dark:hover:bg-gray-800/50 backdrop-blur-sm transition"
            >
              Why Flyobo?
            </Link>
          </div>
        </div>


        {/* Highlights */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {highlights.map((h) => (
            <div
              key={h.heading}
              className="rounded-2xl bg-white/70 dark:bg-gray-900/60 p-5 border border-gray-200/50 dark:border-gray-700/40 text-center shadow-sm backdrop-blur-md"
            >
              <div className="text-2xl mb-2">{h.icon}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {h.heading}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {h.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
