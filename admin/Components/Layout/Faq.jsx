"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";

export default function Faq() {
  const user = useSelector((s) => s?.auth?.user);
  const isAdmin = user?.role === "admin" || user?.isAdmin;

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(-1);
  const [savingIndex, setSavingIndex] = useState(-1);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    fetchFaqs();
  }, [isAdmin]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/layout`, {
        params: { type: "FAQ" },
        withCredentials: true,
      });

      // Server may return 404 with { success:false, message: 'FAQ not found' }
      if (res?.data?.success === false) {
        const msg = (res.data.message || '').toLowerCase();
        if (msg.includes('not found')) {
          setFaqs([]);
          return;
        }
      }

      const data = res.data;
      const serverFaqs = (data?.layout?.faq || []).map((faq, i) => ({
        ...faq,
        _key: faq._id ? `${faq._id}-${i}` : `local-${Date.now()}-${i}-${Math.random()}`,
      }));

      setFaqs(serverFaqs);
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      if (err?.response?.status === 404 && typeof msg === 'string' && msg.toLowerCase().includes('not found')) {
        setFaqs([]);
      } else {
        toast.error('Failed to load FAQs');
      }
    } finally {
      setLoading(false);
    }
  };

  const addFaq = () => {
    const newFaq = {
      question: "",
      answer: "",
      _key: `local-${Date.now()}-${Math.random()}`,
    };
    setFaqs([newFaq, ...faqs]);
    setOpenIndex(0);
  };

  const updateFaq = (idx, key, val) => {
    const updated = [...faqs];
    updated[idx][key] = val;
    setFaqs(updated);
  };

  const deleteFaq = async (idx) => {
    try {
      const item = faqs[idx];
      if (item?._id) {
        await axios.delete(`${API_URL}/layout`, {
          params: { type: "FAQ", id: item._id },
          withCredentials: true,
        });
      }
      setFaqs(faqs.filter((_, i) => i !== idx));
      toast.success("FAQ deleted");
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  const saveFaq = async (idx) => {
    try {
      setSavingIndex(idx);

      const payload = { type: "FAQ", faq: [faqs[idx]] };

      // Try update (PUT); if layout missing, fallback to create (POST)
      try {
        const res = await axios.put(`${API_URL}/layout`, payload, { withCredentials: true });
        const updatedFaqArray = res?.data?.layout?.faq || [];
        const newFaq = updatedFaqArray[0];
        if (newFaq) {
          const updated = [...faqs];
          updated[idx] = { ...newFaq, _key: updated[idx]._key };
          setFaqs(updated);
        }
        toast.success("FAQ saved successfully");
      } catch (err) {
        const msg = err?.response?.data?.message || '';
        if (err?.response?.status === 404 && typeof msg === 'string' && msg.toLowerCase().includes('faq layout not found')) {
          // create new layout instead
          try {
            const createRes = await axios.post(`${API_URL}/layout`, payload, { withCredentials: true });
            const newFaqs = createRes?.data?.layout?.faq || [];
            if (newFaqs.length) {
              const updated = [...faqs];
              updated[idx] = { ...newFaqs[newFaqs.length - 1], _key: updated[idx]._key };
              setFaqs(updated);
            }
            toast.success('FAQ created successfully');
          } catch (createErr) {
            toast.error(createErr?.response?.data?.message || 'Failed to create FAQ');
          }
        } else {
          toast.error(err?.response?.data?.message || 'Failed to save FAQ');
        }
      }
    } catch {
      toast.error("Failed to save FAQ");
    } finally {
      setSavingIndex(-1);
    }
  };

  // Filtering but keeping original index for operations
  const filteredFaqs = faqs
    .map((item, originalIndex) => ({ ...item, originalIndex }))
    .filter((item) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-lg">
        Access Denied: Admins Only
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ Management</h1>
          <button
            onClick={addFaq}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <FaPlus /> Add FAQ
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading FAQs...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No FAQs found.</div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const idx = faq.originalIndex;
              const isOpen = openIndex === idx;

              return (
                <div
                  key={faq._key}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
                >
                  <div
                    className="flex justify-between items-start gap-4 cursor-pointer"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  >
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      {faq.question || "New FAQ"}
                    </h2>
                    <span className="text-gray-400 text-xl">{isOpen ? "−" : "+"}</span>
                  </div>

                  {isOpen && (
                    <div className="mt-4 space-y-3">
                      <input
                        type="text"
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => updateFaq(idx, "question", e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <textarea
                        rows={3}
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveFaq(idx)}
                          disabled={savingIndex === idx}
                          className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                        >
                          <FaSave /> {savingIndex === idx ? "Saving..." : "Save"}
                        </button>

                        <button
                          onClick={() => deleteFaq(idx)}
                          className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
