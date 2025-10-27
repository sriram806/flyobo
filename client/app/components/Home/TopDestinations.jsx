"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const DestinationCard = ({ image, title, location }) => {
  const altText = typeof title === "string" && title.trim()
    ? title
    : (typeof location === "string" && location.trim()
        ? `${location} - Featured destination`
        : "Featured destination");
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg group aspect-[3/2] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-200 dark:border-gray-800">
      <Image
        src={image}
        alt={altText}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-extrabold text-white drop-shadow-md line-clamp-1">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-200 line-clamp-1">{location}</p>
      </div>
    </div>
  );
};

const TopDestinations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchPackages = async () => {
      try {
        const API_URL =
          NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!API_URL) {
          setError("Backend URL not configured. Unable to load packages.");
          setLoading(false);
          return;
        }
        const base = API_URL.replace(/\/$/, "");
        const url = `${base}/package/get-packages`;
        const { data } = await axios.get(url, {
          params: { status: "active", page: 1, limit: 1000 },
          withCredentials: true,
        });
        if (cancelled) return;
        const serverItems = Array.isArray(data?.packages)
          ? data.packages
          : data?.data?.packages;
        if (serverItems?.length) setItems(serverItems);
      } catch (err) {
        setError("Unable to load packages. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPackages();
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredSix = useMemo(() => {
    const featured = items.filter(
      (p) => ((p?.status ?? p?.Status) === "active") && p?.featured === true
    );
    if (featured.length <= 6) return featured;
    const arr = featured.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 6);
  }, [items]);

  return (
    <section className="py-20 bg-black border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Popular Destinations
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
          Discover the most sought-after places around the world, handpicked by our travel experts.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(loading ? Array.from({ length: 6 }) : featuredSix).map((p, i) => (
            <div key={p?._id || p?.id || i}>
              <DestinationCard
                image={
                  p?.images?.url ||
                  p?.image ||
                  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop"
                }
                title={p?.title}
                location={p?.destination}
              />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <a
            href="/packages"
            className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
          >
            View All Destinations
          </a>
        </div>

        {error && (
          <div className="mt-6 text-sm text-amber-600 dark:text-amber-400 text-center">
            {error}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopDestinations;
