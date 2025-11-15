"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Share2,
  ArrowLeft,
} from "lucide-react";
import Badge from "./ui/Badge";

export default function Hero({
  title,
  image,
  destination,
  duration,
  pkg,
  onShare,
}) {
  const rating = pkg?.rating ?? "4.5";
  const reviewCount = pkg?.reviews?.length ?? 0;

  return (
    <section
      className="
      relative overflow-hidden rounded-md border
      border-gray-200 dark:border-gray-800 shadow-2xl
      bg-white dark:bg-gray-900
    "
    >
      <img
        src={image}
        alt={title}
        className="w-full h-[340px] sm:h-[460px] object-cover"
      />

      {/* Overlay */}
      <div
        className="
        absolute inset-0 
        bg-gradient-to-t
        from-black/85 via-black/40 to-transparent
        dark:from-black/90 dark:via-black/50
      "
      />

      {/* Top Actions */}
      <div
        className="
        absolute top-4 left-4 right-4
        flex items-center justify-between
      "
      >
        <Link
          href="/packages"
          className="
          inline-flex items-center gap-2 rounded-full
          bg-white/90 dark:bg-gray-900/80
          backdrop-blur-md border border-white/40 dark:border-gray-700
          px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100
          hover:bg-white dark:hover:bg-gray-900 shadow-lg transition-all
          duration-200 hover:scale-105
        "
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <button
          onClick={() => onShare("native")}
          className="
          inline-flex items-center gap-2 rounded-full
          bg-white/90 dark:bg-gray-900/80
          backdrop-blur-md border border-white/40 dark:border-gray-700
          px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100
          hover:bg-white dark:hover:bg-gray-900 shadow-lg transition-all
          duration-200 hover:scale-105
        "
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Content */}
      <div className="absolute bottom-6 left-6 right-6 space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {destination && (
            <Badge className="bg-white/20 border-white/30 text-white dark:border-gray-300/40">
              <MapPin className="w-4 h-4 mr-1 " />
              {destination}
            </Badge>
          )}
          {duration && (
            <Badge className="bg-white/20 border-white/30 text-white">
              <Calendar className="w-4 h-4 mr-1" />
              {duration} Days
            </Badge>
          )}
          <Badge className="bg-white/20 border-white/30 text-white">
            <Star className="w-4 h-4 mr-1 fill-current text-amber-400" />
            {rating}
          </Badge>
          <Badge className="bg-white/20 border-white/30 text-white">
            <Users className="w-4 h-4 mr-1" />
            {reviewCount} reviews
          </Badge>
        </div>

        {/* Title + Subtitle/Share Button */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1
              className="
              text-3xl sm:text-4xl lg:text-5xl font-extrabold
              text-white drop-shadow-xl leading-tight
            "
            >
              {title}
            </h1>
            {pkg?.subtitle && (
              <p className="mt-2 text-sm sm:text-lg text-white/90 line-clamp-2">
                {pkg.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
