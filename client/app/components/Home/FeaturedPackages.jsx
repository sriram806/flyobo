"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const Card = ({ pkg }) => {

  return (
    <Link
      href={`/packages/${pkg?.slug || pkg?._id || pkg?.id}`}
      className="group relative block rounded overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-transform hover:scale-101 shadow-sm"
      aria-label={`View package ${pkg?.title}`}
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={pkg?.images}
          alt={pkg?.title || "Package image"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={false}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/8 to-transparent" />

        <div className="absolute bottom-0 px-4 py-3 w-full">
          <h3 className="text-white font-bold text-lg drop-shadow-md line-clamp-1 tracking-wide">
            {pkg?.title}
          </h3>
          <p className="text-sm text-sky-200 font-medium line-clamp-1 mt-1">
            {pkg?.destination || "Amazing Destination"}
          </p>
        </div>

        {/* Tag (days) */}
        {pkg?.days && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full bg-sky-500/80 text-white">
            {pkg.days} Days
          </span>
        )}
      </div>
    </Link>
  );
};

export default function FeaturedPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

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
          params: { status: "active", featured: true },
          withCredentials: true,
        });

        const serverPackages =
          Array.isArray(data?.packages)
            ? data.packages
            : Array.isArray(data?.data?.packages)
            ? data.data.packages
            : Array.isArray(data?.data)
            ? data.data
            : [];

        if (mounted) {
          // Ensure random 6
          const shuffled = [...serverPackages].sort(() => 0.5 - Math.random());
          setPackages(shuffled.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load featured packages");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPackages();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 
                animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 text-center">
        <p className="text-amber-500 font-semibold">{error}</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-wide">Featured Packages</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Handpicked trips you may like.</p>
          </div>

          <div className="flex items-center">
            <Link
              href="/packages"
              className="inline-flex items-center px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-sm"
            >
              View all packages
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg?._id || pkg?.id} pkg={pkg} />
          ))}
        </div>
        {/* CTA moved beside heading for better discoverability on all viewports */}
      </div>
    </section>
  );
}
