"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiGlobe, FiUsers, FiMapPin, FiAward } from "react-icons/fi";

const stats = [
  { id: 1, number: 15000, label: "Happy Travelers", icon: FiUsers, suffix: "+" },
  { id: 2, number: 500, label: "Destinations", icon: FiMapPin, suffix: "+" },
  { id: 3, number: 50, label: "Countries", icon: FiGlobe, suffix: "+" },
  { id: 4, number: 4.9, label: "Average Rating", icon: FiAward, suffix: "/5" }
];

const StatCard = ({ stat, isVisible }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const end = stat.number;
      const duration = 2000; // ms
      const increment = end / (duration / 16); // 60fps
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isVisible, stat.number]);
  
  const Icon = stat.icon;
  
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-4">
        <Icon size={24} />
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {count}{stat.suffix}
      </div>
      <div className="text-gray-600 dark:text-gray-400">
        {stat.label}
      </div>
    </motion.div>
  );
};

const TravelStats = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">By The Numbers</h2>
          <p className="mt-2 text-blue-100 dark:text-gray-400">
            Our journey in making travel dreams come true
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard 
              key={stat.id} 
              stat={stat} 
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelStats;