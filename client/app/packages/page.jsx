"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Heading from "../components/MetaData/Heading";
import Header from "../components/Layout/Header";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import PackageListItem from "../components/Packages/PackageListItem";
import PaginationBar from "../components/Packages/PaginationBar";
import FiltersPanel from "../components/Packages/FiltersPanel";
import ResultsToolbar from "../components/Packages/ResultsToolbar";
import EmptyState from "../components/Packages/EmptyState";
import PackageCard from "../components/Packages/PackageCard";
import Footer from "../components/Layout/Footer";
import { MapPin, Compass, Sparkles, TrendingUp } from "lucide-react";
import { HiOutlineSearch, HiOutlineSelector } from "react-icons/hi";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [view, setView] = useState("grid");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minRating, setMinRating] = useState(0);
  const [minDays, setMinDays] = useState(1);
  const [maxDays, setMaxDays] = useState(30);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const resetFilters = () => {
    setSearch("");
    setMinPrice(0);
    setMaxPrice(100000);
    setMinRating(0);
    setMinDays(1);
    setMaxDays(30);
    setCategories([]);
    setPage(1);
  };

  useEffect(() => {
    const qp = Object.fromEntries(params?.entries?.() || []);
    if (qp.q) setSearch(qp.q);
    if (qp.sort) setSortBy(qp.sort);
    if (qp.minPrice) setMinPrice(Number(qp.minPrice));
    if (qp.maxPrice) setMaxPrice(Number(qp.maxPrice));
    if (qp.minRating) setMinRating(Number(qp.minRating));
    if (qp.minDays) setMinDays(Number(qp.minDays));
    if (qp.maxDays) setMaxDays(Number(qp.maxDays));
    if (qp.cats) setCategories(qp.cats.split(",").filter(Boolean));
    if (qp.page) setPage(Math.max(1, Number(qp.page)));
  }, []);

  useEffect(() => {
    const qp = new URLSearchParams();
    if (search) qp.set("q", search);
    if (sortBy !== "popular") qp.set("sort", sortBy);
    if (minPrice) qp.set("minPrice", String(minPrice));
    if (maxPrice !== 100000) qp.set("maxPrice", String(maxPrice));
    if (minRating) qp.set("minRating", String(minRating));
    if (minDays !== 1) qp.set("minDays", String(minDays));
    if (maxDays !== 30) qp.set("maxDays", String(maxDays));
    if (categories.length) qp.set("cats", categories.join(","));
    if (page !== 1) qp.set("page", String(page));
    const qs = qp.toString();
    router.replace(`/packages${qs ? `?${qs}` : ""}`);
  }, [
    search,
    sortBy,
    minPrice,
    maxPrice,
    minRating,
    minDays,
    maxDays,
    categories,
    page,
    router,
  ]);

  useEffect(() => {
    let cancelled = false;
    const fetchPackages = async () => {
      try {
        const API_URL =
          NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!API_URL) {
          setError("Backend URL not configured. Unable to load packages.");
          setLoading(false);
          return;
        }
        const base = API_URL.replace(/\/$/, "");
        const url = `${base}/package/get-packages`;
        const { data } = await axios.get(url, {
          params: { status: "active", page: 1, limit: 1000 },
          withCredentials: true,
        });
        if (cancelled) return;
        const serverItems = Array.isArray(data?.packages)
          ? data.packages
          : data?.data?.packages;
        if (serverItems?.length) setItems(serverItems);
      } catch (err) {
        console.error("Failed to fetch packages", err);
        setError("Unable to load packages. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPackages();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items
      .filter((p) => (p?.status ?? p?.Status) === "active")
      .filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.destination?.toLowerCase().includes(q)
      );
    list = list.filter((p) => {
      const price = Number(p.price || 0);
      const rating = Number(p.rating || 0);
      const days = Number(p.duration ?? p.days ?? 0);
      const cat = (p.category || p.categoryName || p.tags || "").toString();
      const inPrice = price >= minPrice && price <= maxPrice;
      const inRating = rating >= minRating;
      const inDays =
        (!minDays || days >= minDays) && (!maxDays || days <= maxDays);
      const inCategory = categories.length
        ? categories.includes(cat)
        : true;
      return inPrice && inRating && inDays && inCategory;
    });
    if (sortBy === "price_low")
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === "price_high")
      list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === "rating")
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [
    items,
    search,
    sortBy,
    minPrice,
    maxPrice,
    minRating,
    minDays,
    maxDays,
    categories,
  ]);

  const uniqueCategories = useMemo(() => {
    try {
      const set = new Set();
      (items || []).forEach((p) => {
        const raw = p?.category ?? p?.categoryName ?? p?.tags ?? "";
        if (Array.isArray(raw)) {
          raw.forEach((r) => {
            if (r) set.add(String(r).trim());
          });
        } else if (typeof raw === "string") {
          raw.split(",").forEach((r) => {
            if (r && r.trim()) set.add(r.trim());
          });
        } else if (raw != null) {
          set.add(String(raw));
        }
      });
      return Array.from(set).filter(Boolean).sort();
    } catch (e) {
      console.error("Failed to compute uniqueCategories", e);
      return [];
    }
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const filtersActive = Boolean(
    (String(search || "").trim().length > 0) ||
    minPrice > 0 ||
    maxPrice < 100000 ||
    minRating > 0 ||
    minDays !== 1 ||
    maxDays !== 30 ||
    (categories && categories.length > 0)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Heading
        title="Packages | Flyobo"
        description="Explore top travel packages, tours, and holiday deals with Flyobo. Compare prices, discover unique destinations, and plan your perfect adventure today."
        keywords="Travel Packages, Holiday Deals, Tours, Trips, Vacation Packages, Adventure Tours, Family Holidays, Best Travel Deals"
        url="https://www.flyobo.com/packages"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      {/* Hero Section (hidden when filters are active) */}
      {!filtersActive && (
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-[#0a0a0a] dark:via-gray-900 dark:to-indigo-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 sm:py-16">
          <div className="relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md overflow-hidden">

            <div className="absolute top-1 left-0 w-89 h-60 bg-sky-300 blur-3xl rounded-full animate-pulse" />
            <div className="absolute bottom-0.5 right-1 w-90 h-60 bg-sky-500  blur-3xl rounded-full animate-pulse" />
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]">

              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="absolute top-10 left-10 w-24 h-24 bg-sky-400/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />

            <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-center">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-3 text-gray-900 dark:text-gray-50">
                <span className="bg-gradient-to-r from-gray-900 via-sky-800 to-indigo-900 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Discover Your Perfect Journey
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
                Explore our handpicked selection of travel packages across India.
                From serene beaches to majestic mountains, find your dream
                destination.
              </p>

              <div className="flex items-center justify-center gap-3 mb-6">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-full shadow-sm text-sm transition-all"
                >
                  Plan a custom trip
                </a>
                <a
                  href="/packages"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-full shadow-sm text-sm transition-all"
                >
                  View all packages
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {/* Stat Cards */}
                <div className="group px-6 py-3 rounded-2xl bg-white/80 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 dark:from-sky-600 dark:to-indigo-700">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Destinations
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                        100+
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group px-6 py-3 rounded-2xl bg-white/80 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Packages
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {items.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group px-6 py-3 rounded-2xl bg-white/80 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Rating
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        4.8★
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      )}

      {/* Search & Filters */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 sm:py-12 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destination or package..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative w-full lg:w-56">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-all"
              >
                <option value="popular">Most Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <HiOutlineSelector className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            {error}
          </div>
        )}

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FiltersPanel
            search={search}
            setSearch={setSearch}
            uniqueCategories={uniqueCategories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
            minDays={minDays}
            maxDays={maxDays}
            setMinDays={setMinDays}
            setMaxDays={setMaxDays}
            categories={categories}
            setCategories={setCategories}
            onReset={resetFilters}
          />

          <div className="lg:col-span-3 space-y-6">
            <ResultsToolbar
              total={filtered.length}
              view={view}
              setView={setView}
            />

            {loading ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                Loading packages...
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div
                  className={`grid ${view === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
                    : "grid-cols-1 gap-4"
                    }`}
                >
                  {pageItems.map((pkg) =>
                    view === "grid" ? (
                      <PackageCard key={pkg._id} pkg={pkg} />
                    ) : (
                      <PackageListItem key={pkg._id} pkg={pkg} />
                    )
                  )}
                </div>
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setPage={setPage}
                />
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
