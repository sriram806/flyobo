"use client";

import React from "react";
import { FiUsers, FiMap, FiStar, FiClock } from "react-icons/fi";

const Stat = ({ Icon, number, label }) => (
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 rounded-xl bg-sky-50 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-white text-lg">
      <Icon />
    </div>
    <div>
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{number}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
    </div>
  </div>
);

export default function HomeStats() {
  const stats = [
    { Icon: FiUsers, number: "15K+", label: "Happy Travelers" },
    { Icon: FiMap, number: "120+", label: "Destinations" },
    { Icon: FiStar, number: "4.8", label: "Avg. Rating" },
    { Icon: FiClock, number: "24/7", label: "Support" },
  ];

  return (
    <section aria-label="Key statistics" className="bg-white dark:bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Stat key={i} Icon={s.Icon} number={s.number} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
