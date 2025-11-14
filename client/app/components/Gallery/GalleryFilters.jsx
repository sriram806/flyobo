"use client";
import { Search, Calendar, ChevronDown } from "lucide-react";

const GalleryFilters = ({
    search,
    setSearch,
    year,
    setYear,
    years,
    category,
    setCategory,
    categories,
}) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xl backdrop-blur-sm transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search photos by title..."
                        className="w-full pl-11 text-gray-800 dark:text-gray-100 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm 
                                    focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-transparent transition-all"
                    />
                </div>

                <div className="relative w-full lg:w-48">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />

                    <select
                        value={year || ""}
                        onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
                        className="appearance-none w-full pl-11 pr-10 py-3 text-gray-800 dark:text-gray-100 rounded-xl border border-gray-300 dark:border-gray-700 
                                bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-all"
                    >
                        <option value="">All Years</option>
                        {years.filter(Boolean).map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 
            dark:text-gray-500" />
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mt-5">
                {[null, ...categories.filter(Boolean)].map((c) => {
                    const isActive = category === c || (!c && !category);
                    return (
                        <button
                            key={c || "all"}
                            onClick={() => setCategory(c)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-sky-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.05]"
                                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            {c || "All Categories"}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GalleryFilters;
