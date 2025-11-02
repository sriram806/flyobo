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
  const isAdmin = (user?.role || user?.isAdmin) ? true : false;

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
        if (!cancelled) {
          setError("Unable to load FAQs. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const addFaq = () => setFaqs((arr) => [...arr, { question: "", answer: "" }]);
  const updateFaq = (idx, key, val) => setFaqs((arr) => arr.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const deleteFaq = async (idx) => {
    try {
      const item = faqs[idx];
      if (isAdmin && item?._id) {
        const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        const base = (API_URL || "").replace(/\/$/, "");
        await axios.delete(`${base}/layout`, { params: { type: "FAQ", id: item._id }, withCredentials: true });
      }
    } catch (e) {
      setError("Failed to delete FAQ item. Check admin rights and try again.");
    } finally {
      setFaqs((arr) => arr.filter((_, i) => i !== idx));
    }
  };

  const saveFaqs = async () => {
    try {
      setSaving(true);
      const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      const base = (API_URL || "").replace(/\/$/, "");
      const payload = { type: "FAQ", faq: faqs.map(f => ({ question: f.question, answer: f.answer })) };
      const resPut = await axios.put(`${base}/layout`, payload, { withCredentials: true }).catch(() => null);
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
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/30 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-sky-800 to-indigo-900 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Get instant answers to bookings, customization, payments, and support queries.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
              </div>
            </div>
          )}

          {/* FAQ List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-700 border-t-sky-600 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading FAQs...</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No FAQs available at the moment.</p>
              </div>
            ) : faqs.map((item, idx) => {
              const expanded = openItem === idx;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <button
                    className="w-full flex justify-between items-start gap-4 text-left p-6 transition-colors"
                    aria-expanded={expanded}
                    onClick={() => setOpenItem(expanded ? -1 : idx)}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        expanded 
                          ? 'bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/30' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <span className={`text-sm font-bold ${
                          expanded ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>Q</span>
                      </div>
                      <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex-1 pt-0.5">{item.question}</h2>
                    </div>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      expanded 
                        ? 'bg-sky-100 dark:bg-sky-900/30 rotate-180' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <svg className={`w-5 h-5 transition-colors ${
                        expanded ? 'text-sky-600 dark:text-sky-400' : 'text-gray-600 dark:text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                          <span className="text-sm font-bold text-white">A</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line flex-1 pt-1">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Editing */}
                  {isAdmin && (
                    <div className="px-6 pb-6 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Admin Edit Mode</span>
                      </div>
                      <input
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-all"
                        value={item.question}
                        onChange={(e)=>updateFaq(idx, 'question', e.target.value)}
                        placeholder="Edit question"
                      />
                      <textarea
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-all"
                        value={item.answer}
                        onChange={(e)=>updateFaq(idx, 'answer', e.target.value)}
                        placeholder="Edit answer"
                      />
                      <button 
                        onClick={()=>deleteFaq(idx)} 
                        className="inline-flex items-center gap-2 justify-center rounded-lg border border-rose-300 dark:border-rose-700 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete FAQ
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="mt-8 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h3 className="font-semibold text-gray-900 dark:text-white">Admin Controls</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={addFaq} 
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-5 py-2.5 text-sm font-medium shadow-lg shadow-sky-500/30 transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add FAQ
                </button>
                <button 
                  disabled={saving} 
                  onClick={saveFaqs} 
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-5 py-2.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
