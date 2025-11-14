"use client";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import GalleryFilters from "../components/Gallery/GalleryFilters";
import GalleryHero from "../components/Gallery/GalleryHero";
import GalleryCard from "../components/Gallery/GalleryCard"

const yearsFromItems = (items) => {
  const ys = new Set(
    items
      .map((x) => new Date(x.createdAt || x.date || 0).getFullYear())
      .filter((y) => y && !Number.isNaN(y))
  );
  return [null, ...Array.from(ys).sort((a, b) => b - a)];
};



export default function GalleryPage() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(null);
  const [category, setCategory] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [itemsRaw, setItemsRaw] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  const years = useMemo(() => yearsFromItems(itemsRaw), [itemsRaw]);

  const items = useMemo(() => {
    const q = search.toLowerCase();
    return itemsRaw.filter((x) => {
      const matchYear = !year || new Date(x.createdAt).getFullYear() === year;
      const matchCat = !category || x.category?.toLowerCase() === category.toLowerCase();
      const matchSearch = !q || x.title?.toLowerCase().includes(q);
      return matchYear && matchCat && matchSearch;
    });
  }, [itemsRaw, search, year, category]);

  const categories = useMemo(() => {
    const set = new Set(itemsRaw.map((x) => x.category).filter(Boolean));
    return [null, ...set];
  }, [itemsRaw]);

  const stats = useMemo(() => ({ photos: items.length }), [items.length]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/gallery`);
        setItemsRaw(data);
      } catch {
        console.log("Failed loading gallery");
      }
    };
    load();
  }, [API_URL]);

  useEffect(() => {
    const stored = localStorage.getItem("flyobo_saved_pins");
    if (stored) setSavedIds(JSON.parse(stored));
  }, []);

  const toggleSave = (item) => {
    const id = item._id || item.image;
    setSavedIds((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("flyobo_saved_pins", JSON.stringify(next));
      return next;
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

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

          {/* Masonry */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
            {items.map((it, idx) => (
              <GalleryCard
                key={idx}
                item={it}
                index={idx}
                saved={savedIds.includes(it._id || it.image)}
                onToggleSave={toggleSave}
                onOpen={() => setLightboxIndex(idx)}
              />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
