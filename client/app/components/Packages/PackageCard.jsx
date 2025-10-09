"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

export default function PackageCard({ pkg, loading }) {
  const imgSrc = pkg?.images?.url || pkg?.image ||
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
    <article
      className="group relative overflow-hidden rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
        ) : (
          <>
            <Link href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`} className="block h-full">
              <img src={imgSrc} alt={pkg?.title || "Package"} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" draggable={false} />
            </Link>
            {/* Wishlist Button */}
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={onToggleFav}
                disabled={favBusy}
                aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                title={isFav ? "Remove from favourites" : "Add to favourites"}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full shadow-sm transition-colors ${
                  isFav
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900"
                } ${favBusy ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {/* Heart Icon via react-icons */}
                {isFav ? (
                  <AiFillHeart className="w-5 h-5" />
                ) : (
                  <AiOutlineHeart className="w-5 h-5" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : (
          <>
            <Link
              href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
              className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:underline"
            >
              {pkg?.title}
            </Link>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">
              {pkg?.destination} • {pkg?.duration || 0} days
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                {hasDiscount && (
                  <div className="text-xs text-gray-500 line-through">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </div>
                )}
                <div className="text-rose-600 dark:text-rose-400 font-semibold">₹{currentPrice.toLocaleString("en-IN")}</div>
              </div>
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <div className="text-xs rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {discountPct}% OFF
                  </div>
                )}
                <div className="text-xs rounded-full px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  ★ {pkg?.rating || 4.5}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sky-600 dark:text-sky-400 font-semibold">Best Price</div>
              <Link
                href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
                className="inline-flex items-center rounded-lg bg-sky-600 text-white px-3 py-2 text-sm hover:bg-sky-700"
              >
                View Details →
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

