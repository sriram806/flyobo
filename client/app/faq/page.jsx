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

      <main className="min-h-screen bg-[#0b1220] text-gray-200">
        <section className="max-w-5xl mx-auto px-4 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center">❓ Frequently Asked Questions</h1>
          <p className="mt-2 text-center text-gray-400">Get instant answers to bookings, customization, payments, and support queries.</p>

          {error && <div className="mt-4 text-center text-sm text-amber-400">{error}</div>}

          {/* FAQ List */}
          <div className="mt-8 space-y-4">
            {!loading && faqs.map((item, idx) => {
              const expanded = openItem === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm hover:shadow-md transition"
                >
                  <button
                    className="w-full flex justify-between items-center text-left"
                    aria-expanded={expanded}
                    onClick={() => setOpenItem(expanded ? -1 : idx)}
                  >
                    <h2 className="font-semibold text-lg text-white">{item.question}</h2>
                    <span className="text-gray-400 text-xl">{expanded ? "−" : "+"}</span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expanded ? "max-h-40 mt-3 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </p>
                  </div>

                  {/* Admin Editing */}
                  {isAdmin && (
                    <div className="mt-4 space-y-3">
                      <input
                        className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm"
                        value={item.question}
                        onChange={(e)=>updateFaq(idx, 'question', e.target.value)}
                        placeholder="Edit question"
                      />
                      <textarea
                        className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm min-h-[80px]"
                        value={item.answer}
                        onChange={(e)=>updateFaq(idx, 'answer', e.target.value)}
                        placeholder="Edit answer"
                      />
                      <button 
                        onClick={()=>deleteFaq(idx)} 
                        className="inline-flex justify-center rounded-md border border-rose-700/50 px-3 py-2 text-sm text-rose-300 hover:bg-rose-900/20"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={addFaq} className="rounded-md bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 text-sm">+ Add FAQ</button>
              <button disabled={saving} onClick={saveFaqs} className="rounded-md border border-gray-600 hover:bg-gray-800 px-4 py-2 text-sm disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
