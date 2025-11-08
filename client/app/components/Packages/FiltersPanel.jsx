"use client";

import { Search, DollarSign, Star, Clock, Grid, RotateCcw, ChevronDown, MapPin, Tag } from "lucide-react";

export default function FiltersPanel({ 
  search, 
  setSearch, 
  minPrice, 
  maxPrice, 
  setMaxPrice, 
  minRating, 
  setMinRating, 
  minDays, 
  maxDays, 
  setMinDays, 
  setMaxDays, 
  categories, 
  setCategories, 
  uniqueCategories,
  onReset 
}) {
  return (
    <aside className="lg:col-span-1">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Grid className="text-sky-500 w-5 h-5" /> Filters
          </div>
          <button
            onClick={onReset}
            className="text-sm inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
        
        {/* Search Filter */}
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <Search className="text-sky-500 w-4 h-4" /> Search
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-all"
            />
          </div>
        </div>
        
        {/* Price Range Filter */}
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <DollarSign className="text-green-500 w-4 h-4" /> Price Range
          </div>
          <div className="space-y-4">
            <div className="text-xs text-gray-600 dark:text-gray-300">
              ₹{minPrice.toLocaleString("en-IN")} — ₹{maxPrice.toLocaleString("en-IN")}
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={100000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>₹0</span>
                <span>₹1L</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rating Filter */}
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <Star className="text-yellow-500 w-4 h-4 fill-current" /> Minimum Rating
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[0, 3, 3.5, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => setMinRating(rating)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  minRating === rating
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                    : "border-gray-300 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-700"
                }`}
              >
                <Star className={`w-4 h-4 ${minRating === rating ? "fill-current" : ""}`} />
                <span className="text-xs mt-1">{rating === 0 ? "Any" : `${rating}+`}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Duration Filter */}
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <Clock className="text-purple-500 w-4 h-4" /> Duration (Days)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Any", value: "1-30" },
              { label: "1-3", value: "1-3" },
              { label: "4-6", value: "4-6" },
              { label: "7-10", value: "7-10" },
              { label: "10+", value: "11-30" }
            ].map(({ label, value }) => {
              const [min, max] = value.split("-").map(Number);
              const isSelected = minDays === min && maxDays === max;
              return (
                <button
                  key={value}
                  onClick={() => {
                    setMinDays(min);
                    setMaxDays(max);
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                      : "border-gray-300 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Categories Filter */}
        {uniqueCategories.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Tag className="text-amber-500 w-4 h-4" /> Categories
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {uniqueCategories.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={categories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCategories([...categories, category]);
                      } else {
                        setCategories(categories.filter((c) => c !== category));
                      }
                    }}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}