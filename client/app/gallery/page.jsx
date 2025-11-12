"use client";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { Camera, Images, MapPin, Search, Calendar, X, ChevronLeft, ChevronRight, Play, Pause, Loader2 } from "lucide-react";
import { HiOutlineEye, HiOutlineExclamationCircle } from "react-icons/hi";

const yearsFromItems = (items) => {
  const ys = new Set(
    items
      .map((x) => new Date(x.createdAt || x.date || 0).getFullYear())
      .filter((y) => y && !Number.isNaN(y))
  );
  return [null, ...Array.from(ys).sort((a, b) => b - a)];
};

// Gallery Hero Component
const GalleryHero = ({ stats }) => (
  <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
    </div>
    <div className="absolute top-10 left-10 w-20 h-20 bg-sky-400/10 rounded-full blur-2xl" />
    <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />
      <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-center">
      <div className="inline-flex items-center justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-2xl">
            <Camera className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>
      </div>
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-3">
        <span className="bg-gradient-to-r from-gray-900 via-sky-800 to-indigo-900 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
          Travel Gallery
        </span>
      </h1>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
        Explore breathtaking moments captured by our travel community. Share yours to inspire fellow travellers.
      </p>

      <div className="flex items-center justify-center gap-3 mb-6">
        <a href="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg text-sm">Share your photo</a>
        <a href="/gallery" className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm rounded-full">Browse all</a>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <div className="group px-6 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
              <Images className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Photos</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">{stats.photos}</p>
            </div>
          </div>
        </div>
        <div className="group px-6 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Destinations</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">50+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Gallery Filters Component
const GalleryFilters = ({ search, setSearch, year, setYear, years, category, setCategory, categories }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search photos by title..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-transparent transition-all"
        />
      </div>
      <div className="relative w-full lg:w-48">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <select
          value={year || ""}
          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
          className="appearance-none w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-all"
        >
          <option value="">All Years</option>
          {years.filter(Boolean).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90" />
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        onClick={() => setCategory(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          !category
            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30 scale-105'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        All Categories
      </button>
      {categories.filter(Boolean).map((c) => (
        <button
          key={c}
          onClick={() => setCategory(c)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            category === c
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30 scale-105'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  </div>
);

// Gallery Card Component
const GalleryCard = ({ item, index, onOpen }) => (
  <div className="group mb-4 break-inside-avoid-column">
    <button
      onClick={onOpen}
      className="relative block w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt={item.title || `Photo ${index + 1}`}
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-x-0 bottom-0 p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        {item.title && (
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
            {item.title}
          </h3>
        )}
        <div className="flex items-center gap-2 text-sm text-white/90">
          <Calendar className="h-4 w-4" />
          {new Date(item.createdAt || item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
        <div className="rounded-full bg-white/20 backdrop-blur-md p-2.5 border border-white/40 shadow-xl">
          <HiOutlineEye className="h-5 w-5 text-white" />
        </div>
      </div>
    </button>
  </div>
);

// Lightbox Component
const Lightbox = ({ items, index, onClose, onPrev, onNext, autoplay, setAutoplay, onGoTo }) => {
  const item = items[index];
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => onNext(), 3000);
    return () => clearInterval(t);
  }, [autoplay, onNext]);

  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-lg flex items-center justify-center p-4">
      <button aria-label="Close" className="absolute top-4 right-4 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:rotate-90 group" onClick={onClose}>
        <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
      <button aria-label="Previous" className="absolute left-4 md:left-8 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110" onClick={onPrev}>
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button aria-label="Next" className="absolute right-4 md:right-8 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110" onClick={onNext}>
        <ChevronRight className="w-7 h-7" />
      </button>
      <div className="max-w-7xl w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.title || "Gallery image"} className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
        {item.title && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
            <p className="text-sm text-white/70">{new Date(item.createdAt || item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setAutoplay((v) => !v)}
            className="px-5 py-3 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200 flex items-center gap-2 hover:scale-105"
          >
            {autoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {autoplay ? 'Pause' : 'Autoplay'}
          </button>
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white/90">
            {index + 1} / {items.length}
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((it, i) => (
            <button
              key={(it._id || it.image || i) + i}
              onClick={() => onGoTo(i)}
              className={`h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === index
                  ? 'border-white scale-110 shadow-xl'
                  : 'border-white/30 hover:border-white/60 hover:scale-105'
              }`}
            >
              <img src={it.image} alt={it.title || 'thumb'} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function GalleryPage() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [category, setCategory] = useState(null);
  const [autoplay, setAutoplay] = useState(false);
  const [open, setOpen] = useState(false);
  const mainRef = useRef(null);
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itemsRaw, setItemsRaw] = useState([]);

  const years = useMemo(() => yearsFromItems(itemsRaw), [itemsRaw]);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return itemsRaw.filter((x) => {
      const byYear = !year || new Date(x.createdAt || x.date).getFullYear() === year;
      const byCat = !category || String(x.category).toLowerCase() === String(category).toLowerCase();
      const byQuery = !q || (x.title || "").toLowerCase().includes(q);
      return byYear && byCat && byQuery;
    });
  }, [itemsRaw, search, year, category]);

  const categories = useMemo(() => {
    const set = new Set(itemsRaw.map((x) => x.category).filter(Boolean));
    return [null, ...Array.from(set)];
  }, [itemsRaw]);

  const stats = useMemo(() => {
    return { photos: items.length };
  }, [items.length]);

  const openAt = useCallback((i) => setLightboxIndex(i), []);
  const close = useCallback(() => setLightboxIndex(-1), []);
  const prev = useCallback(() => setLightboxIndex((i) => (i <= 0 ? items.length - 1 : i - 1)), [items.length]);
  const next = useCallback(() => setLightboxIndex((i) => (i >= items.length - 1 ? 0 : i + 1)), [items.length]);

  // Reset lightbox when filters change
  useEffect(() => {
    setLightboxIndex(-1);
  }, [search, year, category]);

  // Scroll to the gallery main section after 2s using GSAP if available (fallback to native smooth scroll)
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      if (!mounted) return;
      try {
        const gsapModule = await import('gsap');
        const gsap = gsapModule.gsap || gsapModule.default || gsapModule;
        // Try to load ScrollToPlugin if available
        try {
          const plugin = await import('gsap/ScrollToPlugin');
          const ScrollToPlugin = plugin.default || plugin;
          if (ScrollToPlugin && gsap && gsap.registerPlugin) gsap.registerPlugin(ScrollToPlugin);
        } catch (e) {
          // plugin not available, we'll use basic gsap.to with window if possible
        }

        const targetY = (mainRef.current && mainRef.current.offsetTop) || 0;
        if (gsap && gsap.to && gsap.plugins && gsap.plugins.ScrollTo) {
          gsap.to(window, { duration: 1, scrollTo: { y: targetY - 20 } });
        } else if (gsap && gsap.to) {
          // fallback: animate window.scrollTop via gsap tweening
          gsap.to(window, { duration: 1, scrollTo: targetY - 20 });
        } else {
          // final fallback: native smooth scroll
          window.scrollTo({ top: Math.max(0, targetY - 20), behavior: 'smooth' });
        }
      } catch (err) {
        // GSAP not installed or failed to load – fallback to native smooth scroll
        const targetY = (mainRef.current && mainRef.current.offsetTop) || 0;
        window.scrollTo({ top: Math.max(0, targetY - 20), behavior: 'smooth' });
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Fetch from backend
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!API_URL) return;
      try {
        setLoading(true);
        setError("");
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        const { data } = await axios.get(`${API_URL}/gallery`, { params });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setItemsRaw(list);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || err?.message || "Failed to load gallery");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [API_URL, search, category]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8 sm:py-12 space-y-8">
          {/* Hero */}
          <GalleryHero stats={stats} />

          {/* Filters */}
          <GalleryFilters
            search={search}
            setSearch={setSearch}
            year={year}
            setYear={setYear}
            years={years}
            category={category}
            setCategory={setCategory}
            categories={categories}
          />

          {/* Masonry Gallery */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full blur-xl opacity-50 animate-pulse" />
                  <Loader2 className="relative w-12 h-12 text-sky-600 dark:text-sky-400 animate-spin" />
                </div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">Loading amazing photos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <HiOutlineExclamationCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Images className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Photos Found</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
              {items.map((it, idx) => (
                <GalleryCard
                  key={(it._id || it.image || idx) + idx}
                  item={it}
                  index={idx}
                  onOpen={() => openAt(idx)}
                />
              ))}
            </div>
          )}
          {/* Lightbox */}
          {lightboxIndex >= 0 && (
            <Lightbox items={items} index={lightboxIndex} onClose={close} onPrev={prev} onNext={next} autoplay={autoplay} setAutoplay={setAutoplay} onGoTo={setLightboxIndex} />
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}