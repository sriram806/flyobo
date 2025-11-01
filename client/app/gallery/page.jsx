"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const yearsFromItems = (items) => {
  const ys = new Set(
    items
      .map((x) => new Date(x.createdAt || x.date || 0).getFullYear())
      .filter((y) => y && !Number.isNaN(y))
  );
  return [null, ...Array.from(ys).sort((a, b) => b - a)];
};

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

  // autoplay
  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => onNext(), 2500);
    return () => clearInterval(t);
  }, [autoplay, onNext]);

  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <button aria-label="Close" className="absolute top-4 right-4 text-white/90 hover:text-white text-2xl" onClick={onClose}>×</button>
      <button aria-label="Previous" className="absolute left-4 md:left-8 text-white/90 hover:text-white text-2xl" onClick={onPrev}>‹</button>
      <button aria-label="Next" className="absolute right-4 md:right-8 text-white/90 hover:text-white text-2xl" onClick={onNext}>›</button>
      <div className="max-w-6xl w-full">
        {/* use img to avoid next/image domain config issues */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.title || "Gallery image"} className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
        {(item.title) && (
          <div className="mt-3 text-center text-white/90">
            <div className="text-base font-semibold">{item.title}</div>
            <div className="text-sm">{new Date(item.createdAt || item.date).toLocaleDateString()}</div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-center gap-4">
          <button onClick={() => setAutoplay((v) => !v)} className="px-3 py-1.5 rounded-lg text-sm bg-white/10 hover:bg-white/20 text-white">
            {autoplay ? 'Pause' : 'Autoplay'}
          </button>
        </div>
        {/* Thumbnails */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          {items.map((it, i) => (
            <button key={(it._id || it.image || i) + i} onClick={() => onGoTo(i)} className={`h-14 w-20 flex-shrink-0 rounded-md overflow-hidden border ${i === index ? 'border-white' : 'border-white/30'}`}>
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

        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-6 sm:py-10 space-y-6">
          {/* Hero */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <svg className="h-8 w-8 text-sky-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4.172a2 2 0 0 1 1.414.586l1.828 1.828H19a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z" /></svg>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Customer Memories</h1>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Latest photos shared by our community.</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">Photos: <strong className="ml-1 text-gray-900 dark:text-white">{stats.photos}</strong></span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or location..."
              className="w-full sm:w-80 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60"
            />
            <div className="relative w-full sm:w-48">
              <select
                value={year || ""}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
                className="appearance-none w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              >
                <option value="">All</option>
                {years.filter(Boolean).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
            </div>
            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategory(null)} className={`px-3 py-1.5 rounded-full text-xs border ${!category ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                All
              </button>
              {categories.filter(Boolean).map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs border ${category === c ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Masonry Gallery */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 dark:border-gray-700 border-t-sky-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading gallery...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">No images match your filters.</p>
            </div>
          ) : (
            <div className="columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
              {items.map((it, idx) => (
                <div key={(it._id || it.image || idx) + idx} className="mb-4 break-inside-avoid-column">
                  <button
                    onClick={() => openAt(idx)}
                    className="group relative block w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image}
                      alt={it.title || `Photo ${idx + 1}`}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">


                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-xs text-white/90">
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(it.createdAt || it.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {it.title && (
                            <h3 className="text-base font-semibold text-white mb-1.5 line-clamp-2 drop-shadow-lg">
                              {it.title}
                            </h3>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* View Icon - Appears on Hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="rounded-full bg-white/20 backdrop-blur-md p-2 border border-white/30">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
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