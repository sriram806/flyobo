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
    setSearch('');
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
  }, [search, sortBy, minPrice, maxPrice, minRating, minDays, maxDays, categories, page, router]);

  useEffect(() => {
    let cancelled = false;
    const fetchPackages = async () => {
      try {
        const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!API_URL) {
          setError("Backend URL not configured. Unable to load packages.");
          setLoading(false);
          return;
        }
        const base = API_URL.replace(/\/$/, "");
        const url = `${base}/package/get-packages`;
        // Fetch only active packages from server; use large limit to allow client-side filters/pagination
        const { data } = await axios.get(url, {
          params: { status: 'active', page: 1, limit: 1000 },
          withCredentials: true,
        });
        if (cancelled) return;
        const serverItems = Array.isArray(data?.packages) ? data.packages : data?.data?.packages;
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
      .filter((p) => (p?.status ?? p?.Status) === 'active')
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
      const inDays = (!minDays || days >= minDays) && (!maxDays || days <= maxDays);
      const inCategory = categories.length ? categories.includes(cat) : true;
      return inPrice && inRating && inDays && inCategory;
    });
    if (sortBy === "price_low") list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === "price_high") list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [items, search, sortBy, minPrice, maxPrice, minRating, minDays, maxDays, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <Heading
        title="Packages | Flyobo"
        description="Explore top travel packages, tours, and holiday deals with Flyobo. Compare prices, discover unique destinations, and plan your perfect adventure today."
        keywords="Travel Packages, Holiday Deals, Tours, Trips, Vacation Packages, Adventure Tours, Family Holidays, Best Travel Deals"
        url="https://www.flyobo.com/packages"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mt-6 rounded-3xl bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 p-8 sm:p-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Discover Your Perfect Journey</h1>
            <p className="mt-2 text-gray-700 dark:text-gray-300">Explore our handpicked selection of travel packages across India.<br />From serene beaches to majestic mountains, find your dream destination.</p>
          </div>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destination or package..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 outline-none focus:ring-2  focus:ring-sky-500/60"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-900 px-3 py-3 outline-none focus:ring-2  focus:ring-sky-500/60"
          >
            <option value="popular">Most popular</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        {error && (
          <div className="mt-4 text-sm text-amber-600 dark:text-amber-400">{error}</div>
        )}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FiltersPanel
            search={search}
            setSearch={setSearch}
            minPrice={minPrice}
            maxPrice={maxPrice}
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
          <div className="lg:col-span-3">
            <ResultsToolbar
              filteredCount={filtered.length}
              sortBy={sortBy}
              setSortBy={setSortBy}
              view={view}
              setView={setView}
            />
            {!loading && filtered.length === 0 ? (
              <EmptyState title="No packages found" message="Try changing your filters or search query." onReset={resetFilters} />
            ) : view === 'grid' ? (
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {(loading ? Array.from({ length: pageSize }) : pageItems).map((p, idx) => (
                  <PackageCard key={p?._id || p?.id || idx} pkg={p} loading={loading} />
                ))}
              </section>
            ) : (
              <section className="space-y-4">
                {(loading ? Array.from({ length: pageSize }) : pageItems).map((p, idx) => (
                  <PackageListItem key={p?._id || p?.id || idx} pkg={p} loading={loading} />
                ))}
              </section>
            )}
            {!loading && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}