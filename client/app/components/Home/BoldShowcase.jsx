"use client";

import Link from "next/link";

const highlights = [
  {
    heading: "Curated & Trusted",
    sub: "Handpicked stays and experiences",
    icon: "✨",
  },
  {
    heading: "Transparent Pricing",
    sub: "No hidden fees, ever",
    icon: "₹",
  },
  {
    heading: "24/7 Support",
    sub: "We’re with you, anywhere",
    icon: "🛟",
  },
];

const BoldShowcase = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-100 via-fuchsia-100 to-sky-100 dark:from-rose-900/30 dark:via-fuchsia-900/20 dark:to-sky-900/20" />
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Go Bold. Travel Smarter.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Big vibes. Bigger memories. Flyobo brings you striking destinations, clean design,
            and fast booking—so you spend less time planning and more time exploring.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/packages" className="inline-flex items-center rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 font-semibold">
              Explore Packages
            </Link>
            <Link href="/about" className="inline-flex items-center rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-3 font-semibold text-gray-900 dark:text-white hover:bg-white/60 dark:hover:bg-gray-800/60">
              Why Flyobo?
            </Link>
          </div>
        </div>

        {/* Bold grid cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1600&q=80&auto=format&fit=crop"].map((src, i) => (
            <article
              key={i}
              className="group relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-gray-200/60 dark:ring-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Showcase" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Unforgettable Views</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Handpicked by our editors</p>
                </div>
                <Link href="/packages" className="inline-flex items-center rounded-lg bg-sky-600 text-white px-3 py-2 text-sm hover:bg-sky-700">
                  Book now →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Highlights */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((h) => (
            <div key={h.heading} className="rounded-2xl bg-white/70 dark:bg-gray-900/60 ring-1 ring-gray-200/60 dark:ring-white/10 p-4 text-center">
              <div className="text-2xl mb-1">{h.icon}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{h.heading}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">{h.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoldShowcase;
