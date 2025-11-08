"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import Heading from "../components/MetaData/Heading";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import SEO from "../components/MetaData/SEO";
import { WebsiteStructuredData, OrganizationStructuredData } from "../components/MetaData/StructuredData";

export default function Page() {
  const [openItem, setOpenItem] = useState(-1);
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
        if (!base) {
          setError("Backend URL not configured");
          setLoading(false);
          return;
        }
        const { data } = await axios.get(`${base}/layout`, { params: { type: "FAQ" }, withCredentials: true });
        if (cancelled) return;
        setFaqs(data?.layout?.faq || []);
      } catch (e) {
        if (!cancelled) setError("Unable to load FAQs. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addFaq = () => {
    if (!isAdmin) return;
    setFaqs((arr) => [...arr, { question: "", answer: "" }]);
  };

  const updateFaq = (idx, key, val) => {
    if (!isAdmin) return;
    setFaqs((arr) => arr.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  };

  const deleteFaq = async (idx) => {
    if (!isAdmin) return;
    try {
      const item = faqs[idx];
      if (item?._id) {
        const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        const base = (API_URL || "").replace(/\/$/, "");
        await axios.delete(`${base}/layout`, {
          params: { type: "FAQ", id: item._id },
          withCredentials: true,
        });
      }
      setFaqs((arr) => arr.filter((_, i) => i !== idx));
    } catch (e) {
      setError("Failed to delete FAQ item. Check admin rights and try again.");
    }
  };

  const saveFaqs = async () => {
    if (!isAdmin) return;
    try {
      setSaving(true);
      const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      const base = (API_URL || "").replace(/\/$/, "");
      const payload = { type: "FAQ", faq: faqs.map((f) => ({ question: f.question, answer: f.answer })) };

      const resPut = await axios
        .put(`${base}/layout`, payload, { withCredentials: true })
        .catch(() => null);

      if (resPut?.data?.layout?.faq) {
        setFaqs(resPut.data.layout.faq);
        return;
      }

      const resPost = await axios.post(`${base}/layout`, payload, { withCredentials: true });
      if (resPost?.data?.layout?.faq) {
        setFaqs(resPost.data.layout.faq);
      }
    } catch (e2) {
      setError("Failed to save FAQs. Check admin rights and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEO
        title="Frequently Asked Questions - Flyobo Travel"
        description="Find quick answers to common travel booking questions. Learn about packages, customization, cancellations, and customer support."
        keywords="FAQ, Travel FAQ, Booking Questions, Travel Support, Package Information, Cancellation Policy"
        url="https://www.flyobo.com/faq"
      />
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <Heading
        title="FAQ | Flyobo"
        description="Find quick answers to common travel booking questions. Learn about packages, customization, cancellations, and customer support."
        url="https://www.flyobo.com/faq"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <section className="max-w-5xl mx-auto px-4 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/30 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-sky-800 to-indigo-900 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get instant answers to bookings, customization, payments, and support queries.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-500 text-sm py-10">Loading FAQs...</div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No FAQs available at the moment.
              </div>
            ) : (
              faqs.map((item, idx) => {
                const expanded = openItem === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300"
                  >
                    <button
                      className="w-full flex justify-between items-start text-left p-6"
                      onClick={() => setOpenItem(expanded ? -1 : idx)}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <span className="text-sky-600 font-semibold">Q:</span>
                        <h2 className="font-medium text-gray-900 dark:text-gray-100">{item.question}</h2>
                      </div>
                      <span className="text-gray-400">{expanded ? "−" : "+"}</span>
                    </button>

                    {expanded && (
                      <div className="px-6 pb-6">
                        <div className="flex items-start gap-4">
                          <span className="text-emerald-600 font-semibold">A:</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item.answer}</p>
                        </div>
                      </div>
                    )}

                    {/* Admin Edit Mode */}
                    {isAdmin && (
                      <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
                        <input
                          className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800"
                          value={item.question}
                          onChange={(e) => updateFaq(idx, "question", e.target.value)}
                          placeholder="Edit question"
                        />
                        <textarea
                          className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 min-h-[80px]"
                          value={item.answer}
                          onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                          placeholder="Edit answer"
                        />
                        <button
                          onClick={() => deleteFaq(idx)}
                          className="text-sm text-rose-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="mt-8 flex gap-3">
              <button
                onClick={addFaq}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition-all"
              >
                + Add FAQ
              </button>
              <button
                onClick={saveFaqs}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
