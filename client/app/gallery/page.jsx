"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const BASE_ITEMS = [
  { src: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&auto=format&fit=crop", title: "Beach Escape", location: "Goa, India", date: "2024-02-14", category: "Group" },
  { src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&auto=format&fit=crop", title: "Mountain Trek", location: "Himalayas, India", date: "2023-11-05", category: "Adventure" },
  { src: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&auto=format&fit=crop", title: "City Lights", location: "Dubai, UAE", date: "2024-08-21", category: "City" },
  { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&auto=format&fit=crop", title: "Safari Day", location: "Masai Mara, Kenya", date: "2023-07-09", category: "Wildlife" },
  { src: "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&auto=format&fit=crop", title: "Temple Trail", location: "Siem Reap, Cambodia", date: "2022-10-12", category: "Culture" },
  { src: "https://images.unsplash.com/photo-1531178625044-cc2a0fb353a9?q=80&auto=format&fit=crop", title: "Island Hopping", location: "Phuket, Thailand", date: "2024-05-30", category: "Beach" },
  { src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&auto=format&fit=crop", title: "Desert Ride", location: "Jaisalmer, India", date: "2023-12-18", category: "Adventure" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&auto=format&fit=crop", title: "Lakeside Calm", location: "Udaipur, India", date: "2022-03-22", category: "Heritage" },
  { src: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&auto=format&fit=crop", title: "Forest Trail", location: "Coorg, India", date: "2024-01-04", category: "Nature" },
  { src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&auto=format&fit=crop", title: "Cliff View", location: "Bali, Indonesia", date: "2023-04-15", category: "Beach" },
];

const yearsFromItems = (items) => {
  const ys = new Set(items.map((x) => new Date(x.date).getFullYear()).filter(Boolean));
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
        <Image src={item.src} alt={item.title || "Gallery image"} width={1200} height={800} className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
        {(item.title || item.location) && (
          <div className="mt-3 text-center text-white/90">
            <div className="text-base font-semibold">{item.title}</div>
            <div className="text-sm">{item.location} • {new Date(item.date).toLocaleDateString()}</div>
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
            <button key={it.src + i} onClick={() => onGoTo(i)} className={`h-14 w-20 flex-shrink-0 rounded-md overflow-hidden border ${i === index ? 'border-white' : 'border-white/30'}`}>
              <img src={`${it.src}&w=200&h=150&fit=crop`} alt={it.title || 'thumb'} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [category, setCategory] = useState(null);
  const [autoplay, setAutoplay] = useState(false);
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  const years = useMemo(() => yearsFromItems(BASE_ITEMS), []);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BASE_ITEMS.filter((x) => {
      const byYear = !year || new Date(x.date).getFullYear() === year;
      const byCat = !category || String(x.category).toLowerCase() === String(category).toLowerCase();
      const byQuery = !q || x.title.toLowerCase().includes(q) || x.location.toLowerCase().includes(q);
      return byYear && byCat && byQuery;
    });
  }, [search, year, category]);

  const categories = useMemo(() => {
    const set = new Set(BASE_ITEMS.map((x) => x.category).filter(Boolean));
    return [null, ...Array.from(set)];
  }, []);

  const stats = useMemo(() => {
    const locs = new Set(BASE_ITEMS.map((x) => x.location.split(',')[0].trim()));
    return { photos: BASE_ITEMS.length, places: locs.size };
  }, []);

  const openAt = useCallback((i) => setLightboxIndex(i), []);
  const close = useCallback(() => setLightboxIndex(-1), []);
  const prev = useCallback(() => setLightboxIndex((i) => (i <= 0 ? items.length - 1 : i - 1)), [items.length]);
  const next = useCallback(() => setLightboxIndex((i) => (i >= items.length - 1 ? 0 : i + 1)), [items.length]);

  // Reset lightbox when filters change
  useEffect(() => {
    setLightboxIndex(-1);
  }, [search, year, category]);

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
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Take a look at the wonderful moments our customers have shared from their amazing journeys with us.</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">Photos: <strong className="ml-1 text-gray-900 dark:text-white">{stats.photos}</strong></span>
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">Places: <strong className="ml-1 text-gray-900 dark:text-white">{stats.places}</strong></span>
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

          {/* Masonry */}
          {items.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No images match your filters.</p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
              {items.map((it, idx) => (
                <div key={it.src + idx} className="mb-4 break-inside-avoid-column">
                  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
                    <button onClick={() => openAt(idx)} className="block w-full text-left">
                      <Image src={it.src} alt={it.title || `Photo ${idx + 1}`} width={800} height={600} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <div className="text-xs text-white/80">{it.location} • {new Date(it.date).toLocaleDateString()}</div>
                    </div>
                  </div>
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
