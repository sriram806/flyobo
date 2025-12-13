"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";
import toast from "react-hot-toast";
import Loading from "@/Components/LoadingScreen/Loading";
import { Search } from "lucide-react";
import Header from "@/Components/Layout/Header";
import { motion } from "framer-motion";
import Footer from "@/Components/Layout/Footer";

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(-1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  const API = (NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!API) {
          toast.error("API base URL not configured");
          if (!cancelled) {
            setError("API base URL not configured");
            setFaqs([]);
            setLoading(false);
          }
          return;
        }

        const { data } = await axios.get(`${API}/layout`, {
          params: { type: "FAQ" },
          withCredentials: true,
          timeout: 15000,
        });

        if (!cancelled) {
          setFaqs(Array.isArray(data?.layout?.faq) ? data.layout.faq : []);
        }
      } catch (e) {
        if (!cancelled) setError("Unable to load FAQs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [API]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => {
      const question = (f.question || "").toLowerCase();
      const answer = (f.answer || "").toLowerCase();
      const tags = (f.tags || []).join(" ").toLowerCase();
      return question.includes(q) || answer.includes(q) || tags.includes(q);
    });
  }, [faqs, query]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-3xl px-4 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
          <div className="w-full max-w-3xl px-4 py-8">
            <div className="p-6 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-center text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-gray-900 transition-colors duration-300 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="relative z-10 text-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4"
              >
                <span className="bg-linear-to-r from-gray-900 via-sky-600 to-indigo-800 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-4"
              >
                Answers to common questions about bookings, cancellations and account management.
              </motion.p>
            </div>
          </div>

          <div className="mb-6">
            <label className="relative block">
              <span className="sr-only">Search FAQs</span>
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions, answers or tags..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                aria-label="Search FAQs"
              />
            </label>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                No FAQs found for your search.
              </div>
            ) : (
              filtered.map((f, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <article
                    key={f._id || idx}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-start justify-between gap-4 p-5 text-left focus:outline-none"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{f.question}</h3>
                        {f.tags?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {f.tags.slice(0, 6).map((t) => (
                              <span
                                key={t}
                                className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-linear-0 mt-1">
                        <span
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${isOpen ? "bg-sky-600 text-white border-sky-600" : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700"
                            } transition`}
                          aria-hidden
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>
                    </button>

                    <div
                      className={`px-5 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? "max-h-[1200px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"}`}
                      aria-hidden={!isOpen}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <div dangerouslySetInnerHTML={{ __html: f.answer || "" }} />
                      </div>

                      {f.more && (
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                          {f.more}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
