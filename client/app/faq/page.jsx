"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import Heading from "../components/MetaData/Heading";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import FaqHero from "../components/Faq/FaqHero";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

export default function Page() {
  const [openItem, setOpenItem] = useState(-1);
  const [query, setQuery] = useState("");
  const [expandedAll, setExpandedAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  const user = useSelector((s) => s?.auth?.user);
  const isAdmin = user?.role === "admin" || user?.isAdmin === true;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        const base = (API_URL || "").replace(/\/$/, "");
        const { data } = await axios.get(`${base}/layout`, { params: { type: "FAQ" }, withCredentials: true });
        if (!cancelled) setFaqs(data?.layout?.faq || []);
      } catch {
        if (!cancelled) setError("Unable to load FAQs. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => (cancelled = true);
  }, []);

  const filteredFaqs = faqs.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    return (
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      (item.tags || []).join(",").toLowerCase().includes(q)
    );
  });


  return (
    <>
      <Heading
        title="FAQ | Flyobo"
        description="Find answers to your travel booking queries. Packages, customizations, support & more."
        url="https://www.flyobo.com/faq"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <section className="max-w-5xl mx-auto px-4 lg:px-8 py-12 sm:py-16">
          <FaqHero />

          {/* Search Bar */}
          <div className="mt-10 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a question..."
              className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
            />
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* FAQ List */}
          <div className="space-y-4 mt-10">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading FAQs...</div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No results found.
              </div>
            ) : (
              filteredFaqs.map((item, idx) => {
                const expanded = expandedAll || openItem === idx;

                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6"
                  >
                    <button
                      onClick={() =>
                        setOpenItem(openItem === idx ? -1 : idx)
                      }
                      className="w-full flex justify-between items-center text-left"
                    >
                      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {item.question}
                      </h2>
                      <span className="text-gray-400 text-xl">
                        {expanded ? "−" : "+"}
                      </span>
                    </button>

                    {/* Answer */}
                    {expanded && (
                      <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
