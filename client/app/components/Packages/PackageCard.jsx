"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { Heart, MapPin, Calendar, Users, Star, TrendingUp, Sparkles, Clock } from "lucide-react";
import { HiOutlineChevronRight } from "react-icons/hi";

export default function PackageCard({ pkg, loading }) {
  const imgSrc = pkg?.images || pkg?.image ||
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop";
  const currentPrice = Number(pkg?.price || 0);
  const originalPrice = Number(pkg?.estimatedPrice || 0);
  const hasDiscount = originalPrice > currentPrice && currentPrice > 0;
  const discountPct = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Favourites integration (using user routes)
  const [isFav, setIsFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const packageId = pkg?._id || pkg?.id || pkg?.slug;
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const getAuthConfig = () => {
    if (typeof window === "undefined") return { withCredentials: true };
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    const cfg = { withCredentials: true };
    if (token) cfg.headers = { Authorization: `Bearer ${token}` };
    return cfg;
  };

  const fetchIsFavourite = async () => {
    if (!API_URL || !packageId) return false;
    try {
      const { data } = await axios.get(`${API_URL}/user/profile`, getAuthConfig());
      const user = data?.user;
      const favA = user?.favoritePackages || user?.favouritePackages || [];
      return favA.some((id) => String(id) === String(packageId));
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let active = true;
    async function initFav() {
      if (!packageId) return;
      const inFav = await fetchIsFavourite();
      if (active) setIsFav(Boolean(inFav));
    }
    initFav();
    return () => {
      active = false;
    };
  }, [packageId]);

  const onToggleFav = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!packageId || favBusy) return;
    setFavBusy(true);
    // optimistic update
    setIsFav((v) => !v);
    let ok = false;
    try {
      if (!API_URL) throw new Error("Missing API URL");
      if (isFav) {
        await axios.delete(`${API_URL}/user/favourite-packages/${packageId}`, {
          ...getAuthConfig(),
          data: { packageId }
        });
        ok = true;
      } else {
        await axios.put(
          `${API_URL}/user/favourite-packages`,
          { packageId },
          getAuthConfig()
        );
        ok = true;
      }
    } catch (err) {
      ok = false;
    }
    if (!ok) setIsFav((v) => !v);
    setFavBusy(false);
  };
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-2xl transition-all duration-500">
      {/* Image Section */}
      <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
        ) : (
          <>
            <Link href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`} className="block h-full">
              <img 
                src={imgSrc} 
                alt={pkg?.title || "Package"} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                draggable={false} 
              />
            </Link>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {hasDiscount && (
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {discountPct}% OFF
                </div>
              )}
              {(pkg?.featured || pkg?.trending) && (
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Popular
                </div>
              )}
            </div>
            
            {/* Wishlist Button */}
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={onToggleFav}
                disabled={favBusy}
                aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                title={isFav ? "Remove from favourites" : "Add to favourites"}
                className={`inline-flex items-center justify-center w-11 h-11 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  isFav
                    ? "bg-rose-500 text-white hover:bg-rose-600 scale-110"
                    : "bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900 hover:scale-110"
                } ${favBusy ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-amber-400" />
                  <span>{pkg?.rating || 4.5}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{pkg?.capacity || '2-6'} People</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : (
          <>
            {/* Title */}
            <Link
              href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
              className="block text-xl font-bold text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-2 mb-3"
            >
              {pkg?.title}
            </Link>
            
            {/* Location & Duration */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="font-medium">{pkg?.destination}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">{pkg?.duration || 0} Days</span>
              </div>
              {pkg?.meals && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium">Meals Included</span>
                </div>
              )}
            </div>
            
            {/* Features/Highlights */}
            {pkg?.highlights && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {Array.isArray(pkg.highlights) ? pkg.highlights.join(' • ') : pkg.highlights}
                </p>
              </div>
            )}
            
            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-800 my-4" />
            
            {/* Price & CTA */}
            <div className="flex items-end justify-between">
              <div>
                {hasDiscount && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-through mb-1">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{currentPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">per person</span>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  Best Price Guaranteed
                </div>
              </div>
              
              <Link
                href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-sky-500/30 transition-all duration-300 hover:scale-105"
              >
                View Details
                <HiOutlineChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

