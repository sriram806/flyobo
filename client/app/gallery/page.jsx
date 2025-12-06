"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";
import Header from "@/Components/Layout/Header";
import GalleryHero from "@/Components/Gallery/GalleryHero";
import GalleryFilters from "@/Components/Gallery/GalleryFilters";
import GalleryCard from "@/Components/Gallery/GalleryCard";
import Footer from "@/Components/Layout/Footer";

const yearsFromItems = (items) => {
  const ys = new Set(
    items
      .map((x) => new Date(x.createdAt || x.date || 0).getFullYear())
      .filter((y) => y && !Number.isNaN(y))
  );
  return [null, ...Array.from(ys).sort((a, b) => b - a)];
};

export default function GalleryPage() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(null);
  const [category, setCategory] = useState(null);
  const [itemsRaw, setItemsRaw] = useState([]);
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!API_URL) return;
      try {
        const { data } = await axios.get(`${API_URL}/gallery`, { withCredentials: true, timeout: 15000 });
        if (!cancelled && Array.isArray(data)) setItemsRaw(data);
      } catch (e) {
        // silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [API_URL]);

  const years = useMemo(() => yearsFromItems(itemsRaw), [itemsRaw]);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return itemsRaw.filter((x) => {
      const matchYear = !year || new Date(x.createdAt || x.date || 0).getFullYear() === year;
      const matchCat = !category || (x.category || "").toLowerCase() === category?.toLowerCase();
      const matchSearch = !q || (x.title || "").toLowerCase().includes(q);
      return matchYear && matchCat && matchSearch;
    });
  }, [itemsRaw, search, year, category]);

  const categories = useMemo(() => {
    const set = new Set(itemsRaw.map((x) => x.category).filter(Boolean));
    return [null, ...Array.from(set)];
  }, [itemsRaw]);

  const stats = useMemo(() => ({ photos: items.length }), [items.length]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
        <section className="max-w-7xl mx-auto px-4 py-10 space-y-10">
          <GalleryHero stats={stats} />

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

          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
            {items.map((it, idx) => (
              <GalleryCard key={it._id || it.image || idx} item={it} index={idx} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
