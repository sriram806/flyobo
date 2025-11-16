"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const Card = ({ pkg }) => {
  const image = pkg?.images?.url || pkg?.image || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop";

  return (
    <Link
      href={`/packages/${pkg?.slug || pkg?._id || pkg?.id}`}
      className="block group rounded-2xl overflow-hidden shadow-lg relative"
      aria-label={`View package ${pkg?.title}`}
    >
      <div className="relative h-64 md:h-72 lg:h-64 w-full bg-gray-200">
        <img src={image} alt={pkg?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg line-clamp-1">{pkg?.title}</h3>
          <p className="text-sm text-white/90 mt-1">{pkg?.destination}</p>
        </div>
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
          params: { status: "active", featured: true, limit: 8 },
          withCredentials: true,
        });

        const serverPackages = Array.isArray(data?.packages)
          ? data.packages
          : Array.isArray(data?.data?.packages)
          ? data.data.packages
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (mounted) setPackages(serverPackages.slice(0, 8));
      } catch (err) {
        console.error("Error fetching featured packages:", err);
        if (mounted) setError("Failed to load featured packages");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPackages();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center text-amber-500">{error}</div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg?._id || pkg?.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}