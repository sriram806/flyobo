"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiStar, FiMapPin, FiClock, FiUsers } from "react-icons/fi";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import Link from "next/link";

const PackageCard = ({ package: pkg }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={pkg?.images?.url || pkg?.image || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop"}
          alt={pkg?.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {pkg?.featured && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            FEATURED
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-bold px-2 py-1 rounded-lg">
          ₹{pkg?.price}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
            {pkg?.title}
          </h3>
          <div className="flex items-center text-amber-500">
            <FiStar className="fill-current" />
            <span className="text-sm font-medium ml-1">{pkg?.rating || 4.8}</span>
          </div>
        </div>
        
        <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400 text-sm">
          <FiMapPin className="mr-1" />
          <span>{pkg?.destination}</span>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FiClock className="mr-1" />
            <span>{pkg?.duration} days</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FiUsers className="mr-1" />
            <span>{pkg?.maxGroupSize || 10} people</span>
          </div>
        </div>
        
        <Link 
          href={`/packages/${pkg?._id || pkg?.id}`}
          className="mt-4 block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 rounded-lg transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

const FeaturedPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!API_URL) {
          setError("Backend URL not configured");
          setLoading(false);
          return;
        }
        
        const base = API_URL.replace(/\/$/, "");
        const url = `${base}/package/get-packages`;
        
        const { data } = await axios.get(url, {
          params: { 
            status: "active", 
            featured: true,
            limit: 6 
          },
          withCredentials: true,
        });
        
        const serverPackages = Array.isArray(data?.packages) 
          ? data.packages 
          : data?.data?.packages || [];
          
        setPackages(serverPackages.slice(0, 6));
      } catch (err) {
        setError("Failed to load featured packages");
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Packages</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Discover our most popular travel experiences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-5">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <div className="text-amber-500 font-medium">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Packages</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Discover our most popular travel experiences
          </p>
        </div>
        
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg?._id || pkg?.id} package={pkg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No featured packages available at the moment.
            </p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link 
            href="/packages"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Packages
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPackages;