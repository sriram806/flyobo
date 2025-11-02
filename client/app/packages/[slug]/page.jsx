"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Heading from "../../components/MetaData/Heading";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaCopy,
  FaShareAlt,
} from "react-icons/fa";
import { MapPin, Calendar, Users, Star, Share2, ArrowLeft, Image as ImageIcon, Clock } from "lucide-react";
import Header from "@/app/components/Layout/Header";
import Footer from "@/app/components/Layout/Footer";

export default function PackageDetailPage({ params }) {
  // Unwrap params using React.use() when available (Next.js migration path)
  const unwrapped = React.use ? (React.use(params) || {}) : (params || {});
  const { slug } = unwrapped;
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pkg, setPkg] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      try {
        const API_URL =
          NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!API_URL) {
          setError("API not configured");
          setLoading(false);
          return;
        }
        const base = API_URL.replace(/\/$/, "");
        const url = `${base}/package/${slug}`;
        const { data } = await axios.get(url, { withCredentials: true });
        if (cancelled) return;
        const p =
          data?.foundPackage ||
          data?.package ||
          data?.data?.package ||
          data?.data ||
          data ||
          null;
        setPkg(p);
      } catch (err) {
        console.error("Failed to load package", err);
        if (!cancelled) setError("Unable to load package");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (slug) fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const title = pkg?.title || "Package";
  const image =
    pkg?.images ||
    pkg?.image ||
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop";
  const destination = pkg?.destination || pkg?.location || "";
  const duration = pkg?.duration ?? pkg?.days ?? 0;
  const url =
    typeof window !== "undefined"
      ? window.location.href
      : `https://flyobo.com/packages/${slug}`;
  const price = Number(pkg?.price || 0);
  const mrp = Number(pkg?.estimatedPrice || 0);
  const hasDiscount = mrp > price && mrp > 0;
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleShare = async (platform) => {
    const shareUrl = encodeURIComponent(url);
    const shareText = encodeURIComponent(`Check out this package: ${title}`);

    switch (platform) {
      case "native":
        if (navigator?.share) {
          await navigator.share({ title, text: shareText, url });
        } else {
          setShowShare(true);
        }
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`);
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard ✅");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Heading
        title={`${title} - Flyobo`}
        description={pkg?.subtitle || destination || "Travel package"}
        keywords={`${title}, ${destination}, Travel, Tour, Package`}
      />

      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-64 w-full rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-rose-600 dark:text-rose-400">
            {error}
          </div>
        ) : !pkg ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Package not available
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              It might have been removed or the link is incorrect.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                href="/packages"
                className="inline-flex items-center rounded-lg bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700"
              >
                Browse Packages
              </Link>
              <button
                onClick={() => handleShare("native")}
                className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <FaShareAlt className="mr-2" /> Share
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={title}
                className="w-full h-[320px] sm:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Top Actions */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-white/40 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
                <button
                  onClick={() => handleShare("native")}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-white/40 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
              
              {/* Bottom Content */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {destination && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white">
                      <MapPin className="w-4 h-4" />
                      {destination}
                    </div>
                  )}
                  {duration ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white">
                      <Calendar className="w-4 h-4" />
                      {duration} Days
                    </div>
                  ) : null}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white">
                    <Star className="w-4 h-4 fill-current text-amber-400" />
                    {pkg?.rating || '4.5'}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white">
                    <Users className="w-4 h-4" />
                    {(pkg?.reviews?.length || 0)} reviews
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg">
                  {title}
                </h1>
                {pkg?.subtitle && (
                  <p className="mt-2 text-base sm:text-lg text-white/90 line-clamp-2">
                    {pkg.subtitle}
                  </p>
                )}
              </div>
            </section>

            {/* Tabs + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left content with tabs */}
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md">
                  <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
                    {["Overview", "Gallery", "Inclusions", "Itinerary", "Policies"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                          activeTab === tab
                            ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 sm:p-5">
                    {activeTab === "Overview" && (
                      <div className="space-y-5">
                        {/* About card */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                          <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">About This Package</div>
                          {(() => {
                            const text = (pkg?.description || "").replace(/\s+/g, " ").trim();
                            return (
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{text || "Details coming soon."}</p>
                            );
                          })()}
                        </div>

                        {/* CTA card */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="text-base font-semibold text-gray-900 dark:text-white">Ready to Experience This Journey?</div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Contact our travel experts to customize this package and get the best deals.</p>
                          </div>
                          <a href={`https://wa.me/919291237999?text=${encodeURIComponent('Hi, I am interested in ' + title + ' package.')}`} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm">Contact Expert</a>
                        </div>

                        {pkg?.tags && (
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tags</div>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {pkg.tags
                                .toString()
                                .split(",")
                                .map((t, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300"
                                  >
                                    {t.trim()}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "Gallery" && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(() => {
                          const imgs = [];
                          const add = (src) => src && imgs.push(src);
                          // Common shapes
                          add(pkg?.image);
                          add(pkg?.images?.url);
                          if (Array.isArray(pkg?.images)) pkg.images.forEach((it)=> add(it?.url || it));
                          if (Array.isArray(pkg?.gallery)) pkg.gallery.forEach((it)=> add(it?.url || it));
                          const list = imgs.filter(Boolean);
                          return list.length ? list.map((src, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={src} alt={`${title} ${i+1}`} className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-800" />
                          )) : <div className="text-sm text-gray-600 dark:text-gray-300">No images available.</div>;
                        })()}
                      </div>
                    )}
                    {activeTab === "Inclusions" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Included</div>
                          <ul className="mt-2 list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {(pkg?.included || []).map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Excluded</div>
                          <ul className="mt-2 list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {(pkg?.excluded || []).map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {activeTab === "Itinerary" && (
                      <div className="space-y-3">
                        {(pkg?.itinerary || [])
                          .slice()
                          .sort((a, b) => (a.day || 0) - (b.day || 0))
                          .map((it, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                              <div className="font-medium">Day {it.day}: {it.description}</div>
                              {Array.isArray(it.activities) && it.activities.length > 0 && (
                                <div className="mt-1 text-sm">Activities: {it.activities.join(", ")}</div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                    {activeTab === "Policies" && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Policies & Terms</div>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Full payment is required to confirm the booking unless otherwise stated.</li>
                          <li>Prices are subject to change based on availability and seasonal variations.</li>
                          <li>Government taxes, fees, and surcharges may apply as per regulations.</li>
                          <li>Cancellations within 7 days of departure may be non-refundable.</li>
                          <li>Date changes are subject to partner approval and fare differences.</li>
                          <li>Guests must carry valid ID proofs for all travelers at check-in.</li>
                          <li>Activities are weather-dependent; alternatives may be provided.</li>
                          <li>We are not liable for delays due to traffic, weather, or force majeure.</li>
                          <li>Personal expenses and items not listed under “Included” are excluded.</li>
                          <li>By booking, you agree to our standard Terms & Conditions.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <aside className="w-full lg:w-auto">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Flyobo Price</div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">₹{price.toLocaleString('en-IN')}</div>
                    {hasDiscount && (
                      <>
                        <div className="text-sm text-gray-500 line-through">₹{mrp.toLocaleString('en-IN')}</div>
                        <div className="text-sm text-emerald-600">{discountPct}% OFF</div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Final Price <span className="font-medium text-gray-700 dark:text-gray-300">per person</span></div>

                  <div className="mt-4 space-y-2">
                    <a href={`https://wa.me/919291237999?text=${encodeURIComponent('I want to book ' + title + ' package. Link: ' + url)}`} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700">📞 Book on WhatsApp</a>
                    <Link href={`/packages/checkout?slug=${encodeURIComponent(slug || '')}`} className="block text-center rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Proceed to Checkout</Link>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">✓ Best Price Guarantee</div>
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">✓ Instant Confirmation</div>
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">✓ 24/7 Customer Support</div>
                  </div>
                </div>
              </aside>
            </div>

            {/* 🔗 Social Share Modal */}
            {showShare && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg w-80">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Share this package
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="flex flex-col items-center"
                    >
                      <FaWhatsapp className="text-green-500 text-2xl" />
                      <span className="text-xs">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="flex flex-col items-center"
                    >
                      <FaFacebook className="text-blue-600 text-2xl" />
                      <span className="text-xs">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="flex flex-col items-center"
                    >
                      <FaTwitter className="text-sky-500 text-2xl" />
                      <span className="text-xs">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="flex flex-col items-center"
                    >
                      <FaLinkedin className="text-blue-700 text-2xl" />
                      <span className="text-xs">LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="flex flex-col items-center"
                    >
                      <FaCopy className="text-gray-600 text-2xl" />
                      <span className="text-xs">Copy</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowShare(false)}
                    className="mt-4 w-full py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
