"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import FeaturedPackagesCard from "../styles/Home/FeaturePackagesCard"
import toast from "react-hot-toast";

export default function FeaturedPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const baseApi = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

    const fetchPackages = async () => {
      setLoading(true);
      try {
        if (!baseApi) {
          if (isMounted) {
            toast.error("Backend URL not configured");
          }
          return;
        }

        const { data } = await axios.get(`${baseApi}/package/get-packages`, {
          params: { status: "active", featured: true },
          withCredentials: true,
        });

        const serverPackages =
          data?.packages || data?.data?.packages || data?.data || (Array.isArray(data) ? data : null);

        const list = Array.isArray(serverPackages) ? serverPackages : [];

        if (isMounted) {
          const shuffled = [...list].sort(() => Math.random() - 0.5);
          setPackages(shuffled.slice(0, 6));
        }
      } catch {
        if (isMounted) {
          toast.error("Failed to load featured packages");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPackages();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Featured Packages</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Handpicked trips you may like.</p>
          </div>

          <div className="flex items-center">
            <Link href="/packages" className="inline-flex items-center px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-sm">
              View all packages
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <FeaturedPackagesCard key={pkg?._id || pkg?.id || pkg?.slug} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
