"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaShareAlt } from "react-icons/fa";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";
import Header from "@/Components/Layout/Header";
import Hero from "@/Components/Packages/Slug/Hero";
import Tabs from "@/Components/Packages/Slug/Tabs";
import Sidebar from "@/Components/Packages/Slug/Sidebar";
import ShareModal from "@/Components/Packages/Slug/ShareModal";
import Footer from "@/Components/Layout/Footer";
import Heading from "@/Components/MetaData/Heading";

export default function PackageDetailPage({ params }) {
  const [resolvedParams, setResolvedParams] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(params)
      .then((p) => !cancelled && setResolvedParams(p || null))
      .catch(() => !cancelled && setResolvedParams(null));
    return () => (cancelled = true);
  }, [params]);

  const slug = resolvedParams?.slug || null;
  useEffect(() => {
    if (typeof window === "undefined") return;
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }), 0);
  }, [slug]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pkg, setPkg] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showShare, setShowShare] = useState(false);
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const base = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
        if (!base) throw new Error("API not configured");

        const { data } = await axios.get(`${base}/package/${slug}`, { withCredentials: true });
        if (!cancelled) {
          const p =
            data?.foundPackage ||
            data?.package ||
            data?.data?.package ||
            data?.data ||
            data ||
            null;
          setPkg(p);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Unable to load package");
      } finally {
        !cancelled && setLoading(false);
      }
    };
    if (slug) load();
    return () => (cancelled = true);
  }, [slug]);

  const title = pkg?.title || "Package";
  const destination = pkg?.destination || pkg?.location || "";
  const category = pkg?.category || pkg?.type || "";
  const duration = pkg?.duration ?? pkg?.days ?? 0;

  const image = pkg?.images || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop";

  const siteBase = (process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "https://flyobo.com")).replace(/\/$/, "");

  const url = `${siteBase}/packages/${slug}`;

  const price = Number(pkg?.price || 0);
  const mrp = Number(pkg?.estimatedPrice || 0);
  const hasDiscount = mrp > price;
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  /** Hashtags Builder */
  const hashTags = [
    "#Flyobo", "#TravelIndia", "TravelWorld",
    destination && `#${destination.replace(/\s+/g, "")}`,
    category && `#${category.replace(/\s+/g, "")}`,
  ].filter(Boolean).join(" ");

  /** Enhanced Share Handler (Option B Template) */
  const handleShare = async (platform) => {
    const shareText = `🌍 *${title}*${destination ? `📍 Destination: ${destination}\n` : ""}${duration ? `⏳ Duration: ${duration} Days\n` : ""}${price ? `💰 Price: ₹${price.toLocaleString()}\n` : ""}🔥 Check this package before it's gone!${hashTags}`;

    const encodedText = encodeURIComponent(`${shareText}\n${url}`);

    const mappings = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === "native") {
      if (navigator?.share) {
        return await navigator.share({
          title,
          text: shareText,
          url,
        });
      }
      return setShowShare(true);
    }

    if (platform === "copy") {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      return alert("🔗 Package details copied!");
    }

    if (mappings[platform]) return window.open(mappings[platform], "_blank");
  };

  return (
    <>
      <Heading title={`${title} - Flyobo`} description={pkg?.subtitle || destination || "Travel package"} />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          {loading && (
            <div className="animate-pulse space-y-6">
              <div className="h-[360px] rounded-2xl bg-gray-200 dark:bg-gray-800" />
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-[200px] bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-gray-300 dark:border-gray-700 p-6 text-center text-rose-500 dark:text-rose-400">
              {error}
            </div>
          )}

          {!loading && !error && !pkg && (
            <div className="rounded-xl border border-gray-300 dark:border-gray-700 p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Package not available</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">It may have been removed or the link is incorrect.</p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/packages" className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm">
                  Browse Packages
                </Link>
                <button onClick={() => handleShare("native")} className="px-4 py-2 rounded-lg text-sm border">
                  <FaShareAlt className="inline mr-2" /> Share
                </button>
              </div>
            </div>
          )}

          {!loading && pkg && (
            <div className="space-y-10">

              <Hero
                title={title}
                image={image}
                destination={destination}
                duration={duration}
                pkg={pkg}
                onShare={handleShare}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Tabs activeTab={activeTab} setActiveTab={setActiveTab} pkg={pkg} title={title} url={url} />
                </div>

                <Sidebar
                  price={price}
                  mrp={mrp}
                  hasDiscount={hasDiscount}
                  discountPct={discountPct}
                  title={title}
                  slug={slug}
                  url={url}
                  onShare={handleShare}
                />
              </div>

              {showShare && <ShareModal onClose={() => setShowShare(false)} onShare={handleShare} />}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
