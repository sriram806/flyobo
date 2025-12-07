"use client";

import Link from "next/link";
import { MapPin, Star, Tag, Calendar, Users, TrendingUp, Award, Shield, Clock } from "lucide-react";

export default function PackageListItem({ pkg, loading }) {
  const imgSrc =
    pkg?.images?.url ||
    pkg?.image ||
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&auto=format&fit=crop";

  const currentPrice = Number(pkg?.price || 0);
  const originalPrice = Number(pkg?.estimatedPrice || 0);
  const hasDiscount = originalPrice > currentPrice && currentPrice > 0;
  const discountPct = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Get destination details
  const destinationDetails = pkg?.destinationDetails;
  const destinationDisplay = destinationDetails?.place 
    ? `${destinationDetails.place}${destinationDetails.state ? `, ${destinationDetails.state}` : ''}${destinationDetails.country ? `, ${destinationDetails.country}` : ''}`
    : pkg?.destination || '';

  // Format highlights
  const formatHighlights = (highlights) => {
    if (!highlights) return [];
    if (Array.isArray(highlights)) return highlights.slice(0, 2);
    if (typeof highlights === 'string') return highlights.split('•').slice(0, 2);
    return [];
  };

  const highlights = formatHighlights(pkg?.highlights);

  return (
    <article className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        <div className="w-full sm:w-48 h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
          ) : (
            <>
              <img
                src={imgSrc}
                alt={pkg?.title || "Package"}
                className="w-full h-full object-cover"
              />
              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {discountPct}% OFF
                </div>
              )}
              {/* Popular Badge */}
              {(pkg?.featured || pkg?.trending) && (
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold">
                  Popular
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Content */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <Link
                    href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
                    className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-2"
                  >
                    {pkg?.title}
                  </Link>
                  
                  {/* Location & Duration */}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span>{destinationDisplay}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{pkg?.duration || 0} Days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span>{pkg?.rating || 4.5}</span>
                    </div>
                  </div>
                  
                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <div className="mt-3">
                      <ul className="space-y-1">
                        {highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Tag className="w-4 h-4 text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{highlight.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Additional Info */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {pkg?.meals && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Meals Included</span>
                      </div>
                    )}
                    {pkg?.transport && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Transport Included</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Free Cancellation</span>
                    </div>
                  </div>
                </div>
                
                {/* Price & CTA */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    {hasDiscount && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        ₹{originalPrice.toLocaleString("en-IN")}
                      </div>
                    )}
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{currentPrice.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">per person</div>
                    {hasDiscount && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        Save ₹{(originalPrice - currentPrice).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                  
                  <Link
                      href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-500 dark:to-indigo-700 hover:from-sky-700 hover:to-indigo-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md dark:shadow-none transition-all duration-300 hover:scale-105"
                    >
                    View Details
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}